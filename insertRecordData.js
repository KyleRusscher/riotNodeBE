var mysql = require('mysql');
var data = require('./Data/constants')

var connectToDB = () => {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Mindy8109"
  });
}
function insertChampData(data) {
    let finalSql = "INSERT INTO ttdata.championdata (champID, wins, losses) VALUES ? " +
    "ON DUPLICATE KEY UPDATE wins = wins + VALUES(wins), losses = losses + VALUES(losses);";
    let values = []
    for(champ in data){
      values.push([champ, data[champ].wins, data[champ].losses])
    }
    insert(finalSql, values) 
}

function insertMatchQueue(data) {
  let finalSql = 'INSERT INTO ttdata.usedmatchids (matchID) VALUES ?' +
  'ON DUPLICATE KEY UPDATE matchID = matchID'
  let values = []
  data.forEach(match => {
    values.push([match])
  });
  insert(finalSql, values)
}

function insertSummonerIds(data) {
  let finalSql = 'INSERT INTO ttdata.accountidsalltime (accountID, lastUsedMS) VALUES ?' +
  'ON DUPLICATE KEY UPDATE lastUsedMS = VALUES(lastUsedMS);'
  let values = []
  for(summoner in data){
    values.push([summoner, data[summoner]])
  }
  insert(finalSql, values)
}

function insert(finalSql, values){
  let connection = connectToDB();
  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    connection.query(finalSql, [values], function (err, result) {
      if (err) throw err;
    });
    connection.end()
  }); 
}
function clearAllTempData() {
    data.to_be_inserted.matchIdSet = new Set()
    data.to_be_inserted.summonerIdToLastUsed = {}
    data.championData = {}
}
insertToDB()
function insertToDB() {
  const matchQueue = data.to_be_inserted.matchIdSet;
  const summonerIds = data.to_be_inserted.summonerIdToLastUsed
  const champData = data.championData
  insertMatchQueue(matchQueue)
  insertSummonerIds(summonerIds)
  insertChampData(champData)
  clearAllTempData()
} 