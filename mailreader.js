// Now need to add the
var http = require('http');
var request = require('request');
var querystring = require('querystring');
var Imap = require('imap');
var inspect = require('util').inspect;

var yaml = require('js-yaml');
var fs = require('fs');

var MailParser = require("mailparser").MailParser;

// mail sending stuff copied from mailsender.js...
fs = require('fs');
var http = require('http');
var nodemailer = require("nodemailer");
var configs = require('./configs');


// Get the C2 yml, or throw exception on error
try {
  var c2_doc = yaml.safeLoad(fs.readFileSync(configs.C2_APPLICATION_YML_PATH, 'utf8'));
  var c2_rel_doc = c2_doc["constants"];
} catch (e) {
  console.log("Existing because couldn't find C2 yml file");
  process.exit();
}

// Get the Mario yml, or throw exception on error
try {
  var mario_doc = yaml.safeLoad(fs.readFileSync(configs.GSA_ADVANTAGE_PATH, 'utf8'));
  var mario_rel_doc = mario_doc["constants"];
} catch (e) {
  console.log("Existing because couldn't find mario yml file");
  process.exit();
}

var approval_regexp = c2_rel_doc.email_title_for_approval_request_reg_exp;

console.log(mario_rel_doc);

var cart_id_from_GSA_Advantage = new RegExp(mario_rel_doc.cart_id_from_GSA_Advantage, "gm");
var atn_from_gsa_advantage = new RegExp(mario_rel_doc.atn_from_gsa_advantage, "gm");
var email_from_gsa_advantage = new RegExp(mario_rel_doc.email_from_gsa_advantage, "gm");
var init_comment_from_gsa = new RegExp(mario_rel_doc.init_comment_from_gsa, "gm");

var reject_reg_exp = new RegExp(c2_rel_doc.reject_reg_exp, "gm");
var approve_reg_exp = new RegExp(c2_rel_doc.approve_reg_exp, "gm");
var reject_comment_reg_exp = new RegExp(c2_rel_doc.reject_comment_reg_exp, "gm");
var approve_comment_reg_exp = new RegExp(c2_rel_doc.approve_comment_reg_exp, "gm");
var reply_comment_reg_exp = new RegExp(c2_rel_doc.reply_comment_reg_exp, "gm");

var approval_identifier = new RegExp(approval_regexp);

var DYNO_CART_SENDER = configs.DYNO_CART_SENDER;
var SENDER_CREDENTIALS = configs.SENDER_CREDENTIALS;

function instantiateGmailTransport(username, password) {
  return nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
      user: username,
      pass: password
    }
  });
}

var dynoCartXport = instantiateGmailTransport(
  DYNO_CART_SENDER,
  SENDER_CREDENTIALS
);

