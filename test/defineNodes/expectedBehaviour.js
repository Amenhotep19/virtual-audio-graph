/* global AudioContext */

const test = require('tape')
require('../WebAudioTestAPISetup')
const gainWithNoParams = require('../utils/gainWithNoParams')
const pingPongDelay = require('../utils/pingPongDelay')
const sineOsc = require('../utils/sineOsc')
const sineOscNoGain = require('../utils/sineOscNoGain')
const squareOsc = require('../utils/squareOsc')
const twoGains = require('../utils/twoGains')
const createVirtualAudioGraph = require('../..')

const audioContext = new AudioContext()
const virtualAudioGraph = createVirtualAudioGraph({audioContext})

virtualAudioGraph.defineNodes({
  gainWithNoParams,
  pingPongDelay,
  sineOsc,
  squareOsc,
  twoGains
})

test('defineNodes - returns itself', t => {
  t.is(virtualAudioGraph.defineNodes({pingPongDelay}), virtualAudioGraph)
  t.end()
})

test('defineNodes - creates a custom node which can be reused in virtualAudioGraph.update', t => {
  const virtualGraphParams = {
    0: ['gain', 'output', {gain: 0.5}],
    1: ['pingPongDelay', 0, {decay: 0.5, delayTime: 0.5, maxDelayTime: 0.5}],
    2: ['oscillator', 1]
  }

  t.deepEqual(virtualAudioGraph.update(virtualGraphParams), virtualAudioGraph)
  /* eslint-disable */
  t.deepEqual(audioContext.toJSON(), {
    name: 'AudioDestinationNode', inputs: [{
      name: 'GainNode', gain: { value: 0.5, inputs: [  ] }, inputs: [ Object({ name: 'StereoPannerNode', pan: { value: 1, inputs: [  ] }, inputs: [{ name: 'DelayNode', delayTime: { value: 0.5, inputs: [  ] }, inputs: [{
        name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: { value: 0.5, inputs: [  ] }, inputs: [ '<circular:DelayNode>', Object({ name: 'OscillatorNode', type: 'sine', frequency: Object({ value: 440, inputs: [  ] }), detune: Object({ value: 0, inputs: [  ] }), inputs: [  ] }) ] }) ] }) ]
      }] } ] }), { name: 'StereoPannerNode', pan: { value: -1, inputs: [  ] }, inputs: [ { name: 'DelayNode', delayTime: { value: 0.5, inputs: [  ] }, inputs: [{ name: 'GainNode', gain: { value: 0.5, inputs: [  ] }, inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ '<circular:DelayNode>' ] }) ] }), Object({ name: 'OscillatorNode', type: 'sine', frequency: Object({ value: 440, inputs: [  ] }), detune: Object({ value: 0, inputs: [  ] }), inputs: [  ] }) ] } ] } ] }]
    }]
  })
  /* eslint-enable */
  t.end()
})

test('defineNodes - can define a custom node built of other custom nodes', t => {
  const quietPingPongDelay = () => ({
    0: ['gain', 'output'],
    1: ['pingPongDelay', 0],
    2: ['oscillator', 1]
  })

  virtualAudioGraph.defineNodes({quietPingPongDelay})

  const virtualGraphParams = {
    0: ['gain', 'output', {gain: 0.5}],
    1: ['quietPingPongDelay', 0],
    2: ['pingPongDelay', 1],
    3: ['oscillator', 2]
  }

  t.deepEqual(virtualAudioGraph.update(virtualGraphParams), virtualAudioGraph)
  /* eslint-disable */
  t.deepEqual(audioContext.toJSON(), { name: 'AudioDestinationNode', inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 1, inputs: [  ] }), inputs: [ Object({ name: 'StereoPannerNode', pan: Object({ value: 1, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.3333333333333333, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.3333333333333333, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.3333333333333333, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.3333333333333333, inputs: [  ] }), inputs: [ '<circular:DelayNode>', Object({ name: 'OscillatorNode', type: 'sine', frequency: Object({ value: 440, inputs: [  ] }), detune: Object({ value: 0, inputs: [  ] }), inputs: [  ] }) ] }) ] }) ] }) ] }) ] }), Object({ name: 'StereoPannerNode', pan: Object({ value: -1, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.3333333333333333, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.3333333333333333, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.3333333333333333, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.3333333333333333, inputs: [  ] }), inputs: [ '<circular:DelayNode>' ] }) ] }), Object({ name: 'OscillatorNode', type: 'sine', frequency: Object({ value: 440, inputs: [  ] }), detune: Object({ value: 0, inputs: [  ] }), inputs: [  ] }) ] }) ] }) ] }) ] }) ] }) ] })
  /* eslint-enable */
  t.end()
})

