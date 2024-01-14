/*
 Project criteria:
    * Make a express server with the following endpoints:
        * /snowReport
            get overnight snowfall, current base, snowfall in the last 24 hours,
            total season snowfall, and storm snowfall by scraping snowbasin site
        * /conditions
            get temperature in F, a text description of the weather, the wind
            speed and direction for the base and midmountain
            
 Constraints:
    * Number of characters that the arduino mega can receive
        Arduino Mega can only store about 8,000 bytes of data. I'd like to send
        at MAX only 5,000 characters, which should be pretty easy.
    * Time
        Before the end of the ski season because I want to actually use it
    * Money
        Ideally $0, I should be able to find a free hosting service to host the
        expres.js server.
 */

/*
    Last Update:        body > div.mc-weather > div.mc-weather__wrap > p

    Snow inches:        body > div.mc-weather > div.mc-weather__wrap > div > div > ul > li:nth-child(1) > ul > li:nth-child(1/2/3/4/5) > p

    Base Temp:          body > div.mc-weather > div.mc-weather__wrap > div > div > ul > li:nth-child(2) > ul > li:nth-child(1) > p
    MMtn Temp:          body > div.mc-weather > div.mc-weather__wrap > div > div > ul > li:nth-child(2) > ul > li:nth-child(2) > p
    Base weather:       body > div.mc-weather > div.mc-weather__wrap > div > div > ul > li:nth-child(2) > ul > li:nth-child(1) > ul > li:nth-child(1) > h4
    MMtn weather:       body > div.mc-weather > div.mc-weather__wrap > div > div > ul > li:nth-child(2) > ul > li:nth-child(2) > ul > li:nth-child(1) > h4
    Base Wind:          body > div.mc-weather > div.mc-weather__wrap > div > div > ul > li:nth-child(2) > ul > li:nth-child(1) > ul > li:nth-child(2) > h4
    MMtn Wind:          body > div.mc-weather > div.mc-weather__wrap > div > div > ul > li:nth-child(2) > ul > li:nth-child(2) > ul > li:nth-child(2) > h4
*/

const cheerio = require("cheerio");
const axios = require("axios");

const getBasinData = async () => {
  // downloading the target web page
  // by performing an HTTP GET request in Axios
  const axiosResponse = await axios.request({
    method: "GET",
    url: "https://www.snowbasin.com/the-mountain/mountain-report/",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
  });

  const $ = cheerio.load(axiosResponse.data);

  // stores the last time the snow report was updated
  const lastUpdate = $("body > div.mc-weather > div.mc-weather__wrap > p")
    .text()
    .replace("Last Updated: ", "");

  // array to store the inital snow data
  const rawSnowNums = [];

  // Loops through a HTML selector path to return all the data we want
  for (let i = 1; i <= 5; i++) {
    rawSnowNums.push(
      $(
        `body > div.mc-weather > div.mc-weather__wrap > div > div > ul > li:nth-child(1) > ul > li:nth-child(${i}) > p`
      )
        .text()
        .replace("”", "")
    );
  }

  // GET /conditions ------------------------------------------------------------

  // array to store the initial data
  const rawConditionNums = [];

  // loops through html selector path to get all required data
  // required paths can be found at the top of the page
  for (let i = 1; i <= 2; i++) {
    rawConditionNums.push(
      $(
        `body > div.mc-weather > div.mc-weather__wrap > div > div > ul > li:nth-child(2) > ul > li:nth-child(${i}) > p`
      )
        .text()
        .replace("°F", "")
    );

    for (let j = 1; j <= 2; j++) {
      rawConditionNums.push(
        $(
          `body > div.mc-weather > div.mc-weather__wrap > div > div > ul > li:nth-child(2) > ul > li:nth-child(${i}) > ul > li:nth-child(${j}) > h4`
        )
          .text()
          .replace("Wind ", "")
      );
    }
  }

  // template for server response
  const returnObj = {
    snowData: {
      overnightIn: rawSnowNums[0],
      baseIn: rawSnowNums[1],
      last24HrsIn: rawSnowNums[2],
      seasonIn: rawSnowNums[3],
      stormIn: rawSnowNums[4],
    },
    conditions: {
      base: {
        tempF: rawConditionNums[0],
        weatherDesc: rawConditionNums[1],
        wind: rawConditionNums[2],
      },
      midMountain: {
        tempF: rawConditionNums[3],
        weatherDesc: rawConditionNums[4],
        wind: rawConditionNums[5],
      },
      lastUpdate,
    },
  };

  return returnObj;
};

getBasinData().then(JSON.stringify).then(console.log);
