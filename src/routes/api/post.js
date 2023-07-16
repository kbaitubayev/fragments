const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../../src/response');
const logger = require('../../logger');
//const contentType = require('content-type');

module.exports = async (req, res, next) => {
  const data = req.body;
  const user = req.user;
  const type = req.headers['content-type'];

  logger.debug({ user, type }, 'POST request:');

  try {
    if (!Fragment.isSupportedType(type)) {
      throw new Error('Invalid type');
    }

    const size = Buffer.byteLength(data);
    const fragment = new Fragment({ ownerId: user, type: type, size: size });
    await fragment.save();
    await fragment.setData(data);
    const id = fragment.id;
    logger.debug(id, 'POST fragment id');

    const location = `${process.env.API_URL}/v1/fragments/${id}`;

    res.location(location);
    logger.debug({ location }, 'POST location');
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    next(err);
  }
};
