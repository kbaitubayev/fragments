// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
var md = require('markdown-it')();
const sharp = require('sharp');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');
const logger = require('../logger');

class Fragment {
  constructor({ id = randomUUID(), ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) {
      logger.debug(ownerId, type);
      throw new Error('ownerId is required');
    }
    if (!type) {
      logger.debug(ownerId, type);
      throw new Error('type is required');
    }
    if (isNaN(size) || typeof size !== 'number' || size < 0) {
      logger.debug(size);
      throw new Error('size must be number');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error('Type is not supported');
    }
    this.id = id;
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */

  // Goes to http://localhost:8080/v1/fragments
  // Goes to http://localhost:8080/v1/fragments/?expand=1
  // 1 is true and if empty, expand sets as false
  static async byUser(ownerId, expand = false) {
    try {
      const fragment = await listFragments(ownerId, expand);
      return fragment;
    } catch (err) {
      //here
      logger.error({ err }, `Unable to get fragments by user`);
      //console.error(err);
      return [];
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    try {
      const fragment = await readFragment(ownerId, id);
      //console.log(fragment);
      logger.debug({ fragment }, 'BYID'); //Fixed base on the A1 feedback
      if (!fragment) {
        throw new Error('fragment is not there');
      }
      return fragment;
    } catch (err) {
      // ??? An async function doesn't need you to add extra Promises around your return/throw statements.  It will happen automatically.
      throw new Error('fragment could not find');
      //return Promise.reject(new Error('fragment could not find'));
    }
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    try {
      this.updated = new Date().toISOString();
      return writeFragment(this);
    } catch (err) {
      logger.error({ err }, `Unable to save fragment`);
    }
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    logger.info('Inside Fragment->getData()');
    try {
      return readFragmentData(this.ownerId, this.id);
    } catch (err) {
      logger.error({ err }, `Unable to get fragment data`);
    }
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    try {
      if (data) {
        //Fixed base on the A1 feedback
        await this.save();
        //this.updated = new Date().toISOString();
        this.size = data.byteLength;
        return await writeFragmentData(this.ownerId, this.id, data);
      } else {
        throw new Error('Data is empty');
      }
    } catch (err) {
      return Promise.reject(new Error('Data is not in buffer'));
    }
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
    return [
      'text/plain',
      'text/html',
      'text/markdown',
      'application/json',
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/gif',
      'image/webp',
    ];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    if (
      value.startsWith('text/') ||
      value.startsWith('application/') ||
      value.startsWith('image/')
    ) {
      return true;
    }
    return false;
  }

  static async convertFragment(data, ext) {
    if (ext === '.png' || ext === '.jpeg' || ext === '.jpg') {
      //logger.info({ ext }, 'THIS IS IMAGE');
      //logger.info({ data }, 'buffer inside image');

      //Removing the dot from ext ".png" => "png"
      ext = ext.substring(1);
      data = await sharp(data).toFormat(ext).toBuffer();
      return data;
    }

    if (ext === '.md' || ext === '.html') {
      logger.info({ ext }, 'IM A TEXT');
      // Convert the data to string ("data": [35, 32, 104, 49])
      // markdown-it works ONLY with string
      let convert = md.render(data.toString('utf-8'));
      // Convert to buffer again and send back to the get.js function
      convert = Buffer.from(convert, 'utf-8');

      //logger.info({ convert }, 'TEXT CONVERTED');
      return convert;
    }
  }
}

module.exports.Fragment = Fragment;
