/*
  This is a file that is meant to implement certain types, classes or ADTs
  in javascript.

  listcart: general class that lists somewhere between a shopping list and 
a chart.  It can contain indefinite and incomplete information.

  shop_re_api: an API for performing shopping research.
*/

// This is to represent abstract, boolean compliances
Compliance = function Compliance() {
    this.name = "FSSI Compliant";
}
Compliance.prototype = new Compliance;

exports.disableVeteranOwnedBusiness = new Compliance();
exports.disableVeteranOwnedBusiness.name = "DVOB";

exports.womanOwnedBusiness = new Compliance();
exports.womanOwnedBusiness.name = "WOB";

exports.GREEN = new Compliance();
exports.GREEN.name = "Green";

exports.BPA = new Compliance();
exports.BPA.name = "BPA";


exports.CatalogItem = function CatalogItem() {
    // We will allow the description to be versioned and to 
    // develop over time.
    this.name = "";
    this.description = "";
    this.detail = "";
    this.vehicle = "";
    this.SKU = "";
    this.unit_price = 0;
    this.vendor = "";
    this.compliances = new Array();
}
exports.CatalogItem.prototype = new exports.CatalogItem;

// An order ties a CataglogItem to a WishItem
exports.OrderItem = function() {
    // We will allow the description to be versioned and to 
    // develop over time.
    this.ci = new exports.CatalogItem();
    this.units = -1;
}
exports.OrderItem.prototype = new exports.OrderItem;

exports.WishItem = function() {
    this.description = "";
}
exports.WishItem.prototype = new exports.WishItem;

// A WishList contains both free-form text and a formal list of 
// WishItems
exports.WishList = function() {
    this.freeform = "";
    this.wish_items = new Array();
}
exports.WishList.prototype = new exports.WishList;

exports.ListCart = function(name) {
    this.type = "listcart";
    this.name = name;
    this.clientdata = null;
    this.searchCallBackName = "";
    this.items = new Array(0);
    this.addItem = function (item) {
	};
    this.getItems = function () {
	};
}

exports.ListCart.prototype = new exports.ListCart;


exports.ResearchResults = function() {
    this.type = "research_reults";
    this.numOptions = 0;
    this.orderItems = new Array();
// Obviously, this is a not implemented yet...
/// be sure to put a test in here.
    this.MeanUnitPrice = function() {
	var len = this.orderItems.length;
	var total = 0.0;
	for (var i = 0; i < len; i++) {
	    total = total + this.orderItems[i].ci.unit_price;
	}
	return total / len;
    };
}

exports.ResearchResults.prototpye = new exports.ResearchResults;

// The ShopResearchAPI returns CatalogItems (though they may be incomplete.
// The CatalogItems may be processed to create OrderItems.
exports.ShopResearchAPI = function(num,items) {
    this.type = "shop_re_api";
    this.num = num;
    this.items = items;
    // return a raft of research results for a item in the listcart
    this.getResearch = function(numResults,listcart) {
	};
    }

exports.ShopResearchAPI.prototype = new exports.ShopResearchAPI;

exports.fake_pp_shop_research_api = new exports.ShopResearchAPI;


exports.fake_pp_shop_research_api.getResearch = function(numResults,listcart) {
    var rr = new exports.ResearchResults();
    rr.numOptions = 1;
    listcart.items.every(function (x) {
	rr.orderItems.push(new exports.OrderItem());
	return true;
	});
    return rr;
}

exports.listcart = new exports.ListCart;


mariotype_magic_number = 5;



// The C2SearchAPI returns Communicarts (though they may be incomplete).
exports.C2ResearchAPI = function(num,items) {
    this.type = "c2_re_api";
    this.num = num;
    this.items = items;
    // return a Cart based on its id
    this.get = function(cartId) {
	};
    // return a set of ids (up to limit) matching the query
    this.search = function(query,limit) {
	};
    }

exports.C2ResearchAPI.prototype = new exports.C2ResearchAPI;

var example_carts = new Array();
var first = new exports.ListCart();
first.name = "Rob's Mystery Cart";
first.items = new Array();
first.items[0] = new exports.OrderItem();
first.items[0].units = 50;
first.items[0].ci = new exports.CatalogItem();
first.items[0].ci.name = "shredder";
first.items[0].ci.description = "A +5 Magic Shredder that feels Good and Light.";
first.items[0].ci.detail = "These shredders are the best non-artifact shredders allowed in the game.";
first.items[0].ci.vehicle = "GSA Advantage";
first.items[0].ci.SKU = "535-SKU-ZOQ";
first.items[0].ci.unit_price = 1001;
first.items[0].ci.vendor = "Shredders-R-Us";
first.items[0].ci.compliances[0] = exports.disableVeteranOwnedBusiness;