test('defineNodes - can define a custom node which can be updated', t => {
  const virtualGraphParams = {
    0: ['gain', 'output', {gain: 0.5}],
    1: ['pingPongDelay', 0, {decay: 0.5, delayTime: 0.5, maxDelayTime: 0.5}],
    2: ['oscillator', 1]
  }

  virtualAudioGraph.update(virtualGraphParams)

  /* eslint-disable */
  t.deepEqual(audioContext.toJSON(), { name: 'AudioDestinationNode', inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'StereoPannerNode', pan: Object({ value: 1, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ '<circular:DelayNode>', Object({ name: 'OscillatorNode', type: 'sine', frequency: Object({ value: 440, inputs: [  ] }), detune: Object({ value: 0, inputs: [  ] }), inputs: [  ] }) ] }) ] }) ] }) ] }) ] }), Object({ name: 'StereoPannerNode', pan: Object({ value: -1, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ '<circular:DelayNode>' ] }) ] }), Object({ name: 'OscillatorNode', type: 'sine', frequency: Object({ value: 440, inputs: [  ] }), detune: Object({ value: 0, inputs: [  ] }), inputs: [  ] }) ] }) ] }) ] }) ] }) ] })
  /* eslint-enable */
  virtualGraphParams[1][2].decay = 0.6
  virtualAudioGraph.update(virtualGraphParams)
  /* eslint-disable */
  t.deepEqual(audioContext.toJSON(), { name: 'AudioDestinationNode', inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'StereoPannerNode', pan: Object({ value: 1, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.6, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.6, inputs: [  ] }), inputs: [ '<circular:DelayNode>', Object({ name: 'OscillatorNode', type: 'sine', frequency: Object({ value: 440, inputs: [  ] }), detune: Object({ value: 0, inputs: [  ] }), inputs: [  ] }) ] }) ] }) ] }) ] }) ] }), Object({ name: 'StereoPannerNode', pan: Object({ value: -1, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.6, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.6, inputs: [  ] }), inputs: [ '<circular:DelayNode>' ] }) ] }), Object({ name: 'OscillatorNode', type: 'sine', frequency: Object({ value: 440, inputs: [  ] }), detune: Object({ value: 0, inputs: [  ] }), inputs: [  ] }) ] }) ] }) ] }) ] }) ] })
  /* eslint-enable */
  t.end()
})

