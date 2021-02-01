module.exports = function (RED) {
  function GspTagSet(config) {
    RED.nodes.createNode(this, config);

    this.tagId = config.tagId;
    this.status({ fill: "red", shape: "ring", text: "disconnected" });
    var node = this;

    this.server = RED.nodes.getNode(config.server);

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

      let values = fixInput(msg);
      if (values !== null) {
        gws.setTagValues(values);
      }
    });

    function fixInput(msg) {
      let id = msg.tagId;
      let fixedId = null;

      let value = msg.payload;

      if (typeof id === "number") {
        fixedId = id;
      } else if (!isNaN(id)) {
        fixedId = parseInt(id);
      } else {
        node.warn("Invalid or missing tagId value!");
      }

      return [{ tag: fixedId, val: value }];
    }

    function onReady(e) {
      node.status({ fill: "green", shape: "ring", text: "connected" });
    }

    function onClose(e) {
      node.status({ fill: "red", shape: "ring", text: "disconnected - error" });
    }
  }

  RED.nodes.registerType("gsp-tag-set", GspTagSet);
};
