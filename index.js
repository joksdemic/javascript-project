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

function simulateEliminationStage(pots) {
    console.log("\nSesiri:");
    for(const pot in pots) {
        console.log(`   Sesir ${pot}:`);
        pots[pot].forEach((team) => console.log(`   ${team.team}`));
    }

    const quaterFinals = [
        {team1: pots.D[0], team2: pots.G[0]},
        {team1: pots.D[1], team2: pots.G[1]},
        {team1: pots.E[0], team2: pots.F[0]},
        {team1: pots.E[1], team2: pots.F[1]}
    ];

    console.log("\nCetvrtfinale:");
    const semiFinals = [];
    quaterFinals.forEach((match) => {
        const result = generateMatchResults(match.team1, match.team2);
        console.log(`   ${match.team1.team} - ${match.team2.team}: (${result.scoreTeamA} : ${result.scoreTeamB})`);
        if(result.scoreTeamA > result.scoreTeamB) {
            semiFinals.push(match.team1);
        }else{
            semiFinals.push(match.team2);
        }
    });

    const finals = [];
    thirdPlaceMatch = [];
    console.log("\nPolufinale:");
    for(let i = 0; i < semiFinals.length; i += 2) {
        const result = generateMatchResults(semiFinals[i], semiFinals[i + 1]);
        console.log(`   ${semiFinals[i].team} - ${semiFinals[i + 1].team}: (${result.scoreTeamA} : ${result.scoreTeamB})`);
        if(result.scoreTeamA > result.scoreTeamB) {
            finals.push(semiFinals[i]);
            thirdPlaceMatch.push(semiFinals[i + 1]);
        }else{
            finals.push(semiFinals[i + 1]);
            thirdPlaceMatch.push(semiFinals[i]);
        }
    }

    const thirdPlaceResult = generateMatchResults(thirdPlaceMatch[0], thirdPlaceMatch[1]);
    console.log(`\nUtakmica za 3. mesto: \n     ${thirdPlaceMatch[0].team} - ${thirdPlaceMatch[1].team} (${thirdPlaceResult.scoreTeamA} : ${thirdPlaceResult.scoreTeamB})`);

    const finalResult = generateMatchResults(finals[0], finals[1]);
    console.log(`\nFinale: \n   ${finals[0].team} - ${finals[1].team}: (${finalResult.scoreTeamA} : ${finalResult.scoreTeamB})`);

    console.log("\nMedalje:");
    console.log(`   1. ${finalResult.scoreTeamA > finalResult.scoreTeamB ? finals[0].team : finals[1].team}`);
    console.log(`   2. ${finalResult.scoreTeamA > finalResult.scoreTeamB ? finals[1].team : finals[0].team}`);
    console.log(`   3. ${thirdPlaceResult.scoreTeamA > thirdPlaceResult.scoreTeamB ? thirdPlaceResult[0].team : thirdPlaceResult[1].team}`);
}

const results = generateGroupStageResults(groups);
standings = rankTeams(groups, results);
printResults(results, standings);
const pots = groupTeamsIntoPots(standings);
simulateEliminationStage(pots);