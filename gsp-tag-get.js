module.exports = function (RED) {
  function GspGet(config) {
    RED.nodes.createNode(this, config);

    this.tagId = config.tagId;
    this.status({ fill: "red", shape: "ring", text: "disconnected" });
    var node = this;

    this.server = RED.nodes.getNode(config.server);

    let gws = this.server.gws;
    gws.addEventListener("ready", onReady);
    gws.addEventListener("close", onClose);

    var pendingMsg;

    this.on("close", function () {
      gws.removeEventListener("ready", onReady);
      gws.removeEventListener("close", onClose);
    });

    node.on("input", function (msg) {
      if (!node.server.connected) {
        return;
      }

      let id = msg.tagId;
      pendingMsg = msg;
      gws.queryTagValues(id);
    });

    function onReady(e) {
      node.status({ fill: "green", shape: "ring", text: "connected" });
    }

    function onClose(e) {
      node.status({ fill: "red", shape: "ring", text: "disconnected - error" });
    }
  }

  RED.nodes.registerType("gsp-tag-get", GspGet);
};
