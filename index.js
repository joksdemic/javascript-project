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

function generateGroupStageResults(groups) {
    const results = {};
    for(const[group, teams] of Object.entries(groups)) {
        results[group] = [];
        for(let i = 0; i < teams.length; i++) {
            for(let j = i + 1; j < teams.length; j++) {
                const match = generateMatchResults(teams[i],teams[j]);
                results[group].push(match);
            }
        }
    }
    return results;
}

const results = generateGroupStageResults(groups);