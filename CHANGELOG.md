# Release Notes

## 0.7.x

Prior to version 0.7.x virtual-audio-graph parameters were an array of objects with id properties representing nodes like this:

```javascript
[
  {
    id: 0,
    node: 'oscillator',
    output: 'output',
    params: {
      frequency: 220,
    },
  },
  {
    id: 1,
    node: 'oscillator',
    output: {id: 0, destination: 'detune'},
    params: {
      frequency: 110,
    },
  },
]
```

Now the parameters are a single object with keys which represent the node ids:

```javascript
{
  0: {
    node: 'oscillator',
    output: 'output',
    params: {
      frequency: 220,
    },
  },
  1: {
    node: 'oscillator',
    output: {key: 0, destination: 'detune'}, // NB. "key" property used to be "id"
    params: {
      frequency: 110,
    },
  },
}
```

The new notation automatically ensures the id of each node exists and is unique. It is also more concise and allows for greater performance.
