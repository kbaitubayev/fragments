// src/routes/api/get.js

// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const crypto = require('crypto');
const { Fragment } = require('../../model/fragment');

const createSuccessResponse = require('../../response').createSuccessResponse;
const createErrorResponse = require('../../response').createErrorResponse;

const generateUUID = () => {
  return crypto.randomUUID().toString('hex');
};

module.exports = async (req, res) => {
  const id = req.params.id;
  let user = crypto.createHash('sha256').update(req.user).digest('hex');
  const idList = await Fragment.byUser(user);

  if (idList.includes(id)) {
    const fragment = await Fragment.byId(user, id);
    if (fragment) {
      if (fragment.mimeType == req.headers['content-type']) {
        if (Buffer.isBuffer(req.body) && Fragment.isSupportedType(req.headers['content-type'])) {
          const id = generateUUID();
          const location = req.protocol + '://' + req.hostname + ':8080/v1' + req.url + '/' + id;
          res.set({ Location: location });

          await fragment.setData(req.body);

          createSuccessResponse(
            res.status(200).json({
              status: 'ok',
              fragments: fragment,
            })
          );
        } else {
          createErrorResponse(
            res.status(415).json({
              status: 'error',
              message: 'Invalid file type or body empty',
            })
          );
        }
      } else {
        createErrorResponse(
          res.status(400).json({
            status: 'error',
            message: 'Type not match with old type',
          })
        );
      }
    } else {
      createErrorResponse(
        res.status(415).json({
          status: 'error',
          message: 'fragment empty...',
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
