require('dotenv').config();
const express = require('express');
const next = require('next')
const Twit  = require('twit')
const configAuth = require('./config/auth')

const port = process.env.PORT || 7000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
   .then(()=> {
       const server = express()

       
      server.get('/api/show', (req, res)=> {
         return res.send('yay we made it')
      })
         
      const T = new Twit({
         consumer_key: configAuth.twitterAuth.consumerKey,
         consumer_secret: configAuth.twitterAuth.consumerSecret,
         access_token: configAuth.twitterAuth.access_token,
         access_token_secret: configAuth.twitterAuth.access_token_secret,
     }); 
     
     server.get('/api/twitter', (req, res) => {
             // send back data from Twitter
             T.get('search/tweets', 
                 { q: 'NBA since:2019-1-11', count: 12 }, 
                     function(err, data, response) {
                         // send back an array of objects that contain the profile
                         // img url and tweet_status
                         let tweets = data.statuses.map(function(tweet){
                             let TwitterImageUrl= tweet.user.profile_image_url_https
                             let imageUrl = TwitterImageUrl.replace('_normal' , '')
                             
                             const retTweet = {
                                 img: imageUrl,
                                 text: tweet.text,
                                 created: tweet.created_at,
                                 tweetID: tweet.id_str
                             }
                             return retTweet
                         })
                         res.send(tweets)
             })
     })
      server.get("*", (req, res) => {
      return handle(req, res)
      })
	   server.listen(port, err => {
			if(err) throw err;
			console.log(`Ready on ${port}`)
       });
   })
   .catch(ex => {
      console.error(ex.stack);
      process.exit(1);
   })