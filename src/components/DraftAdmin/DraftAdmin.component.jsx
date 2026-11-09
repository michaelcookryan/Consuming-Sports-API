import React from "react";
import TeamDraftForm from "../TeamDraftForm/TeamDraftForm.component";
import ResetBoard from "../ResetBoard/ResetBoard.component";
import DraftOrder from "../DraftOrder/DraftOrder.component";
// import LoadTeams from "../LoadTeams/LoadTeams.component";
/* LoadTeams component is only used once per season, so it is left disabled until needed */

function DraftAdmin({
  displayTeams,
  selection,
  draftManager,
  availableTeams,
}) {
  return (
    <div className='draft-admin-dashboard'>
      <h2>Draft Admin Dashboard</h2>
      <div className='draft-admin-header'>
        <ResetBoard />
        <DraftOrder players={draftManager} />
        {/* <LoadTeams displayTeams={displayTeams} /> */}
      </div>
      <h2>Teams</h2>
      <div className='draft-admin-list'>
        {availableTeams.map((member) => {
          return (
            <TeamDraftForm
              key={member.id}
              team={member}
              selection={selection}
              draftManager={draftManager}
            />
          );
        })}
      </div>
    </div>
  );
}
export default DraftAdmin;
