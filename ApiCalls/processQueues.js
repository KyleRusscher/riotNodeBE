// const data = require('./../Data/constants.js')
// const async = require('./../node_modules/async');
// const axios = require('./../node_modules/axios');
// const rate_limit = require('./rate_limit');
// const logger = require('./errorHandling/errorLogging');
// const headers = data.headers;

// function processSummonerId(summonerId, matchIdQueue) {
//     rate_limit.updateRateLimits("MATCH_LIST_RATE_LIMIT");
//     axios.get(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${summonerId}`, {headers})
//         .then(response => {
//             async.each(response.data.matches, function(match, cb) {
//                 matchIdQueue.push({matchId: match.gameId})
//                 data.all_time.matchIdSet.add(match.gameId)
//                 data.to_be_inserted.matchIdSet.add(match.gameId)
//                 cb();
//             });
//         })
//         .catch(err => {
//             logger.info(err.response.data, err.response.headers.date)
//         });
// }

// function processMatchData(matchData){
//     const winningTeam = matchData.teams[0].win === "Win" ? matchData.teams[0].teamId : matchData.teams[1].teamId 
//     async.each(data.participants, function(summoner, cb) {
//         if(data.championData[summoner.championId]){
//             summoner.teamId === winningTeam ? data.championData[summoner.championId].wins++ : data.championData[summoner.championId].losses++;
//         } else {
//             data.championData[summoner.championId] = {wins:0, losses:0}
//             summoner.teamId === winningTeam ? data.championData[summoner.championId].wins++ : data.championData[summoner.championId].losses++;
//         }
//         cb()
//     })
// }

// function addNewSummonerIds(participants, summonerIdQueue) {
//     async.each(participants, function(summoner, cb) {
//         summonerIdQueue.push({id: summoner.player.accountId})
//     })
// }

// function processMatchId(matchId, summonerIdQueue) {
//     rate_limit.updateRateLimits("MATCHES_RATE_LIMIT");
//     axios.get(`https://na1.api.riotgames.com/lol/match/v4/matches/${matchId}`, {headers})
//         .then(response => {
//              //TODO: add matchId to all time matchIds and to be inserted match ids
//             processMatchData(response.data);
//             addNewSummonerIds(response.data.participantIdentities, summonerIdQueue)
//             console.log(data.championData)
//             //main.matchDataQueue.push({matchData: formatedData})
//         })
//         .catch(err => {
//             logger.info(err.response.data, err.response.headers.date);
//         });
// }


// module.exports = {
//     processSummonerId,
//     processMatchId,
//     processMatchData
// }
