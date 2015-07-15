'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('ramda');

var contains = _require.contains;
var filter = _require.filter;
var forEach = _require.forEach;
var pluck = _require.pluck;
var propEq = _require.propEq;
var map = _require.map;
var zipWith = _require.zipWith;

var asArray = require('../tools/asArray');
var connectAudioNodes = require('../tools/connectAudioNodes');
var NativeVirtualAudioNode = require('../virtualNodeConstructors/NativeVirtualAudioNode');

module.exports = (function () {
  function CustomVirtualAudioNode(virtualAudioGraph, _ref) {
    var node = _ref.node;
    var id = _ref.id;
    var output = _ref.output;
    var params = _ref.params;

    _classCallCheck(this, CustomVirtualAudioNode);

    params = params || {};
    this.audioGraphParamsFactory = virtualAudioGraph.customNodes[node];
    this.connected = false;
    this.node = node;
    this.virtualNodes = map((function createVirtualAudioNode(virtualAudioNodeParam) {
      if (this.customNodes[virtualAudioNodeParam.node]) return new CustomVirtualAudioNode(this, virtualAudioNodeParam);

      return new NativeVirtualAudioNode(this, virtualAudioNodeParam);
    }).bind(virtualAudioGraph), this.audioGraphParamsFactory(params));

    connectAudioNodes.call(this, CustomVirtualAudioNode);
    this.id = id;
    this.output = output;
  }

  _createClass(CustomVirtualAudioNode, [{
    key: 'connect',
    value: function connect(destination) {
      var outputVirtualNodes = filter(function (_ref2) {
        var output = _ref2.output;
        return contains('output', asArray(output));
      }, this.virtualNodes);
      forEach(function (audioNode) {
        return audioNode.connect(destination);
      }, pluck('audioNode', outputVirtualNodes));
      this.connected = true;
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      forEach(function (virtualNode) {
        return virtualNode.disconnect();
      }, this.virtualNodes);
      this.connected = false;
    }
  }, {
    key: 'updateAudioNode',
    value: function updateAudioNode(params) {
      zipWith(function (virtualNode, _ref3) {
        var params = _ref3.params;
        return virtualNode.updateAudioNode(params);
      }, this.virtualNodes, this.audioGraphParamsFactory(params));
    }
  }, {
    key: 'inputs',
    get: function get() {
      return pluck('audioNode', filter(propEq('input', 'input'), this.virtualNodes));
    }
  }]);

  return CustomVirtualAudioNode;
})();