var imap = new Imap({
  user: DYNO_CART_SENDER,
  password: SENDER_CREDENTIALS,
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

function openInbox(cb) {
  // But "true" here if you want to leave the emails you are reading in place...
  // probably this should be a command-line argument for debugging purposes.
  imap.openBox('INBOX', configs.LEAVE_EMAIL_IN_PLACE, cb);
}

// Currently these are operating on the COMPLETE
// email message.  This is very inefficient, and
// can be made significantly better which the time comes.

EmailAnalysis = function EmailAnalysis() {
  this.cartNumber = "";
  this.category = "";
  this.attention = "";
  this.fromAddress = "";
  this.gsaUserName = "";
}

EmailAnalysis.prototype = new EmailAnalysis;

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
  var attn = parseCompleteEmail(str, atn_from_gsa_advantage);
  var email = parseCompleteEmail(attn, email_from_gsa_advantage);
  return {
    "attn": attn,
    "email": email
  };
}

function consolePrintJSON(analysis) {
  console.log(JSON.stringify(analysis, null, 4));
}

function analyzeCategory(mail_object) {
  var analysis = new EmailAnalysis();
  // This string technically comes from Advantage, not C2---but perhaps
  // We should move it into application.yml anyway!
  //    var reg = /GSA Advantage! cart # (\d+)/gm;
  var initiationCartNumber = parseCompleteEmail(mail_object.subject, cart_id_from_GSA_Advantage);

  console.log("html = " + mail_object.html);
  console.log("text = " + mail_object.text);
  console.log("subject = " + mail_object.subject);
  console.log("cartNumber = " + initiationCartNumber);
  if (initiationCartNumber) {
    if (configs.MODE == "debug") {
      console.log("Total initiation email = " + str);
    }
    analysis.category = "initiation";
    analysis.cartNumber = initiationCartNumber;
    attentionParsed = parseAtnFromGSAAdvantage(mail_object.html);
    analysis.approvalGroup = attentionParsed.attn;
    analysis.email = attentionParsed.email;
    analysis.initiationComment = parseCompleteEmail(mail_object.html, init_comment_from_gsa);
    console.log("cart initiation");
    consolePrintJSON(analysis);
    return analysis;
  } else {
    var approvalCartNumber = parseCompleteEmail(mail_object.subject,
      approval_identifier);
    if (approvalCartNumber) {
      analysis.cartNumber = approvalCartNumber;
      analysis.category = "approvalreply";
      analysis.fromAddress = mail_object.from[0].address;
      analysis.gsaUsername = mail_object.to[0].name;
      analysis.date = mail_object.date;
      analysis.approve = parseCompleteEmail(mail_object.text, approve_reg_exp);
      analysis.disapprove = parseCompleteEmail(mail_object.text, reject_reg_exp);
      analysis.comment = analysis.approve ?
        parseCompleteEmail(mail_object.text, approve_comment_reg_exp) :
        parseCompleteEmail(mail_object.text, reject_comment_reg_exp);
      analysis.humanResponseText = parseCompleteEmail(mail_object.text, reply_comment_reg_exp);
      console.log("approval request");
      consolePrintJSON(analysis);
      return analysis;
    }
  }
  return null;
}

function executeInitiationMailDelivery(path, analysis) {
  var options = {
    uri: configs.C2_SERVER_ENDPOINT + path, //TODO: Configuration file for this
    method: 'POST',
    json: analysis,
    path: ""
  };

  // Really we don't have anything to do, though
  // I suppose in a perfect world we wouldn't mark
  // the email as seen until this succeeds..
  function callback(error, response, body) {
    console.log("callback from Ruby:" + path);
    console.log("error:" + error);

    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  }
  console.log("making request to Ruby:" + path);
  console.log("Data is:");
  console.log(JSON.stringify(analysis, null, 4));
  request(options, callback);
}

function generalizeScraperTraits(cartItems) {
  var len = cartItems.length;
  for (var i = 0; i < len; i++) {
    var citem = cartItems[i];
    citem.traits = {
      "socio": citem.socio,
      "features": citem.features,
      "green": citem.green
    };
    delete citem["socio"];
    delete citem["features"];
    delete citem["green"];
  }
  return cartItems;
}

function processInitiation(analysis) {
  if (analysis.cartNumber) {
    console.log("inside process Initiation");
    var params = querystring.stringify({
      u: configs().GSA_USERNAME,
      p: configs().GSA_PASSWORD
    });
    var options = {
      url: configs.GSA_SCRAPE_URL + '/api/v1/carts/' + analysis.cartNumber + '?' + params
    };

    function callback(error, response, body) {
      console.log("Back from Scraper");
      // Here I'm going to pack socio, green, and features, which
      // are known to the GSA SCRAPER into a single "JSON" object.
      if (!error && response.statusCode == 200) {
        console.log(body);
        var info = JSON.parse(body);
        var data = eval(info);
        analysis.cartItems = generalizeScraperTraits(data['cartItems']);
        analysis.cartName = data['cartName'];

        console.log(JSON.stringify(analysis, null, 4));
        executeInitiationMailDelivery('/send_cart', analysis);
      } else {
        console.log("error = " + error);
        console.log("statusCode = " + response.statusCode);
      }
    }
    request(options, callback);
  }
}

function processApprovalReply(analysis) {
  executeInitiationMailDelivery('/approval_reply_received', analysis);
}
var GLOBAL_MESSAGES = [];

imap.once('ready', function() {

  openInbox(function(err, box) {
    if (err) {
      console.log("Yes, I got an err param: " + err);
      throw err;
    }
    imap.search(['UNSEEN'], function(err, results) {
      if (err) throw err;
      if (results == null || results.length == 0) {
        console.log("Nothing to fetch!");
        console.log(err);
        // It's okay to kill here because presumably we have nothing to do..
        process.exit(code = 0);
      }
      console.log("results.length = " + results.length);
      var f = imap.fetch(results, {
        bodies: '',
        markSeen: true
      });
      f.on('message', function(msg, seqno) {
        console.log('Message #%d', seqno);
        var prefix = '(#' + seqno + ') ';
        msg.on('body', function(stream, info) {
          var buffer = '',
            count = 0;
          stream.on('data', function(chunk) {
            buffer += chunk.toString('utf8');
          });

          stream.on('end', function() {
            // I used to put this here, but am moving out
            // to mark as unread faster---might have to
            // move even further out
            GLOBAL_MESSAGES.push(buffer);
            console.log("QQQQQQQQQ");
            console.log("Just pushed :" + buffer);
          });

          msg.once('attributes', function(attrs) {
            console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
          });
          msg.once('end', function() {});
        });
      });
      f.once('error', function(err) {
        console.log('Fetch error: ' + err);
      });
      f.once('end', function() {
        console.log('Done fetching all messages!');
        imap.end();
        arrayLength = GLOBAL_MESSAGES.length;
        for (var i = 0; i < arrayLength; i++) {
          mailparser = new MailParser();

          // setup an event listener when the parsing finishes
          mailparser.on("end", function(mail_object) {
            var analysis = analyzeCategory(mail_object);
            if (!analysis) {
              console.log('Cannot categorize, doing nothing!');
            } else if (analysis.category == "initiation") {
              processInitiation(analysis);
            } else if (analysis.category == "approvalreply") {
              processApprovalReply(analysis);
            } else {
              console.log('Unimplemented Category:' + analysis.category);
            };

          });
          mailparser.write(GLOBAL_MESSAGES[i]);
          mailparser.end();
        }
        // We would like to exit, but doing so on this event
        // ends this process to soon...if necessary, we could figure out
        // how to wait on all threads and count the messages processed,
        // but that is a low priority at present.
        // So you kill the process by hand...yukky.
        //    process.exit(code=0);
      });
    });
  });
});

imap.once('error', function(err) {
  console.log('IMAP ERROR');
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});


imap.connect();

exports.analyzeCategory = analyzeCategory;
