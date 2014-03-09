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

CatalogItem = function CatalogItem() {
    // We will allow the description to be versioned and to 
    // develop over time.
    this.description = "";
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

ListCart = function() {
    this.type = "listchart";
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

