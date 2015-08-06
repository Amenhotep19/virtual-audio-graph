'use strict';

var asArray = require('./asArray');
var connect = require('./connect');

var isPlainOldObject = function isPlainOldObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
};

module.exports = function (virtualGraph) {
  var handleConnectionToOutput = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
  return Object.keys(virtualGraph).forEach(function (id) {
    var virtualNode = virtualGraph[id];
    if (virtualNode.connected) {
      return;
    }
    asArray(virtualNode.output).forEach(function (output) {
      if (output === 'output') {
        return handleConnectionToOutput(virtualNode);
      }

      if (isPlainOldObject(output)) {
        var key = output.key;
        var destination = output.destination;

        if (key == null) {
          throw new Error('id: ' + id + ' - output object requires a key property');
        }
        return connect(virtualNode, virtualGraph[key].audioNode[destination]);
      }

      var destinationVirtualAudioNode = virtualGraph[output];

      if (destinationVirtualAudioNode.isCustomVirtualNode) {
        var _ret = (function () {
          var virtualNodes = destinationVirtualAudioNode.virtualNodes;

          return {
            v: Object.keys(destinationVirtualAudioNode.virtualNodes).map(function (key) {
              return virtualNodes[key];
            }).filter(function (node) {
              return node.input === 'input';
            }).map(function (node) {
              return node.audioNode;
            }).forEach(function (audioNode) {
              return connect(virtualNode, audioNode);
            })
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }

      connect(virtualNode, destinationVirtualAudioNode.audioNode);
    });
  });
};