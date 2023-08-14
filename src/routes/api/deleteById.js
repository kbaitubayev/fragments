// src/routes/api/delete.js
const crypto = require('crypto');
const { Fragment } = require('../../model/fragment');
const createSuccessResponse = require('../../response').createSuccessResponse;
const createErrorResponse = require('../../response').createErrorResponse;

module.exports = async (req, res) => {
  const id = req.params.id;
  let user = crypto.createHash('sha256').update(req.user).digest('hex');
  const idList = await Fragment.byUser(user);

  if (idList.includes(id)) {
    await Fragment.delete(user, id);
    createSuccessResponse(
      res.status(200).json({
        status: 'ok',
        message: `fragment ${id} was deleted`,
      })
    );
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
