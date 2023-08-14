const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    logger.debug({ ownerId: req.user, Id: req.params.id }, 'DELETE /fragments/:id');
    await Fragment.delete(req.user, req.params.id);
    logger.info('DELETE fragment');
    res.status(200).json(createSuccessResponse());
  } catch (err) {
    logger.error({ err }, `Unable to delete fragment`);
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
