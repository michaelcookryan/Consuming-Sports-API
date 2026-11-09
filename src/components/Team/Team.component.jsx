import React from 'react';

function Team ({teamName, wins, losses, ties}) {
      
        return (
            <tr className="player-details__teams--stats">
                <td className="team-name">{teamName}</td>
                <td>{wins}</td>
                <td>{losses}</td>
                <td>{ties}</td>
            </tr>
        );

}

export default Team;




