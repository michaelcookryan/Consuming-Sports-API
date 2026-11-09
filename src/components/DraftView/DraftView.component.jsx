import React from "react";
import PlayerDraftList from "../PlayerDraftList/PlayerDraftList.component";

function DraftView({ availableTeams, players, allTeams }) {
  return (
    <div className='draft-view'>
      <div className='draft-view__list'>
        <h2>Current Teams Available</h2>
        {availableTeams.map((member) => {
          return (
            <div
              className={`draft-view__team${
                member.available ? "" : " selected"
              }`}
              key={member.id}
            >
              <img
                src={member.logoImageSrc}
                alt={member.name}
                height='30px'
                width='30px'
              />{" "}
              {member.city} {member.name}
            </div>
          );
        })}
      </div>

      <PlayerDraftList players={players} allTeams={allTeams} />
    </div>
  );
}
export default DraftView;
