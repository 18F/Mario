var querystring = require('querystring');
var http = require('q-io/http');
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
    url: configs.GSA_SCRAPE_URL + '/api/v1/carts/' + cartNumber + '?' + params
  };

  var promise = http.request(options).
    finally(function() {
      console.log("Back from Scraper");
    }).
    then(
      function(response) {
        console.log(body);
        var info = JSON.parse(body);
        var data = eval(info);
        generalizeScraperTraits(data.cartItems);
        return data;
      },
      function(response) {
        console.log("error = " + response.body);
        console.log("statusCode = " + response.statusCode);
      }
    );

  return promise;
};
