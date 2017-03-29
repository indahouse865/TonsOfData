The content below is an example project proposal / requirements document. Replace the text below the lines marked "__TODO__" with details specific to your project. Remove the "TODO" lines.

(___TODO__: your project name_)

# Tons Of Data

## Overview

(___TODO__: a brief one or two paragraph, high-level description of your project_)

Learning what to focus on next in a game of League is daunting. There are so many micro and macro aspects to take note of in every game. Why try and manage them yourself, instead let Tons Of Data do it for you.

Tons of Data is web app that utilizes the League of Legends API to get and track data about recent games and progress in terms of specific analytics. The goal, like any League related website is to give users a slight edge in their next journey to Summoners Rift. Once a user adds their data to the website, or refreshes their data, analytics are run in the background to datamine statistics about recent games as well as trends across multiple games. For every user, they can filter by champion and lane, and compare two individual games.


## Data Model

(___TODO__: a description of your application's data and their relationships to each other_) 

The application will store Users, Games, General Metrics, Best Data

* users can store multiple batches of games (via refrences)
* each game will have multiple metrics (kills, deaths, assists, etc) - by embedding
* each metric will have a best of (via refrences)

(___TODO__: sample documents_)

An Example User:

```javascript
{
  username: "Cruknarg",
  hash: // a password hash,
  lists: // an array of references to different games
}
```

An Example Game with Embedded Items:

```javascript
{
  user: // a reference to a User object
  game_ID:, //Riot API game number
  metrics {
    win:true, kills:12, deaths:3, assists:7
    cs:271, dpm:integer //ideally as many as possible
  },

}
```

```javascript
{
  user: //a reference to a User Object
  bestOfmetrics {
    kills:18, deaths:0, assists:24 //each embedded from another game
    cs:312, dpm:integer //ideally as many as possible
  }
}
```

An Example 


## [Link to Commented First Draft Schema](db.js) 

(___TODO__: create a first draft of your Schemas in db.js and link to it_)

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

(___TODO__: write out how your application will be used through [user stories](http://en.wikipedia.org/wiki/User_story#Format) and / or [use cases](https://www.mongodb.com/download-center?jmp=docs&_ga=1.47552679.1838903181.1489282706#previous)_)
"In order to get better as a player, I want to know my weaknesses so I use Tons Of Data to see where my gameplay is lacking.""
"As a player, I want a better understanding of my damage output because I don't get a lot of kills"
"As a person, I want to see growth for the time invested. I can track this growth, however marginal by comparing games and seeing the upward trends in my statistics."



1. as non-registered user, I can register a new account with the site
2. as a user, I can log in to the site
3. as a user, I can add a summoner's data to the site
4. as a user, I can download more recent data for a summoner
5. as a user, I can more closely inspect the metrics of an individual game
6. as a user, I can view the best individual statistics for a summoner
7. as a user, I can compare the metrics of 2 recent games a summoner has played

## Research Topics

(___TODO__: the research topics that you're planning on working on along with their point values... and the total points of research topics listed_)

* (5 points) Integrate user authentication
    * I'm going to be using passport for user authentication
    * And account has been made for testing; I'll email you the password
    * see <code>cs.nyu.edu/~jversoza/ait-final/register</code> for register page
    * see <code>cs.nyu.edu/~jversoza/ait-final/login</code> for login page
* (4 points) Perform client side form validation using a JavaScript library
    * see <code>cs.nyu.edu/~jversoza/ait-final/my-form</code>
    * if you put in a number that's greater than 5, an error message will appear in the dom
* (5 points) vue.js
    * used vue.js as the frontend framework; it's a challenging library to learn, so I've assigned it 5 points

10 points total out of 8 required points (___TODO__: addtional points will __not__ count for extra credit_)


## [Link to Initial Main Project File](app.js) 

(___TODO__: create a skeleton Express application with a package.json, app.js, views folder, etc. ... and link to your initial app.js_)

## Annotations / References Used

(___TODO__: list any tutorials/references/etc. that you've based your code off of_)

1. [passport.js authentication docs](http://passportjs.org/docs) - (add link to source code that was based on this)
2. [tutorial on vue.js](https://vuejs.org/v2/guide/) - (add link to source code that was based on this)
