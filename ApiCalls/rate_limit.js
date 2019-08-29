
const data = require('./../Data/constants.js')
const axios = require('./../node_modules/axios');
const logger = require('./errorHandling/errorLogging');
const headers = data.headers;

let appRateLimitMet = false;
let summonerRateLimitMet = false;
let matchRateLimitMet = false;
let matchListRateLimitMet = false;

const amountOffRateLimit = 5
// need to seperately look out for serivce rate limits after each call in catch
const RATE_LIMIT = {
    APPLICATION_RATE_LIMIT: [],
    MATCH_LIST_RATE_LIMIT: {
        allowed: 0,
        count: 0,
        initial_time: 0,
        interval: 0
    },
    MATCHES_RATE_LIMIT: {
        allowed: 0,
        count: 0,
        initial_time: 0,
        interval: 0
    },
    SUMMONER_RATE_LIMIT: {
        allowed: 0,
        count: 0,
        initial_time: 0,
        interval: 0
    }
}

function updateRateLimits(endPointName){
    const initialTime = Date.now()
    let ini = RATE_LIMIT[endPointName].allowed 
    let now = RATE_LIMIT[endPointName].count
    if(initialTime > RATE_LIMIT[endPointName].initial_time + RATE_LIMIT[endPointName].interval){
        RATE_LIMIT[endPointName].count = 1;
        RATE_LIMIT[endPointName].initial_time = initialTime;
    } else if(RATE_LIMIT[endPointName].allowed - RATE_LIMIT[endPointName].count < amountOffRateLimit){
        const timeNeededToWait = RATE_LIMIT[endPointName].interval - (initialTime - RATE_LIMIT[endPointName].initial_time) + 1000;
        RATE_LIMIT[endPointName].count = 0
        //maybe not the best but works for now 
        console.log("waiting for: " + timeNeededToWait / 1000  + " seconds")
        console.log("was delayed from " + endPointName)
        while(Date.now() < initialTime + timeNeededToWait){

        }
        RATE_LIMIT[endPointName].count++
    } else {
        RATE_LIMIT[endPointName].count++;
    }
    updateApplicationRateLimit()
}

function updateApplicationRateLimit(){
    RATE_LIMIT.APPLICATION_RATE_LIMIT.forEach(limit => {
        let initialTime = Date.now()
        if(initialTime > limit.initial_time + limit.interval){
            limit.initial_time = initialTime;
            limit.count = 1;
        } else if(limit.allowed - limit.count < amountOffRateLimit) {
            const timeNeededToWait = limit.interval - (initialTime - limit.initial_time) + 1000;
            console.log("waiting for: " + timeNeededToWait / 1000  + " seconds")
            console.log("was delayed from application")
            while(Date.now() < initialTime + timeNeededToWait){
                insertInto
            } 
            updateApplicationRateLimit()
        } else {
            limit.count++;
        }
    })
}


// seems limt acc ids change?
function setAllRateLimits() {
    let overall = setMethodRateLimits("https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/jockbuffton","SUMMONER_RATE_LIMIT",true).then(accId => {
         let promise1 = setMethodRateLimits(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${accId}`, "MATCH_LIST_RATE_LIMIT",false);
         let promise2 = setMethodRateLimits("https://na1.api.riotgames.com/lol/match/v4/matches/2771489407", "MATCHES_RATE_LIMIT",false)
         let promise3 = setApplicationRateLimit()
         return Promise.all([promise1,promise2,promise3])
    })
    return Promise.resolve(overall)
    
}

function setApplicationRateLimit(){
  return new Promise(function(resolve, reject) { 
  const ACCOUNT_ID = "fM3o0f-THeNEBL159X-SxCna8EKBXKCu8EDmuJkl2OdMKZE"
  const timeWhenCallWasMade = Date.now();
  axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/${ACCOUNT_ID}`, {headers})
  .then(response => {
      const applicationRateLimitResponseArr = response.headers['x-app-rate-limit'].split(',');
      applicationRateLimitResponseArr.forEach(limit => {
          let data = {
              allowed: parseInt(limit.split(':')[0]),
              interval: (parseInt(limit.split(':')[1]) * 1000),
              count: 4,
              initial_time: timeWhenCallWasMade
          }
          RATE_LIMIT.APPLICATION_RATE_LIMIT.push(data)
          console.log("app")
          resolve("done")
      });
  })
  .catch(err => {
      logger.info(err.response.data, err.response.headers.date)
  });
})
}

function setMethodRateLimits(restUrl, method, returnId){
    return new Promise(function(resolve, reject) { 
    const timeWhenCallWasMade = Date.now();
    axios.get(restUrl, {headers})
    .then(response => {
        console.log("here")
        const methodRateLimitResponse = response.headers['x-method-rate-limit'].split(':');
        RATE_LIMIT[method].allowed = parseInt(methodRateLimitResponse[0]);
        RATE_LIMIT[method].interval = parseInt(methodRateLimitResponse[1]) * 1000;
        RATE_LIMIT[method].initial_time = timeWhenCallWasMade;
        RATE_LIMIT[method].count++;
        if(returnId){
            resolve(response.data.accountId)
        } else {
            resolve("done")
        }
        
    })
    .catch(err => {
        logger.info(err.response.data, err.response.headers.date)
    });
})
}

module.exports = {
    updateRateLimits,
    setAllRateLimits,
    RATE_LIMIT,
    appRateLimitMet
}
