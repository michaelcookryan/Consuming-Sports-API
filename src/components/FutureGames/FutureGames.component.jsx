import React from "react";

export default function FutureGames({ showOwner, playerInfo, schedule }) {
  const { awayTeam, homeTeam } = schedule;

  return (
    <div className='futureGame'>
      <div className='futureGame__awayTeam'>
        {awayTeam.abbreviation.length > 0 ? (
          <>
            <div className='futureGame__awayTeam-name'>
              {`${awayTeam.abbreviation}`}
              <p className='ownerName'>{`${showOwner(
                awayTeam.id,
                playerInfo.teams
              )}`}</p>
            </div>
            <span> VS </span>
          </>
        ) : (
          <div className='futureGame__awayTeam-bye-week'>
            {`${homeTeam.abbreviation} (Bye Week)`}
          </div>
        )}
      </div>

      <div className='futureGame__homeTeam'>
        {awayTeam.abbreviation.length > 0 ? (
          <>
            <div className='futureGame__homeTeam-name'>
              {`${homeTeam.abbreviation}`}
              <p className='ownerName'>{`${showOwner(
                homeTeam.id,
                playerInfo.teams
              )}`}</p>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
