// Refactored findTeam function
export const findTeam = (allTeams, searchedId, owner) => {
  const found = allTeams.find((team) => team.team.id === searchedId);
  const { id, abbreviation, city, name } = found?.team || {};
  const { wins, losses, ties = 0 } = found?.stats?.standings || {};

  return {
    id,
    abbreviation,
    name: `${city} ${name}`,
    record: { wins, losses, ties },
    owner,
  };
};

const toNumericId = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : value;
};

export const hydratePlayerDoc = (documentSnapshot) => {
  const data = documentSnapshot.data();

  // Firestore document ids are metadata, not part of doc.data(). Hydrating them
  // from the snapshot keeps updateDoc calls pointed at the displayed document,
  // even if an older stored docId field is missing or stale.
  return {
    ...data,
    docId: documentSnapshot.id,
    id: data.id || documentSnapshot.id,
    mainLogo:
      data.mainLogo === undefined ? data.mainLogo : toNumericId(data.mainLogo),
    teamList: Array.isArray(data.teamList)
      ? data.teamList.map(toNumericId)
      : [],
  };
};

export const hydrateTeamDoc = (documentSnapshot) => {
  const data = documentSnapshot.data();

  return {
    ...data,
    docId: documentSnapshot.id,
    id: toNumericId(data.id),
  };
};

// Refactored findTeamLogo function
export const findTeamLogo = (allTeams, teamId) => {
  const dedicatedTeam = allTeams.find((team) => team?.team.id === teamId);
  return dedicatedTeam?.team.officialLogoImageSrc;
};

// Refactored descendingOrder function
export const descendingOrder = (list) => {
  return list.sort(
    (a, b) => b.record.wins + b.record.ties - (a.record.wins + a.record.ties),
  );
};

// Refactored currentDateTime function
export const currentDateTime = () => {
  const today = new Date();
  return `${today.getHours()}:${today.getMinutes()}`;
};

// Refactored totalsForStandings function
export const totalsForStandings = (team) => {
  const ties = team.record.ties || 0;
  return team.record.wins + ties / 2;
};

// Refactored sortStandings function
export const sortStandings = (array) => {
  const currentStandings = array.map((player) => {
    const teamsTotal = player.teams.reduce(
      (total, team) => total + totalsForStandings(team),
      0,
    );
    return {
      id: player.id,
      logo: player.logo,
      total: teamsTotal,
      teams: player.teams,
    };
  });

  return currentStandings.sort((a, b) => b.total - a.total);
};

// Refactored standingsPosition function
export const standingsPosition = (indexPos) => {
  const positions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
  return positions[indexPos] || "";
};
