var querystring = require('querystring');
var rp = require('request-promise');
var configs = require('../configs');


// Here I'm going to pack socio, green, and features, which
// are known to the GSA SCRAPER into a single "JSON" object.
function generalizeScraperTraits(cartItems) {
  var len = cartItems.length;
  for (var i = 0; i < len; i++) {
    var citem = cartItems[i];
    citem.traits = {
      socio: citem.socio,
      features: citem.features,
      green: citem.green
    };
    delete citem.socio;
    delete citem.features;
    delete citem.green;
  }
  return cartItems;
}


exports.scrape = function(cartNumber, callback) {
  var params = querystring.stringify({
    u: configs.GSA_USERNAME,
    p: configs.GSA_PASSWORD
  });

  var options = {
    url: configs.GSA_SCRAPE_URL + '/api/v1/carts/' + cartNumber + '?' + params,
    json: true
  };

  var promise = rp(options).
    finally(function() {
      console.log("Back from Scraper");
    }).
    then(function(data) {
      console.log('data:', data);
      generalizeScraperTraits(data.cartItems);
      return data;
    });

  promise.catch(function(response) {
    console.log("error = " + response.body);
    console.log("statusCode = " + response.statusCode);
  }).done();

  return promise;
};
