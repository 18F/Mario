var expect = require('expect.js');
var fs = require('fs');
var nock = require('nock');
var rewire = require('rewire');
var scraper = rewire('../lib/scraper');

scraper.__set__('configs', {
  GSA_USERNAME: 'user',
  GSA_PASSWORD: 'password',
  GSA_SCRAPE_URL: 'http://gsa-advantage-scraper/cgi-bin/gsa-adv-cart.py'
});

describe('scraper.scrape()', function() {
  beforeEach(function(){
    nock.disableNetConnect();
  });

  afterEach(function(){
    nock.enableNetConnect();
  });

  it("transforms the data", function() {
    var json = fs.readFileSync('spec/data/cart.json');
    nock('http://gsa-advantage-scraper').
      get('/cgi-bin/gsa-adv-cart.py?u=user&p=password&cart_id=123').
      reply(200, json);

    return scraper.scrape(123).then(function(data) {
      expect(data.cartItems[0]).to.eql({
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
    });
  });

  it("handles errors gracefully", function() {
    nock('http://gsa-advantage-scraper').
      get('/cgi-bin/gsa-adv-cart.py?u=user&p=password&cart_id=123').
      reply(500, {});

    return scraper.scrape(123).catch(function(response) {
      expect(response.statusCode).to.eql(500);
    });
  });
});
