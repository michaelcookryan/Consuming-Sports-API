import React from "react";

function TeamDraftInput({
  team,
  selection,
  manager,
  docId,
  limitReached,
  drafted,
}) {
  return (
    <div className="team-group">
      <input
        type="radio"
        id={manager + team.id}
        name={team.id}
        value={docId}
        onChange={selection}
        disabled={limitReached}
        checked={drafted}
      />
      <label htmlFor={manager + team.id}>{manager}</label>
    </div>
  );
}
export default TeamDraftInput;
