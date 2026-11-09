import React from "react";
import TeamDraftInput from "../TeamDraftInput/TeamDraftInput.component";

function TeamDraftForm({ team, selection, draftManager }) {
  return (
    <form className="team-form">
      <div className="team-details">
        <h5>{team.abbreviation}</h5>
        <img src={team.logoImageSrc} alt={team.name} />
      </div>
      <div className="team-managers">
        {draftManager.map((manager) => {
          let drafted = manager.teamList.includes(team.id);

          return (
            <TeamDraftInput
              key={manager.id}
              team={team}
              selection={selection}
              manager={manager.id}
              docId={manager.docId}
              limitReached={manager.limitReached}
              drafted={drafted}
            />
          );
        })}
      </div>
    </form>
  );
}

export default TeamDraftForm;
