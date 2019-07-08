module.exports = {
	'twitterAuth': {
		'consumerKey': process.env.CONSUMER_KEY,
		'consumerSecret': process.env.CONSUMER_SECRET,
		'access_token': process.env.ACCESS_TOKEN,
    	'access_token_secret': process.env.ACCESS_TOKEN_SECRET,
		'callbackURL': '/api/auth/twitter/callback'
	}
};