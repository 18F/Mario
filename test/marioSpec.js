

var expect = require("chai").expect;
var tags = require("../mariotype.js");

expect(mariotype_magic_number).to.equal(5);
 
/*
describe("Mario", function(){
  describe("fake_pp_shop_research_api()", function(){
       it("fake_research_api returns research results with 3 Catalog Itmems", function(){
	   var x = fake_pp_shop_research_api;
           var result = x.getResearch(1,"nothing");
           expect(result.num).to.equal(3);
           expect(result.orderItems.length).to.equal(3);
       });
   }); 
});
*/


describe("Mario", function(){
  describe("fake_pp_shop_research_api()", function(){
       it("fake_pp_shop retruns one results for each cart item", function(){
	   var x = fake_pp_shop_research_api;
	   var lc = new ListCart();
	   lc.items[0] = new WishItem();
	   lc.items[0].description = "notepad";
	   lc.items[1] = new WishItem();
	   lc.items[1].description = "highlighter";
	   lc.items[2] = new WishItem();
	   lc.items[2].description = "ballpoint pens";
           var result = x.getResearch(1,lc);
           expect(result.orderItems.length).to.equal(3);
       });
   }); 
});
