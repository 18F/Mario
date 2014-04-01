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

function parseAPPROVE(str) {
    console.log("Total Mail: "+str);
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
    var reg = /\[Atn: \S+@\S+\.\S+\]([\s\S]*?)<BR><BR>/gm;
    return parseCompleteEmail(str,reg);
}

function consolePrintJSON(analysis) {

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
    console.log("analysis.cart "+analysis.cart);
}
function analyze_category(str) {
    var analysis = new EmailAnalysis();
    var reg = /Subject: GSA Advantage! cart # (\d+)/gm;
    var initiationCartNumber = parseCompleteEmail(str,reg);
    if (initiationCartNumber) {
	console.log("Total initiation email = "+str);
	analysis.category = "initiation";
	analysis.cartNumber = initiationCartNumber;
	var atn = parseAtnFromGSAAdvantage(str);
	analysis.attention = atn;
	var comment = parseInitiationComment(str);
	console.log("comment = "+comment);
	analysis.initiationComment = comment;
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
	    analysis.approve = parseAPPROVE(str);
	    analysis.disapprove = parseDISAPPROVE(str);
	    consolePrint(analysis);
	    return analysis;
	}
    }
    return null;
}

function executeInitiationMailDelivery(path,analysis) {
    var options = {
	host: 'localhost',
	port: '3000',
	method: 'POST',
	json: analysis,
	path: String.format(path)
    };

// Really we don't have anything to do, though 
// I suppose in a perfect world we wouldn't mark 
// the email as seen until this succeeds..
    function callback(error, response, body) {
	if (!error && response.statusCode == 200) {
	    var info = JSON.parse(body);
	    console.log(body);
	    console.log(info);
	}
    }
    request(options, callback);
}

function processInitiation(analysis) {
    var recipientEmail = analysis.attention;
    if (analysis.cartNumber && recipientEmail) {
	console.log("inside process Initiation");
	var options = {
	    url: 'http://'+'gsa-advantage-scraper'+
		String.format('/cgi-bin/gsa-adv-cart.py?p={0}&u={1}&cart_id={2}',
			      encodeURIComponent(GSA_PASSWORD),encodeURIComponent(GSA_USERNAME),analysis.cartNumber)
	};

	function callback(error, response, body) {
	    if (!error && response.statusCode == 200) {
		var info = JSON.parse(body);
		console.log(body);
		console.log(info);

		var data = eval(info);
		analysis.cart = data;

		executeInitiationMailDelivery('/path',analysis);
		consolePrint(analysis);
		console.log(JSON.stringify(analysis,null,4));
	    }
	}
	request(options, callback);
    }
}
/*
function processInitiationOld(analysis) {
    var recipientEmail = analysis.attention;
    if (analysis.cartNumber && recipientEmail) {
	console.log("inside process Initiation");
	var options = {
            host: 'gsa-advantage-scraper',
            path: String.format('/cgi-bin/gsa-adv-cart.py?p={0}&u={1}&cart_id={2}',
				encodeURIComponent(GSA_PASSWORD),encodeURIComponent(GSA_USERNAME),analysis.cartNumber)
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
		analysis.cart = data;

		executeInitiationMailDelivery(analysis);
		consolePrint(analysis);
		console.log(JSON.stringify(analysis,null,4));

// Eventually, this should all go away...
		var rendered_html = c2render.renderListCart(c2render.generateCart(data));
		var subject = "please approve Cart Number: "+analysis.cartNumber;
		rendered_html = "<p>Here is the comment sent to you:</p><p>BEGIN COMMENT</p><p>"+analysis.initiationComment+"</p><p>END COMMENT</p>" + rendered_html;
		rendered_html = "<p></p><p>------------------</p><p>Please reply with the word 'APPROVE' or 'DISAPPROVE' begining a line with nothing else on that line.</p>" + rendered_html;
		var from = GSA_USERNAME;
		sendFrDynoCart(DYNO_CART_SENDER,from, recipientEmail, subject, rendered_html)
	    });
	};
	http.request(options, callback).end();
    };
}
*/

function processApprovalReply(analysis) {
/*
    // Now we must treat this as a reply...
    // But in fact I have no endpoint to sent this to.
    // Therefore as a stopgap I will send an "approval received" 
    // email to the originator...if I can determine it!
    // To simulate this, I have created a 
    var approved = (analysis.approve && !analysis.disapprove);
    var subject = (approved ? "Approved" : "Disapproved") + " for Cart Number: "+analysis.cartNumber;

    var approvalMessage = approved ? "{1} approved" : "{1} disapproved";
    var approvalInstruction = approved ? "<p>Please purchase that cart with all deliberate speed.</p>" : "<p>You may wish to contact the approver for more explanation.</p>";

    var emailBody = String.format('At time {0}, approver '+approvalMessage+' Cart Number {2}.  {3}',
				  analysis.date,
				  analysis.fromAddress,
				  analysis.cartNumber,
				  approvalInstruction);

    sendFrDynoCart(DYNO_CART_SENDER,analysis.fromAddress,
		   simulatedMapOfUserNameToEmail[analysis.gsaUsername],
		   subject,
		   emailBody			    
		  );
*/
    executeInitiationMailDelivery('/notification',analysis);
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
    console.log(err);
});

imap.once('end', function() {
    console.log('Connection ended');
});


imap.connect();