test('defineNodes - can define a custom node which can be removed', t => {
  const virtualGraphParams = {
    0: ['gain', 'output', {gain: 0.5}],
    1: ['pingPongDelay', 0, {decay: 0.5, delayTime: 0.5, maxDelayTime: 0.5}],
    2: ['oscillator', 1]
  }

  virtualAudioGraph.update(virtualGraphParams)

  /* eslint-disable */
  t.deepEqual(audioContext.toJSON(), { name: 'AudioDestinationNode', inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'StereoPannerNode', pan: Object({ value: 1, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ '<circular:DelayNode>', Object({ name: 'OscillatorNode', type: 'sine', frequency: Object({ value: 440, inputs: [  ] }), detune: Object({ value: 0, inputs: [  ] }), inputs: [  ] }) ] }) ] }) ] }) ] }) ] }), Object({ name: 'StereoPannerNode', pan: Object({ value: -1, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'DelayNode', delayTime: Object({ value: 0.5, inputs: [  ] }), inputs: [ Object({ name: 'GainNode', gain: Object({ value: 0.5, inputs: [  ] }), inputs: [ '<circular:DelayNode>' ] }) ] }), Object({ name: 'OscillatorNode', type: 'sine', frequency: Object({ value: 440, inputs: [  ] }), detune: Object({ value: 0, inputs: [  ] }), inputs: [  ] }) ] }) ] }) ] }) ] }) ] })
  /* eslint-enable */
  virtualGraphParams[1][2].decay = 0.6

  virtualAudioGraph.update({0: ['gain', 'output', {gain: 0.5}]})

  t.deepEqual(audioContext.toJSON(), {
    name: 'AudioDestinationNode',
    inputs: [{
      name: 'GainNode',
      gain: {value: 0.5, inputs: []},
      inputs: []
    }]
  })
  t.end()
})

test('defineNodes - can define a custom node which can be replaced with another on update', t => {
  virtualAudioGraph.update({
    0: ['gain', 'output', {gain: 0.5}],
    1: ['squareOsc', 0, {gain: 0.5,
                         frequency: 220,
                         startTime: 1,
                         stopTime: 2}]
  })

  /* eslint-disable */
  t.deepEqual(audioContext.toJSON(), {"name":"AudioDestinationNode","inputs":[{"name":"GainNode","gain":{"value":0.5,"inputs":[]},"inputs":[{"name":"GainNode","gain":{"value":0.5,"inputs":[]},"inputs":[{"name":"OscillatorNode","type":"square","frequency":{"value":220,"inputs":[]},"detune":{"value":0,"inputs":[]},"inputs":[]},{"name":"OscillatorNode","type":"square","frequency":{"value":220,"inputs":[]},"detune":{"value":3,"inputs":[]},"inputs":[]}]}]}]})
  /* eslint-enable */

  virtualAudioGraph.update({
    0: ['gain', 'output', {gain: 0.5}],
    1: ['sineOsc', 0, {gain: 0.5,
                       frequency: 220,
                       startTime: 1,
                       stopTime: 2}]
  })
  /* eslint-disable */
  t.deepEqual(audioContext.toJSON(), {"name":"AudioDestinationNode","inputs":[{"name":"GainNode","gain":{"value":0.5,"inputs":[]},"inputs":[{"name":"GainNode","gain":{"value":0.5,"inputs":[]},"inputs":[{"name":"OscillatorNode","type":"sine","frequency":{"value":220,"inputs":[]},"detune":{"value":0,"inputs":[]},"inputs":[]}]}]}]})
  /* eslint-enable */

  const sampleRate = audioContext.sampleRate
  const buffer = audioContext.createBuffer(2, sampleRate * 2, sampleRate)
  virtualAudioGraph.defineNodes({
    'reverb1': _ => ({
      0: ['gain', 'output'],
      1: ['convolver', 0, {buffer}, 'input']
    }),
    'reverb2': _ => ({
      0: ['gain', 'output', {gain: 0.5}],
      1: ['convolver', 0, {buffer}, 'input']
    })
  })

  virtualAudioGraph.update({
    0: ['reverb1', 'output'],
    1: ['gain', 0]
  })

  t.deepEqual(audioContext.toJSON(), {
    name: 'AudioDestinationNode',
    inputs: [{
      name: 'GainNode',
      gain: {value: 1, inputs: []},
      inputs: [{
        name: 'ConvolverNode',
        normalize: true,
        inputs: [{
          name: 'GainNode',
          gain: {value: 1, inputs: []}, inputs: []
        }]
      }]
    }]
  })

  virtualAudioGraph.update({
    0: ['reverb2', 'output'],
    1: ['gain', 0]
  })

  t.deepEqual(audioContext.toJSON(), {
    name: 'AudioDestinationNode',
    inputs: [{
      name: 'GainNode',
      gain: {value: 0.5, inputs: []},
      inputs: [{
        name: 'ConvolverNode',
        normalize: true,
        inputs: [{
          name: 'GainNode',
          gain: {value: 1, inputs: []}, inputs: []
        }]
      }]
    }]
  })
  t.end()
})

