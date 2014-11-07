// http://stackoverflow.com/a/22785981/358804
require('blanket')({
  pattern: function (filename) {
    return !/\/(node_modules|spec)\//.test(filename);
  }
});

// require all files explicitly so they get instrumented, in case they don't get required by the specs
var requireDir = require('require-dir');
require('../mailreader');
requireDir('../lib');

// run specs
requireDir('.');
