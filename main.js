const async = require('async');
const axios = require('axios');
const initialize = require('./ApiCalls/initializeQueues')
const rate_limit = require('./ApiCalls/rate_limit')
const data = require('./Data/constants')
const logger = require('./ApiCalls/errorHandling/errorLogging')
const headers = data.headers
const taskQueueConcurrency = 1;
let overallCount = 0;
let start = 0
function kickOffProcess(){
    initialize.getExistingQueueData()
    .then(function() {
        if(summonerIdQueue.length() < 10){
            initialize.initializeSummonerIdQueue();
        }
    })
    
}
rate_limit.setAllRateLimits().then(result => {
    start = Date.now()
    summonerIdQueue.push({id:"8TtCOWCWxJ3ic-_VFVHsKsUSg5XirOX8du4EdNpYDsLUUUk"})
})
var summonerIdQueue = async.queue(function(summoner, cb) {
    overallCount++
    let url = '';
    //TODO: since account ids change regularly we should make this key summoner name value aboject wiht time last queried and account id
    const lastTimeQueried = data.all_time.summonerIdToLastUsed[summoner.id]
    if(!lastTimeQueried){
        url = `https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${summoner.id}`
    } else if((Date.now() - lastTimeQueried) > data.msIn5Days){
        var now = Date.now()
        var diff = Date.now() - lastTimeQueried
        url = `https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${summoner.id}?beginTime=${lastTimeQueried}`
    } else {
        console.log('summoner ' + summoner.id + " was skipped. queried " + ((Date.now() - lastTimeQueried) / 1000) + " seconds ago")
        cb()
        return 
    }
    
    data.all_time.summonerIdToLastUsed[summoner.id] = Date.now()
    data.to_be_inserted.summonerIdToLastUsed[summoner.id] = Date.now()
    rate_limit.updateRateLimits("MATCH_LIST_RATE_LIMIT");
    axios.get(url, {headers})
        .then(response => {
            cb()
            //console.log("local to response count 1 second ->  " + rate_limit.RATE_LIMIT.APPLICATION_RATE_LIMIT[0].count +" : "+ response.headers['x-app-rate-limit-count'].split(',')[0].split(':')[0])
            //console.log("local to response count 120 second -> " + rate_limit.RATE_LIMIT.APPLICATION_RATE_LIMIT[1].count +" : "+ response.headers['x-app-rate-limit-count'].split(',')[1].split(':')[0])
            async.each(response.data.matches, function(match, cb2) {
                if(!data.all_time.matchIdSet.has(match.gameId)){
                    data.all_time.matchIdSet.add(match.gameId)
                    data.to_be_inserted.matchIdSet.add(match.gameId)
                    matchIdQueue.push({matchId: match.gameId})
                }
                cb2();
            });
        })
        .catch(err => {
            if(err.code === 'ETIMEDOUT'){
                logger.info(err.message)
                cb()
                return
            }
            logger.info(err.response.data, err.response.headers.date)
            if(!err.response.status === 404){
                console.log(err)
            }
            cb()
        });
    
}, taskQueueConcurrency);



var matchIdQueue = async.queue(function(match, cb) {
    console.log(overallCount++)
    rate_limit.updateRateLimits("MATCHES_RATE_LIMIT");
    axios.get(`https://na1.api.riotgames.com/lol/match/v4/matches/${match.matchId}`, {headers})
        .then(response => {
            cb()
            //console.log("local to response count 1 second ->  " + rate_limit.RATE_LIMIT.APPLICATION_RATE_LIMIT[0].count +" : "+ response.headers['x-app-rate-limit-count'].split(',')[0].split(':')[0])
           // console.log("local to response count 120 second -> " + rate_limit.RATE_LIMIT.APPLICATION_RATE_LIMIT[1].count +" : "+ response.headers['x-app-rate-limit-count'].split(',')[1].split(':')[0])
             //TODO: add matchId to all time matchIds and to be inserted match ids
            processMatchData(response.data);
            async.each(response.data.participantIdentities, function(summoner, cb2) {
                summonerIdQueue.push({id: summoner.player.accountId})
                cb2()
            })
            //main.matchDataQueue.push({matchData: formatedData})
        })
        .catch(err => {
            if(err.code === 'ETIMEDOUT'){
                logger.info(err.message)
                cb()
                return
            }
            logger.info(err.response.data, err.response.headers.date);
            if(!err.response.status === 404){
                console.log(err)
            }
            cb()
        });
}, taskQueueConcurrency);

function processMatchData(matchData){
    const winningTeam = matchData.teams[0].win === "Win" ? matchData.teams[0].teamId : matchData.teams[1].teamId 
    async.each(matchData.participants, function(summoner, cb) {
        if(data.championData[summoner.championId]){
            summoner.teamId === winningTeam ? data.championData[summoner.championId].wins++ : data.championData[summoner.championId].losses++;
        } else {
            data.championData[summoner.championId] = {wins:0, losses:0}
            summoner.teamId === winningTeam ? data.championData[summoner.championId].wins++ : data.championData[summoner.championId].losses++;
        }
        cb()
    })
}



module.exports = {
    summonerIdQueue,
    matchIdQueue
}
