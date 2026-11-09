import React from "react";

function PlayerDraftList({ players, allTeams }) {
  const showTeamName = (array, teamId) => {
    if (array?.length > 0) {
      let teamToShow = array.find(
        (teamSearch) => teamSearch?.team.id === teamId
      );
      return (
        <li key={teamId}>
          {teamToShow.team.city} {teamToShow.team.name}
        </li>
      );
    }
  };

  return (
    <div className='draft-view__current-drafted'>
      <h2>Players</h2>
      <div className='draft-view__draft-lists'>
        {players.map((player, index) => (
          <div
            key={`${player.id}-${index}`}
            className={`draft-view__player _${player.id}`}
          >
            <h2>{player.id}</h2>
            <ol>
              {player.teamList.map((team) => showTeamName(allTeams, team))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
export default PlayerDraftList;
