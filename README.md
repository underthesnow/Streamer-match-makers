# JinriTV Streamer Matchmakers Project
Creating a website to match the streamer of your type:
[https://streamer-match-maker.herokuapp.com/](https://streamer-match-maker.herokuapp.com/)


# Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Installation

**Note** This guide is for Windows OS only, maybe if someone wants to make a guide for other systems it would be appreciated.
This guide will show how to install these software:

* **Node.js** - The backend environment 
* **PostgreSQL** - Our choice of database

### Installing Node.js

Start with downloading Node.js version LTS from the [Node.js](https://nodejs.org/en/) downloads page. Run the installer and leave most settings at default. Make sure that **npm package manager** is set to be installed.

After installation, verify that Node was successfully installed by opening up a Command Prompt and typing

```node -v```

It should display the version number of Node installed (v12.18.3).

### Installing PostgreSQL

Download PostgreSQL [here](https://www.postgresql.org/download/). When you install, it is strongly recommended including pgAdmin as a part of the installation package.

## Verify Postgresql database server connection

### Environment setup
Please go to the project root directory and open `.env` file with a text editor. Add DB credentials here. Please make sure to not commit the `.env` file that contains the connection string.

### DB connection test
Run test_db_connection.js as instructed in admin/README.md, and make sure that the success message is displayed.

## Populate data into DB

1. Get permission to [Google sheet](https://docs.google.com/spreadsheets/d/1yQ7YzuM5FhFB13ChTz77W2VyhzYJnjtqMBAEOwJrebI) from the Boss
2. Open the spreadsheet, go to "Focused Targets" sheet
3. Download the sheet info CSV file
4. Run recreate_database.js as instructed in admin/README.md

## Verify Node server is working

Open Command Prompt and `cd` to the location of this project. First we must install the required packages. In this folder, run the command 

`npm install`

And it should install the required packages we need (which are defined in the package.json file).

To start the server, run the command `npm start`

Go to [localhost:3000](http://localhost:3000) in a web browser. Verify there are no errors on the page, or in the console.

## Play with the website

Now you're ready to start!


# Project Structure
I tried to keep the structure as simple as possible, so that anyone who wants to learn can follow along easier. Our Node server doesn't use any view engine, we are only displaying the static html file with the css and js. For now this is the simplest way, until, or if, we need to add something more.

* **/admin** : this folder contains various custom admin scripts you can run to manipulate data.
* **/backend** : this folder contains the code that will run server-side
* **/db** : this folder contains DB-related code.
* **/models** : this folder has auto-generated Sequelize model files. You wouldn't need to touch this folder unless there is change in DB schema. /models/README.md has information about how to re-generate models in schema change
* **/node_modules** : this folder is automatically filled when you run `npm install`, don't worry about it.
* **/public** : this folder contains our website files (html, css, and js) for all of our client-side activities. 
* **/util** : some common utility functions used in other modules.
* **/validation** : data validation between business logic and data access layer
* **app.js** : the 'base' module that will run our server. Here we define the endpoints and serve the static pages
* **package.json** : this outlines our project and contains information such as the name and what other modules we need. When we run `npm install`, it reads the package names from the "dependancies" section and installs them for us. It also gets updated if we install any packages using `npm install package-name`. Don't worry about this file.
* **package-lock.json** : automatically generated, don't worry about it.
* **.env** : This file needs to be created so we can connect to the database hosted on heroku. It should never be commited to github. 


# Release Notes

## 2020-11-02
New script file 'create_quiz.js' added, that will build the html for the questions when the page loads.

## 2020-10-26
Streamer ranking backend is added 

## 2020-10-22
All code changes in other repositories are merged. streamer-mtchmkr-postgres repositories should not be used anymore, and people should fork jinritv/Streamer-match-makers from now on.

## 2020-10-19
jinritv/Streamer-match-makers is now the central repository, and code from other places is merged into this repository.

All previous commit histories and list of contributors (from this and other repositories) are also merged here.

## 2020-10-12
Updated the quiz and the database query logic, and many UI changes
* quiz is now only 5 questions long, as decided on stream
* added new question: viewing hours, where the user can select when they can watch a stream
* the switches have been changed for toggle buttons
* the slide left/right animation has been replaced with a fade in/out animation
* the mascot image has been changed to the one with the magnifying glass
* a new time picker has been added to the final question about viewing hours (see Notes below)
* the results page now displays 5 'top' streamers returned from the query, based off the mockup
* results now returns the logo URL, as well as a 'match_value' (see Notes below)

**Notes** 
* The SQL query we run fails to return any streamers. This could mean that the query is too strict, or we are not passing enough data, or the data it specifically needs to find any streamer. Someone who wants to look into more about [Sequelize](https://sequelize.org/) could help us here
* The 'match_value' is supposed to represent a % value of how the streamer matched against the answers provided, BUT: we don't have a system or algorithm in place to actually calculate this yet. So right now I just set the 1st result as 98% (jinri), and the other 4 streamers get random values. 
* The 'Viewing hours" question (question #5) doesn't provide anything to the database query yet. We receive that data but the SQL WHERE methods have not been implemented, so right now it's just doing nothing. 

## 2020-09-18
Major updates in backend and custom admin script to facilitate dev works.

1. In server, /calculateStreamer endpoint now returns a matching streamer based on the user answers
2. Validation is added between business logic and data access layer. Eventually, communication between the two layers should be done by passing JSON object in specific formats, which is validated by this validation logic. 
3. Two admin scripts were added: test_db_connection.js and recreate_database.js. Please take a look at admin/README.md for more information.
4. ORM library [Sequelize](https://sequelize.org/) was introduced into the project to work with the database more easily. Also, all models under /models are automatically generated by [sequelize-auto](https://github.com/sequelize/sequelize-auto)
5. This README.md now includes how to run a working streamer match maker service from localhost from scratch. Please look at Getting Started section.


## 2020-09-14
Really scuffed update, this one includes a new modal to the main page where we can add a streamer to the database. A record is created only for the base 'streamers' table, the rest still needs to be updated. But when we insert a new streamer, we retreive the id, so we can use it in subsequent insert queries for things like nationality, stats, language, etc. 

## 2020-09-08
Small update to actually send user's answers to the server, and retreive a streamer from the database. Includes a "results" page with a button to reveal the streamer. 

We're now using kyroskoh's API gateway to interact with the database, but for right now we only retrieve Jinri's record and return it.

Still need to figure out an algorithm, or best strategy to determine the streamer based on the quiz answers.

## 2020-09-04
The main flow for the quiz is complete for the 9 example questions. I've added different examples of quiz elements so we can pick the best ones to use:
* **Range Slider**: I used Mark's suggestion to add [https://github.com/seiyria/bootstrap-slider](https://github.com/seiyria/bootstrap-slider), it is in use for questions 1 and 3.
* **'Radio'-type radio buttons**: These are radio buttons (only one selection allowed), with circle-style normal radio button style, used for question 2 and 6.
* **'Button'-type radio buttons**: These are radio buttons, with a 'button' style, used for questions 7, 8 and 9.
* **Switches**: These are toggles, which allow for multiple selection, used in questions 4 and 5.

To reset the quiz, refresh the page. 


# Authors

Contributors please add your name to this readme in the Authors section

* **glottsi** - this readme, initial work - 
* **kalaloon** - inital work, spreadsheet -
* **kookehs** - initial work, loading data -
* **Proshuto** - meme captain -
* **kyroskoh** - providing the DreamFactory database API
* **9_dog_9_dog** - some backend work and admin scripts
* **ysfchapterzero** - ranking algorithm
* **[YOUR NAME HERE]**


# Links
Trello board for project management: [Trello](https://trello.com/b/026o2aq4/jinri-co-project-2-streammatch)

Google Sheet with the data: [Google sheet](https://docs.google.com/spreadsheets/d/1yQ7YzuM5FhFB13ChTz77W2VyhzYJnjtqMBAEOwJrebI)

