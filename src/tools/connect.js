const asArray = require('./asArray');
const mapObj = require('./mapObj');

module.exports = (virtualNode, destination) => {
  if (virtualNode.isCustomVirtualNode) {
    mapObj(childVirtualNode => {
      if (asArray(childVirtualNode.output).indexOf('output') !== -1) {
        childVirtualNode.audioNode.connect(destination);
      }
    }, virtualNode.virtualNodes);
  } else {
    virtualNode.audioNode.connect(destination);
  }
  virtualNode.connected = true;
};
