var http = require('http');
var Imap = require('imap'),
    inspect = require('util').inspect;

var c2render = require('./c2render');


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


var password18f = process.env.WEARE18F;
var GSA_PASSWORD = process.env.GSA_PASSWORD;
var GSA_USERNAME = process.env.GSA_USERNAME;

var imap = new Imap({
  user: 'weare18f@gmail.com',
  password: password18f,
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

function parseCartIdFromGSAAdvantage(str) {
    var reg = /GSA Advantage! cart # (\d+)/gm;
    var myArray = reg.exec(str);
    if (myArray) {
    var arrayLength = myArray.length;
    for (var i = 0; i < arrayLength; i++) {
        console.log("number "+myArray[i]);
    }
	var cartNumber = myArray[1];
	return cartNumber;
    }
    return null;
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
		    console.log(prefix + 'Body');

		    // Now the plan is to buffer this, and at the end
		    // (or in the subject!) we can read the cart number via a pattern match.
		    // The cart number can then be used DIRECTLY in a web service call 
		    // to our scraping function, which builds up the type, and then 
		    // we figure out how to send the new email.
		    // 1) Get Cart #. - 1 Hour
		    // 2) Invoke a new Web Service to get the email. -- Could take a couple of hours. 
		    // 3) Send the new Email based on the webservice. -- Could take a couple of hours.
		    var buffer = '', count = 0;
		    
		    stream.on('data', function(chunk) {
			//			console.log('got %d bytes of data [%s]', chunk.length,chunk);
			buffer += chunk.toString('utf8');
		    })

		    stream.on('end', function() {
			console.log('there will be no more data.');
			var cartId = parseCartIdFromGSAAdvantage(buffer);
			if (cartId) {
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
				    console.log('XXXX' + str);
				});
			    };

			    http.request(options, callback).end();
			}
		    });
		    
		});
		msg.once('attributes', function(attrs) {
		    console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
		});
		msg.once('end', function() {
		    console.log(prefix + 'Finished');
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
