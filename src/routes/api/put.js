//PUT
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const apiURL = process.env.API_URL;

module.exports = async (req, res) => {
  logger.debug(req);
  logger.debug(Buffer.isBuffer(req.body));
  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported Content Type'));
  }
  try {
    logger.info('PUT fragment');
    logger.debug('THIS IS RESPONSE', res);
    logger.debug(req.user);

    // Make a new Fragment based on the id parameter
    //const frag = new Fragment(await Fragment.byId(req.headers.ownerid, req.params.id));
    const frag = new Fragment(await Fragment.byId(req.user, req.params.id));
    //frag.type = req.get('Content-Type');
    logger.debug(frag);
    logger.debug(req);
    await frag.setData(req.body);
    await frag.save();

    // FB: This is not necessary, since you already have `frag` from creating it a few lines above
    //const savedFragment = await Fragment.byId(req.user, frag.id);

    logger.debug({ frag }, 'Fragment is updated');
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location
    // https://www.itra.co.jp/webmedia/http-header.html

    // FB from A2: The code below is wrong - I have to fix the post unit test!
    // Name of the test: returns sucess response with correct fragments content-type
    //res.setHeader('Content-Type', frag.type);
    res.setHeader('Location', apiURL + `/v1/fragments/` + frag.id);

    return res.status(201).json(
      createSuccessResponse({
        fragment: frag,
        // FB from A2: Remove these, they are wrong(2 lines below this)
        //Location: apiURL + `/v1/fragments/` + frag.id,
        //'Content-Length': frag.size,
      })
    );
  } catch (error) {
    logger.error({ error }, `Unable to upate fragment`);
    //console.log('Unable to save fragment');
    res.status(400).json(createErrorResponse(400, 'Unable to update fragment'));
  }
};
