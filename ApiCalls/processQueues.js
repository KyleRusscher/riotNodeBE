//TODO: change name to processQueues.js
const main = require('../main')
const data = require('../Data/constants.js')
const async = require('./node_modules/async');
const axios = require('./node_modules/axios');
const rate_limit = require('./rate_limit');
const logger = require('./errorHandling/errorLogging');
const headers = data.headers;

function processSummonerId(summonerId) {
    rate_limit.updateRateLimits("MATCH_LIST_RATE_LIMIT");
    axios.get(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${summonerId}`, {headers})
        .then(response => {
            async.each(response.data.matches, function(match, cb) {
                // TODO: add participants back to summonerIdQueue and add / remove data from queues
                console.log(match.gameId)
                main.matchIdQueue.push({matchId: match.gameId})
                cb();
            });
        })
        .catch(err => {
            logger.info(err.response.data, err.response.headers.date)
        });
}

function processMatchData(data){
    //TODO: implement
}
// TODO: implement what is needed from match data
function processMatchId(matchId) {
    rate_limit.updateRateLimits("MATCHES_RATE_LIMIT");
    axios.get(`https://na1.api.riotgames.com/lol/match/v4/matches/${matchId}`, {headers})
        .then(response => {
             //TODO: add matchId to all time matchIds and to be inserted match ids
            const formatedData = getRequiredDate(response.data);
            main.matchDataQueue.push({matchData: formatedData})
        })
        .catch(err => {
            logger.info(err.response.data, err.response.headers.date);
        });
}

function getRequiredDate(data) {
    return data
}

module.exports = {
    processSummonerId,
    processMatchId,
    processMatchData
}
