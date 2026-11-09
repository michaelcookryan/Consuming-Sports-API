// Return team by id
export const findTeam = (allTeams, searchedId, owner) => {
  let found = allTeams.find((team) => team.team.id === searchedId);
  let { id } = found?.team;
  let { wins, losses, ties } = found?.stats?.standings;
  let { abbreviation, city, name } = found?.team;

  return {
    id: id,
    abbreviation: abbreviation,
    name: `${city} ${name}`,
    record: {
      wins: wins,
      losses: losses,
      ties: ties ? ties : 0,
    },
    owner: owner,
  };
};

export const findTeamLogo = (allTeams, teamId) => {
  let dedicatedTeam = allTeams.find((team) => team?.team.id === teamId);
  return dedicatedTeam?.team.officialLogoImageSrc;
};

export const descendingOrder = (list) => {
  return list.sort((a, b) => {
    return b.record.wins + b.record.ties - (a.record.wins + a.record.ties);
  });
};

export const currentDateTime = () => {
  let today = new Date();
  return `${
    //   today.getMonth() + 1
    // } + "/" + ${today.getDate()} + "/" + ${today.getFullYear()}`;
    today.getHours()
  }:${today.getMinutes()}`;
};

// Returns player's total
export const totalsForStandings = (team) => {
  let total = 0;
  let ties = team.record.ties ? team.record.ties : 0; //accoutn for ties being undifined....most likely will be corrected at a later date
  total = parseInt(team.record.wins, 10) + parseFloat(ties / 2, 10);
  return total;
};

// Returns sorted list for standings
export const sortStandings = (array) => {
  let currentStandings = [];

  for (const player of array) {
    let teamsTotal = 0;

    for (const team of player.teams) {
      teamsTotal = teamsTotal + totalsForStandings(team);
    }

    let playerTotal = {
      id: player.id,
      logo: player.logo,
      total: teamsTotal,
      teams: player.teams,
    };
    currentStandings.push(playerTotal);
  }

  let sorted = currentStandings.sort((a, b) => {
    return b.total - a.total;
  });

  return sorted;
};

export const standingsPosition = (indexPos) => {
  const positions = {
    0: "1st",
    1: "2nd",
    2: "3rd",
    3: "4th",
    4: "5th",
    5: "6th",
    6: "7th",
    7: "8th",
  };

  return positions[indexPos] || "";
};
