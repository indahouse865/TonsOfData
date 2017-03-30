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
	games: [game]
});

user.plugin(URLSlugs('name'));

mongoose.model('user', user);
mongoose.model('game', game);
mongoose.model('bestOf', bestOf);

mongoose.connect('mongodb://localhost/final');