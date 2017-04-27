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
//const best = mongoose.model('bestOf');

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
const userRequest = "https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/";
const apiKey = "?api_key=";

//name of champion string
let nameS = "";

//used for game objects
const gameRequest = "https://na.api.riotgames.com/api/lol/NA/v1.3/game/by-summoner/";
const recent = "/recent?api_key=";

//initalize arrays for keeping track of overall
let newKills = [];
let newDeaths = [];
let newAssists = [];
let newGold = [];
let newDamage = [];
let newHeals = [];
let testKills = [];

//All Requirements above this

//bestOf object to keep track of best of data in the app
const bestOf = {
	kills: {number: 0, summonerID: "test", champion: "NAME"},
	deaths: {number: 100, summonerID: "test", champion: "NAME"},
	assists: {number: 0, summonerID: "test", champion: "NAME"},
	heals: {number: 0, summonerID: "test", champion: "NAME"},
	gold: {number: 0, summonerID: "test", champion: "NAME"},
	damage: {number: 0, summonerID: "test", champion: "NAME"},
};

const worstOf = {
	kills: {number: 100, summonerID: "test", champion: "NAME"},
	deaths: {number: 0, summonerID: "test", champion: "NAME"},
	assists: {number: 100, summonerID: "test", champion: "NAME"},
	gold: {number: 100000, summonerID: "test", champion: "NAME"},
	damage: {number: 100000, summonerID: "test", champion: "NAME"},
	heals: {number: 100000, summonerID: "test", champion: "NAME"},
};

const overall = {
	kills: 0,
	deaths: 0,
	assists: 0,
	gold: 0,
	damage: 0,	
	heals: 0,
};

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

function filterIt(arr ,kills) { //called around lines 257 to filter out undefined results from riots data
	let nums = arr.filter(function(ele) {
		return typeof ele === 'number';
	});
	return nums;
}

//used to increment overall values for the site.
function personal2(checker, val) { //called in last waterfall of req games to increment overall site statistics. lines 267 or so
	overall[val] += checker.reduce((a, v) => (a + v), overall[val]);
}

function reqGames(un, uID) { //called by /get after a summoner is searched
	const gamesURL = gameRequest + uID + recent + key;
	newKills = []; //reset the arrays for reduce
	newDeaths = [];
	newAssists = [];
	newGold = [];
	newDamage = [];
	newHeals = [];

	async.waterfall([
		function(nextCall) {
			request(gamesURL, function(err, response, games) {
				if (!err && response.statusCode === 200) { //good response
					const gamesO = JSON.parse(games);
					gamesO.games.forEach(game => {
						if (game.subType === "RANKED_SOLO_5x5" || game.subType === "RANKED_TEAM_5x5" || game.subType === "RANKED_FLEX_SR") { //only consider ranked games

							gameList.findOne({id: uID, gameId:game.gameId}, (err, res, count) => {
								if (err) {
									console.log(err);
								} else if(!err && res) {
									//game was found inside database already: ignore it
									console.log("game in db already");
								} else {
									let champName = ""; //get champion name from Riot's static data
									const champReq = "https://global.api.riotgames.com/api/lol/static-data/NA/v1.2/champion/" + game.championId + apiKey + key; //get champion request
									request(champReq, function(err, response, champ) {
										if (!err && response.statusCode === 200) {
											const cData = JSON.parse(champ);
											champName = cData.name;
										}
										//set gamemode
										let gameMode = "";
										if (game.subType === "RANKED_FLEX_SR") {
											gameMode = "Flex";
										} else {
											gameMode = "Soloq";
										}
										const newGame = new gameList({ //initalize new object for game schema
											id: uID,
											gameId: game.gameId,
											mode: gameMode,
											championId: game.championId,
											stats: game.stats, //imported from Riot Games APi
											result: game.stats.win,
											level: game.level,
											spell1: game.spell1,
											spell2: game.spell1,
											championName: champName,
										});
										newGame.save(function(err, newG, count) {
											if (err) {
												console.log("ERROR SAVING");
												res.send(err);
												res.send('an error has occurred, please check the server output' + err);
											}
										});
										//add game to user object
										user.findOneAndUpdate({name:un}, {$push: {games: newGame}}, function(err, ele, count) {
											if (err) {
												console.log("ERROR LOADING GAME INTO DATABASE");
												console.log(err);
											} else {
												console.log("Game was added!", newGame.gameId);
											}
										}); //end save game to user.games lsit
										//check each game against the best and worst stats. Improvements can be made
										Best(newGame, un);
										Worst(newGame, un);
									}); //end get champion name request promise
								} //end else statement where game is not found
							}); //end user.
						} //end if ranked game 
						
						//add each element to an array for each game
						newKills.push(game.stats.championsKilled);
						newDeaths.push(game.stats.numDeaths);
						newAssists.push(game.stats.assists);
						newGold.push(game.stats.goldEarned);
						newDamage.push(game.stats.totalDamageDealtToChampions);
						newHeals.push(game.stats.totalHeal);
					}); //end forEach 
					nextCall(null, "next Function"); //go to next step in the waterfall

				} else if (!err && response.statusCode === 404) { //some error on riots side
					console.log("There was an error on the RIOT side");
					nextCall(null, "404");
				} else { //internal error
					console.log("ERROR LOADING RECENT GAMES");
					console.log(err);
					nextCall(null, "Other Errors");
				}
			});
		},
		//use arrays to reduce on each of these values in the overall object for the site. This data 
		//is displayed in the top portion of /ranked
		function(ele, nextCall) {
			newKills = filterIt(newKills);
			newDeaths = filterIt(newDeaths);
			newAssists = filterIt(newAssists);
			newGold = filterIt(newGold);
			newDamage = filterIt(newDamage);
			newHeals = filterIt(newHeals);
			nextCall(null, "next up");
		},
		function(nextCall) {
			personal2(newKills, "kills");
			personal2(newDeaths, "deaths");
			personal2(newAssists, "assists");
			personal2(newGold, "gold");
			personal2(newDamage, "damage");
			personal2(newHeals, "heals");
		}
	], //end waterfall
	function(err, newUser) {
		if(err) {
			console.log("ERROR in req games waterfall: ", err);
			return;
		}
	}); 
} //end reqGames

