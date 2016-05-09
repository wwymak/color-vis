/**
 * Created by wwymak on 02/05/2016.
 */
'use strict';
const ColorThief  = require('color-thief');
var colorThief = new ColorThief();
const Flickr = require('flickrapi');
const fs = require('fs');
const request = require('request');
const rp = require('request-promise');
const rimraf = require('rimraf');
const async = require('async');
var config = require('./config');

var flickrOptions = {
  api_key: config.flickr.apiKey,
  secret: config.flickr.secretKey
};

// var flickrPandasSearchOpts = {
//   panda_name: 'wang wang',
//   per_page:500
// };
//
// Flickr.tokenOnly(flickrOptions, function(error, flickr) {
//   if(error) {
//     console.log(error)
//   }
//   console.log('flickr pandas');
//   // flickr.panda.getList((err, result) => {
//   //   console.log(err, result.pandas.panda[0], result.pandas.panda[1], result.pandas.panda[2])
//   // })
//   flickr.panda.getPhotos(flickrPandasSearchOpts, (err, result) => {
//     if (err != null) {
//       console.log(err);
//       return;
//     } else {
//       if (!result || !result.photos || !result.photos.photo.length == 0) {
//         console.log('no results')
//         return;
//       }
//     }
//     console.log(result, result.photos.photo[0], result.photos.photo.length);
//     let imagesRawData = result.photos.photo;
//     let imageUrls = imagesRawData.map(photo => {
//       return {
//         imgID: photo.id,
//         imgUrl: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`,
//         imgTitle: photo.title
//
//       };
//
//     });
//     //use map limit both to respect api and also colorthief gets confused and images
//     //don't write so nicely and likely to err out
//     async.mapLimit(imageUrls, 5, (urlObj, callback) => {
//       request.get(
//           {
//             url: urlObj.imgUrl,
//             encoding: 'binary'
//           }, (err, resp, body) => {
//             var filename = urlObj.imgID + '.jpg';
//             var path = 'tmp/' + filename;
//             fs.writeFile(path, body, 'binary', function () {
//               var palette = colorThief.getPalette(path, 4);
//               callback(err, palette);
//
//               rimraf(path, [], function (err) {
//                 if (err) {
//                   console.log(err)
//                 }
//               });
//             });
//           });
//     }, (err, result) => {
//       let allColors = result[0];
//       for (let i = 1; i< result.length; i++){
//         allColors = [...allColors, ...result[i]];
//       }
//       console.log(allColors[0] , 'done')
//       fs.writeFile('colorPandas.json', JSON.stringify(allColors), (err, cb) => {
//         if (err !== null) {
//           console.log(err);
//         } else {
//           console.log('file saved');
//         }
//       })
//     });
//
//   })
// });

Flickr.tokenOnly(flickrOptions, function(error, flickr) {
  if(error) {
    console.log(error)
  }
  console.log('flickr');
  flickr.photos.search({
    text: 'green',
    per_page: 500
  }, (err, result) => {

    console.log(result.photos.photo[0], result.photos.photo.length);
    let imagesRawData = result.photos.photo;
    let imageUrls = imagesRawData.map(photo => {
      return {
        imgID: photo.id,
        imgUrl: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`,
        imgTitle: photo.title

      };

    });
    //use map limit both to respect api and also colorthief gets confused and images
    //don't write so nicely and likely to err out
    async.mapLimit(imageUrls, 5, (urlObj, callback) => {
      request.get(
          {
            url: urlObj.imgUrl,
            encoding: 'binary'
          }, (err, resp, body) => {
            var filename = urlObj.imgID + '.jpg';
            var path = 'tmp/' + filename;
            fs.writeFile(path, body, 'binary', function () {
              var palette = colorThief.getPalette(path, 4);
              callback(err, palette);

              rimraf(path, [], function (err) {
                if (err) {
                  console.log(err)
                }
              });
            });
          });
    }, (err, result) => {
      let allColors = result[0];
      for (let i = 1; i< result.length; i++){
        allColors = [...allColors, ...result[i]];
      }
      console.log(allColors[0] , 'done')
      fs.writeFile('color.json', JSON.stringify(allColors), (err, cb) => {
        if (err !== null) {
          console.log(err);
        } else {
          console.log('file saved');
        }
      })
    });

  })
});

function getPalette(imageUrl, id, dataObj) {
  rp.get({url: imageUrl,
    encoding: 'binary'})
      .then(body => {
        var filename = id + '.jpg';
        var path = 'tmp/' + filename;
        fs.writeFile(path, body, 'binary', function () {
          var palette = colorThief.getPalette(path, 4);
          // console.log(palette);
          dataObj.colorPalette = palette;

          rimraf(path, [], function(err) {
            if(err) {
              console.log(err)
            }
          });

        });
      });


}

