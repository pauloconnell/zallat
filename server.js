/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */

const path = require("path");
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");
const cors = require("cors");
const mongoose = require("mongoose");
require("isomorphic-fetch");
require("dotenv").config();
const express = require("express");

var app = express();
var port = process.env.PORT || 3000;
// Setup our static files
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//connect to DB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log("server started");

// set up our Schema for the DB
var stateSchema = new mongoose.Schema({
  name: String,
  data: [Array]
});

// create our model in DB collection
const stateDB = mongoose.model("apiPopulated", stateSchema);
console.log("mongoose is: " + mongoose.connection.readyState);

//helper functions to avoid slowing down server when accessing DB:
// checkForStateData - I built an API to automate adding data to DB, so this ensures no duplicate data is saved to DB
// addStateData      - "  " "  "   this function adds the data from gov't API to the DB
// findMaxEmissions  - bonus section - hits DB and finds max emission & state for time period given

// this function will check if we already have this state's data to avoid duplicate data
async function checkForStateData(state, done) {
  try {
    //    var gotStateData=new stateDB({name:"CA", data:dataArray});
    var stateInfoFound = await stateDB.find({ name: state });

    console.log(
      "state data is",
      stateInfoFound,
      JSON.stringify(stateInfoFound)
    );
    if (stateInfoFound.length == 0) done(null, false);
    else done(null, true);
  } catch (err) {
    console.log("Line 53" + err);
    done(err);
  }
}

// this function will save this state's data to the DB
async function addStateData(state, dataArray, done) {
  try {
    var newStateData = new stateDB({ name: state, data: dataArray }); // will this JSON formated dataArray still be saved into data?
    await newStateData.save(function(err, data) {
      if (err) return console.log(err);
      done(null, data);
    });
  } catch (err) {
    console.log("Redundant err handling-delete me" + err);
    done(err);
  }
}

// this function will calculate max emmsions for all states in DB
async function findMaxEmissions(toYear, fromYear, done) {
  try {
    //    var gotStateData=new stateDB({name:"CA", data:dataArray});
    var allStatesInfo = await stateDB.find({});
    var maxEmissionState = { state: "", emission: 0 };
    console.log(
      "state data is",
      allStatesInfo[0].name,
      JSON.stringify(allStatesInfo[0])
    );
    if (allStatesInfo.length == 0) done(null, "no info in DB");
    else {
      allStatesInfo.forEach(state => {
        state.data.forEach(year => {
          if (
            parseInt(year[0], 10) >= fromYear &&
            parseInt(year[0], 10) <= toYear
          ) {
           // console.log("checking : ", state.name, year);

            if (year[1] >= maxEmissionState.emission) {
              maxEmissionState.state = state.name;
              maxEmissionState.emission = year[1];
              console.log("max is now ", JSON.stringify(maxEmissionState));
            }
          }
        });
      });
      done(null, maxEmissionState);
    }
  } catch (err) {
    console.log("Line 53" + err);
    done(err);
  }
}

/**
 * Our home page route
 *

 */
app.get("/", function(request, response) {
  // params is an object we'll pass to our handlebars template

  response.sendFile(__dirname + "/src/pages/index.html");
});

// this API endpoint recieve's the state and outputs it's emmisions for selected year (PART 1 of Code Challenge)
app.post("/API/emmisions", function(request, response) {
  console.log(request.body);
  var sentState = request.body.state1;
  console.log("state is ", sentState);
  let apiUrl =
    "http://api.eia.gov/series/?api_key=" +
    process.env.SECRET +
    "&series_id=EMISS.CO2-TOTV-EC-CO-" +
    sentState +
    ".A";
  let oldUrl =
    "http://api.eia.gov/category/?api_key=" +
    process.env.MYKEY +
    "&category_id=2251609";
  var finalAnswer = 0;
  fetch(apiUrl)
    .then(response => {
      return response.json();
    })
    .then(myJson => {
      console.log("recieved: ", JSON.stringify(myJson.series[0].data));
      myJson.series[0].data.forEach(year => {
        console.log("checking", year);
        if (year[0] == request.body.year1) {
          console.log("found year ", year);
          finalAnswer = year[1];
        }
      });

      response.json(finalAnswer);
    })
    .catch(err => console.log(err));
});

// this API endpoint calculates the cost of the CO2 emissions for years selected ( Part 2 of Challenge)
app.post("/API/cost", function(request, response) {
  console.log(request.body);
  if (request.body.fromYear2 > request.body.toYear2) {
    response.send("'From' year must be before 'to' year, Please re-try");
  }
  var sentState = request.body.state2;
  console.log("state is ", sentState);
  let apiUrl =
    "http://api.eia.gov/series/?api_key=" +
    process.env.SECRET +
    "&series_id=EMISS.CO2-TOTV-EC-CO-" +
    sentState +
    ".A";

  var finalAnswer = [];
  fetch(apiUrl)
    .then(response => {
      return response.json();
    })
    .then(myJson => {
      console.log("recieved: ", JSON.stringify(myJson.series[0].data));
      myJson.series[0].data.forEach(year => {
        console.log("checking", year);
        if (
          year[0] >= request.body.fromYear2 &&
          year[0] <= request.body.toYear2
        ) {
          console.log("found year ", year);
          finalAnswer.push(year[1]);
        }
      });
      console.log("final answer processing:", finalAnswer);
      var returnAmount = 0;
      finalAnswer.forEach((item, index) => {
        returnAmount += item;
        //console.log("check this out",total, num, returnAmount);
      });
      console.log("calculated:", returnAmount);
      let returnString = returnAmount.toString();
      returnString += "Million";

      response.send(returnString);
    })
    .catch(err => console.log(err));
});

// this is the endpoint that will hit DB to determine state with most emissions over this period
app.post("/API/max", function(request, response) {
  var { toYear3, fromYear3 } = request.body;
  let answer = findMaxEmissions(toYear3, fromYear3, function(err, result) {
    // add request.body.toDate3 & frontDate3
    if (err) {
      console.log(err);
    }
    if (result) {
      return response.json(result);
    }
  });
});

// this API endpoint automates loading state data into the database to prep for PART 3 of Challenge
app.post("/API/add", async function(request, response) {
  var state = request.body.state3b;

  if (state) {
    // check if we already have this data in database
    var haveData = false;
    try {
      await checkForStateData(state, function(err, result) {
        if (err) {
          console.log(err + " error on this state ", state);
          haveData =
            "set to avoid api call on line 238 due to this unlikely error";
        } else {
          console.log(result + "state data in DB?");
          haveData = result;
        }
      });
    } catch (err) {
      console.log(err);
      return "error saving to data base" + err;
    }
    if (haveData == false) {
      let apiUrl =
        "http://api.eia.gov/series/?api_key=" +
        process.env.SECRET +
        "&series_id=EMISS.CO2-TOTV-EC-CO-" +
        state +
        ".A";
      fetch(apiUrl)
        .then(response => {
          return response.json();
        })
        .then(async myJson => {
          console.log("recieved: ", JSON.stringify(myJson.series[0].data));

          let reply = myJson.series[0].data;
          console.log("about to save to DB", JSON.stringify(reply));

          //if state not here, add to DB

          try {
            await addStateData(state, reply, function(err, result) {
              if (err) {
                console.log(err + "@line 245");
              }
              if (result) {
                console.log(reply + "saved at line 248");
                return response.json(result);
              }
            });
          } catch (err) {
            console.log(err);
            return "error saving to data base" + err;
          }
        });
    } else response.send("already have that state's data in DB");
  } else response.send("no State Selected");
});

// Run the server and report out to the logs

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
