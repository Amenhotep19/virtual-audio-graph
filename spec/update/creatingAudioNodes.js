/* global beforeEach describe expect it */
import VirtualAudioGraph from '../../src/index.js';

describe('virtualAudioGraph.update - creating AudioNodes: ', () => {
  let audioContext;
  let virtualAudioGraph;

  beforeEach(() => {
    audioContext = new AudioContext();
    virtualAudioGraph = new VirtualAudioGraph({audioContext});
  });

  it('creates AnalyserNode with all valid parameters', () => {
    const params = {
      fftSize: 2048,
      minDecibels: -90,
      maxDecibels: -10,
      smoothingTimeConstant: 1,
    };

    const virtualGraphParams = {
      0: {
        node: 'analyser',
        params,
        output: 'output',
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    const audioNode = virtualAudioGraph.getAudioNodeById(0);
    expect(audioNode.constructor).toBe(AnalyserNode);
    expect(audioNode.fftSize).toBe(params.fftSize);
    expect(audioNode.frequencyBinCount).toBe(params.fftSize / 2);
    expect(audioNode.minDecibels).toBe(params.minDecibels);
    expect(audioNode.maxDecibels).toBe(params.maxDecibels);
    expect(audioNode.smoothingTimeConstant).toBe(params.smoothingTimeConstant);
    expect(audioNode.getFloatFrequencyData(new Float32Array(audioNode.frequencyBinCount))).toBeUndefined();
    expect(audioNode.getByteFrequencyData(new Uint8Array(audioNode.frequencyBinCount))).toBeUndefined();
    expect(audioNode.getFloatTimeDomainData(new Float32Array(audioNode.fftSize))).toBeUndefined();
    expect(audioNode.getByteTimeDomainData(new Uint8Array(audioNode.fftSize))).toBeUndefined();
  });

  it('creates BiquadFilterNode with all valid parameters', () => {
    const type = 'peaking';
    const frequency = 500;
    const detune = 6;
    const Q = 0.5;

    const virtualGraphParams = {
      0: {
        node: 'biquadFilter',
        params: {
          type,
          frequency,
          detune,
          Q,
        },
        output: 'output',
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    const audioNode = virtualAudioGraph.virtualNodes[0].audioNode;
    expect(audioNode.constructor).toBe(BiquadFilterNode);
    expect(audioNode.type).toBe(type);
    expect(audioNode.frequency.value).toBe(frequency);
    expect(audioNode.detune.value).toBe(detune);
    expect(audioNode.Q.value).toBe(Q);
  });

  it('creates BufferSourceNode with all valid parameters', () => {
    const {audioContext, audioContext: {sampleRate}} = virtualAudioGraph;

    const params = {
      buffer: audioContext.createBuffer(2, sampleRate * 2, sampleRate),
      loop: true,
      loopEnd: 2,
      loopStart: 1,
      onended: () => {},
      playbackRate: 2,
    };

    const virtualGraphParams = {
      0: {
        node: 'bufferSource',
        params,
        output: 'output',
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    const audioNode = virtualAudioGraph.getAudioNodeById(0);
    expect(audioNode.constructor.name).toBe('AudioBufferSourceNode');
    expect(audioNode.buffer).toBe(params.buffer);
    expect(audioNode.loop).toBe(params.loop);
    expect(audioNode.loopEnd).toBe(params.loopEnd);
    expect(audioNode.loopStart).toBe(params.loopStart);
    expect(audioNode.onended).toBe(params.onended);
    expect(audioNode.playbackRate.value).toBe(params.playbackRate);
  });

  it('creates ConvolverNode with all valid parameters', () => {
    const {audioContext: {sampleRate}} = virtualAudioGraph;
    const params = {
      buffer: audioContext.createBuffer(2, sampleRate * 2, sampleRate),
      normalize: false,
    };

    const virtualGraphParams = {
      0: {
        node: 'convolver',
        params,
        output: 'output',
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    const audioNode = virtualAudioGraph.getAudioNodeById(0);
    expect(audioNode.constructor.name).toBe('ConvolverNode');
    expect(audioNode.buffer).toBe(params.buffer);
    expect(audioNode.normalize).toBe(params.normalize);
  });

  it('creates DelayNode with all valid parameters', () => {
    const delayTime = 2;
    const maxDelayTime = 5;

    const virtualGraphParams = {
      0: {
        node: 'delay',
        params: {
          delayTime,
          maxDelayTime,
        },
        output: 'output',
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    const audioNode = virtualAudioGraph.virtualNodes[0].audioNode;
    expect(audioNode.constructor).toBe(DelayNode);
    expect(audioNode.delayTime.value).toBe(delayTime);
  });

  it('creates GainNode with all valid parameters', () => {
    const gain = 0.5;

    const virtualGraphParams = {
      0: {
        node: 'gain',
        params: {gain},
        output: 'output',
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    const audioNode = virtualAudioGraph.virtualNodes[0].audioNode;
    expect(audioNode.constructor).toBe(GainNode);
    expect(audioNode.gain.value).toBe(gain);
  });

  it('creates OscillatorNode with all valid parameters', () => {
    const params = {
      type: 'square',
      frequency: 440,
      detune: 4,
    };

    const virtualGraphParams = {
      0: {
        node: 'oscillator',
        params,
        output: 'output',
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    const audioNode = virtualAudioGraph.virtualNodes[0].audioNode;
    expect(audioNode.constructor).toBe(OscillatorNode);
    expect(audioNode.type).toBe(params.type);
    expect(audioNode.frequency.value).toBe(params.frequency);
    expect(audioNode.detune.value).toBe(params.detune);
  });

  it('creates PannerNode with all valid parameters', () => {
    const distanceModel = 'inverse';
    const panningModel = 'HRTF';
    const refDistance = 1;
    const maxDistance = 10000;
    const rolloffFactor = 1;
    const coneInnerAngle = 360;
    const coneOuterAngle = 0;
    const coneOuterGain = 0;
    const position = [0, 0, 0];
    const orientation = [1, 0, 0];

    const virtualGraphParams = {
      0: {
        node: 'panner',
        params: {
          coneInnerAngle,
          coneOuterAngle,
          coneOuterGain,
          distanceModel,
          orientation,
          panningModel,
          position,
          maxDistance,
          refDistance,
          rolloffFactor,
        },
        output: 'output',
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    const audioNode = virtualAudioGraph.virtualNodes[0].audioNode;
    expect(audioNode.constructor.name).toBe('PannerNode');
    expect(audioNode.coneInnerAngle).toBe(coneInnerAngle);
    expect(audioNode.coneOuterAngle).toBe(coneOuterAngle);
    expect(audioNode.coneOuterGain).toBe(coneOuterGain);
    expect(audioNode.distanceModel).toBe(distanceModel);
    expect(audioNode.panningModel).toBe(panningModel);
    expect(audioNode.refDistance).toBe(refDistance);
    expect(audioNode.rolloffFactor).toBe(rolloffFactor);
    expect(audioNode.maxDistance).toBe(maxDistance);
  });

  it('creates StereoPannerNode with all valid parameters', () => {
    const pan = 1;

    const virtualGraphParams = {
      0: {
        node: 'stereoPanner',
        params: {pan},
        output: 'output',
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    const audioNode = virtualAudioGraph.virtualNodes[0].audioNode;
    expect(audioNode.constructor.name).toBe('StereoPannerNode');
    expect(audioNode.pan.value).toBe(pan);
  });
});
