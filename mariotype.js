/*
  This is a file that is meant to implement certain types, classes or ADTs
  in javascript.

  listcart: general class that lists somewhere between a shopping list and 
a chart.  It can contain indefinite and incomplete information.

  shop_re_api: an API for performing shopping research.
*/

// This is to represent abstract, boolean compliances
function Compliance() {
    this.name = "FSSI Compliant";
}
Compliance.prototype = new Compliance;

disableVeteranOwnedBusiness = new Compliance();
disableVeteranOwnedBusiness.name = "DVOB";

womanOwnedBusiness = new Compliance();
womanOwnedBusiness.name = "WOB";


CatalogItem = function CatalogItem() {
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
CatalogItem.prototype = new CatalogItem;

// An order ties a CataglogItem to a WishItem
OrderItem = function() {
    // We will allow the description to be versioned and to 
    // develop over time.
    this.ci = new CatalogItem();
    this.units = -1;
}
OrderItem.prototype = new OrderItem;

WishItem = function() {
    this.description = "";
}
WishItem.prototype = new WishItem;

// A WishList contains both free-form text and a formal list of 
// WishItems
WishList = function() {
    this.freeform = "";
    this.wish_items = new Array();
}
WishList.prototype = new WishList;

ListCart = function(name) {
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

ListCart.prototype = new ListCart;


ResearchResults = function() {
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

ResearchResults.prototpye = new ResearchResults;

// The ShopResearchAPI returns CatalogItems (though they may be incomplete.
// The CatalogItems may be processed to create OrderItems.
ShopResearchAPI = function(num,items) {
    this.type = "shop_re_api";
    this.num = num;
    this.items = items;
    // return a raft of research results for a item in the listcart
    this.getResearch = function(numResults,listcart) {
	};
    }

ShopResearchAPI.prototype = new ShopResearchAPI;

fake_pp_shop_research_api = new ShopResearchAPI;


fake_pp_shop_research_api.getResearch = function(numResults,listcart) {
    var rr = new ResearchResults();
    rr.numOptions = 1;
    listcart.items.every(function (x) {
	rr.orderItems.push(new OrderItem());
	return true;
	});
    return rr;
}

listcart = new ListCart;


mariotype_magic_number = 5;



// The C2SearchAPI returns Communicarts (though they may be incomplete).
C2ResearchAPI = function(num,items) {
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

C2ResearchAPI.prototype = new C2ResearchAPI;

var example_carts = new Array();
var first = new ListCart();
first.name = "Rob's Magical Mystery Cart";
first.items = new Array();
first.items[0] = new OrderItem();
first.items[0].units = 50;
first.items[0].ci = new CatalogItem();
first.items[0].ci.name = "shredder";
first.items[0].ci.description = "A +5 Magic Shredder that feels Good and Light.";
first.items[0].ci.detail = "These shredders are the best non-artifact shredders allowed in the game.";
first.items[0].ci.vehicle = "GSA Advantage";
first.items[0].ci.SKU = "535-SKU-ZOQ";
first.items[0].ci.unit_price = 1001;
first.items[0].ci.vendor = "Shredders-R-Us";
first.items[0].ci.compliances[0] = disableVeteranOwnedBusiness;

first.items[1] = new OrderItem();
first.items[1].units = 5;
first.items[1].ci = new CatalogItem();
first.items[1].ci.name = "highlighter";
first.items[1].ci.description = "Yellow highlighters that are very, very, timid.";
first.items[1].ci.detail = "These highlighters are so yellow, they are chicken.";
first.items[1].ci.vehicle = "GSA Advantage";
first.items[1].ci.SKU = "535-SKU-ACE";
first.items[1].ci.unit_price = 6.35;
first.items[1].ci.vendor = "Office Surplus";
first.items[1].ci.compliances[0] = womanOwnedBusiness;

example_carts['1'] = first;

mock_C2ResearchAPI = new C2ResearchAPI;

mock_C2ResearchAPI.get = function(cartId) {
    return example_carts[cartId];
}

mock_C2ResearchAPI.search = function(query,limit) {

}


