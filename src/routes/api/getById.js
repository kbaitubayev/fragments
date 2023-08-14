// src/routes/api/get.js
const crypto = require('crypto');
const { Fragment } = require('../../model/fragment');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
// const contentType = require('content-type');
/**
 * Get a list of fragments for the current user
 */
// const createSuccessResponse = require('../../response').createSuccessResponse;
const createErrorResponse = require('../../response').createErrorResponse;

function validConversion(contentType, extension) {
  let formats = [];
  switch (contentType) {
    case 'text/plain':
      formats = ['.txt'];
      break;
    case 'text/markdown':
      formats = ['.md', '.html', '.txt'];
      break;
    case 'text/html':
      formats = ['.html', '.txt'];
      break;
    case 'application/json':
      formats = ['.json', '.txt'];
      break;
    case 'image/png':
      formats = ['.png', '.jpg', '.webp', '.gif'];
      break;
    case 'image/jpeg':
      formats = ['.png', '.jpg', '.webp', '.gif'];
      break;
    case 'image/webp':
      formats = ['.png', '.jpg', '.webp', '.gif'];
      break;
    case 'image/gif':
      formats = ['.png', '.jpg', '.webp', '.gif'];
      break;
    default:
      return false;
  }

  const includeExt = (element) => element.includes(extension);

  return formats.some(includeExt);
}

// module.exports = async (req, res) => {
//   // await Fragment.byId('1234'))
//   const idWithExt = req.params.id;
//   let user = crypto.createHash('sha256').update(req.user).digest('hex');

//   const idWithExtArray = idWithExt.split('.');

//   let id;
//   let ext;

//   if (idWithExtArray.length > 1) {
//     id = idWithExtArray.slice(0, idWithExtArray.length - 1).join('.');
//     ext = idWithExtArray[idWithExtArray.length - 1];
//   } else {
//     id = idWithExtArray[0];
//     ext = null;
//   }

//   const idList = await Fragment.byUser(user);

//   if (idList.includes(id)) {
//     const fragment = await Fragment.byId(user, id);
//     if (fragment) {
//       let dataResult = null;

//       if (!ext) {
//         if (fragment.type.startsWith('text/')) {
//           if (fragment.type.includes('markdown') || fragment.type.includes('html')) {
//             let html = await Fragment.getData(user, id);
//             dataResult = '<h1>' + html + '</h1>';
//           } else {
//             console.log('TEXT PLAIN: ');
//             dataResult = await Fragment.getData(user, id);
//           }
//         }
//         // fragment instanceof Fragment
//         //   ? console.log("It's Fragment" + ' | ' + typeof fragment)
//         //   : console.log('DEL ON ROI' + ' | ' + typeof fragment);

//         // console.log(fragment.mimeType + ' | ' + typeof fragment.mimeType);

//         if (fragment.type.includes('json')) {
//           dataResult = await Fragment.getData(user, id);
//         }
//       } else {
//         if (validConversion(fragment.type, ext)) {
//           if (fragment.type.startsWith('text/')) {
//             if (fragment.type.includes('markdown') || fragment.type.includes('html')) {
//               let html = await Fragment.getData(user, id);
//               dataResult = '<h1>' + html + '</h1>';
//             } else {
//               dataResult = await Fragment.getData(user, id);
//             }
//           } else {
//             dataResult = await Fragment.getData(user, id);
//           }

//           if (fragment.type.includes('json')) {
//             dataResult = await Fragment.getData(user, id);
//           }
//         }
//       }

//       if (dataResult) {
//         console.log('Data: ' + dataResult);
//         const { type } = contentType.parse(fragment.type);
//         res.setHeader('Content-Type', type);
//         res.status(200).send(dataResult);
//       } else {
//         const error = 'Cannot convert from ' + fragment.type + ' to ' + ext;
//         createErrorResponse(
//           res.status(415).json({
//             code: 415,
//             message: error,
//           })
//         );
//       }
//     } else {
//       createErrorResponse(
//         res.status(404).json({
//           status: 'error',
//           error: {
//             message: 'Not found id!',
//             code: 404,
//           },
//         })
//       );
//     }
//   } else {
//     createErrorResponse(
//       res.status(404).json({
//         message: 'Not found id!',
//       })
//     );
//   }

//   // if (idList.contain(id)) {
//   //   const fragment = await Fragment.byId(user, id);
//   //   if (validConversion(fragment.mimeType()))
//   //     createSuccessResponse(
//   //       res.status(200).json({
//   //         status: 'ok',
//   //         fragments: fragments,
//   //       })
//   //     );
//   // } else {
//   // }
// };

module.exports = async (req, res) => {
  // await Fragment.byId('1234'))
  const idWithExt = req.params.id;
  let user = crypto.createHash('sha256').update(req.user).digest('hex');

  const idWithExtArray = idWithExt.split('.');

  let id;
  let ext;

  if (idWithExtArray.length > 1) {
    id = idWithExtArray.slice(0, idWithExtArray.length - 1).join('.');
    ext = idWithExtArray[idWithExtArray.length - 1];
  } else {
    id = idWithExtArray[0];
    ext = null;
  }

  const idList = await Fragment.byUser(user);

  if (idList.includes(id)) {
    const fragmentObject = await Fragment.byId(user, id);
    let fragment;

    if (fragmentObject instanceof Fragment) {
      fragment = fragmentObject;
    } else {
      fragment = new Fragment({
        id: id,
        ownerId: fragmentObject.ownerId,
        created: fragmentObject.created,
        update: fragmentObject.update,
        type: fragmentObject.type,
        size: fragmentObject.size,
      });
    }

    if (fragment) {
      let dataResult = null;

      if (!ext) {
        // if (fragment.isText) {
        //   if (fragment.mimeType.includes('markdown') || fragment.mimeType.includes('html')) {
        //     let html = await fragment.getData();
        //     dataResult = '<h1>' + html + '</h1>';
        //   } else {
        //     dataResult = await fragment.getData();
        //   }
        // }
        // if (fragment.mimeType.includes('json')) {
        //   dataResult = await fragment.getData();
        // }
        dataResult = await fragment.getData();
      } else {
        if (validConversion(fragment.mimeType, ext)) {
          // if (fragment.isText) {
          //   if (fragment.mimeType.includes('markdown') || fragment.mimeType.includes('html')) {
          //     let html = await fragment.getData();
          //     // dataResult = '<h1>' + html + '</h1>';
          //     dataResult = html;
          //   } else {
          //     dataResult = await fragment.getData();
          //   }
          // } else {
          //   dataResult = await fragment.getData();
          // }
          // if (fragment.mimeType.includes('json')) {
          //   dataResult = await fragment.getData();
          // }
          dataResult = await fragment.getData();
        }
      }

      if (dataResult) {
        res.setHeader('Content-Type', fragment.mimeType);
        res.status(200).send(dataResult);
      } else {
        const error = 'Cannot convert from ' + fragment.mimeType + ' to ' + ext;
        createErrorResponse(
          res.status(415).json({
            code: 415,
            message: error,
          })
        );
      }
    }
  } else {
    createErrorResponse(
      res.status(404).json({
        message: 'Not found id!',
      })
    );
  }

  // if (idList.contain(id)) {
  //   const fragment = await Fragment.byId(user, id);
  //   if (validConversion(fragment.mimeType()))
  //     createSuccessResponse(
  //       res.status(200).json({
  //         status: 'ok',
  //         fragments: fragments,
  //       })
  //     );
  // } else {
  // }
};
