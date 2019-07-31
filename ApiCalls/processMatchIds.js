const main = require('../main')
const data = require('../Data/constants.js')
const axios = require('./node_modules/axios');
const logger = require('./errorHandling/errorLogging');
const rate_limit = require('./rate_limit');
const headers = data.headers;

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
    processMatchId
}
