/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */

const path = require("path");
const bodyParser = require("body-parser");
require("isomorphic-fetch");
require("dotenv").config();

// Require the fastify framework and instantiate it
const express = require("express");
// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE

var app = express();
var port = process.env.PORT || 3000;
// Setup our static files
app.use(express.static("public"));

//app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

/**
 * Our home page route
 *

 */
app.get("/", function(request, response) {
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };

  response.sendFile(__dirname + "/src/pages/index.html");
});

/**
 * Our POST route to handle and react to form submissions
 *
 * Accepts body data indicating the user choice
 */
app.post("/", function(request, reply) {
  // Build the params object to pass to the template
  let params = { seo: seo };

  // If the user submitted a color through the form it'll be passed here in the request body
  let color = request.body.color;

  // If it's not empty, let's try to find the color

  // The Handlebars template will use the parameter values to update the page with the chosen color
  reply.view("/src/pages/index.hbs", params);
});

app.post("/API/emmisions", function(request, response) {
  console.log(request.body);
  var sentState = request.body.state;
  console.log("key is ", process.env.MYKEY, "state is ", sentState);
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
  var finalAnswer=0;
  fetch(apiUrl)
    .then(response => {
      return response.json();
    })
    .then(myJson => {
      console.log("recieved: ",JSON.stringify(myJson.series[0].data));
     let myData=myJson.series[0].data.forEach((year)=>{
       console.log("checking",year);
       if (year[0]==request.body.year){
         console.log("found year ", year);
         finalAnswer=year[1];
       }
     });
    // let answerIndex=myData.indexOf(request.body.year);
    // console.log("answer is ", answerIndex,JSON.stringify(myData[answerIndex]));
      response.json(finalAnswer);
    })
    .catch(err => console.log(err));
});

// Run the server and report out to the logs

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
