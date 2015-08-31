import capitalize from 'capitalize';
import connect from './helpers/connect';
import connectAudioNodes from './helpers/connectAudioNodes';
import createVirtualAudioNode from './helpers/createVirtualAudioNode';
import updateAudioNodeAndVirtualAudioGraph from './helpers/updateAudioNodeAndVirtualAudioGraph';
import disconnect from './helpers/disconnect';

const startTimePath = obj => obj.params && obj.params.startTime;
const stopTimePath = obj => obj.params && obj.params.stopTime;
const difference = (arr0, arr1) => arr0.filter(x => arr1.indexOf(x) === -1);

export default class VirtualAudioGraph {
  constructor ({audioContext = new AudioContext(),
                output = audioContext.destination} = {}) {
    this.audioContext = audioContext;
    this.output = output;
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

  getAudioNodeById (id) {
    return this.virtualNodes[id].audioNode;
  }

  update (virtualGraphParams) {
    difference(Object.keys(this.virtualNodes), Object.keys(virtualGraphParams))
      .forEach(id => {
                 disconnect(this.virtualNodes[id]);
                 delete this.virtualNodes[id];
               });

    Object.keys(virtualGraphParams)
      .forEach(key => {
        if (key === 'output') {
          throw new Error(`'output' is not a valid id`);
        }
        const virtualAudioNodeParam = virtualGraphParams[key];
        const {output, node} = virtualAudioNodeParam;
        if (output == null && node !== 'mediaStreamDestination') {
          throw new Error(`output not specified for node key ${key}`);
        }
        const virtualAudioNode = this.virtualNodes[key];
        if (virtualAudioNode == null) {
          this.virtualNodes[key] = createVirtualAudioNode.call(this, virtualAudioNodeParam);
          return;
        }
        if (startTimePath(virtualAudioNodeParam) !== startTimePath(virtualAudioNode) ||
          stopTimePath(virtualAudioNodeParam) !== stopTimePath(virtualAudioNode)) {
          disconnect(virtualAudioNode);
          delete this.virtualNodes[key];
        }
        updateAudioNodeAndVirtualAudioGraph.call(this, virtualAudioNode, virtualAudioNodeParam, key);
      });

    connectAudioNodes(this.virtualNodes,
                      virtualNode => connect(virtualNode, this.output));

    return this;
  }
}
