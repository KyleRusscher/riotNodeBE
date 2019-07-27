
const constants = {
    ranksss: ["IRON","BRONZE","SILVER","GOLD","PLATINUM","DIAMOND"],
    ranks: ["IRON"],
    masterPlus: ["master", "grandmaster", "challenger"],
    divisions: ["I","II","III","IV"],
}

let mapsAndSets = {
    allIdsLastUsed: {},
    queueSet: new Set(),
    usedMatchIdsSet: new Set()
}

module.exports = {
    constants,
    mapsAndSets
}