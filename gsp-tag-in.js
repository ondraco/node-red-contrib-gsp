module.exports = function (RED) {
  function GspTagIn(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    this.tagFilter = fixFilter(config.tagFilter);
    this.status({ fill: "red", shape: "ring", text: "disconnected" });
    this.server = RED.nodes.getNode(config.server);

    let gws = this.server.gws;
    gws.addEventListener("tagValue", onNewValue);
    gws.addEventListener("close", onClose);
    gws.addEventListener("ready", onReady);

    this.on("close", function () {
      gws.removeEventListener("tagValue", onNewValue);
      gws.removeEventListener("close", onClose);
      gws.removeEventListener("ready", onReady);
    });

    function fixFilter(filter) {
      // no filtering
      if (filter === undefined || filter === "") {
        return undefined;
      }

      if (Array.isArray(filter)) {
        let set = new Set();
        filter.forEach((x) => {
          if (typeof x === "number") {
            set.add(x);
          } else if (!isNaN(x)) {
            set.add(parseInt(x));
          }
        });
        return set;
      } else if (typeof x === "number") {
        let set = new Set();
        set.add(filter);
      } else if (!isNaN(filter)) {
        let set = new Set();
        set.add(parseInt(filter));
        return set;
      } else {
        node.error("Invalid filter format!");
        return null;
      }
    }

    function filterTags(e) {
      if (node.tagFilter === undefined) {
        return e;
      }

      if (node.tagFilter === null) {
        return null;
      }

      if (!Array.isArray(e)) {
        node.error("GSP reposonse is in wrong format!");
      }

      let filtered = e.filter((x) => node.tagFilter.has(x.tag));
      if (filtered.length === 0) {
        return null;
      }

      return filtered;
    }

    function onNewValue(e) {
      let filtered = filterTags(e);

      if (filtered !== null) {
        var msg = { payload: filtered };
        node.send(msg);
      }
    }

    function onClose(e) {
      node.status({ fill: "red", shape: "ring", text: "disconnected - error" });
    }

    function onReady(e) {
      node.status({ fill: "green", shape: "ring", text: "connected" });
    }
  }

  RED.nodes.registerType("gsp-tag-in", GspTagIn);
};
