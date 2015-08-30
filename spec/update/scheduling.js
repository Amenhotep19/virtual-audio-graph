/* global beforeEach describe expect it */
import VirtualAudioGraph from '../../src/index.js';

const testSchedulingForNode = node => describe('virtualAudioGraph.update - scheduling: ', () => {
  let audioContext;
  let virtualAudioGraph;

  beforeEach(() => {
    audioContext = new AudioContext();
    virtualAudioGraph = new VirtualAudioGraph({audioContext});
  });

  it(`${node}s with no start or stop times are played immediately and forever`, () => {
    const virtualGraphParams = {
      0: {
        node,
        output: 'output',
      },
      1: {
        node,
        output: 'output',
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    [...virtualAudioGraph.virtualNodes].forEach(virtualNode => {
      const audioNode = virtualNode.audioNode;
      expect(audioNode.$stateAtTime('00:00.000')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.099')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.100')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.199')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.200')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('23:59.999')).toBe('PLAYING');
    });
  });

  it(`${node}s with no start times but with stop times are played immediately until their stop time`, () => {
    const virtualGraphParams = {
      0: {
        node,
        output: 'output',
        params: {
          stopTime: 0.2,
        },
      },
      1: {
        node,
        output: 'output',
        params: {
          stopTime: 0.2,
        },
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    [...virtualAudioGraph.virtualNodes].forEach(virtualNode => {
      const audioNode = virtualNode.audioNode;
      expect(audioNode.$stateAtTime('00:00.000')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.099')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.100')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.199')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.200')).toBe('FINISHED');
      expect(audioNode.$stateAtTime('23:59.999')).toBe('FINISHED');
    });
  });

  it(`${node}s with start times but no stop times are played at their start time then forever`, () => {
    const virtualGraphParams = {
      0: {
        node,
        output: 'output',
        params: {
          startTime: 0.1,
        },
      },
      1: {
        node,
        output: 'output',
        params: {
          startTime: 0.1,
        },
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    [...virtualAudioGraph.virtualNodes].forEach(virtualNode => {
      const audioNode = virtualNode.audioNode;
      expect(audioNode.$stateAtTime('00:00.000')).toBe('SCHEDULED');
      expect(audioNode.$stateAtTime('00:00.099')).toBe('SCHEDULED');
      expect(audioNode.$stateAtTime('00:00.100')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.199')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.200')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('23:59.999')).toBe('PLAYING');
    }, virtualAudioGraph.virtualNodes);
  });

  it(`works when scheduling a single ${node}'s start and stop times`, () => {
    const virtualGraphParams = {
      nodeA: {
        node,
        output: 'output',
        params: {
          startTime: 0.1,
          stopTime: 0.2,
        },
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    const audioNode = virtualAudioGraph.virtualNodes.nodeA.audioNode;
    expect(audioNode.$stateAtTime('00:00.000')).toBe('SCHEDULED');
    expect(audioNode.$stateAtTime('00:00.099')).toBe('SCHEDULED');
    expect(audioNode.$stateAtTime('00:00.100')).toBe('PLAYING');
    expect(audioNode.$stateAtTime('00:00.199')).toBe('PLAYING');
    expect(audioNode.$stateAtTime('00:00.200')).toBe('FINISHED');
  });

  it(`works when scheduling multiple ${node}s' start and stop times`, () => {
    const virtualGraphParams = {
      0: {
        node,
        output: 'output',
        params: {
          startTime: 0.1,
          stopTime: 0.2,
        },
      },
      1: {
        node,
        output: 'output',
        params: {
          startTime: 0.1,
          stopTime: 0.2,
        },
      },
      2: {
        node,
        output: 'output',
        params: {
          startTime: 0.1,
          stopTime: 0.2,
        },
      },
    };

    virtualAudioGraph.update(virtualGraphParams);
    [...virtualAudioGraph.virtualNodes].forEach(virtualNode => {
      const audioNode = virtualNode.audioNode;
      expect(audioNode.$stateAtTime('00:00.000')).toBe('SCHEDULED');
      expect(audioNode.$stateAtTime('00:00.099')).toBe('SCHEDULED');
      expect(audioNode.$stateAtTime('00:00.100')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.199')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.200')).toBe('FINISHED');
    });
  });

  it(`works when rescheduling multiple ${node}' start and stop times`, () => {
    virtualAudioGraph.update({
      0: {
        node,
        output: 'output',
      },
      1: {
        node,
        output: 'output',
        params: {
          startTime: 1,
        },
      },
      2: {
        node,
        output: 'output',
        params: {
          stopTime: 0.1,
        },
      },
      3: {
        node,
        output: 'output',
        params: {
          startTime: 1,
          stopTime: 2,
        },
      },
    });

    virtualAudioGraph.update({
      0: {
        node,
        output: 'output',
        params: {
          startTime: 0.1,
          stopTime: 0.2,
        },
      },
      1: {
        node,
        output: 'output',
        params: {
          startTime: 0.1,
          stopTime: 0.2,
        },
      },
      2: {
        node,
        output: 'output',
        params: {
          startTime: 0.1,
          stopTime: 0.2,
        },
      },
      3: {
        node,
        output: 'output',
        params: {
          startTime: 0.1,
          stopTime: 0.2,
        },
      },
    });
    [...virtualAudioGraph.virtualNodes].forEach(virtualNode => {
      const audioNode = virtualNode.audioNode;
      expect(audioNode.$stateAtTime('00:00.000')).toBe('SCHEDULED');
      expect(audioNode.$stateAtTime('00:00.099')).toBe('SCHEDULED');
      expect(audioNode.$stateAtTime('00:00.100')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.199')).toBe('PLAYING');
      expect(audioNode.$stateAtTime('00:00.200')).toBe('FINISHED');
    });
  });
});

testSchedulingForNode('oscillator');
testSchedulingForNode('bufferSource');
