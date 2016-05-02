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
var config = require('./config');

var flickrOptions = {
  api_key: config.flickr.apiKey,
  secret: config.flickr.secretKey
}
Flickr.tokenOnly(flickrOptions, function(error, flickr) {
  if(error) {
    console.log(error)
  }
  console.log('flickr');
  flickr.photos.search({
    text: 'happy',
    per_page: 10
  }, (err, result) => {
    
    console.log(result.photos.photo[0]);
    let imagesRawData = result.photos.photo;
    let imageUrls = imagesRawData.map(photo => {
      return {
        imgID: photo.id,
        imgUrl: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`,
        imgTitle: photo.title
        
      };
          
    });

    // console.log(imageUrls[0]);
    
    let test = imageUrls.slice(0,5);
    var testPromise =  [];
    test.forEach((d, i) => {
      testPromise.push(setTimeout(() => {getPalette(d.imgUrl, d.imgID, d); console.log(d);}, 500 * i));
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
  // request.get({url: imageUrl,
  //   encoding: 'binary'}, (err, resp, body) => {
  //   if (!err && resp.statusCode == 200) {
  //     var filename = id + '.jpg';
  //     var path = 'tmp/' + filename;
  //     fs.writeFile(path, body, 'binary', function () {
  //       var palette = colorThief.getPalette(path, 4);
  //       // console.log(palette);
  //       dataObj.colorPalette = palette;
  //      
  //         rimraf(path, [], function(err) {
  //           if(err) {
  //             console.log(err)
  //           }
  //         });
  //      
  //       console.log(dataObj)
  //
  //     });
  //
  //
  //   }
  // });

}