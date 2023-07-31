// src/routes/api/get.js
const crypto = require('crypto');
const { Fragment } = require('../../model/fragment');
/**
 * Get a list of fragments for the current user
 */
const createSuccessResponse = require('../../response').createSuccessResponse;
const createErrorResponse = require('../../response').createErrorResponse;

module.exports = async (req, res) => {
  // await Fragment.byUser('1234'))
  const id = req.params.id;
  let user = crypto.createHash('sha256').update(req.user).digest('hex');
  const idList = await Fragment.byUser(user);

  if (idList.includes(id)) {
    const fragment = await Fragment.byId(user, id);
    if (fragment) {
      createSuccessResponse(
        res.status(200).json({
          status: 'ok',
          fragment: fragment,
        })
      );
    }
  } else {
    const error = 'Id is not exist by user ' + user + '.';
    createErrorResponse(
      res.status(415).json({
        code: 415,
        message: error,
      })
    );
  }
};
