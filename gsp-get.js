module.exports = function (RED) {
  function GspGet(config) {
    RED.nodes.createNode(this, config);

    this.tagId = config.tagId;
    this.status({ fill: "red", shape: "ring", text: "disconnected" });
    var node = this;

    this.server = RED.nodes.getNode(config.server);

    let gws = this.server.gws;
    gws.addEventListener("tagValue", onNewValue);
    gws.addEventListener("ready", onReady);
    gws.addEventListener("error", onError);
    gws.addEventListener("close", onClose);

    var pendingMsg;

    this.on("close", function () {
      gws.removeEventListener("tagValue", onNewValue);
      gws.removeEventListener("ready", onReady);
      gws.removeEventListener("error", onError);
    });

    node.on("input", function (msg) {
      node.warn("INPUT " + node.server.connected);

      if (!node.server.connected) {
        return;
      }

      let id = msg.tagId;
      pendingMsg = msg;
      gws.queryTagValues(id);
    });

    function onNewValue(e) {
      pendingMsg.payload = e;
      node.send(pendingMsg);
    }

    function onReady(e) {
      node.status({ fill: "green", shape: "ring", text: "connected" });
    }

    function onClose(e) {
      node.status({ fill: "red", shape: "ring", text: "disconnected - error" });
    }

    function onError(e) {
      node.warn(e);
    }
  }

  RED.nodes.registerType("gsp-get", GspGet);
};
