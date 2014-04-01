// Returns a function that we can read Environment variables,
// where we put things we never want to check into github.
module.exports = function(){
    switch(process.env.NODE_ENV){
    case 'debug':
        return {
	    'DYNO_CART_SENDER':'communicart.sender@gmail.com',
	    'SENDER_CREDENTIALS':process.env.COMMUNICART_DOT_SENDER,
	    'GSA_SCRAPE_URL' :'http://gsa-advantage-scraper/cgi-bin/gsa-adv-cart.py',
	    'GSA_PASSWORD': process.env.GSA_PASSWORD,
	    'GSA_USERNAME': process.env.GSA_USERNAME
	};
    case 'development':
        return {
	    'DYNO_CART_SENDER':'communicart.sender@gmail.com',
	    'SENDER_CREDENTIALS':process.env.COMMUNICART_DOT_SENDER,
	    'GSA_SCRAPE_URL' :'http://gsa-advantage-scraper/cgi-bin/gsa-adv-cart.py',
	    'GSA_PASSWORD': process.env.GSA_PASSWORD,
	    'GSA_USERNAME': process.env.GSA_USERNAME
	};
    default:
        return {
	    'DYNO_CART_SENDER':'communicart.sender@gmail.com',
	    'SENDER_CREDENTIALS':process.env.COMMUNICART_DOT_SENDER,
	    'GSA_SCRAPE_URL' :'http://gsa-advantage-scraper/cgi-bin/gsa-adv-cart.py',
	    'GSA_PASSWORD': process.env.GSA_PASSWORD,
	    'GSA_USERNAME': process.env.GSA_USERNAME
	};


    }
};
