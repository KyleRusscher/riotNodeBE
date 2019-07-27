//TODO: big time code cleanup
//      check for rate limiting in each api call and if rate limit is close / met start inserting into db

let data = require('./data');
const async = require('async');
const axios = require('axios');
var logger = require('./errorLogging');

let apiKeyDown = false;
const taskQueueConcurrency = 1;
const apiKey = 'RGAPI-d4c65e21-0fba-4e99-9687-ddc3ba197ed3';
const apiKey2 = 'RGAPI-1cc491dc-643a-4a48-9e51-a3a0aea888e2'
const headers = {
    "Origin": "https://developer.riotgames.com",
    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Riot-Token": apiKey2,
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36"
}
var summonerIdQueue = async.queue(function(task, cb) {
    console.log("performingTask: " + task.id)
    console.log("waiting to be processed: " + summonerIdQueue.length())
    console.log("--------------------------")
     
    processQueueItem(task.id)
    cb()
    
}, taskQueueConcurrency);

var matchIdQueue = async.queue(function(task, cb) {
    console.log("performingTask: " + task.matchId)
    console.log("waiting to be processed: " + matchIdQueue.length())
    console.log("--------------------------")
   
    loadMatchInfo(task.matchId)
    cb()
}, taskQueueConcurrency);
//summonerIdQueue.pause()
//matchIdQueue.pause()
function processQueueItem(summonerId) {
    if(apiKeyDown)return;
    axios.get(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${summonerId}`, {headers})
        .then(response => {
            async.each(response.data.matches, function(match, cb) {
                console.log(match.gameId)
                matchIdQueue.push({matchId: match.gameId})
                cb();
            });
            checkForRateLimit(response.headers['x-app-rate-limit'], response.headers['x-app-rate-limit-count'],
                response.headers['x-method-rate-limit'], response.headers['x-method-rate-limit-count']);
        })
        .catch(err => {
            logger.info(err.response.data, err.response.headers.date)
        });
}

function loadMatchInfo(matchId) {
    if(apiKeyDown)return;
    axios.get(`https://na1.api.riotgames.com/lol/match/v4/matches/${matchId}`, {headers})
        .then(response => {
            //TODO: load this data into an object to be stored in database only once rate limit is met and we have down time
            //console.log(response.headers)
            checkForRateLimit(response.headers['x-app-rate-limit'], response.headers['x-app-rate-limit-count'],
                response.headers['x-method-rate-limit'], response.headers['x-method-rate-limit-count']);
        })
        .catch(err => {
            logger.info(err.response.data, err.response.headers.date)
        });
}
// for(var i = 0; i < 20; i++){
//     loadMatchInfo('2771489407')
// }
summonerIdQueue.push({id:"HChslF21F_QcYWDPxFKbSjtBveC4Utg0ZGGbBl6INyjcnz8"});
//processQueueItem('wG8kojLjHuGx89zRCoU2_rUGozwkmixlAp-RwJE0R9AIm94')

function summonerIdsToAccountIds(summonerId){
    axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}`, {headers})
        .then(response => {
            checkForRateLimit(response.headers['x-app-rate-limit'], response.headers['x-app-rate-limit-count'],
                response.headers['x-method-rate-limit'], response.headers['x-method-rate-limit-count'], response.headers['']);
            return response.data.accountId;
        })
        .catch(err => {
            logger.info(err.response.data, err.response.headers.date)
        })
}

//  TODO: this is a very costly function to be ran each time an api call is made.  
//  Consider logging rate limits at start and then implimenting a counter for each level instead.
//  (use Date.now() to determine when to reset counter)
function checkForRateLimit(keyTotal, keyActual, methodTotal, methodActual) {
    console.log(keyTotal)
    console.log(keyActual)
    console.log(methodTotal)
    console.log(methodActual)
    const keyActualValues = keyActual.split(',')
    const keyTotalValues = keyTotal.split(',')
    const methodActualValues = methodActual.split(',')
    const methodTotalValues = methodTotal.split(',')
    let totalTimeOnRateLimitHit = 0;
    for(var i = 0; i < keyActualValues.length; i++){
        const actualKey = keyActualValues[i].split(':')
        const totalKey = keyTotalValues[i].split(':')
        if(totalKey[0] - actualKey[0] < 10){
            totalTimeOnRateLimitHit = totalKey[1]
            processDataQueue(totalTimeOnRateLimitHit)
            
        }
    }
    for(var i = 0; i < methodActualValues.length; i++){
        const actualMethod = methodActualValues[i].split(':')
        const totalMethod = methodTotalValues[i].split(':')
        if(totalMethod[0] - actualMethod[0] < 10) {
            processDataQueue(totalMethod[1] - totalTimeOnRateLimitHit)
        }
    }
}

function processDataQueue(rateLimitDownTime){
    console.log("in the processdataqueue bc rate limit was hit")
    console.log(rateLimitDownTime)
    apiKeyDown = true;
    matchIdQueue.pause()
    summonerIdQueue.pause()
    // const timeCanExit = Date.now() + (rateLimitDownTime * 1000)
    // apiKeyDown = true;
    // while(Date.now() < timeCanExit){

    // }
    // apiKeyDown = false

    setTimeout(() => {
        console.log("resuming Queues")
        matchIdQueue.resume()
        summonerIdQueue.resume()
        apiKeyDown = false;
    }, rateLimitDownTime);
}

function initializeSummonerQueue(){
    initializeBelowMaster();
    initializeMasterPlus(); 
}

function initializeBelowMaster() {
    data.constants.ranks.forEach(rank => {
        data.constants.divisions.forEach(division => {
            axios.get(`https://na1.api.riotgames.com/lol/league/v4/entries/RANKED_SOLO_5x5/${rank}/${division}?page=1`, {headers})
                .then(response => {
                    async.each(response.data, function(summoner, cb) {
                        const accountId = summonerIdsToAccountIds(summoner.summonerId)
                        summonerIdQueue.push({id: accountId})
                        cb();
                    });
                    checkForRateLimit(response.headers['x-app-rate-limit'], response.headers['x-app-rate-limit-count'],
                response.headers['x-method-rate-limit'], response.headers['x-method-rate-limit-count']);
                })
                .catch(err => {
                    logger.info(err.response.data, err.response.headers.date)
                });
        });
    });
}

function initializeMasterPlus() {
    data.constants.masterPlus.forEach(rank => {
        axios.get(`https://na1.api.riotgames.com/lol/league/v4/${rank}leagues/by-queue/RANKED_SOLO_5x5`, {headers})
        .then(response => {
            async.each(response.data.entries, function(summoner, cb) {
                const accountId = summonerIdsToAccountIds(summoner.summonerId)
                summonerIdQueue.push({id: accountId})
                cb();
            });
            checkForRateLimit(response.headers['x-app-rate-limit'], response.headers['x-app-rate-limit-count'],
                response.headers['x-method-rate-limit'], response.headers['x-method-rate-limit-count']);
        })
        .catch(err => {
            logger.info(err.response.data, err.response.headers.date)
        });
    });
}
//initializeSummonerQueue();