// Now need to add the 
var http = require('http');
var request = require('request');
var Imap = require('imap'),
inspect = require('util').inspect;

var c2render = require('./c2render');

// mail sending stuff copied from mailsender.js...
fs = require('fs');
var http = require('http');
var nodemailer = require("nodemailer");
var configs = require('./configs');

var simulatedMapOfUserNameToEmail = configs().SIM_MAP_USER_EMAIL;

var DYNO_CART_SENDER = configs().DYNO_CART_SENDER;
var SENDER_CREDENTIALS = configs().SENDER_CREDENTIALS;

function instantiateGmailTransport(username, password) {
    return nodemailer.createTransport("SMTP",{
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

function sendFrDynoCart(dynoCartSender,from, recipients, subject, message) {
    var fromString = from + ' <' + dynoCartSender +'>';
    if (configs().MODE == "debug") {
	console.log('from is "' + fromString + '"');
	console.log('recipient is "' + recipients + '"');
	console.log('subject is "' + subject + '"');
	console.log('___________');
    }

    dynoCartXport.sendMail(
        {
            from: fromString,
            to: recipients,
            subject: subject,
            text: "you need an html capable email client",
            html: message
        },
        function(error, response){
            console.log("MAIL RESULT =========");
            if (error) {
                console.log("Mail Error:"+error);
            } else {
                console.log("Message sent(from " + from + "): " +
                            response.message);
            }
        });
}

// taken from StackOverflow: http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.format) {
    String.format = function(format) {
	var args = Array.prototype.slice.call(arguments, 1);
	return format.replace(/{(\d+)}/g, function(match, number) { 
	    return typeof args[number] != 'undefined'
		? args[number] 
		: match
	    ;
	});
    };
}

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
    imap.openBox('INBOX', true, cb);
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

function parseCompleteEmail(str,reg) {
    var myArray = reg.exec(str);
    if (myArray) {
	return myArray[1];
    }
    return null;
}

function parseCartIdFromGSAAdvantage(str) {
    var reg = /GSA Advantage! cart # (\d+)/gm;
    return parseCompleteEmail(str,reg);
}

function parseAtnFromGSAAdvantageOld(str) {
    var reg = /\[Atn: (\S+@\S+\.\S+)\]/gm;
    return parseCompleteEmail(str,reg);
}

function parseAtnFromGSAAdvantage(str) {
    var areg = /\[Atn: (\S+)\]/gm;
    var attn =  parseCompleteEmail(str,areg);
    var ereg = /(\S+@\S+\.\S+)/gm;
    var email =  parseCompleteEmail(attn,ereg);
    return { "attn" : attn, "email" : email };
}

function parseFromEmail(str) {
    var reg = /From: .* <(\S+@\S+\.\S+)>/gm;
    return parseCompleteEmail(str,reg);
}

function parseGsaUsername(str) {
    var reg = /To: (\S+) <communicart.sender@gmail.com>/gm;
    return parseCompleteEmail(str,reg);
}

function parseDate(str) {
    var reg = /Date: (.*)/gm;
    return parseCompleteEmail(str,reg);
}

function parseAPPROVE(str) {
    if (configs().MODE == "debug") {
	console.log("Total Mail: "+str);
    }
    var reg = /^(APPROVE)$/gm;
    return parseCompleteEmail(str,reg);
}

function parseDISAPPROVE(str) {
    var reg = /^(DISAPPROVE)$/gm;
    return parseCompleteEmail(str,reg);
}

// This is rather an ugly way of doing this...
// all of these regexs could be made more efficient but 
// focusing on the proper parts, and not runing over the whole
// email---improvement for the future.
function parseInitiationComment(str) {
    var reg = /\[Atn: \S+]([\s\S]*?)<BR><BR>/gm;
    return parseCompleteEmail(str,reg);
}

function consolePrintJSON(analysis) {
    console.log(JSON.stringify(analysis,null,4));
}
function consolePrint(analysis) {
    console.log("analysis.category "+analysis.category);
    console.log("analysis.attention "+analysis.attention);
    console.log("analysis.cartNumber "+analysis.cartNumber);
    console.log("analysis.fromAddress "+analysis.fromAddress);
    console.log("analysis.gsaUsername "+analysis.gsaUsername);
    console.log("analysis.date "+analysis.date);
    console.log("analysis.approve "+analysis.approve);
    console.log("analysis.disapprove "+analysis.disapprove);
    console.log("analysis.cartItems "+analysis.cartItems);
    console.log("analysis.cartName "+analysis.cartName);
}
function analyze_category(str) {
    var analysis = new EmailAnalysis();
    var reg = /Subject: GSA Advantage! cart # (\d+)/gm;
    var initiationCartNumber = parseCompleteEmail(str,reg);
    if (initiationCartNumber) {
	if (configs().MODE == "debug") {
	    console.log("Total initiation email = "+str);
	}
	analysis.category = "initiation";
	analysis.cartNumber = initiationCartNumber;
	analysis.approvalGroup = parseAtnFromGSAAdvantage(str).attn;
	analysis.email = parseAtnFromGSAAdvantage(str).email;
	analysis.initiationComment = parseInitiationComment(str);
	console.log("cart initiation");
        consolePrintJSON(analysis);
	return analysis;
    } else {
	var reg = /Re: Please approve Cart Number: (\d+)/gm;
	var approvalCartNumber = parseCompleteEmail(str,reg);
	if (approvalCartNumber) {
	    analysis.cartNumber = approvalCartNumber;
	    analysis.category = "approvalreply";	    
	    analysis.fromAddress = parseFromEmail(str);
	    analysis.gsaUsername = parseGsaUsername(str);
	    analysis.date = parseDate(str);
	    analysis.approve = parseAPPROVE(str);
	    analysis.disapprove = parseDISAPPROVE(str);
	    console.log("approval request");
            consolePrintJSON(analysis);
	    return analysis;
	}
    }
    console.log("FFFFFFFFFFF");
    return null;
}

function executeInitiationMailDelivery(path,analysis) {
    var options = {
	uri: 'http://localhost:3000'+path,
	method: 'POST',
	json: analysis,
	path: ""
    };

// Really we don't have anything to do, though 
// I suppose in a perfect world we wouldn't mark 
// the email as seen until this succeeds..
    function callback(error, response, body) {
        console.log("callback from Ruby:"+path);
        console.log("error:"+error);
//        console.log("response:"+response.statusCode);

	if (!error && response.statusCode == 200) {
	    console.log(body);
	}
    }
    console.log("making request to Ruby:"+path);
    console.log("Data is:");
    console.log(JSON.stringify(analysis,null,4));
    request(options, callback);
}

function processInitiation(analysis) {
    if (analysis.cartNumber) {
	console.log("inside process Initiation");
	var options = {
	    url: configs().GSA_SCRAPE_URL + 
		String.format('?p={0}&u={1}&cart_id={2}',
			      encodeURIComponent(configs().GSA_PASSWORD),encodeURIComponent(configs().GSA_USERNAME),analysis.cartNumber)
	};

	function callback(error, response, body) {
	    console.log("Back from Scraper");
	    if (!error && response.statusCode == 200) {
		console.log(body);
		var info = JSON.parse(body);
		var data = eval(info);
		analysis.cartItems = data['cartItems'];
		analysis.cartName = data['cartName'];

		console.log(JSON.stringify(analysis,null,4));
		executeInitiationMailDelivery('/send_cart',analysis);
	    } else {
		console.log("error = "+error);
		console.log("statusCode = "+response.statusCode);
		}
	}
	request(options, callback);
    }
}

function processApprovalReply(analysis) {
    executeInitiationMailDelivery('/approval_reply_received',analysis);
}

imap.once('ready', function() {

    openInbox(function(err, box) {
	if (err) {
	    console.log("Yes, I got an err param: "+err);
	    throw err;
	}
	imap.search([ 'UNSEEN' ], function(err, results) {
	    if (err) throw err;
	    if (results == null || results.length == 0) {
		console.log("Nothing to fetch!");
		console.log(err);
		// It's okay to kill here because presumably we have nothing to do..
		process.exit(code=0);
       	    }
	    var f = imap.fetch(results, { bodies: '', markSeen: true });
	    f.on('message', function(msg, seqno) {
		console.log('Message #%d', seqno);
		var prefix = '(#' + seqno + ') ';
		msg.on('body', function(stream, info) {
		    var buffer = '', count = 0;
		    stream.on('data', function(chunk) {
			buffer += chunk.toString('utf8');
		    });

		    stream.on('end', function() {
			// We must categorize the email, the most basic 
			// categorization being a two:
			// *) An initiation email send from GSA Advantage.
			// *) A reply.
			var analysis = analyze_category(buffer);
			if (!analysis) {
			    console.log('Cannot categorize, doing nothing!');
			} else if (analysis.category == "initiation") {
			    processInitiation(analysis);
			} else if (analysis.category == "approvalreply") {
			    processApprovalReply(analysis);
			} else {
			    console.log('Unimplemented Category:'+analysis.category);
  			};
		    });

		    msg.once('attributes', function(attrs) {
			console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
		    });
		    msg.once('end', function() {
			console.log(prefix + 'Finished');
		    });
		});
	    });
	    f.once('error', function(err) {
		console.log('Fetch error: ' + err);
	    });
	    f.once('end', function() {
		console.log('Done fetching all messages!');
		imap.end();
		// We would like to exit, but doing so on this event 
		// ends this process to soon...if necessary, we could figure out
		// how to wait on all threads and count the messages processed,
		// but that is a low priority at present.
		// So you kill the process by hand...yukky.
		//		process.exit(code=0);
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

