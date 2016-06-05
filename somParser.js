/**
 * Perform SOM clustering on the colors
 */
'use strict';
const fs = require('fs');
const som = require('node-som');
const Stats = require('fast-stats').Stats;

let colors = JSON.parse(fs.readFileSync('color.json'));
console.log(colors[0]); 
let somColors = [];
colors.forEach(d => {
  let palette = d.palette;
  palette.forEach(p => {
    somColors.push({palette:p, id:d.imgID})
  });
});

console.log(somColors[0]);

function analyzeTrainingSet(somConfig, data) {
  var inputSpace = data;
  var network = new som(somConfig);
  network.train();

  var resultSpace = {
    groups: {},
    network: network
  };

  for (var i = 0; i <= inputSpace.length - 1; i++) {
    var inputVector = inputSpace[i].palette;
    var group = network.classify(inputVector);
    if (!resultSpace.groups[group])
      resultSpace.groups[group] = {
        key: group,
        inputs: [],
        inputCount: 0
      };
    resultSpace.groups[group].inputCount++;
    resultSpace.groups[group].inputs.push(inputSpace[i]);
  }

  return resultSpace;
}


var result = analyzeTrainingSet({
  inputLength: 3,
  maxClusters: 1000,
  loggingEnabled: true,
  inputPatterns: 5000,
  scale: {
    min: 0,
    max: 255
  }
}, somColors);

fs.writeFile('colorSOM.json', JSON.stringify(result), (err, cb) => {
  if (err !== null) {
    console.log(err);
  } else {
    console.log('file saved');
  }
})