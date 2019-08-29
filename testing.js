const async = require('async');
const axios = require('axios');
const apiKey2 = 'RGAPI-799f7cac-ab6b-40e2-9252-7a443b91333f'
const headers = {
    "Origin": "https://developer.riotgames.com",
    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Riot-Token": apiKey2,
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36"
}

const summoner = '8TtCOWCWxJ3ic-_VFVHsKsUSg5XirOX8du4EdNpYDsLUUUk'
function getSomething(){
    return new Promise(function(resolve, reject) { 
    axios.get(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${summoner}`, {headers})
    .then(response => {
        console.log("time since starting: " + (Date.now() - start) / 1000)
        resolve('done')
    })
    .catch(err => {
        console.log(err)
        logger.info(err.response.data, err.response.headers.date)
    });
    })
}
var start = Date.now()
getSomething()
.then(response => {
    getSomething()
}) .then(response => {
    getSomething()
}) .then(response => {
    getSomething()
}) .then(response => {
    getSomething()
}) .then(response => {
    getSomething()
}) .then(response => {
    getSomething()
}) .then(response => {
    getSomething()
}) .then(response => {
    getSomething()
}) .then(response => {
    getSomething()
})

// for(var i = 0; i < 10; i++){
//     getSomething()
// }
