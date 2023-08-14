// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
var path = require('path');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get a list of fragments for the current user

async function getFragments(req, res) {
  try {
    let fragments;
    fragments = await Fragment.byUser(req.user, req.query.expand === '1');
    res.status(200).json(createSuccessResponse({ fragments: fragments }));
  } catch (err) {
    res.status(401).json(createErrorResponse(401, 'unauthenticated'));
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET FRAGMENT BY ID

async function getFragmentById(req, res) {
  try {
    //id 657557646474hfh
    //id 64r675467476.md
    const URL = req.originalUrl;
    logger.info({ URL }, 'URL');
    // Getting parameter after the "fragment/""
    const baseName = path.basename(URL);
    // Get the extension after the parameter
    const ext = path.extname(URL);
    // Get only id from parameter
    const id = path.basename(baseName, ext);
    logger.info({ id }, 'ID');
    logger.info({ ext }, 'EXT');

    const user = req.user;
    logger.info({ user }, 'USER');

    logger.info({ id }, 'ID');

    //*****
    //Create a new fragment based on the id
    //otherwise cannot call getData()
    //*****
    const fragment = new Fragment(await Fragment.byId(req.user, id));
    logger.info({ fragment }, 'fragment');

    const data = await fragment.getData(); //not metadata
    logger.info({ data }, 'GOT DATA FROM DATABASE');

    // FB: You need to set the content-type header before you send the Buffer, so it matches the fragment's type

    //res.setHeader('Location', 'http://' + apiURL + '/v1/fragments/' + fragment.id);
    // console.log(fragment.type);
    //res.status(200).json(createSuccessResponse({ fragment }));

    if (ext) {
      logger.info('INSIDE GET: /:id.ext');
      // call convert Function
      // Buffer -> STRING -> Convert -> Buffer
      // await needed
      const converted = await Fragment.convertFragment(data, ext);
      logger.info({ converted }, 'converted');

      // TODO: Check this again
      const type = ext.substring(1);

      logger.info({ type }, 'TYPE');

      switch (type) {
        case 'html':
          res.header('Content-Type', 'text/html');
          break;
        case 'md':
          res.header('Content-Type', 'text/markdown');
          break;

        case 'plain':
          res.header('Content-Type', 'text/plain');
          break;

        case 'json':
          res.header('Content-Type', 'application/json');
          break;

        case 'png':
          res.header('Content-Type', 'image/png');
          break;

        case 'jpg':
          res.header('Content-Type', 'image/jpg');
          break;

        case 'jpeg':
          res.header('Content-Type', 'image/jpeg');
          break;

        case 'gif':
          res.header('Content-Type', 'image/gif');
          break;

        case 'webp':
          res.header('Content-Type', 'image/webp');
          break;

        default:
          break;
      }

      return res.status(200).send(converted);
      //return res.status(200).json(createSuccessResponse(converted));
    }
    res.header('Content-Type', fragment.type);
    res.status(200).send(data);
    //res.status(200).json(createSuccessResponse(data));
  } catch (error) {
    logger.error(error + ' Fragment is not found by id: ');
    return res.status(404).json(createErrorResponse('Fragment is not found by id'));
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET FRAGMENT INFO

async function getFragmentsInfo(req, res) {
  try {
    const id = req.params.id;
    console.log(id, 'THIS IS ID IN THE GET INFO');
    const fragment = await Fragment.byId(req.user, id);

    res.status(200).json(createSuccessResponse({ fragment }));
    // FB: You need to set the content-type header before you send the Buffer, so it matches the fragment's type
    //res.status(200).send({ status: 'ok', fragment });
  } catch (error) {
    logger.error('Fragment is not found by id');
    return res.status(400).json(createErrorResponse('Fragment is not found by id'));
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.getFragments = getFragments;
module.exports.getFragmentById = getFragmentById;
module.exports.getFragmentsInfo = getFragmentsInfo;
