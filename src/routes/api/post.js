const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const logger = require('../../logger');
const contentType = require('content-type');

module.exports = async (req, res) => {
  logger.info('Trying to add a new fragment // POST v1/fragments');
  const { type } = contentType.parse(req);
  const fragmentData = req.body;

  if (!Buffer.isBuffer(fragmentData)) {
    logger.warn(`Cannot parse fragment data for user ${req.user}`);
    throw new Error('Cannot parse fragment data');
  }
  if (!Fragment.isSupportedType(type)) {
    logger.warn(`Unsupported type ${type} passed in POST v1/fragments`);
    res.status(415).json(createErrorResponse(415, `Unsupported type ${type} `));
  }

  try {
    const fragment = new Fragment({ ownerId: req.user, type: type });
    logger.info(`Created a new fragment`);
    logger.info(fragment);
    // save created fragment
    await fragment.save();
    // write fragment data
    await fragment.setData(fragmentData);

    const location = process.env.API_URL
      ? new URL(`${process.env.API_URL}/v1/fragments/${fragment.id}`)
      : new URL(`${req.headers.host}/v1/fragments/${fragment.id}`);

    logger.debug('Location: ' + location);

    res
      .location(location)
      .status(201)
      .json(createSuccessResponse({ fragment: fragment }));
  } catch (err) {
    console.log(err);
    logger.error(err);
    res.status(415).json(createErrorResponse(415, err));
  }
};
