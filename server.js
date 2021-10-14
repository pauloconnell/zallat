/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */

const path = require("path");
const bodyParser = require("body-parser");
require('isomorphic-fetch');

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
 * Returns src/pages/index.hbs with data built into it
 */
app.get("/", function(request, response) {
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };

  // If someone clicked the option for a random color it'll be passed in the querystring
  if (request.query.randomize) {
    // We need to load our color data file, pick one at random, and add it to the params
    const colors = require("./src/colors.json");
    const allColors = Object.keys(colors);
    let currentColor = allColors[(allColors.length * Math.random()) << 0];

    // Add the color properties to the params object
    params = {
      color: colors[currentColor],
      colorError: null,
      seo: seo
    };
  }

  // The Handlebars code will be able to access the parameter values and build them into the page
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
  fetch(
    "http://api.eia.gov/category/?api_key=${process.env.SECRET}&category_id=2251609"
  )
    .then(response => {
      return response.json();
    })
    .then(myJson => {
      console.log(myJson);
      response.send(myJson);
    })
    .catch(err => console.log(err));
});

// Run the server and report out to the logs

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