first.items[1] = new exports.OrderItem();
first.items[1].units = 5;
first.items[1].ci = new exports.CatalogItem();
first.items[1].ci.name = "highlighter";
first.items[1].ci.description = "Yellow highlighters that are very, very, timid.";
first.items[1].ci.detail = "These highlighters are so yellow, they are chicken.";
first.items[1].ci.vehicle = "GSA Advantage";
first.items[1].ci.SKU = "535-SKU-ACE";
first.items[1].ci.unit_price = 6.35;
first.items[1].ci.vendor = "Office Surplus";
first.items[1].ci.compliances[0] = exports.womanOwnedBusiness;


var second = new exports.ListCart();
second.name = "Adam's Example Cart";
second.items = new Array();
second.items[0] = new exports.OrderItem();
second.items[0].units = 25;
second.items[0].ci = new exports.CatalogItem();
second.items[0].ci.name = "binder";
second.items[0].ci.description = "ROUND RING VIEW BINDER WITH INTERIOR POC";
second.items[0].ci.detail = "7510015194381, Round Ring View Binder with Interior Pockets, White, Capacity 1 1/2 in 30% Recycled content, 30% Post Consumer Recycled Content,JWOD/AbilityOne";
second.items[0].ci.vehicle = "GSA Advantage";
second.items[0].ci.SKU = "7510-01-519-4381";
second.items[0].ci.unit_price = 2.46;
second.items[0].ci.vendor = "DOCUMENT IMAGING DIMENSIONS INC.";
second.items[0].ci.compliances[0] = exports.BPA;
second.items[0].ci.compliances[1] = exports.GREEN;

second.items[1] = new exports.OrderItem();
second.items[1].units = 5;
second.items[1].ci = new exports.CatalogItem();
second.items[1].ci.name = "roller pen";
second.items[1].ci.description = "PEN,ROLLER,GELINK,G-2,X-FINE";
second.items[1].ci.detail = "OD ITEM# 790921 Pilot(R) G-2(TM) Retractable Gel Ink Rollerball Pens, 05 mm, Extra Fine Point, Clear Barrel, Blue Ink, Pack Of 12PIL31003Pilot(R) G-2(TM) Retractable Gel Ink Rollerball Pens, 05 mm, Extra Fine Point, Clear Barrel, Blue Ink, Pack Of 12 \
\
Additional Description\
Pilot G2 Retractable Rollerball Pen - Fine Pen Point Type - 0.5 mm Pen Point Size - Blue Ink - Translucent Barrel - 12 / Dozen";
second.items[1].ci.vehicle = "GSA Advantage";
second.items[1].ci.SKU = "072838310033";
second.items[1].ci.unit_price = 10.29;
second.items[1].ci.vendor = "OFFICE DEPOT";
second.items[1].ci.compliances[0] = exports.BPA;


second.items[2] = new exports.OrderItem();
second.items[2].units = 3;
second.items[2].ci = new exports.CatalogItem();
second.items[2].ci.name = "ledger";
second.items[2].ci.description = "PAPER,LEDGER,11X8.5";
second.items[2].ci.detail = "Plain Ledger Paper, 11\"x8-1/2\", 100/BX, White White ledger paper is punched for three 3/16\" x 7/16\" rectangular posts. Ledger sheets offer 8-1/4\" outside post spacing. Paper is designed for use with Wilson Jones 0395-11, 0396-11 and 0399-00. Acco/Wilson Jones,Books,Minute,Records,Meeting Notes,Journals,Refills,ACCO Brands,Ledger Paper\
\
Additional Description\
Wilson Jones Ledger Paper Refill Sheet - Letter 8.50\" x 11\" - 100 / Box - White Paper";
second.items[2].ci.vehicle = "GSA Advantage";
second.items[2].ci.SKU = "072838310033";
second.items[2].ci.unit_price = 32.67;
second.items[2].ci.vendor = "METRO OFFICE PRODUCTS";
second.items[2].ci.compliances[0] = exports.BPA;

example_carts['1'] = first;
example_carts['2'] = second;

mock_C2ResearchAPI = new exports.C2ResearchAPI;

mock_C2ResearchAPI.get = function(cartId) {
    return example_carts[cartId];
}

mock_C2ResearchAPI.search = function(query,limit) {

}


// Here I attempt to make an AJAX call to get the cart
// corresponding to the CartId.  Username and Password must 
// be provided.
exports.gsaCartScrape_C2ResearchAPI = new exports.C2ResearchAPI;

var gsa_cart_scrape_url = "http://gsa-advantage-scraper/gsa-adv-cart.py"

exports.gsaCartScrape_C2ResearchAPI.get = function(u,p,id,callback) {
// Okay, first, we try to make a JSONP hello-world call!

$.ajax({
    type: 'GET',
    url: gsa_cart_scrape_url,
    async: false,
    jsonpCallback: callback,
    contentType: "application/json",
    dataType: 'jsonp',
    data: {
       p: p,
       u: u,
       cart_id: id,
    },
    error: function(e) {
       alert("e.message = "+e.message);
       console.log(e.message);
    }
  });


    return example_carts[id];
}