//Route Handlers
//homepage
app.get('/', (req, res) => {
	if (req.query.summoner === "") { //or req.query.summoner is not in database
		res.render('home', {error: "error: Please input a stored summonerID"});
	} else if (req.query.summoner) {
		//get and clean data
		const nameSearch = req.query.summoner;
		//cleaned version of name for object
		nameS=nameSearch.toLowerCase();
		nameS=nameS.replace(/\s+/g, "");

		//search database
		user.findOne({name: nameSearch}, (err, name, count) => {
			if (!err && name) { //found
				console.log("USER WAS FOUND");
				const summonerName = name.name;
				const summonerID = name.id;
				
				async.waterfall([
					function(callback) { //load recent games
						reqGames(summonerName, summonerID);
						callback(null);
					},
					function(callback) { //render the home page with user
						res.render('home', {existing:name});
						callback(null,':D');
					}
				],
				function (err, status) { //end of waterfall
					if (err) {
						console.log("ERROR IN GET db WATERFALL!: ", err);
					}
				});		

			} else if (err) { //eror
				console.log(err);
			} else { //adding user to database
				async.waterfall([
					function(toCall) {
						const urlCalling = userRequest+nameS+apiKey+key; //https://na.api.riotgames.com/api/lol/NA/v1.4/summoner/by-name/doomsy135?api_key= +key is a sample url
						console.log("No user found and searching RIOT", nameS);
						request(urlCalling, function(err, response, body) {
							if (!err && response.statusCode >= 200 && response.statusCode <400) {
								const Body = JSON.parse(body); //responses are in json
								const newUser = new user({ //create new user and save it in the db
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
										const summonerName = Body.name;
										const summonerID = Body.id;
										reqGames(summonerName, summonerID);	 //add recent games
										toCall(null, newUser); //exit waterfall with completion
									}
								});

							} else if (!err && response.statusCode >= 400 && response.statusCode < 500) { //invalid summoner name
								console.log("ERROR CODE IS", response.statusCode);
								res.render('home', {NOPE: "Invalid user: " +nameS+ " please use a valid summoner name", NOPE2:"Make sure spaces and capitalizations are included."});
							} else if (err) { //error occured somewhere on out side
								res.render('home', {Error: "Some error occured. Please try again"});
								console.log("BAD ERRROR", err);
							} else {
								console.log(response.statusCode);
							}
						}); //actual request

					} //callback
				], //initial waterfall


				function(err, newUser) {
					if(err) {
						console.log("ERROR IN new user water fall!: ",err);
						return;
					} else {
						res.render('home', {newUser: newUser});
					}
				}); //callback function

			} //end else statements
		}); //end db.find
	} else { 
		res.render('home');
	}
});

//after a user searches a user in our db
app.post('/summData', (req, res) => {
	const summSearch = req.body.newsummoner;
	user.findOne({name: summSearch}, (err, result, count) => {
		if (err) {
			console.log(err);
			res.send(err);
			res.send('an error has occurred, please check the server output' + err);
		} else if (!err && result) {
			res.redirect('/User/'+result.slug); //use slug to redirect to that users page
		} else { //user is not indb
			res.render('user', {NOPE: "Invalid user: " + summSearch, NOPE2:"Please use a summoner's whose info has been downloaded and make sure spaces and capitalizations are included"});
		}
	});
});

app.get('/User', (req, res) => {
	res.render('user');
}); //render user search page

