var helper = require("node-red-node-test-helper");
var gspNode = require("../gsp-get.js");

describe('gsp-get Node', function () {

    afterEach(function () {
      helper.unload();
    });
  
    it('should be loaded', function (done) {
      var flow = [{ id: "n1", type: "gsp-get", name: "gsp get node" }];
      helper.load(gspNode, flow, function () {
        var n1 = helper.getNode("n1");
        n1.should.have.property('name', 'gsp get node');
        done();
      });
    });
  });