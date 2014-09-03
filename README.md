IMPORTANT WARNING
=================

Note: This project currently uses nodemailer, which seems to suffer from, or benefit from,
a tightening of security in Node itself.  This is well-documented, but a little obscure.
It manifests itself as an error concerning Self-signed SSL Certificates.  We made the 
documented hack and got it working.

However, I doubt this code will work out-of-the-box for you unless you make the same hack
after install nodemailer.

Mario : What is this project?
=====

The basic purpose of Mario is to support the email processing of the
Communicart (C2) diet.  We are using Mario as the Node.js-based mail
reader.  It also invokes the gsa-advantage-scraper.

We could have implemented this in the C2 rails application, and may
still move that feature there.

The basic execution of Mario is that you execute it once, which reads
any unread mail.  We use a cron job to run it every minute.

This architecture allow us to keep C2 independent of the GSA
Advantage.

INSTALLATION
============

This is currently a node project.  You should install the following packages:

npm install nodemailer
npm install imap
npm install request

Then copy configs.js.EXAMPLE to configs.js and adjust the values
there.

In particular, Mario is meant to be installed on the same server with
C2, and the path to the shared constants flie in C2 should be set in
C2_APPLICATION_YML_PATH.

Note that Mario needs 5 variable to be set into the environment where
it runs:

> NODE_ENV
> GSA_PASSWORD
> GSA_USERNAME
> COMMUNICART_DOT_SENDER
> DYNO_CART_SENDER

NODE_ENV (this can be empty, 'debug' or 'development'

GSA_PASSWORD is the password used byt the scraper to pass to the
GSA Advantage.
GSA_USERNAME is the username for GSA Advantage for the scraper.
COMMUNICART_DOT_SENDER is credentials to be passed to the email
address you are reading, which can be publicly set into
"DYNO_CART_SENDER".

This mechanism avoids the danger of setting a password in the repo and
accidentally committing it.




