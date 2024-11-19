const fs = require("fs");
const groups = JSON.parse(fs.readFileSync("groups.json","utf-8"));

function generateMatchResults(teamA, teamB) {
    const scoreTeamA = Math.floor(Math.random() * 30) + 70;
    const scoreTeamB = Math.floor(Math.random() * 30) + 70;

    return {
        teamA: teamA.Team,
        teamB: teamB.Team,
        scoreTeamA,
        scoreTeamB
    };

}