//if invalid search is followed by a valid one, use it to redirect to the correct page. Same as /summData
app.post('/User/summData', (req, res) => {
	const summSearch = req.body.newsummoner;
	user.findOne({name: summSearch}, (err, result, count) => {
		if (err) {
			console.log(err);
			res.send(err);
			res.send('an error has occurred, please check the server output' + err);
		} else if (!err && result) {
			res.redirect('/User/'+result.slug);
		} else { //user is not indb
			res.render('user', {NOPE: "Invalid user: " + summSearch, NOPE2:"Please use a summoner's whose info has been downloaded and make sure spaces and capitalizations are included"});
		}
	});
});

//page displayed with username as slug
app.get('/User/:slug', (req, res) => {
	const slug = req.params.slug;
	user.findOne({slug: slug}, function(err, ele) { //returns the user object stored in db
		if (err) {
			res.send(err);
		} else {
			res.render('user', {ele: ele, slug: slug}); //display of the objects/stats handled in hbs
		}
	});
});

//represents the best and worst forms, data handled in hbs
app.get('/Legendary', (req, res) => {
	if (req.query.Awards === "Best") {
		res.render('best', {bestOf: bestOf});
	} else if (req.query.Awards === "Worst") {
		res.render('best', {worstOf: worstOf});
	} else {
		res.render('best');
	}
});

//display overall stats as well as allows users to search for overall stats
//of a player in any given season
app.get('/RankedStats', (req, res) => {
	if (req.query.summonerID && req.query.season) {
		const tName = req.query.summonerID;
		//cleaned version of name for object
		let nameT=tName.toLowerCase();
		nameT=nameT.replace(/\s+/g, "");
		const season = req.query.season; //get season andd scrubbed un
		async.waterfall([
			function(callback) {
				const urlCalling = userRequest+nameT+apiKey+key; //have to get id associated with acct first
				request(urlCalling, function(err, response, body) {
					if(!err && response.statusCode >= 200 && response.statusCode < 400) {
						const idBody = JSON.parse(body);
						const callID = idBody.id;
						callback(null, callID); //successfully retrieved id. continue waterfall
					} else if (err) {
						console.log(err);
						res.render('ranked', {overall:overall, err:"There was an error with the request. Please Try again later."});
					} else {
						console.log("error on our side");
						res.render('ranked', {overall:overall, err:"There was an error on our side... be back up soon"});
					}
				}); //end search user request
			},
			function(callID, callback) { //use id found above to make requests about overall ranked stats
				const urlStats = 'https://na.api.riotgames.com/api/lol/NA/v1.3/stats/by-summoner/' + callID + '/ranked?season=' + season + '&api_key=' + key;
				request(urlStats, function(err, response, stats) {
					if (!err && response.statusCode >= 200 && response.statusCode < 400) {
						//init object to be displayed
						const overallStats = {}; //initalize object to be edited
						const jStats = JSON.parse(stats);

						overallStats.Kills = jStats.champions.reduce((prev, curr) => prev + curr.stats.totalChampionKills, 0);
						overallStats.Deaths = jStats.champions.reduce((prev, curr) => prev + curr.stats.totalDeathsPerSession, 0);
						overallStats.Assists = jStats.champions.reduce((prev, curr) => prev + curr.stats.totalAssists, 0);
						overallStats.Gold = jStats.champions.reduce((prev, curr) => prev + curr.stats.totalGoldEarned, 0);
						overallStats.Damage = jStats.champions.reduce((prev, curr) => prev + curr.stats.totalDamageDealt, 0);
						overallStats.Minions = jStats.champions.reduce((prev, curr) => prev + curr.stats.totalMinionKills, 0);
						overallStats.Pentas = jStats.champions.reduce((prev, curr) => prev + curr.stats.totalPentaKills, 0);
						overallStats.Quadras = jStats.champions.reduce((prev, curr) => prev + curr.stats.totalQuadraKills, 0);
						overallStats.Triples = jStats.champions.reduce((prev, curr) => prev + curr.stats.totalTripleKills, 0);
						overallStats.Doubles = jStats.champions.reduce((prev, curr) => prev + curr.stats.totalDoubleKills, 0);

						res.render('ranked', {overall:overall, stats: overallStats, name:tName, season:season});
					} else if (!err && response.statusCode >= 400) {
						console.log("error on ritos side");
						res.render('ranked', {overall:overall, err:"Please make sure that the summoner name is valid and that they were active in the season selected."});
					} else {
						console.log("error on our side");
						res.render('ranked', {overall:overall, err:"There was an error on our side... be back up soon"});
					}
				}); //end stats request
				callback(null, '::DD');
			} //callback
		],
		function(err, result) {
			if (err) {
				console.log("Err in waterfall Ranked: ", err);
			}
		}); //end waterfall
	} else {
		res.render('ranked', {overall:overall});
	}
});

app.listen(process.env.PORT || 3000);