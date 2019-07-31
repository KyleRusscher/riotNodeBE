const main = require('./../main')
const data = require('./../Data/constants.js')
const async = require('./../node_modules/async');
const axios = require('./../node_modules/axios');
const logger = require('./errorHandling/errorLogging');
const headers = data.headers;

function initializeSummonerIdQueue() {
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
                        console.log(accountId)
                        main.summonerIdQueue.push({id: accountId})
                        cb();
                    });
                })
                .catch(err => {
                    //TODO: actually write something that responds to erors message
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
                main.summonerIdQueue.push({id: accountId})
                cb();
            });
        })
        .catch(err => {
            logger.info(err.response.data, err.response.headers.date)
        });
    });
}


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

module.exports = {
    initializeSummonerIdQueue
}
