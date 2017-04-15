//lines to look at with joe 99 and  270 + 285
//also how to make sure bestOf is still a separate collection
//hw 5 grade?

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
const gameList = mongoose.model('game');
const best = mongoose.model('bestOf');

//public middleware
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));


 //handle key using obstruction
const fs = require('fs');
const fnKey = path.join(__dirname, 'config2.json');
const dataKey = fs.readFileSync(fnKey);

// our configuration file will be in json, so parse it and set the
// conenction string appropriately!
const confKey = JSON.parse(dataKey);
const key = confKey.key; //true key

//api key
const request = require('request');
const userRequest = "https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/"
const apiKey = "?api_key=";

let nameS = "";

const gameRequest = "https://na.api.riotgames.com/api/lol/NA/v1.3/game/by-summoner/";
const recent = "/recent?api_key=";

//All Requirements above this

//bestOf object to keep track of best of data in the app
let bestOf = {
	kills: {number: 0, summonerID: "test", champion: "NAME"},
	deaths: {number: 100, summonerID: "test", champion: "NAME"},
	assists: {number: 0, summonerID: "test", champion: "NAME"},
	gold: {number: 0, summonerID: "test", champion: "NAME"},
	damage: {number: 0, summonerID: "test", champion: "NAME"},
	heals: {number: 0, summonerID: "test", champion: "NAME"},
};

let worstOf = {
	kills: {number: 100, summonerID: "test", champion: "NAME"},
	deaths: {number: 0, summonerID: "test", champion: "NAME"},
	assists: {number: 100, summonerID: "test", champion: "NAME"},
	gold: {number: 100000, summonerID: "test", champion: "NAME"},
	damage: {number: 100000, summonerID: "test", champion: "NAME"},
	heals: {number: 100000, summonerID: "test", champion: "NAME"},
};

let overall = {
	kills: {number: 0},
	deaths: {number: 0},
	assists: {number: 0},
	gold: {number: 0},
	damage: {number: 0},	
	heals: {number: 0},
}


	

function Best(checker, name) {
	if (checker.stats.championsKilled > bestOf.kills.number) {
		bestOf.kills.number = checker.stats.championsKilled;
		bestOf.kills.summonerID = name;
		bestOf.kills.champion = checker.championName;
	}
	if (checker.stats.numDeaths < bestOf.deaths.number) {
		bestOf.deaths.number = checker.stats.numDeaths;
		bestOf.deaths.summonerID = name;
		bestOf.deaths.champion = checker.championName;
	}
	if (checker.stats.assists > bestOf.assists.number) {
		bestOf.assists.number = checker.stats.assists;
		bestOf.assists.summonerID = name;
		bestOf.assists.champion = checker.championName;
	}
	if (checker.stats.goldEarned > bestOf.gold.number) {
		bestOf.gold.number = checker.stats.goldEarned;
		bestOf.gold.summonerID = name;
		bestOf.gold.champion = checker.championName;
	}
	if (checker.stats.totalDamageDealtToChampions > bestOf.damage.number) {
		bestOf.damage.number = checker.stats.totalDamageDealtToChampions;
		bestOf.damage.summonerID = name;
		bestOf.damage.champion = checker.championName;
	}
	if (checker.stats.totalHeal > bestOf.heals.number) {
		bestOf.heals.number = checker.stats.totalHeal;
		bestOf.heals.summonerID = name;
		bestOf.heals.champion = checker.championName;
	}


}