test('defineNodes - can define a custom node which has an input node with no params', t => {
  virtualAudioGraph.update({
    0: ['gainWithNoParams', 'output'],
    1: ['sineOsc', 0, {gain: 0.5,
                       frequency: 220,
                       startTime: 1,
                       stopTime: 2}]
  })
  t.deepEqual(
    audioContext.toJSON(),
    /* eslint-disable */
    {"name":"AudioDestinationNode","inputs":[{"name":"GainNode","gain":{"value":1,"inputs":[]},"inputs":[{"name":"GainNode","gain":{"value":0.5,"inputs":[]},"inputs":[{"name":"OscillatorNode","type":"sine","frequency":{"value":220,"inputs":[]},"detune":{"value":0,"inputs":[]},"inputs":[]}]}]}]}
    /* eslint-enable */
  )
  t.end()
})

test('defineNodes - can define custom nodes which can be reordered', t => {
  const expectedData = {
    name: 'AudioDestinationNode',
    inputs: [{
      name: 'GainNode',
      gain: {value: 1, inputs: []},
      inputs: [{
        name: 'GainNode',
        gain: {value: 1, inputs: []},
        inputs: [{
          name: 'GainNode',
          gain: {value: 1, inputs: []},
          inputs: [{
            name: 'GainNode',
            gain: {value: 0.3, inputs: []},
            inputs: [{
              name: 'OscillatorNode',
              type: 'sine',
              frequency: {value: 500, inputs: []},
              detune: {value: 0, inputs: []},
              inputs: []
            }]
          }]
        }]
      }]
    }]
  }

  virtualAudioGraph.update({
    'channel:0-type:effect-id:0': ['gain', 'output'],
    'channel:0-type:effect-id:1': ['twoGains', 'channel:0-type:effect-id:0'],
    'channel:[0]-type:source-id:keyboard: 7': [
      'sineOsc',
      ['channel:0-type:effect-id:1'],
      {gain: 0.3, frequency: 500}
    ]
  })
  t.deepEqual(audioContext.toJSON(), expectedData)

  virtualAudioGraph.update({
    'channel:0-type:effect-id:0': ['gain', 'channel:0-type:effect-id:1'],
    'channel:0-type:effect-id:1': ['twoGains', 'output'],
    'channel:[0]-type:source-id:keyboard: 5': [
      'sineOsc',
      ['channel:0-type:effect-id:0'],
      {gain: 0.3, frequency: 500}
    ]
  })
  t.deepEqual(audioContext.toJSON(), expectedData)

  virtualAudioGraph.update({
    'channel:0-type:effect-id:0': ['gain', 'output'],
    'channel:0-type:effect-id:1': ['twoGains', 'channel:0-type:effect-id:0'],
    'channel:[0]-type:source-id:keyboard: 7': [
      'sineOsc',
      ['channel:0-type:effect-id:1'],
      {gain: 0.3, frequency: 500}
    ]
  })
  t.deepEqual(audioContext.toJSON(), expectedData)
  t.end()
})

test('defineNodes - custom nodes can override native nodes', t => {
  virtualAudioGraph.defineNodes({gain: sineOscNoGain})
  virtualAudioGraph.update({0: ['gain', 'output']})
  t.deepEqual(audioContext.toJSON(), {
    name: 'AudioDestinationNode',
    inputs: [{
      name: 'OscillatorNode',
      type: 'sine',
      frequency: {value: 440, inputs: []},
      detune: {value: 0, inputs: []},
      inputs: []
    }]
  })
  t.end()
})
