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
                console.log(match.gameId)
                main.matchIdQueue.push({matchId: match.gameId})
                cb();
            });
        })
        .catch(err => {
            logger.info(err.response.data, err.response.headers.date)
        });
}

module.exports = {
    processSummonerId
}
