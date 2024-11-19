const { match } = require("assert");
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

function rankTeams(groups, results) {
    const standings = {};
    for(const[group, matches] of Object.entries(results)) {
        const teams = groups[group];
        const teamStats = teams.reduce((teanRecords, team) => {
            teanRecords[team.Team] = {
                wins: 0,
                losses: 0,
                points: 0,
                scored: 0,
                conceded: 0
            };
            return teanRecords;
        }, {});
        matches.forEach((match) => {
            const{teamA, teamB, scoreTeamA, scoreTeamB} = match;
            teamStats[teamA].scored += scoreTeamA;
            teamStats[teamA].conceded += scoreTeamB;
            teamStats[teamB].scored += scoreTeamB;
            teamStats[teamB].conceded += scoreTeamA;

            if(scoreTeamA > scoreTeamB) {
                teamStats[teamA].wins++;
                teamStats[teamB].losses++;
                teamStats[teamA].points += 2;
                teamStats[teamB].points += 1;
            }else{
                teamStats[teamB].wins++;
                teamStats[teamA].losses++;
                teamStats[teamB].points += 2;
                teamStats[teamA].points += 1;
            }
        });

        standings[group] = Object.entries(teamStats) 
            .map(([team, stats]) => {
                return {
                    team,
                    ...stats,
                    pointDifference: stats.scored - stats.conceded
                };
            })
            .sort((a,b) =>
                b.points - a.points || b.pointDifference - a.pointDifference || b.scored - a.scored
            );
    }
    return standings;
}

function printResults(results, standings) {
    console.log("Grupna faza: I kolo:");
    for(const[group, matches] of Object.entries(results)) {
        console.log(`   Grupa ${group}:`);
        matches.forEach((match) => {
            console.log(`   ${match.teamA} - ${match.teamB} (${match.scoreTeamA}:${match.scoreTeamB})`);
        });
    }

    console.log("\nKonacan plasman u grupama:\n");
    for(const[group, teams] of Object.entries(standings)) {
        console.log(`   Grupa ${group} (Ime- pobede/porazi/bodovi/postignuti kosevi/primljeni kosevi/kos razlika)`);
        teams.forEach((team, index) => {
            console.log(`   ${index + 1}. ${team.team.padEnd(10)} ${team.wins} / ${team.losses} / ${team.points} / ${team.points} / ${team.scored} / ${team.pointDifference >= 0 ? "+" : ""}${team.pointDifference}`);
        });
    }
}

function groupTeamsIntoPots(standings) {
    const sortedTeams = [];
    for(const group in standings) {
        sortedTeams.push(...standings[group]);
    }

    sortedTeams.sort((a, b) => 
        b.points - a.points || b.pointDifference - a.pointDifference
    );

    const pots = {
        D: sortedTeams.slice(0,2),
        E: sortedTeams.slice(2,4),
        F: sortedTeams.slice(4,6),
        G: sortedTeams.slice(6,8)
    };
    return pots;
}

const results = generateGroupStageResults(groups);
standings = rankTeams(groups, results);
printResults(results, standings);
const pots = groupTeamsIntoPots(standings);