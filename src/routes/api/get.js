// src/routes/api/get.js
const crypto = require('crypto');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user
 */
const createSuccessResponse = require('../../response').createSuccessResponse;

module.exports = async (req, res) => {
  const expand = req.query.expand == 1 ? true : false;
  let user = crypto.createHash('sha256').update(req.user).digest('hex');
  const idList = await Fragment.byUser(user, expand);

  createSuccessResponse(
    res.status(200).json({
      status: 'ok',
      fragments: idList,
    })
  );
};
