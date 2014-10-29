var EmailAnalysis = function() {
  this.cartNumber = "";
  this.category = "";
  this.attention = "";
  this.fromAddress = "";
  this.gsaUserName = "";
};

EmailAnalysis.prototype = new EmailAnalysis();

module.exports = EmailAnalysis;
