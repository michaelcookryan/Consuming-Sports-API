import React from 'react';
import Team from './Team';

function Player ({name, allTeams, descendingOrder, total}) {
  
    let all = 0
    
        return (
            <div className="player-details">
                <h2 className="player-details__name">{name}</h2>
                <table className="player-details__teams">
                    <tbody>
                        <tr className="player-details__teams--header">
                            <th>Team</th>
                            <th>Wins</th>
                            <th>Losses</th>
                            <th>Ties</th>
                        </tr>

                        
                       
                        {descendingOrder(allTeams).map((team) => {
                        
                            all = all + total(team)
                            
                            return (

                                <Team
                                    key={team.name}
                                    teamName={team.name}
                                    wins={team.record.wins}
                                    losses={team.record.losses}
                                    ties={team.record.ties}
                                />
                            );

                        })}

                    </tbody>
                </table>
                <h2 className="player-details__total">{all}</h2>
            </div>
        );

}

export default Player;

