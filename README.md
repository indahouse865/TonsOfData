# Tons Of Data

## Overview

Learning what to focus on next in a game of League is daunting. There are so many micro and macro aspects to take note of in every game. Why try and manage them yourself, instead let Tons Of Data do it for you.

Tons of Data is web app that utilizes the League of Legends API to get and track data about recent games and progress in terms of specific analytics. The goal, like any League related website is to give users a slight edge in their next journey to Summoners Rift. Once a user adds their data to the website, or refreshes their data, analytics are run in the background to datamine statistics about recent games as well as trends across multiple games. For every user, they can filter by champion and lane, and compare two individual games.


## Data Model

The application will store Users, Games, General Metrics, Best Data

* users can store multiple batches of games (via refrences)
* each game will have multiple metrics (kills, deaths, assists, etc) - by embedding
* each metric will have a best of (via refrences)

An Example User:

```javascript
{
  name: "Cruknarg",
  id: 64872106812
  games: //an array of refrences to different games
}
```

An Example Game with Embedded Items:

```javascript
{
  id: 64872106812 // a reference to the players whose data is represented
  gameID:, 3229820//Riot API game number
  mode: Ranked,
  championId: 67,
  stats {
    win:true, kills:12, deaths:3, assists:7,
    gold: 10000, timePlayed:8203, damagedealtPlayer: int,
    cs:271, //ideally as many as possible 
    //object from Riot Games API
  },

}
```

An Example of Total Ranked Stats

```javascript
{
  summonerID: 64872106812//a reference to a User Object
  name: Dyrus
  bestOfmetrics {
    kills:18, deaths:0, assists:24
    cs:312, dpm:integer  //object from Riot Games API
  }
}
```


## [Link to Commented First Draft Schema](TonsOdData/db.js) 

## Wireframes

(___TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc._)

/list/create - page for creating a new shopping list

![list create](documentation/list-create.png)

/list - page for showing all shopping lists

![list](documentation/list.png)

/list/slug - page for showing specific shopping list

![list](documentation/list-slug.png)

## Site map

(___TODO__: draw out a site map that shows how pages are related to each other_)

Here's a [complex example from wikipedia](https://upload.wikimedia.org/wikipedia/commons/2/20/Sitemap_google.jpg), but you can create one without the screenshots, drop shadows, etc. ... just names of pages and where they flow to.

## User Stories or Use Cases

1. as a user, I can add a player's data to the site
2. as a user, I can download more recent data for a player
3. as a user, I can more closely inspect the metrics of an individual game
4. as a user, I can view the best individual statistics for a summoner
5. as a user, I can view the best stats per metric on the site
6. as a user, I can view the worst stats per metric on the site
7. as a user, I can view the overall ranked stats for a player

## Research Topics

(___TODO__: the research topics that you're planning on working on along with their point values... and the total points of research topics listed_)

* (5 points) Riot Games API 
    * All data is coming from Riot Games API
    * users use player names to generate data
    * Data retrieved from API is used in my data model 
    * A user's data must be added to the database before aggregation can begin
    * Totals and Min/Max objects are based entirely off of data retrieved from API
* (3 points) Async Methods
    * Use Waterfall to order API calls and effectively organize API calls
    * Organization structure is handled by Async
* (3 Point) Client Side Form Validation
    * All requests will be run against the Riot Games API and returned before data is displayed
    * Client Side Form Validation with custom responses in hbs triggered by js events

11 points total out of 8 required points


## [Link to Initial Main Project File](TonsOfData/app.js) 

## Annotations / References Used

1. [Riot Games API Documentation](https://developer.riotgames.com/api-methods/)
2. [async Documentation](https://caolan.github.io/async/docs.html) 
