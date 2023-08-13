// src/api/put.js

const response = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  logger.info(`PUT v1/fragments called`);

  let data = req.body;
  let id = req.params.id;
  let type = req.get('Content-Type');

  try {
    const fragment = await Fragment.byId(req.user, id);
    if (type != fragment.type)
      return res
        .status(400)
        .json(
          response.createErrorResponse(
            400,
            'A fragments type can not be changed after it is created.'
          )
        );
    await fragment.setData(data);
    return res.status(201).json(
      response.createSuccessResponse({
        status: 'ok',
        fragment: fragment,
      })
    );
  } catch (err) {
    logger.error(`PUT /v1/fragments - Invalid ID: ${err}`);
    return res.status(404).json(response.createErrorResponse(404, err.message));
  }
};
