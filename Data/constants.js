//TODO: rename to something more appropriate / seperate out data into different files
const constants = {
    ranksss: ["IRON","BRONZE","SILVER","GOLD","PLATINUM","DIAMOND"],
    ranks: ["IRON"],
    masterPlus: ["master", "grandmaster", "challenger"],
    divisions: ["I","II","III","IV"],
}

const apiKey = 'RGAPI-d4c65e21-0fba-4e99-9687-ddc3ba197ed3';
const apiKey2 = 'RGAPI-8dd708ff-0a15-402e-84af-b2b4e239f1dd'

const headers = {
    "Origin": "https://developer.riotgames.com",
    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Riot-Token": apiKey2,
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36"
}

// const concurrent = {
//     summonerIdSet: new Set(),
// }
const all_time = {
    matchIdSet: new Set(),
    summonerIdToLastUsed: {},
}

const msIn5Days = 5 * 24 * 60 * 60 * 1000

// on insert to DB this should be reset
const to_be_inserted = {
    matchIdSet: new Set(),
    summonerIdToLastUsed: {},
}

const championData = {}

module.exports = {
    constants,
    headers,
    all_time,
    to_be_inserted,
    championData,
    msIn5Days
}
