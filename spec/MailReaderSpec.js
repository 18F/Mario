// var fs = require('fs')
// mailReaderCode = fs.readFileSync('./mailreader.js','utf-8')
// eval(mailReaderCode)
// require('mailreader')
var mailReader = require('../mailreader');

describe("MailReader", function() {

  describe("Reading an approval email", function() {
    beforeEach(function() {
    });

    it("does something with mailReader", function(){
      expect(mailReader.analyze_category({ hi: 'there', does: 'it work?' })).toBeTruthy();
    });
  });

});
