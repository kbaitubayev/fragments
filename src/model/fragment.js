// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const md = require('markdown-it')({
  html: true,
});
const sharp = require('sharp');
const mime = require('mime-types');
const logger = require('../logger');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!type) throw new Error('type is required');
    if (!Fragment.isSupportedType(type)) {
      throw new Error('invalid type');
    }
    if (!ownerId) throw new Error('ownerId is required');
    if (size < 0) throw new Error('size must be >= 0');
    if (typeof size !== 'number') throw new Error('size must be a number');

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toString();
    this.updated = updated || new Date().toString();
    this.type = type;
    this.size = size || 0;

    logger.info(`Created new fragment: ${this.id}`);
    logger.debug(`Fragment details: ${JSON.stringify(this)}`);
  }

  /* {
    if (
      (ownerId &&
        type &&
        Fragment.isSupportedType(type) &&
        typeof size === 'number' &&
        size >= 0) ||
      /;\s*charset=/.test(type)
    ) {
      if (!size) {
        this.size = 0;
      } else {
        this.size = size;
      }
      this.id = id || randomUUID();
      this.ownerId = ownerId;
      // this.created = created || JSON.stringify(new Date());
      this.created = created || new Date().toString();
      // this.updated = updated || JSON.stringify(new Date());
      this.update = updated || new Date().toString();
      this.type = type;
      this.save();
    } else {
      if (!ownerId) {
        throw new Error(`Fragment missing ownerId not found!`);
      }
      if (!type) {
        throw new Error(`Fragment missing type not found!`);
      } else {
        throw new Error('Fragment type or size is wrong');
      }
    }
  } */

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      throw new Error(`Fragment ${id} not found!`);
    }
    return fragment;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date().toString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    try {
      logger.info(`getData called for fragment: ${this.id}`);
      return readFragmentData(this.ownerId, this.id);
    } catch (err) {
      throw new Error('unable to read fragment data');
    }
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) throw new Error('data must be a Buffer');
    this.size = data.length;
    await this.save();
    logger.info(`Data saved for fragment: ${this.id}`);
    return await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.type.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    if (this.mimeType === 'text/plain') return ['text/plain'];
    else if (this.mimeType === 'text/markdown') return ['text/markdown', 'text/html', 'text/plain'];
    else if (this.mimeType === 'text/html') return ['text/html', 'text/plain'];
    else if (this.mimeType === 'application/json') return ['application/json', 'text/plain'];
    else if (this.mimeType === 'image/png')
      return ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    else if (this.mimeType === 'image/jpeg')
      return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    else if (this.mimeType === 'image/gif')
      return ['image/gif', 'image/png', 'image/jpeg', 'image/webp'];
    else if (this.mimeType === 'image/webp')
      return ['image/webp', 'image/png', 'image/jpeg', 'image/gif'];
    else return [];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    let validType = [
      'text/plain',
      'text/plain; charset=utf-8',
      'text/markdown',
      'text/html',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    return validType.includes(value);
  }

  async convertTo(data, extension) {
    let type = mime.lookup(extension);
    if (!type) throw new Error('invalid extension');
    const formats = this.formats;
    if (!formats.includes(type)) throw new Error('unsupported format');
    var convertedData;
    if (type === this.mimeType) return data;
    if (this.mimeType == 'text/markdown' && type == 'text/html') {
      convertedData = md.render(data.toString());
    } else if (this.mimeType == 'text/markdown' && type == 'text/plain') {
      convertedData = data.toString();
    } else if (this.mimeType == 'text/html' && type == 'text/plain') {
      convertedData = data.toString().replace(/(<([^>]+)>)/gi, '');
    } else if (this.mimeType == 'application/json' && type == 'text/plain') {
      const obj = JSON.parse(data.toString());
      const entries = Object.entries(obj);
      const result = entries.map(([key, value]) => `${key}: ${value}`).join(', ');
      convertedData = result;
    } else if (type === 'image/jpeg') {
      convertedData = await sharp(data).jpeg().toBuffer();
    } else if (type === 'image/png') {
      convertedData = await sharp(data).png().toBuffer();
    } else if (type === 'image/webp') {
      convertedData = await sharp(data).webp().toBuffer();
    } else if (type === 'image/gif') {
      convertedData = await sharp(data).gif().toBuffer();
    }
    return convertedData;
  }
}

module.exports.Fragment = Fragment;
