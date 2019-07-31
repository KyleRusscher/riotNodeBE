const async = require('async');
const process = require('./ApiCalls/processQueues')
const initialize = require('./ApiCalls/initializeQueues')
const taskQueueConcurrency = 1;

function kickOffProcess(){
    initialize.getExistingQueueData()
    .then(function() {
        if(summonerIdQueue.length() < 10){
            initialize.initializeSummonerIdQueue();
        }
    })
    
}
var summonerIdQueue = async.queue(function(task, cb) {
    console.log("performingTask: " + task.id)
    console.log("waiting to be processed: " + summonerIdQueue.length())
    console.log("--------------------------")
    process.processSummonerId(task.id)
    cb()
}, taskQueueConcurrency);

var matchIdQueue = async.queue(function(task, cb) {
    console.log("performingTask: " + task.matchId)
    console.log("waiting to be processed: " + matchIdQueue.length())
    console.log("--------------------------")
    process.processMatchId(task.matchId)
    cb()
}, taskQueueConcurrency);

//TODO: implement 
var matchDataQueue = async.queue(function(task, cb) {
    console.log("performingTask: " + task.matchId)
    console.log("waiting to be processed: " + matchIdQueue.length())
    console.log("--------------------------")
    process.processMatchData(task)
    cb()
}, taskQueueConcurrency);

module.exports = {
    summonerIdQueue,
    matchIdQueue,
    matchDataQueue
}
