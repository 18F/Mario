var fs = require('fs');
var nock = require('nock');
var rewire = require('rewire');
var scraper = rewire('../lib/scraper');

scraper.__set__('configs', {
  GSA_USERNAME: 'user',
  GSA_PASSWORD: 'password',
  GSA_SCRAPE_URL: 'http://localhost:5000'
});

describe('scraper.scrape()', function() {
  beforeEach(function(){
    nock.disableNetConnect();
  });

  afterEach(function(){
    nock.enableNetConnect();
  });

  it("transforms the data", function(done) {
    var json = fs.readFileSync('spec/data/cart.json');
    nock('http://localhost:5000').
      get('/api/v1/carts/123?u=user&p=password').
      reply(200, json);

    scraper.scrape(123, function(error, data) {
      expect(data.cartItems[0]).toEqual({
        description: '7520014512267,PENCIL',
        details: "Direct Delivery 2 days shipped ARO",
        traits: {
          socio: ['h', 'dv', 's'],
          features: ['discount'],
          green: ''
        },
        notes: 'R-1',
        partNumber: 'NSN4512267',
        price: '$6.67',
        qty: '500',
        url: 'https://gsaadvantage.gov/advantage/catalog/product_detail.do?&oid=735196277&baseOid=&bpaNumber=',
        vendor: "NORTHEAST OFFICE SUPPLY CO. LLC."
      });

      done();
    });
  });
});
