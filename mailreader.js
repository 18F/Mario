// Now need to add the
var http = require('http');
var request = require('request');
var scraper = require('./lib/scraper');
var analyzer = require('./lib/analyzer');
var Imap = require('imap');
var inspect = require('util').inspect;

var yaml = require('js-yaml');
var fs = require('fs');

var MailParser = require("mailparser").MailParser;

// mail sending stuff copied from mailsender.js...
var fs = require('fs');
var http = require('http');
var nodemailer = require("nodemailer");
var configs = require('./configs');
var C2 = require('./lib/c2Constants');
var GSA = require('./lib/gsaAdvantage');

var DYNO_CART_SENDER = configs.DYNO_CART_SENDER;
var COMMUNICART_DOT_SENDER = configs.COMMUNICART_DOT_SENDER;

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
  COMMUNICART_DOT_SENDER
);

var imap = new Imap({
  user: DYNO_CART_SENDER,
  password: COMMUNICART_DOT_SENDER,
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

function executeInitiationMailDelivery(path, analysis) {
  var options = {
    uri: configs.C2_SERVER_ENDPOINT + path, //TODO: Configuration file for this
    method: 'POST',
    json: analysis,
    path: "",
    headers: {'X-Api-Key': configs.C2_API_KEY}
  };

  // Really we don't have anything to do, though
  // I suppose in a perfect world we wouldn't mark
  // the email as seen until this succeeds..
  function callback(error, response, body) {
    console.log("callback from Ruby:" + path);
    console.log("error:" + error);

    if (!error && response.statusCode === 200) {
      console.log(body);
    }
  }
  console.log("making request to Ruby:" + path);
  console.log("Data is:");
  console.log(JSON.stringify(analysis, null, 4));
  request(options, callback);
}

function processInitiation(analysis) {
  if (analysis.cartNumber) {
    console.log("inside process Initiation");

    scraper.scrape(analysis.cartNumber).then(function(data) {
      analysis.cartItems = data.cartItems;
      analysis.cartName = data.cartName;
      console.log(JSON.stringify(analysis, null, 4));
      executeInitiationMailDelivery('/send_cart', analysis);
    });
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
      if (!results || results.length === 0) {
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
            var analysis = analyzer.analyzeCategory(mail_object);
            if (!analysis) {
              console.log('Cannot categorize, doing nothing!');
            } else if (analysis.category === "initiation") {
              processInitiation(analysis);
            } else if (analysis.category === "approvalreply") {
              processApprovalReply(analysis);
            } else {
              console.log('Unimplemented Category:' + analysis.category);
            }

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
  console.log("%j", err);
});

imap.once('end', function() {
  console.log('Connection ended');
});


// don't run if file isn't run directly (e.g. during test coverage check)
if (require.main === module) {
  imap.connect();
}
