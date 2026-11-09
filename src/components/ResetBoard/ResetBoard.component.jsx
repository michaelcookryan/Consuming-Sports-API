import React from "react";
import CustomButton from "../CustomButton/CustomButton.component";
import { db } from "../../firebase/firebase.utils";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

function ResetBoard() {
  async function setPlayersToDefault() {
    try {
      const playersCollection = collection(db, "players");
      const querySnapshot = await getDocs(playersCollection);

      const updatePromises = querySnapshot.docs.map((document) => {
        const docRef = doc(db, "players", document.id);
        return updateDoc(docRef, {
          teamList: [],
          limitReached: false,
        });
      });

      await Promise.all(updatePromises);
      console.log("Players reset to default successfully");
    } catch (error) {
      console.error("Error resetting players:", error);
    }
  }

  async function setTeamsToDefault() {
    try {
      const teamsCollection = collection(db, "teams");
      const querySnapshot = await getDocs(teamsCollection);

      const updatePromises = querySnapshot.docs.map((document) => {
        const docRef = doc(db, "teams", document.id);
        return updateDoc(docRef, {
          available: true,
        });
      });

      await Promise.all(updatePromises);
      console.log("Teams reset to default successfully");
    } catch (error) {
      console.error("Error resetting teams:", error);
    }
  }

  async function resetDefaultDraftSettings() {
    const clearLists = window.confirm(
      "You are about to reset the lists. Are you sure?"
    );
    const resetingBoardToDefault = clearLists ? true : false;

    if (resetingBoardToDefault) {
      await setPlayersToDefault();
      await setTeamsToDefault();
    }
  }

  return (
    <div className='draft-reset'>
      <h3>Clear Team Lists</h3>

      <CustomButton type='submit' onClick={() => resetDefaultDraftSettings({})}>
        Reset Board
      </CustomButton>
      <p>
        This should only be used at the very begining of draft to clear last
        year's settings.
      </p>
    </div>
  );
}
export default ResetBoard;
