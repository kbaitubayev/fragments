const md = require('markdown-it')();
//const sharp = require('sharp');
const logger = require('../../logger');
const { Fragment, validTypes } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports.getRoute = async (req, res) => {
  const user = req.user;
  const expand = req.query.expand || 0;

  const fragments = await Fragment.byUser(user, expand == 1);

  logger.debug({ fragments, expand }, 'List Fragments, Expand');

  res.status(200).json(createSuccessResponse({ fragments }));
};

// GET /fragments/:id returns an existing fragment's data with the expected `Content-Type`, with unit tests.
module.exports.getById = async (req, res, next) => {
  const user = req.user;
  let id = req.params.id;
  let ext = '';

  // `GET /fragments/:id.ext` returns an existing fragment's data converted to a supported type.
  const period = id.search(/[.]/g);

  if (period !== -1) {
    ext = id.slice(period + 1);
    id = id.substring(0, period);
  }

  logger.debug({ user, id, ext }, 'GET /:ID User and ID and ext');

  try {
    const metadata = await Fragment.byId(user, id);
    const fragment = new Fragment(metadata);
    logger.debug({ fragment }, '/fragments/:id fragment');
    const data = await fragment.getData();

    let type = fragment.type;
    if (type.includes('; charset=utf-8')) {
      type = type.substring(0, type.search(/[;]/g));
    }
    const formats = fragment.formats;
    let conversionContentType;
    let convertedData;

    if (ext !== '') {
      // Get image content type of extension
      if (type.includes('image')) {
        const imageType = Object.keys(validTypes).find((key) => key === ext);
        if (imageType) {
          conversionContentType = validTypes[ext];
        }
        // Get text content type of extension
      } else if (fragment.isText) {
        switch (ext) {
          case 'txt':
            conversionContentType = validTypes.txt;
            break;
          case 'html':
            conversionContentType = validTypes.html;
            break;
          case 'md':
            conversionContentType = validTypes.md;
            break;
          default:
        }
        // Get json content type of extension
      } else if (type === validTypes.json) {
        switch (ext) {
          case 'txt':
            conversionContentType = validTypes.txt;
            break;
          case 'json':
            conversionContentType = validTypes.json;
            break;
          default:
        }
      }

      logger.debug({ conversionContentType }, 'conversionContentType');

      // Add format conversion check
      if (formats.includes(conversionContentType)) {
        // Do the conversion.
        switch (conversionContentType) {
          case validTypes.html:
            // Do the markdown-it conversion
            logger.debug({}, 'HTML conversion!');
            convertedData = md.render(data.toString());
            break;
          case validTypes.txt:
            // Do the plain text conversion
            logger.debug({}, 'Plain Text conversion!');
            convertedData = data.toString();
            break;
          default:
          // Convert to image type ext
          //logger.debug({}, 'Image conversion!');
          //convertedData = await sharp(data).toFormat(ext).toBuffer();
        }
      } else throw Error('Invalid type');
    }

    res.type(conversionContentType ? conversionContentType : fragment.type);

    logger.debug(res, 'byId res headers');

    res.status(200).send(convertedData ? convertedData : data);
  } catch (err) {
    next(err);
  }
};

// GET /fragments/:id/info returns an existing fragment's metadata
module.exports.getInfo = async (req, res, next) => {
  const user = req.user;
  const id = req.params.id;

  logger.debug({ user, id }, 'GET /:ID User and ID');

  try {
    const fragment = await Fragment.byId(user, id);
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    next(err);
  }
};
