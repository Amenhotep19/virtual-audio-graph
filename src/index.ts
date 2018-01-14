import { equals, forEach } from './utils'
import connectAudioNodes from './connectAudioNodes'
import createVirtualAudioNode from './createVirtualAudioNode'
import VirtualAudioNode from './VirtualAudioNode'
import CustomVirtualAudioNode from './VirtualAudioNodes/CustomVirtualAudioNode'
import StandardVirtualAudioNode from './VirtualAudioNodes/StandardVirtualAudioNode'

interface VirtualAudioNodes {
  [key: string]: VirtualAudioNode
}

const disconnectParents = (vNode: VirtualAudioNode, vNodes: VirtualAudioNodes) => Object.keys(vNodes)
  .forEach(key => (vNodes[key] as StandardVirtualAudioNode).disconnect(vNode))

class VirtualAudioGraph {
  virtualNodes: VirtualAudioNodes = {}

  constructor (
    public readonly audioContext: AudioContext,
    public readonly output: AudioDestinationNode,
  ) {}

  get currentTime () {
    return this.audioContext.currentTime
  }

  getAudioNodeById (id: string) {
    const vNode = this.virtualNodes[id]
    return vNode && (vNode as StandardVirtualAudioNode).audioNode
  }

  update (newGraph) {
    forEach(id => {
      if (newGraph.hasOwnProperty(id)) return
      const virtualAudioNode = this.virtualNodes[id]
      virtualAudioNode.disconnectAndDestroy()
      disconnectParents(virtualAudioNode, this.virtualNodes)
      delete this.virtualNodes[id]
    }, Object.keys(this.virtualNodes))

    forEach(key => {
      if (key === 'output') throw new Error('"output" is not a valid id')
      const newNodeParams = newGraph[key]
      const [paramsNodeName, paramsOutput, paramsParams] = newNodeParams
      if (paramsOutput == null && paramsNodeName !== 'mediaStreamDestination') {
        throw new Error(`output not specified for node key ${key}`)
      }
      const virtualAudioNode = this.virtualNodes[key]
      if (virtualAudioNode == null) {
        this.virtualNodes[key] = createVirtualAudioNode(this.audioContext, newNodeParams)
        return
      }
      if (
        (paramsParams && paramsParams.startTime) !==
          (virtualAudioNode.params && virtualAudioNode.params.startTime) ||
        (paramsParams && paramsParams.stopTime) !==
          (virtualAudioNode.params && virtualAudioNode.params.stopTime) ||
        paramsNodeName !== virtualAudioNode.node
      ) {
        virtualAudioNode.disconnectAndDestroy()
        disconnectParents(virtualAudioNode, this.virtualNodes)
        this.virtualNodes[key] = createVirtualAudioNode(this.audioContext, newNodeParams)
        return
      }
      if (!equals(paramsOutput, virtualAudioNode.output)) {
        (virtualAudioNode as CustomVirtualAudioNode).disconnect()
        disconnectParents(virtualAudioNode, this.virtualNodes)
        virtualAudioNode.output = paramsOutput
      }

      virtualAudioNode.update(paramsParams)
    }, Object.keys(newGraph))

    connectAudioNodes(
      this.virtualNodes,
      (vNode: VirtualAudioNode) => vNode.connect(this.output),
    )

    return this
  }
}

export default (config?: {audioContext?: AudioContext, output?: AudioDestinationNode}) => {
  const audioContext = config && config.audioContext || new AudioContext
  const output = config && config.output || audioContext.destination
  return new VirtualAudioGraph(audioContext, output)
}