function Worst(checker, name) {
	if (checker.stats.championsKilled < worstOf.kills.number) {
		worstOf.kills.number = checker.stats.championsKilled;
		worstOf.kills.summonerID = name;
		worstOf.kills.champion = checker.championName;
	}
	if (checker.stats.numDeaths > worstOf.deaths.number) {
		worstOf.deaths.number = checker.stats.numDeaths;
		worstOf.deaths.summonerID = name;
		worstOf.deaths.champion = checker.championName;
	}
	if (checker.stats.assists < bestOf.assists.number) {
		worstOf.assists.number = checker.stats.assists;
		worstOf.assists.summonerID = name;
		worstOf.assists.champion = checker.championName;
	}
	if (checker.stats.goldEarned < worstOf.gold.number) {
		worstOf.gold.number = checker.stats.goldEarned;
		worstOf.gold.summonerID = name;
		worstOf.gold.champion = checker.championName;
	}
	if (checker.stats.totalDamageDealtToChampions < worstOf.damage.number) {
		worstOf.damage.number = checker.stats.totalDamageDealtToChampions;
		worstOf.damage.summonerID = name;
		worstOf.damage.champion = checker.championName;
	}
	if (checker.stats.totalHeal < worstOf.heals.number) {
		worstOf.heals.number = checker.stats.totalHeal;
		worstOf.heals.summonerID = name;
		worstOf.heals.champion = checker.championName;
	}

}

function personal(checker) {
	overall.kills.number += (+checker.stats.championsKilled || 0);
	overall.deaths.number += (+checker.stats.numDeaths || 0);
	overall.assists.number += (+checker.stats.assists || 0); 
	overall.gold.number += checker.stats.goldEarned;
	overall.damage.number += (+checker.stats.totalDamageDealtToChampions || 0);
	overall.heals.number += (+checker.stats.totalHeal || 0);
}

