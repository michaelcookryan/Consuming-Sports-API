import React from "react";
import Team from "../Team/Team.component";
import { totalsForStandings, standingsPosition } from "../../utils/helpers";

function Player({ name, position, allTeams, logo, toggleModal }) {
  let all = 0;

  return (
    <div
      className='player-details'
      id={name}
      onClick={(event) => toggleModal(event)}
    >
      <div className='player-details__name-position'>
        <h2 className='player-details__name'>{name}</h2>
        <h3 className='player-details__position'>
          {standingsPosition(position)}
        </h3>
      </div>
      <table className='player-details__teams'>
        <tbody>
          <tr className='player-details__teams--header'>
            <th>Team</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Ties</th>
          </tr>

          {allTeams.map((team) => {
            all = all + totalsForStandings(team);

            return (
              <Team
                key={team.name}
                teamName={team.name}
                wins={team.record.wins}
                losses={team.record.losses}
                ties={team.record.ties ? team.record.ties : 0}
              />
            );
          })}
        </tbody>
      </table>
      <div className='player-details__footer'>
        <img className='player-details__logo' src={logo} alt='team logo' />
        <h2 className='player-details__total'>{all}</h2>
      </div>
    </div>
  );
}

export default Player;
