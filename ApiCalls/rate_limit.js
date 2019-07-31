const main = require('./../main')
const data = require('./../Data/constants.js')
const async = require('./../node_modules/async');
const axios = require('./../node_modules/axios');
const logger = require('./errorHandling/errorLogging');
const headers = data.headers;

const amountOffRateLimit = 5
// need to seperately look out for serivce rate limits after each call in catch
let APPLICATION_RATE_LIMIT = []
let MATCH_LIST_RATE_LIMIT = {
    allowed: 0,
    count: 0,
    initial_time: 0,
    interval: 0
};
let MATCHES_RATE_LIMIT = {
    allowed: 0,
    count: 0,
    initial_time: 0,
    interval: 0
};
let SUMMONER_RATE_LIMIT = {
    allowed: 0,
    count: 0,
    initial_time: 0,
    interval: 0
};

function updateRateLimits(endPointName){
    const initialTime = Date.now()
    if(initialTime > this[endPointName].initial_time){
        this[endPointName].count = 1;
        this[endPointName].initial_time = initialTime;
    } else if(this[endPointName].allowed - this[endPointName].count < amountOffRateLimit){
        const timeNeededToWait = this[endPointName].interval - (initialTime - this[endPointName].initial_time);
        this[endPointName].count = 0
        setTimeout(() => {
            console.log("waiting for: " + timeNeededToWait / 1000 + " seconds")
            this[endPointName].count++
        }, timeNeededToWait);
    } else {
        this[endPointName].count++;
    }
    updateApplicationRateLimit()
}

function updateApplicationRateLimit(){
    APPLICATION_RATE_LIMIT.forEach(limit => {
        let initialTime = Date.now()
        if(initialTime > limit.initial_time){
            limit.count = 1;
            limit.initial_time = initialTime;
        } else if(limit.allowed - limit.count < amountOffRateLimit) {
            const timeNeededToWait = limit.interval - (initialTime - limit.initial_time);
            limit.count = 0
            setTimeout(() => {
                console.log("waiting for: " + timeNeededToWait / 1000 + " seconds")
                limit.count++
            }, timeNeededToWait);
        } else {
            limit.count++;
        }
    })
}

function setAllRateLimits() {
    setMethodRateLimits("https://na1.api.riotgames.com/lol/match/v4/matches/2771489407", "MATCHES_RATE_LIMIT");
    setMethodRateLimits("https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/HChslF21F_QcYWDPxFKbSjtBveC4Utg0ZGGbBl6INyjcnz8", "MATCH_LIST_RATE_LIMIT");
    setMethodRateLimits("https://na1.api.riotgames.com/lol/summoner/v4/summoners/qS2xtsrVG_lZ0IN8qK-b6JZCFBIBVAvvdhoxDFS-MdZgAiU","SUMMONER_RATE_LIMIT");
    setApplicationRateLimit()
    return Promise.resolve()
}

function setApplicationRateLimit(){
  const SUMMONER_ID = "qS2xtsrVG_lZ0IN8qK-b6JZCFBIBVAvvdhoxDFS-MdZgAiU"
  const timeWhenCallWasMade = Date.now();
  axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/${SUMMONER_ID}`, {headers})
  .then(response => {
      const applicationRateLimitResponseArr = response.headers['x-app-rate-limit'].split(',');
      applicationRateLimitResponseArr.forEach(limit => {
          let data = {
              allowed: parseInt(limit.split(':')[0]),
              interval: parseInt(limit.split(':')[1]) * 1000,
              count: 4,
              initial_time: timeWhenCallWasMade
          }
          APPLICATION_RATE_LIMIT.push(data)
      });
  })
  .catch(err => {
      logger.info(err.response.data, err.response.headers.date)
  });
}

function setMethodRateLimits(restUrl, method){
    const timeWhenCallWasMade = Date.now();
    axios.get(restUrl, {headers})
    .then(response => {
        const methodRateLimitResponse = response.headers['x-method-rate-limit'].split(':');
        this[method].allowed = parseInt(methodRateLimitResponse[0]);
        this[method].interval = parseInt(methodRateLimitResponse[1]) * 1000;
        this[method].initial_time = timeWhenCallWasMade;
        this[method].count++;
    })
    .catch(err => {
        logger.info(err.response.data, err.response.headers.date)
    });
}

module.exports = {
    updateRateLimits,
    setAllRateLimits
}