function reqGames(un, uID) {
	const gamesURL = gameRequest + uID + recent + key;
	async.waterfall([
		function(nextCall) {
			request(gamesURL, function(err, response, games) {
				if (!err && response.statusCode === 200) { //good response
					//games.foreach
					//create new game object
					//push new game object to user
					console.log("GAMES OBJECT SUCCESSFULLY LOADED");
					let gamesO = JSON.parse(games);

					gamesO.games.forEach(game => {
						if (game.subType === "RANKED_SOLO_5x5" || game.subType === "RANKED_TEAM_5x5" || game.subType === "RANKED_FLEX_SR") { //only consider ranked games






						////////////GET HELP FROM JOE
						//I want to find a game with id: x and gameId Y
						//If that document isnt present I want to create and add it
						//however i can keep calling the same request and it will keep adding the same documents
						//why is result always null




							gameList.findOne( {id: uID, gameId: game.id}, (err, result, count) => { //search game database for game for this user, use both id and game id since
								//multiple players can use the same gameID but metrics are specific to the player for each game

								if (err) {
									console.log(err);
								} else if (!err && result) {
									console.log("GAME ALREADY LOADED full search");
								} else {
									console.log("game will be added to db");
									let champName = "";

									champReq = "https://global.api.riotgames.com/api/lol/static-data/NA/v1.2/champion/" + game.championId + apiKey + key;
									request(champReq, function(err, response, champ) {
										if (!err && response.statusCode === 200) {
											let cData = JSON.parse(champ);
											champName = cData.name;
										}
									

										const newGame = new gameList({
											id: uID,
											gameId: game.gameId,
											mode: game.subType,
											championId: game.championId,
											stats: game.stats, //imported from Riot Games APi
											result: game.stats.win,
											level: game.level,
											championId: game.championId,
											spell1: game.spell1,
											spell2: game.spell1,
											championName: champName,
										});

										newGame.save(function(err, newG, count) {
											if (err) {
												console.log("ERROR SAVING");
												res.send(err);
												res.send('an error has occurred, please check the server output' + err);
											} else {
											}
										});

										user.findOneAndUpdate({name:un}, {$push: {games: newGame}}, function(err, ele, count) {
											if (err) {
												console.log("ERROR LOADING GAME INTO DATABASE");
												console.log(err);
											} else {
												console.log("Game was added!", newGame.gameId);
											}
										}); //end save game to user.games lsit

										Best(newGame, un);
										Worst(newGame, un);
										personal(newGame);
									}); //end get champion name request promise
								} //end else statement
							}); //end user.findOne
						} //end if ranked game 
					}); //end forEach 
					nextCall(null, "success");
				} else if (!err && response.statusCode === 404) { //some error on riots side
					console.log(gamesURL);
					console.log("There was an error on the RIOT side");
					nextCall(null, "404");
				}  else { //internal error
					console.log("ERROR LOADING RECENT GAMES");
					console.log(err);
					nextCall(null, "Other Errors");
				}
			});
		},

		function(callback) {
			console.log("SUCCEEDED IN reqGames the async");
			callback("LAST POSSIBLE", "0");
		}
	],
	function(err, newUser) {
		if(err) {
			console.log("ERROR in req games waterfall: ", err);
			return;
		} else {
			
		}
	}); 
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
		nameS=nameS.replace(/\s+/g, "");

		//search database
		user.findOne({name: nameSearch}, (err, name, count) => {
			if (!err && name) { //found
				console.log("USER WAS FOUND");
				summonerName = name.name;
				summonerID = name.id;
				
				async.waterfall([
					function(callback) {
						reqGames(summonerName, summonerID);
						callback(null);
					},
					function(callback) {
						res.render('home', {existing:name});
						callback(null,':D');
					}

				],
				function (err, status) {
					if (err) {
						console.log("ERROR IN GET db WATERFALL!: ", err);
					} else {console.log(status);}
				});		

			} else if (err) { //eror
				console.log(err);
			} else { //adding user to database
				async.waterfall([
					function(toCall) {
						urlCalling = userRequest+nameS+apiKey+key;
						console.log("No user found and searching RIOT", nameS);
						request(urlCalling, function(err, response, body) {
							if (!err && response.statusCode === 200) {
								let Body = JSON.parse(body);

								console.log("User being added is: ", Body);
								let newUser = new user({
									id: Body.id,
									name: Body.name,
									level: Body.summonerLevel, 
								});

								newUser.save(function(err, newU, count) {
									if (err) {
										console.log("ERROR SAVING");
										res.send(err);
										res.send('an error has occurred, please check the server output' + err);
									} else {

										summonerName = Body.name;
										summonerID = Body.id;
										reqGames(summonerName, summonerID);	 //add recent games
										toCall("FIRST POSSIBLE", newUser); //exit waterfall with completion
									}
								});

							} else if (!err && response.statusCode === 404) {
								console.log("ERROR CODE IS", response.statusCode);
								res.render('home', {NOPE: "Invalid user: " +nameS+ " please use a valid summoner name", NOPE2:"Make sure spaces and capitalizations are included."});
								toCall("404", "404");
							} else {
								res.render('home', {Error: "Some error occured. Please try again"});
								console.log(err);
								toCall("800", "801");
							}
						}); //actual request

					} //callback
				], //initial waterfall


				function(err, newUser) {
					if(err) {
						console.log("ERROR IN new user water fall!: ",err);
						return;
					} else {
						res.render('home', {newUser: newUser})
					}
				}); //callback function

			} //end else statements
		}); //end db.find
	} else { 
		res.render('home');
	}
});


//USER DATA PAGE
app.post('/summData', (req, res) => {
	const summSearch = req.body.newsummoner;
	user.findOne({name: summSearch}, (err, result, count) => {
		if (err) {
			console.log(err);
			res.send(err);
			res.send('an error has occurred, please check the server output' + err);
		} else if (!err && result) {
			console.log(result.slug);
			res.redirect('/User/'+result.slug);
		} else { //user is not indb
			res.render('user', {NOPE: "Invalid user: " + summSearch, NOPE2:"Please use a summoner's whose info has been downloaded and make sure spaces and capitalizations are included"});
		}
	});
});

app.get('/User', (req, res) => {
	res.render('user');
});

app.get('/User/:slug', (req, res) => {
	const slug = req.params.slug;
	user.findOne({slug: slug}, function(err, ele) {
		if (err) {
			res.send(err);
		} else {

			//PROCESS DATA!
			res.render('user', {ele: ele});
		}
	});
});


app.get('/Legendary', (req, res) => {
	if (req.query.Awards === "Best") {
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
		res.render('ranked', {overall:overall});
	} else {
		res.render('ranked', {overall:overall});
	}
});

app.listen(process.env.PORT || 3000);