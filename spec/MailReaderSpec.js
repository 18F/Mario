require('./setup');

var expect = require('expect.js');
var mailReader = require('../mailreader');

describe("MailReader", function() {

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
        expect(mailReader.analyzeCategory(mail)).to.eql(null);
      });
    });

  });

});
