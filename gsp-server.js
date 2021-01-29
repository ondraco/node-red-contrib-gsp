const { GSPClient } = require("gspwsclient/release/commonjs2/gspclient.js");

module.exports = function (RED) {
  function GspRemoteServerNode(n) {
    RED.nodes.createNode(this, n);
    this.host = n.host;
    this.port = n.port;
    this.apiKey = n.apiKey;
    var node = this;
    var finished = false;

    // THIS NEEDS TO BE REMOVED!!!!
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    // ---------------------------

    this.gws = new GSPClient.WS(this.host, this.apiKey);
    this.connected = false;
    this.gws.addEventListener("ready", onReady);
    this.gws.addEventListener("close", onClose);
    connect();

    this.on("close", function () {
      node.finished = true;
      gws.close();
    });

    function connect() {
      node.gws.connect();
    }

    function onReady(e) {
      node.connected = true;
    }

    function onClose(e) {
      node.connected = false;

      // try to reconnect
      if (!node.finished) {
        setTimeout(() => connect(), 500);
      }
    }
  }

  RED.nodes.registerType("gsp-remote-server", GspRemoteServerNode);
};
