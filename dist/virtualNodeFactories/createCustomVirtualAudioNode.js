'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports['default'] = createCustomVirtualNode;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersConnectAudioNodes = require('../helpers/connectAudioNodes');

var _helpersConnectAudioNodes2 = _interopRequireDefault(_helpersConnectAudioNodes);

var _virtualNodeFactoriesCreateStandardVirtualAudioNode = require('../virtualNodeFactories/createStandardVirtualAudioNode');

var _virtualNodeFactoriesCreateStandardVirtualAudioNode2 = _interopRequireDefault(_virtualNodeFactoriesCreateStandardVirtualAudioNode);

var _toolsMapObj = require('../tools/mapObj');

var _toolsMapObj2 = _interopRequireDefault(_toolsMapObj);

function createCustomVirtualNode(virtualAudioGraph, _ref) {
  var _ref2 = _slicedToArray(_ref, 3);

  var node = _ref2[0];
  var output = _ref2[1];
  var params = _ref2[2];

  params = params || {};
  var audioGraphParamsFactory = virtualAudioGraph.customNodes[node];
  var virtualNodes = (0, _toolsMapObj2['default'])(function (virtualAudioNodeParam) {
    if (virtualAudioGraph.customNodes[virtualAudioNodeParam[0]]) {
      return createCustomVirtualNode(virtualAudioGraph, virtualAudioNodeParam);
    }
    return (0, _virtualNodeFactoriesCreateStandardVirtualAudioNode2['default'])(virtualAudioGraph, virtualAudioNodeParam);
  }, audioGraphParamsFactory(params));

  (0, _helpersConnectAudioNodes2['default'])(virtualNodes);

  return {
    audioGraphParamsFactory: audioGraphParamsFactory,
    connected: false,
    isCustomVirtualNode: true,
    node: node,
    output: output,
    params: params,
    virtualNodes: virtualNodes
  };
}

module.exports = exports['default'];