var expect = require('expect.js');
var nock = require('nock');
var analyzer = require('../lib/analyzer');

describe("analyzer.analyzeCategory()", function() {
  beforeEach(function(){
    nock.disableNetConnect();
  });

  afterEach(function(){
    nock.enableNetConnect();
  });

  describe("Reading an approval email", function() {
    beforeEach(function() {

      mail = {
        subject: 'my subject',
        html: '<h1>my mail html</h1>',
        text: 'more text\nAPPROVE',
        from: [
          { address: '111 first from address' }
        ],
        to: [
          { name: '222 first name' }
        ],
        date: Date.now()
      }

    });

    describe("#analyzeCategory", function(){
      it("returns null", function(){
        expect(analyzer.analyzeCategory(mail)).to.eql(null);
      });
    });

  });

});
