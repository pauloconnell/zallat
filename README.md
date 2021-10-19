# HR Zallat Code Test





## Challenge Questions:

Challenge Question for Junior Backend Developer  
Please use the child series from this page (CO2 emission from Coal consumption for Electrical 
power production) as reference: 
https://www.eia.gov/opendata/qb.php?category=2251609 
 
Key: (hidden in .env)
 
Please use the following 3rd party API to create an express.js base API so that: 
1. Can return “Electric power carbon dioxide emission quantity from some state from 
some year”.  
a. For example: given params of year:2000, state:California. It should return 
2.103701 
2. If for each million metric tons of “Electric power carbon dioxide emission” from coal 
consumed, the state government need to pay tax of 1 million dollars. Please create an 
API that with params of from, to, state, that returns the total tax that the state 
government paid in that period.  
a. For example: given from: 2003, to:2006, state: California. It should return 
8.306344million or 8.3 million 
 
3. (Bonus) Please create a NOSQL MongoDB in any cloud. To save at least 5 set data from 
child series on this page: https://www.eia.gov/opendata/qb.php?category=2251609 
And add another end point that can return the state that has the highest CO2 emission 
in a given period (from, to will be given as params)



## What's in this project?

← `README.md`: That’s this file, 

← `public/style.css`: The styling rules for the pages in this site.

← `server.js`: The **Node.js** server script for this site. The JavaScript defines the API endpoints in the site back-end

## Helper DB Functions:
To avoid slowing down server when accessing DB:
 #### checkForStateData
- Extra Bonus: I built an API to automate adding data to DB, so this ensures no duplicate data is saved to DB<br>
 #### addStateData
 this function adds the data from gov't API to the DB<br>
 #### findMaxEmissions 
 - bonus section - hits DB and finds max emission & state for time period given<br>

## API routes are:
 /API/emmissions   -PT 1 -  finds emissions for selected state in selected year<br>
 /API/cost         -PT 2 -  finds cost of emissions for selected state across years selected <br>
 /API/max          -Pt 3 - finds state in DataBase with max emissions over years selected<br>
 /API/add          -Pt 3 extra - automates adding state data to database<br>



← `package.json`: The NPM packages for this project's dependencies.

← `src/`: This folder holds the homepage 

← `src/seo.json`: can change SEO/meta settings in here.


## You built this with Glitch!

[Glitch](https://glitch.com) is a friendly community where millions of people come together to build web apps and websites.

