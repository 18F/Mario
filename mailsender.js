fs = require('fs');
var http = require('http');
var nodemailer = require("nodemailer");

var dynoCartSender;    // This is a quick and dirty way to keep the user

function instantiateGmailTransport(username, password) {
    dynoCartSender = username;
    return nodemailer.createTransport("SMTP",{
        service: "Gmail",
        auth: {
            user: username,
            pass: password
        }
    });
}

var dynoCartXport = instantiateGmailTransport(
    'communicart.sender@gmail.com',
    process.env.COMMUNICART_DOT_SENDER
    );

// from is user-friendly name of sender
// message is html string

function sendFrDynoCart(from, recipients, subject, message) {
    var fromString = from + ' <' + dynoCartSender +'>';
    console.log('from is "' + fromString + '"');
    dynoCartXport.sendMail(
        {
        from: fromString,
        to: recipients,
        subject: subject,
        text: "you need an html capable email client",
        html: message
        },
        function(error, response){
            if (error) {
                console.log(error);
            } else {
                console.log("Message sent(from " + from + "): " +
                        response.message);
            }
        });
}

console.log('starting server at "http:127.0.0.1:8124"\n');

http.createServer(function (request, response) {
  var parsedUrl = require('url').parse(request.url, true);
  console.log('received HTTP ' + request.method + ': ' + parsedUrl.path);
  switch (parsedUrl.pathname) {

    case '/':
        switch (request.method) {
            case 'POST':
            console.log('someone clicked a form');
            for (thing in parsedUrl.query) {
                console.log(thing);
            }
            break;

            default:
            doDefault(parsedUrl, request,response);
        }
    break;

    case '/sendMail':
      switch (request.method) {
        case 'GET':
        doSendMail(parsedUrl, request,response);
        break;

        // case 'POST':
        // doPostPage(parsedUrl, request,response);
        // break;

        default:
        doDefault(parsedUrl, request,response);
      }
    break;

    default:
    break;
  }
}).listen(8124);

function doDefault(parsedUrl, request, response) {
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end('<div>' + request.method + ' Not Serviced</div>');
}

var littleForm = '<form name="input" action="http://127.0.0.1:8124/" method="post">' +
    '<input type="hidden" name="originator" value="John Q.">' +
    '<input type="hidden" name="title" value="Q cart">' +
    '<input type="hidden" name="item1" value="1000 pencils">' +
    '<input type="hidden" name="item2" value="F-18A Blue Angels jet">' +
    '<input type="submit" value="Submit">' +
    '</form>';

// curl http:127.0.0.1:8124?from=<sender>&recipient=<recipient>&subject=<subject>

function doSendMail(parsedUrl, request, response) {
    parsedUrl.query.site_name
    sendFrDynoCart(
        parsedUrl.query.sender + ' via CAP DynoCart Service',
        parsedUrl.query.recipient,
        parsedUrl.query.subject,
        '<a href="https://gsa.gov">' + '<img alt="GSA logo" ' +
        'src="http://www.gsa.gov/resources/images/GSAlogo.gif"</img></a>' +
        '<h3>GSA FAS Dynamic Cart</h3>' +
        '<div style="background:#ffffd0;border:2px solid blue;"><h3>Communicators</h3><p><strong>Originator: </strong>Felleman, John</p><p><strong>Purchaser</strong>Stanton, Laura</p></div>' +
        '<div style="border:2px solid blue;" id="cart"><h3>List</h3><ol><li>Tuna Fish</li><li>Aircraft Carrier</li><li>tardis</li></ol></div>' +
        '<div id="hidden-form">' + littleForm + '</div>'
    );

    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('<div>success./div>');
}

// if you don't want to use this transport object anymore, uncomment following line
// dynoCartXport.close(); // shut down the connection pool, no more messages
