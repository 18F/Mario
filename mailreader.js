var http = require('http');
var Imap = require('imap'),
inspect = require('util').inspect;

var c2render = require('./c2render');

// mail sending stuff copied from mailsender.js...
fs = require('fs');
var http = require('http');
var nodemailer = require("nodemailer");

var simulatedMapOfUserNameToEmail = { "ROBERTLREAD" : "read.robert@gmail.com" };

var DYNO_CART_SENDER = 'communicart.sender@gmail.com';   

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
    process.env.COMMUNICART_DOT_SENDER
);

function sendFrDynoCart(dynoCartSender,from, recipients, subject, message) {
    var fromString = from + ' <' + dynoCartSender +'>';
    console.log('from is "' + fromString + '"');
    console.log('recipient is "' + recipients + '"');
    console.log('subject is "' + subject + '"');
    console.log('___________');
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


// This url must be have p (password), u (url), and cart_id 
var GSA_SCRAPE_URL = 'http://gsa-advantage-scraper/cgi-bin/gsa-adv-cart.py';


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

var GSA_PASSWORD = process.env.GSA_PASSWORD;
var GSA_USERNAME = process.env.GSA_USERNAME;

var imap = new Imap({
    user: 'communicart.sender@gmail.com',
    password: process.env.COMMUNICART_DOT_SENDER,
    host: 'imap.gmail.com',
    port: 993,
    tls: true
});

function openInbox(cb) {
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
//	var arrayLength = myArray.length;
//	for (var i = 0; i < arrayLength; i++) {
//            console.log("number "+myArray[i]);
//	}
	var result = myArray[1];
	return result;
    }
    return null;
}

function parseCartIdFromGSAAdvantage(str) {
    var reg = /GSA Advantage! cart # (\d+)/gm;
    return parseCompleteEmail(str,reg);
}

function parseAtnFromGSAAdvantage(str) {
    var reg = /\[Atn: (\S+@\S+\.\S+)\]/gm;
    return parseCompleteEmail(str,reg);
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
	    
function consolePrint(analysis) {
    console.log("analysis.category "+analysis.category);
    console.log("analysis.attention "+analysis.attention);
    console.log("analysis.cartNumber "+analysis.cartNumber);
    console.log("analysis.fromAddress "+analysis.fromAddress);
    console.log("analysis.gsaUsername "+analysis.gsaUsername);
    console.log("analysis.date "+analysis.date);
}
function analyze_category(str) {
    var analysis = new EmailAnalysis();
    var reg = /Subject: GSA Advantage! cart # (\d+)/gm;
    var initiationCartNumber = parseCompleteEmail(str,reg);
    if (initiationCartNumber) {
	analysis.category = "initiation";
	analysis.cartNumber = initiationCartNumber;
	var atn = parseAtnFromGSAAdvantage(str);
	analysis.attention = atn;
	consolePrint(analysis);
	return analysis;
    } else {
	var reg = /Re: please approve Cart Number: (\d+)/gm;
	var approvalCartNumber = parseCompleteEmail(str,reg);
	if (approvalCartNumber) {
	    analysis.cartNumber = approvalCartNumber;
	    analysis.category = "approvalreply";	    
	    analysis.fromAddress = parseFromEmail(str);
	    analysis.gsaUsername = parseGsaUsername(str);
	    analysis.date = parseDate(str);
	    consolePrint(analysis);
	    return analysis;
	}
    }
    return null;
}

function processInitiation(analysis) {
    var recipientEmail = analysis.attention;
    var cartId = analysis.cartNumber;
    console.log('XXXX:' + recipientEmail);
    console.log('YYY:' + cartId);
    if (cartId && recipientEmail) {
	var options = {
	    host: 'gsa-advantage-scraper',
	    path: String.format('/cgi-bin/gsa-adv-cart.py?p={0}&u={1}&cart_id={2}',
				encodeURIComponent(GSA_PASSWORD),encodeURIComponent(GSA_USERNAME),cartId)
	};

	callback = function(response) {
	    var str = '';

	    //another chunk of data has been recieved, so append it to `str`
	    response.on('data', function (chunk) {
		str += chunk;
	    });

	    //the whole response has been recieved, so we just print it out here
	    response.on('end', function () {
		var data = eval(str);
		var rendered_html = c2render.renderListCart(c2render.generateCart(data));
		var subject = "please approve Cart Number: "+cartId;
		var from = GSA_USERNAME;
		sendFrDynoCart(DYNO_CART_SENDER,from, recipientEmail, subject, rendered_html)
	    });
	};
	http.request(options, callback).end();
    };
}

imap.once('ready', function() {

    openInbox(function(err, box) {
	if (err) throw err;
	imap.search([ 'UNSEEN', ['SINCE', 'May 20, 2010'] ], function(err, results) {
	    if (err) throw err;
	    var f = imap.fetch(results, { bodies: '' });
	    f.on('message', function(msg, seqno) {
		console.log('Message #%d', seqno);
		var prefix = '(#' + seqno + ') ';
		msg.on('body', function(stream, info) {

		    var buffer = '', count = 0;
		    
		    stream.on('data', function(chunk) {
			buffer += chunk.toString('utf8');
		    })

		    stream.on('end', function() {
			console.log('there will be no more data.');
			// We must categorize the email, the most basic 
			// categorization being a two:
			// *) An initiation email send from GSA Advantage.
			// *) A reply.
//			console.log('Total Email:'+buffer);
			var analysis = analyze_category(buffer);
			if (!analysis) {
			    console.log('Cannot categorize, doing nothing!');
			} else if (analysis.category == "initiation") {
			    processInitiation(analysis);
			} else if (analysis.category == "approvalreply") {
			    // Now we must treat this as a reply...
			    // But in fact I have no endpoint to sent this to.
			    // Therefore as a stopgap I will send an "approval received" 
			    // email to the originator...if I can determine it!
			    // To simulate this, I have created a 
			    var subject = "Approved for Cart Number: "+analysis.cartNumber;
                            var emailBody = String.format('At time {0}, approver {1} approved Car Number {2}.  So please fulfill the order with all deliberate speed.',
							  analysis.date,
							  analysis.fromAddress,
							  analysis.cartNumber);

			    sendFrDynoCart(DYNO_CART_SENDER,analysis.fromAddress,
					   simulatedMapOfUserNameToEmail[analysis.gsaUsername],
					   subject,
					   emailBody			    
					  );
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
	    });
	});
    });
});

imap.once('error', function(err) {
    console.log(err);
});

imap.once('end', function() {
    console.log('Connection ended');
});

imap.connect();
