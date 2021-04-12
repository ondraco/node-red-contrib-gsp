module.exports = function (RED) {
  function GspTagIn(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    this.tagFilter = fixFilter(config.tagFilter);
    this.server = RED.nodes.getNode(config.server);
    this.status(node.server.stateDisconnected);

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

      // its a number or a string number
      if (typeof x === "number") {
        let set = new Set();
        set.add(filter);
        return set;
      } else if (!isNaN(filter)) {
        let set = new Set();
        set.add(parseInt(filter));
        return set;
      }

      let arrayObject;
      try {
        arrayObject = JSON.parse(filter);
      } catch (e) {
        arrayObject = null;
      }

      if (Array.isArray(arrayObject)) {
        let set = new Set();
        arrayObject.forEach((x) => {
          if (typeof x === "number") {
            set.add(x);
          } else if (!isNaN(x)) {
            set.add(parseInt(x));
          }
        });
        return set;
      }

      node.error("Invalid filter format!");
      return null;
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

  RED.nodes.registerType("gsp-tag-in", GspTagIn);
};
