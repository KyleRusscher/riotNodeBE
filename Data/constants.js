//TODO: rename to something more appropriate / seperate out data into different files
const constants = {
    ranksss: ["IRON","BRONZE","SILVER","GOLD","PLATINUM","DIAMOND"],
    ranks: ["IRON"],
    masterPlus: ["master", "grandmaster", "challenger"],
    divisions: ["I","II","III","IV"],
}

const apiKey = 'RGAPI-d4c65e21-0fba-4e99-9687-ddc3ba197ed3';
const apiKey2 = 'RGAPI-e1534318-1d47-4a51-a739-e13e3e9d2465'

const headers = {
    "Origin": "https://developer.riotgames.com",
    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Riot-Token": apiKey2,
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36"
}

let concurrent = {
    summonerIdSet: new Set(),
    matchIdSet: new Set(),
    
}
let all_time = {
    matchIdsSet: new Set(),
    summonerIdToLastUsed: {},
}

// on insert to DB this should be reset
let to_be_inserted = {
    matchIdsSet: new Set(),
    summonerIdToLastUsed: {},
}

module.exports = {
    constants,
    headers,
    concurrent,
    all_time,
    to_be_inserted
}
