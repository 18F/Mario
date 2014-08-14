IMPORTANT WARNING
=================

Note: This project currently uses nodemailer, which seems to suffer from, or benefit from,
a tightening of security in Node itself.  This is well-documented, but a little obscure.
It manifests itself as an error concerning Self-signed SSL Certificates.  We made the 
documented hack and got it working.

However, I doubt this code will work out-of-the-box for you unless you make the same hack
after install nodemailer.


INSTALLATION
============

This is currently a node project.  You should install the following packages:

npm install nodemailer
npm install imap
npm install request

Possibly others.

Addtionally, at present this code hard-wires our own email addresses, which you will want 
to find and replace.

Furthermore, to avoid checking passwords into git, we place them in environment varialbes,
where they are read by Node.

Your imap/reading email password needs to go in this variable:

(Which obviously needs to change) 

and your sending/nodemailer password needs to go in 

COMMUNICART_DOT_SENDER.


Mario : What is this project?
=====

This project is just beginning; we are felling our way.

The basic idea here is to automate some of the processes that government peforms now.  This involves 
researching items to buy to purchase things as cheaply as possible to save taxpayer money.  It also
involves automating something that government procurement rules force, but sometimes happens to everyone:
you want to buy something on behalf of someone else.  So you act as the buyer on behalf of someone else 
who we will call the program manager.  This creates a need for communication, consensus, and approval.

It occurs to us that someone could start a business around this concept.

All of the code in this repo is in the public domain; you may freely use it for any purpose, commercial or otherwise,
but it is released without warranty of any kind.  In fact it probably doesn't do anything useful---yet.


