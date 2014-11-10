var EmailAnalysis = require('./emailAnalysis');
var GSA = require('./gsaAdvantage');
var C2 = require('./c2Constants');
var configs = require('../configs');


// This is rather an ugly way of doing this...
// all of these regexs could be made more efficient but
// focusing on the proper parts, and not runing over the whole
// email---improvement for the future.
function parseCompleteEmail(str, reg) {
  var myArray = reg.exec(str);
  if (myArray) {
    return myArray[1];
  }
  return null;
}

function parseAtnFromGSAAdvantage(str) {
  var attn = parseCompleteEmail(str, GSA.atn);
  var email = parseCompleteEmail(attn, GSA.email);
  return {
    "attn": attn,
    "email": email
  };
}

function consolePrintJSON(analysis) {
  console.log(JSON.stringify(analysis, null, 4));
}


var analyzeCategory = function(mail_object) {
  var analysis = new EmailAnalysis();
  // This string technically comes from Advantage, not C2---but perhaps
  // We should move it into application.yml anyway!
  //    var reg = /GSA Advantage! cart # (\d+)/gm;
  var initiationCartNumber = parseCompleteEmail(mail_object.subject, GSA.cart_id);

  console.log("html = " + mail_object.html);
  console.log("text = " + mail_object.text);
  console.log("subject = " + mail_object.subject);
  console.log("cartNumber = " + initiationCartNumber);
  if (initiationCartNumber) {
    if (configs.MODE === "debug") {
      console.log("Total initiation email = " + str);
    }
    analysis.category = "initiation";
    analysis.cartNumber = initiationCartNumber;
    attentionParsed = parseAtnFromGSAAdvantage(mail_object.html);
    analysis.approvalGroup = attentionParsed.attn;
    analysis.email = attentionParsed.email;
    analysis.initiationComment = parseCompleteEmail(mail_object.html, GSA.init_comment);
    console.log("cart initiation");
    consolePrintJSON(analysis);
    return analysis;
  } else {
    var approvalCartNumber = parseCompleteEmail(mail_object.subject,
      C2.approval_identifier);
    if (approvalCartNumber) {
      analysis.cartNumber = approvalCartNumber;
      analysis.category = "approvalreply";
      analysis.fromAddress = mail_object.from[0].address;
      analysis.gsaUsername = mail_object.to[0].name;
      analysis.date = mail_object.date;
      analysis.approve = parseCompleteEmail(mail_object.text, C2.approve_reg_exp);
      analysis.disapprove = parseCompleteEmail(mail_object.text, C2.reject_reg_exp);
      analysis.comment = analysis.approve ?
        parseCompleteEmail(mail_object.text, C2.approve_comment_reg_exp) :
        parseCompleteEmail(mail_object.text, C2.reject_comment_reg_exp);
      analysis.humanResponseText = parseCompleteEmail(mail_object.text, C2.reply_comment_reg_exp);
      console.log("approval request");
      consolePrintJSON(analysis);
      return analysis;
    }
  }
  return null;
};


exports.analyzeCategory = analyzeCategory;
