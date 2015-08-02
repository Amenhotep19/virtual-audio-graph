const {compose, difference, forEach, isNil, keys, path, tap} = require('ramda');
const capitalize = require('capitalize');
const connect = require('./tools/connect');
const connectAudioNodes = require('./tools/connectAudioNodes');
const createVirtualAudioNode = require('./tools/createVirtualAudioNode');
const updateAudioNodeAndVirtualAudioGraph = require('./tools/updateAudioNodeAndVirtualAudioGraph');
import disconnect from './tools/disconnect';

const startTimePath = path(['params', 'startTime']);
const stopTimePath = path(['params', 'stopTime']);

module.exports = class VirtualAudioGraph {
  constructor (params = {}) {
    this.audioContext = params.audioContext || new AudioContext();
    this.output = params.output || this.audioContext.destination;
    this.virtualNodes = {};
    this.customNodes = {};
  }

  get currentTime () {
    return this.audioContext.currentTime;
  }

  defineNode (customNodeParamsFactory, name) {
    if (this.audioContext[`create${capitalize(name)}`]) {
      throw new Error(`${name} is a standard audio node name and cannot be overwritten`);
    }

    this.customNodes[name] = customNodeParamsFactory;
    return this;
  }

  update (virtualGraphParams) {
    forEach(compose(id => delete this.virtualNodes[id],
                    tap(id => disconnect(this.virtualNodes[id]))),
            difference(keys(this.virtualNodes),
                       keys(virtualGraphParams)));

    forEach(key => {
      if (key === 'output') {
        throw new Error(`'output' is not a valid id`);
      }
      const virtualAudioNodeParam = virtualGraphParams[key];
      if (isNil(virtualAudioNodeParam.output)) {
        throw new Error(`ouptput not specified for node key ${key}`);
      }
      const virtualAudioNode = this.virtualNodes[key];
      if (isNil(virtualAudioNode)) {
        this.virtualNodes[key] = createVirtualAudioNode.call(this, virtualAudioNodeParam);
        return;
      }
      if (startTimePath(virtualAudioNodeParam) !== startTimePath(virtualAudioNode) ||
        stopTimePath(virtualAudioNodeParam) !== stopTimePath(virtualAudioNode)) {
        disconnect(virtualAudioNode);
        delete this.virtualNodes[key];
      }
      updateAudioNodeAndVirtualAudioGraph.call(this, virtualAudioNode, virtualAudioNodeParam, key);
    }, keys(virtualGraphParams));

    connectAudioNodes(this.virtualNodes,
                      virtualAudioNode => connect(virtualAudioNode,
                                                  this.output));

    return this;
  }
};
