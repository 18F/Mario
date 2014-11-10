require('./setup');

var expect = require('expect.js');
var mockery = require('mockery');
var nock = require('nock');

describe("analyzer.analyzeCategory()", function() {
  var analyzer;

  beforeEach(function(){
    nock.disableNetConnect();
    mockery.enable({
      warnOnUnregistered: false
    });

    mockery.registerMock('./c2Constants', {
      approval_identifier: /^.*Communicart Approval Request from.*: Please review Cart #(\\d+)/
    });
    analyzer = require('../lib/analyzer');
  });

  afterEach(function(){
    mockery.deregisterAll();
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
