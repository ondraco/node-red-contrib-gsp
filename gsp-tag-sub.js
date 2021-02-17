module.exports = function (RED) {
  function GspTagSub(config) {
    RED.nodes.createNode(this, config);

    this.tagId = config.tagId;
    var node = this;

    this.server = RED.nodes.getNode(config.server);
    this.status(node.server.stateDisconnected);

    let gws = this.server.gws;
    gws.addEventListener("ready", onReady);
    gws.addEventListener("close", onClose);

    this.on("close", function () {
      gws.removeEventListener("ready", onReady);
      gws.removeEventListener("close", onClose);
    });

    node.on("input", function (msg) {
      if (!node.server.connected) {
        return;
      }

      let id = msg.tagId;
      gws.subscribe(id);
    });

    function setState(state) {

      if (node.activeState !== state) {
        node.activeState = state;
        node.status(state);
      }
    }

    function onReady(e) {
      setState(node.server.stateConnected);
    }

    function onClose(e) {
      setState(node.server.stateDisconnected);
    }
  }

  RED.nodes.registerType("gsp-tag-sub", GspTagSub);
};
