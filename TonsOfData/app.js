// app.js
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const async = require('async');

//mongodb
require('./db');
const mongoose = require('mongoose');
const user = mongoose.model('user');
const game = mongoose.model('game');
const best = mongoose.model('bestOf');

//public middleware
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({extended: false}));



//api key
const key = 'RGAPI-6005b170-e613-4899-a490-ad0003c8c7f7';
const request = require('request');
const userRequest = "https://na.api.riotgames.com/api/lol/NA/v1.4/summoner/by-name/"
const apiKey = "?api_key=";

let nameS = "";

//All Requirements above this

//bestOf object to keep track of best of data in the app
let bestOf = {
	kills: {number: 0, summonerID: "test"},
	deaths: {number: 100, summonerID: "test"},
	assists: {number: 0, summonerID: "test"},
	gold: {number: 0, summonerID: "test"},
	damage: {number: 0, summonerID: "test"},
	heals: {number: 0, summonerID: "test"},
};

let worstOf = {
	kills: {number: 100, summonerID: "test"},
	deaths: {number: 0, summonerID: "test"},
	assists: {number: 100, summonerID: "test"},
	gold: {number: 100000, summonerID: "test"},
	damage: {number: 100000, summonerID: "test"},
	heals: {number: 100000, summonerID: "test"},
};

let overall = {
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
	} else if (req.query.summoner) {

		//get and clean data
		nameSearch = req.query.summoner;

		//cleaned version of name for object
		nameS=nameSearch.toLowerCase();
		console.log("NAMES LOWER CASE: ", nameS);
		nameS=nameS.replace(/\s+/g, "");
		console.log("NAMES NO SPACE: ", nameS);

		//search database
		user.findOne({name: nameSearch}, (err, name, count) => {
			if (!err && name) { //found
				console.log("USER WAS FOUND");
				res.render('home', {existing:name});

				//in callback
				//add recent games
				//compute best



			} else if (err) { //eror
				console.log(err);
			} else { //adding user to database
				async.waterfall([
					function(toCall) {
						//urlCalling = baseURL + req.query.summoner + apiKey + key
						urlCalling = userRequest+nameS+apiKey+key;
						console.log(urlCalling);
						console.log("No user found and searching RIOT");
						request(urlCalling, function(err, response, body) {
							if (!err && response.statusCode === 200) {
								console.log("user found in RIOT");
								let Body = JSON.parse(body);
								console.log(Body);


								console.log("User being added is: ", Body);
								let newUser = new user({
									id: Body[nameS].id,
									name: Body[nameS].name,
									level: Body[nameS].summonerLevel, 
								});


								newUser.save(function(err, newU, count) {
									if (err) {
										console.log("ERROR SAVING");
										res.send(err);
										res.send('an error has occurred, please check the server output' + err);
									} else {
										toCall(null, newUser); //exit waterfall with completion
									}
								});
							} else if (!err && response.statusCode === 404) {
								console.log("ERROR CODE IS", response.statusCode);
								res.render('home', {NOPE: "Invalid user: please use a valid summoner name", NOPE2:"Make sure spaces and capitalizations are included"});
							} else {
								res.render('home', {Error: "Some error occured. Please try again"});
								console.log(err);
							}
						}); //actual request

					} //callback
				], //initial waterfall


				function(err, newUser) {
					if(err) {
						console.log(err);
						return;
					} else {


						//add recent games by making a call here as well


						res.render('home', {newUser: newUser})
					}
				}); //callback function

			} //end else statements
		}); //end db.find
	} else { 
		res.render('home');
	}
});

app.post('/summData/:slug', (req, res) => {
	//handle adding summoner
	res.render('/summonerData/:slug');
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
	if (req.query.summonerID !== "" || null) {
		//make ranked stats 
		//send only
		console.log("USERNAME");
		res.render('ranked')
	} else {
		res.render('ranked', {overall:overall});
	}
});

app.listen(process.env.PORT || 3000);