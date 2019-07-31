const main = require('../main')
const data = require('../Data/constants.js')
const async = require('async');
const axios = require('axios');
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

function updateMethodRateLimit(endPointName){
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

function getAllRateLimits() {
    setMatchAndKeyLimits();
    setMatchListLimits();
    setSummonerLimits();
    return Promise.resolve()
}

function setMatchAndKeyLimits() {
    const MATCH_ID = "2771489407"
    const timeWhenCallWasMade = Date.now();
    axios.get(`https://na1.api.riotgames.com/lol/match/v4/matches/${MATCH_ID}`, {headers})
    .then(response => {
        const methodRateLimitResponse = response.headers['x-method-rate-limit'].split(':');
        MATCHES_RATE_LIMIT.allowed = parseInt(methodRateLimitResponse[0]);
        MATCHES_RATE_LIMIT.interval = parseInt(methodRateLimitResponse[1]) * 1000;
        MATCHES_RATE_LIMIT.initial_time = timeWhenCallWasMade;
        MATCHES_RATE_LIMIT.count++;

        const applicationRateLimitResponseArr = response.headers['x-app-rate-limit'].split(',');
        setApplicationRateLimit(applicationRateLimitResponseArr, timeWhenCallWasMade)
    })
    .catch(err => {
        logger.info(err.response.data, err.response.headers.date);
    });
}

function setApplicationRateLimit(applicationRateLimitResponseArr, timeWhenCallWasMade){
    applicationRateLimitResponseArr.forEach(limit => {
        let data = {
            allowed: parseInt(limit.split(':')[0]),
            interval: parseInt(limit.split(':')[1]) * 1000,
            count: 1,
            initial_time: timeWhenCallWasMade
        }
        APPLICATION_RATE_LIMIT.push(data)
    });
}
function setMatchListLimits(){
    const ACCOUNT_ID = "HChslF21F_QcYWDPxFKbSjtBveC4Utg0ZGGbBl6INyjcnz8";
    const timeWhenCallWasMade = Date.now();
    axios.get(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${ACCOUNT_ID}`, {headers})
    .then(response => {
        const methodRateLimitResponse = response.headers['x-method-rate-limit'].split(':');
        MATCH_LIST_RATE_LIMIT.allowed = parseInt(methodRateLimitResponse[0]);
        MATCH_LIST_RATE_LIMIT.interval = parseInt(methodRateLimitResponse[1]) * 1000;
        MATCH_LIST_RATE_LIMIT.initial_time = timeWhenCallWasMade;
        MATCH_LIST_RATE_LIMIT.count++;
    })
    .catch(err => {
        logger.info(err.response.data, err.response.headers.date)
    });
}

function setSummonerLimits() {
    const SUMMONER_ID = "qS2xtsrVG_lZ0IN8qK-b6JZCFBIBVAvvdhoxDFS-MdZgAiU";
    const timeWhenCallWasMade = Date.now();
    axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/${SUMMONER_ID}`, {headers})
    .then(response => {
        const methodRateLimitResponse = response.headers['x-method-rate-limit'].split(':');
        SUMMONER_RATE_LIMIT.allowed = parseInt(methodRateLimitResponse[0]);
        SUMMONER_RATE_LIMIT.interval = parseInt(methodRateLimitResponse[1]) * 1000;
        SUMMONER_RATE_LIMIT.initial_time = timeWhenCallWasMade;
        SUMMONER_RATE_LIMIT.count++;
    })
    .catch(err => {
        logger.info(err.response.data, err.response.headers.date)
    })

}

module.exports = {
    getAllRateLimits,
    APPLICATION_RATE_LIMIT,
    MATCH_LIST_RATE_LIMIT,
    MATCHES_RATE_LIMIT,
    SUMMONER_RATE_LIMIT
}