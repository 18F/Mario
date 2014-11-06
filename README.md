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

1. Install Node.js 0.10
1. Run `npm install`.
1. Copy [`configs.js.EXAMPLE`](configs.js.EXAMPLE) to `configs.js` and adjust the values
there.

In particular, Mario is meant to be installed on the same server with
[C2](https://github.com/18F/C2), and the path to the shared constants file in C2 should be set in
`C2_APPLICATION_YML_PATH`.

Mario needs these variable to be set into the environment where
it runs:

```bash
NODE_ENV # (optional) can be set to 'debug' or 'development'

GSA_USERNAME # username for GSA Advantage for the scraper
GSA_PASSWORD # password used by the scraper to pass to GSA Advantage

DYNO_CART_SENDER # email address to read from
COMMUNICART_DOT_SENDER # password for the DYNO_CART_SENDER email
```

This mechanism avoids the danger of setting a password in the repo and
accidentally committing it.

Although Mario can be used in a number of ways, we normally use a
crontab job to run it once a minute.  The job actually implements a
shell scripts which ensures the environmental variables are correctly
exported, and then Mario is invoked, piping the output to a log file.

For debugging, you can of course invoke it by hand.  Additionally,
there is a flag not to mark email as unread, which allows repetitive
execution without a need to recreate the initiating emails.


TESTING
=======

To run test suite, run `npm test`. To check code coverage, run `npm run-script coverage`.
