mariotype = require('./mariotype');

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function renderResultItem(orderItem) {
	var html = "";
        html +=   ' <div class="w-container results-list">';

	html +=      ' <div class="w-row result-item">';

        html +=     '<div class="w-col w-col-2">';
        html +=      '<p><strong>'+orderItem.ci.name+'</strong></p>';
        html +=     '</div>';

        html +=     '<div class="w-col w-col-2">';
        html +=      '<p><strong>'+orderItem.ci.description.substring(0,60)+'</strong></p>';
        html +=     '</div>';

        html +=     '<div class="w-col w-col-2">';
        html +=      '<p><strong>'+orderItem.units+'</strong></p>';
        html +=     '</div>';

        html +=     '<div class="w-col w-col-2">';
        html +=      '<p><strong>'+orderItem.ci.detail.substring(0,60)+'</strong></p>';
        html +=     '</div>';

        html +=     '<div class="w-col w-col-2">';
        html +=      '<p><strong>'+orderItem.ci.vendor+'</strong></p>';
        html +=     '</div>';

        html +=     '<div class="w-col w-col-2">';
        html +=      '<p><strong>'+'$'+numberWithCommas(orderItem.ci.unit_price)+'</strong></p>';
        html +=     '</div>';

	html +=      '</div>';
	html +=      '</div>';
        return html;
}

function renderListCartItems(items) {
      var html = "";
      for(i = 0; i < items.length; i++) {
         html = html + renderResultItem(items[i]);
      }
      return html;
}



// This relies on the clientdata having an standard index number.
exports.renderListCart = function renderListCart(lc) {
     var html = "";

     html += '<div class="w-container results-header-container">';
     html += '     <div>';
     html += '       <h3>'+lc.name+'</h3>';
     html += '     </div>';
     html += '   </div>';
     html += '     <div>';
     html += '       <div class="w-row header">';
     html += '         <div class="w-col w-col-2">';
     html += '           <h5>Name</h5>';
     html += '         </div>';
     html += '         <div class="w-col w-col-2">';
     html += '           <h5>Description</h5>';
     html += '         </div>';
     html += '         <div class="w-col w-col-2">';
     html += '           <h5>Quantity</h5>';
     html += '         </div>';
     html += '         <div class="w-col w-col-2">';
     html += '           <h5>Details</h5>';
     html += '         </div>';
     html += '         <div class="w-col w-col-2">';
     html += '           <h5>Tags</h5>';
     html += '         </div>';
     html += '         <div class="w-col w-col-2">';
     html += '           <h5>Price</h5>';
     html += '         </div>';
     html += '       </div>';
     html += '     </div>';

     html += renderListCartItems(lc.items);

     html += '<div id="listcart_area'+lc.clientdata+'">\n';
     html += '</div>\n';
     html += '     <div>';
     html += '       <div class="w-row total-price-row">';
     html += '         <div class="w-col w-col-10 total-price">';
     html += '           <p><strong>Total Price</strong>';
     html += '           </p>';
     html += '         </div>';
     html += '         <div class="w-col w-col-2">';
     html += '           <p><strong>$ 27.98</strong>';
     html += '           </p>';
     html += '         </div>';
     html += '       </div>';
     html += '     </div>';
     html += '     <div class="w-form">';
     html += '       <form class="button-submit" name="email-form" data-name="Email Form">';
     html += '         <input class="w-button form-button" type="submit" value="Send for Approval" data-wait="Sending..." wait="Sending..."></input>';
     html += '       </form>';
     html += '       <div class="w-form-done">';
     html += '         <p>Thank you! Your submission has been received!</p>';
     html += '       </div>';
     html += '       <div class="w-form-fail">';
     html += '         <p>Oops! Something went wrong while submitting the form :(</p>';
     html += '       </div>';
     html += '     </div>';
     return html;
}


exports.generateCart = function generateCart(data) {
   var lc = new mariotype.ListCart();
   lc.name = "Adam's Example Cart";
   lc.items = new Array();
// This is unattractive but perhaps necessary...
// The ListCart Abstrat Data Type should and cannot be quite the same 
// as the GSA Advantage cart, though obviously they are in the same clade...
   for (var i = 0; i < data.length; i++) {
      lc.items[i] = new mariotype.OrderItem();
      var gsa = data[i];
      lc.items[i].units = gsa['qty'];
      lc.items[i].ci = new mariotype.CatalogItem();
      lc.items[i].ci.name = "binder";
      lc.items[i].ci.description = gsa['description'];
      lc.items[i].ci.detail = gsa['details'];
      lc.items[i].ci.vehicle = "GSA Advantage";
      lc.items[i].ci.SKU = "7510-01-519-4381";
      lc.items[i].ci.unit_price = gsa['price'];
      lc.items[i].ci.vendor = gsa['vendor'];
      lc.items[i].ci.compliances[0] = mariotype.BPA;
      lc.items[i].ci.compliances[1] = mariotype.GREEN;
   }
   return lc;

}
