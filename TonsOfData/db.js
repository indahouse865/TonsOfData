const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const Schema = mongoose.Schema;

//schema goes here
const game = new Schema({
	id: Number,
	gameId: Number,
	mode: String,
	championId: Number,
	stats: Object, //imported from Riot Games API
});

const bestOf = new Schema({
	id: Number,
	name: String,
	totalStats: Object, //imported from Riot Games API
})

const user = new Schema({
	name: String,
	id: Number,
	games: [game],
	level: Number,
});

user.plugin(URLSlugs('name'));

mongoose.model('user', user);
mongoose.model('game', game);
mongoose.model('bestOf', bestOf);

//copied from code provided by professor Versoza at https://foureyes.github.io/csci-ua.0480-spring2017-008/homework/deploy.html
// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;

if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/final';
}

mongoose.connect(dbconf);