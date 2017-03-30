// app.js
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

//mongodb
//require('./db');
//const mongoose = require('mongoose');
//const link = mongoose.model('link');
//const comment = mongoose.model('comment');

//public middleware
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({extended: false}));

/*
//session
const session = require('express-session');
const sessionOptions = { 
	secret: 'secret for signing session id', 
	saveUninitialized: true, 
	resave: true,
};
app.use(session(sessionOptions));
*/


//api key
const key = 'RGAPI-6005b170-e613-4899-a490-ad0003c8c7f7';
const request = require('request');

//All Requirements above this

//bestOf object to keep track of best of data in the app
bestOf = {
	kills: {number: 0, summonerID: "test"},
	deaths: {number: 100, summonerID: "test"},
	assists: {number: 0, summonerID: "test"},
	gold: {number: 0, summonerID: "test"},
	damage: {number: 0, summonerID: "test"},
	heals: {number: 0, summonerID: "test"},
};

worstOf = {
	kills: {number: 100, summonerID: "test"},
	deaths: {number: 0, summonerID: "test"},
	assists: {number: 100, summonerID: "test"},
	gold: {number: 100000, summonerID: "test"},
	damage: {number: 100000, summonerID: "test"},
	heals: {number: 100000, summonerID: "test"},
};

overall = {
	kills: {number: 0},
	deaths: {number: 0},
	assists: {number: 0},
	gold: {number: 0},
	damage: {number: 0},	
	heals: {number: 0},
}



//Route Handlers
app.get('/', (req, res) => {
	if (req.query.summoner === "") { //or req.query.summoner is not in database
		res.render('home', {error: "error: Please input a stored summonerID"});
	} else {
	//ask about css splitting into 2 columns on page, specifically on /
	/*if (req.query.summoner !== undefined) {

	} else{

	}*/
		res.render('home');
}
});

app.post('/newSumm', (req, res) => {
	res.redirect('/');
});

//create page for user with post and redirect

app.get('/Legendary', (req, res) => {
	if (req.query.Awards === "Best") {
		console.log(bestOf);
		res.render('best', {bestOf: bestOf});
	} else if (req.query.Awards === "Worst") {
		res.render('best', {worstOf: worstOf});
	} else {
		res.render('best');
	}
});

app.get('/RankedStats', (req, res) => {
	//choose a user
	//https://developer.riotgames.com/api-methods/#stats-v1.3/GET_getRankedStats
	if (req.query.filter === "summonerID") {
		//make ranked stats 
		//send only
		console.log("USERNAME");
		res.render('ranked')
	} else {
		res.render('ranked', {overall:overall});
	}

});

app.listen(7000);
