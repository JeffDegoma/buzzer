const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

//load user model
const User = require('./models/user');

//load auth module
const configAuth = require('./auth')


module.exports = function(passport) {

    //serialize
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    //deserialize
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    //local signup
    passport.use('local-signup', 
        // by default, local strategy uses username and password, we will override with email
        new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },

    //
    function(req, email, password, done) {
        //asychronous
        //User.findOne won't fire unless data is sent back
        process.nextTick(function(){
            //find a user whose email is the same as the forms email
            //we are checking to see if the user trying to login already exists
            User.findOne({'local.email': email},function(err,user) {
                if(err)
                    return done(err);

                if(user){
                    return done(null,false);
                }else{
                    const newUser = new User();
                    newUser.local.email = email;
                    newUser.local.password = newUser.generateHash(password);

                    newUser.save(function(err){
                        if(err)
                            throw err;

                        return done(null, newUser);
                    });
                }

            });
        })
    }));

    //Local Login
    passport.use('local-login', 
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            //find a user in the database whose email is the same in the form email
            User.findOne({'local.email': email}, function(err, user) {
                if(err)
                    return done(err);
            //if user doesn't exist return flash message
                if(!user)
                    return done(null, false);    
            //check to see if user is found but the password is wrong
                if(!user.validPassword(password))
                    return done(null,false);

                // console.log("logged in userrrrr", user)

                return done(null, user);
            });

        }));



    //Twitter Login
    passport.use(
        new TwitterStrategy({
            consumerKey     : configAuth.twitterAuth.consumerKey,
            consumerSecret  : configAuth.twitterAuth.consumerSecret,
            callbackURL     : configAuth.twitterAuth.callbackURL
        },

        (accessToken, refreshToken, profile, done) => {
            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Twitter
            process.nextTick(function() {
                User.findOne({'twitter.id' : profile.id}, function(err, user) {
                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if(err) {
                        return done(err);
                    }
                    if(user) {
                        return done(null, user);
                    }
                    else {
                        const newUser = new User();
                        //set all data we need from schema
                        newUser.twitter.id          = profile.id;
                        newUser.twitter.accessToken = accessToken;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;
                        newUser.twitter.favorites   = [];

                        newUser.save(function(err) {
                            if(err) {
                                throw err
                            }
                            return done(null, newUser);
                        });
                    }
                });
            });
        })
    );


    passport.use(
        new BearerStrategy(
            function(accessToken, done) {
                User.findOne({
                    $or:[ 
                        {'local.email' : accessToken}, {'twitter.accessToken': accessToken}
                    ]}, 
                    function(err, user) {
                        if(err) {
                            return done(err);
                        }
                        if(!user) {
                            return done(null, false);
                        }
                        return done(null, user, { scope: 'all' });
                    }
                );
            })
        );
    
};