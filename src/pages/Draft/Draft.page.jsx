import { React, useState, useEffect } from "react";
import DraftAdmin from "../../components/DraftAdmin/DraftAdmin.component";
import DraftView from "../../components/DraftView/DraftView.component";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner.component";
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/firebase.utils";
import { hydratePlayerDoc, hydrateTeamDoc } from "../../utils/helpers";

function Draft({ adminUser, allTeams, scheduled, dayOfDraft }) {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const draftDay = new Date(scheduled);
  const currentDay = new Date().getTime(); //current time in milliseconds
  const draftDayCompleted = currentDay > scheduled;

  const month = draftDay.toLocaleString("en-US", { month: "long" });
  const day = draftDay.toLocaleString("en-US", { day: "numeric" });
  const year = draftDay.toLocaleString("en-US", { year: "numeric" });

  const fullDate = `${month} ${day}, ${year}`;

  // Real-time listener for players
  useEffect(() => {
    setLoading(true);
    const unsubscribePlayers = onSnapshot(
      collection(db, "players"),
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((documentSnapshot) => {
          items.push(hydratePlayerDoc(documentSnapshot));
        });
        items.sort((a, b) => {
          return parseInt(a.draftOrder) - parseInt(b.draftOrder);
        });
        setPlayers(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to players:", error);
        setLoading(false);
      },
    );

    return unsubscribePlayers;
  }, []);

  // Real-time listener for teams
  useEffect(() => {
    const unsubscribeTeams = onSnapshot(
      collection(db, "teams"),
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((documentSnapshot) => {
          items.push(hydrateTeamDoc(documentSnapshot));
        });
        items.sort((a, b) => {
          return parseInt(a.draftOrder) - parseInt(b.draftOrder);
        });
        setTeams(items);
      },
      (error) => {
        console.error("Error listening to teams:", error);
      },
    );

    return unsubscribeTeams;
  }, []);

  useEffect(() => {
    if (teams.length > 0) {
      setLoading(false);
    }
  }, [teams]);

  async function recordTeamSelection(event) {
    const { name, value } = event.target;

    const addToPlayerTeamList = doc(db, "players", value);
    const teamsCollection = collection(db, "teams");
    const teamNoLongerAvailable = query(
      teamsCollection,
      where("id", "==", parseInt(name)),
    );

    // Find team selected and make unavailable
    // Change property 'available' to false and update document
    let teamSelected;

    try {
      const teamQuerySnapshot = await getDocs(teamNoLongerAvailable);
      teamQuerySnapshot.forEach((docSnapshot) => {
        teamSelected = docSnapshot.id;
      });

      if (teamSelected) {
        const teamDocRef = doc(db, "teams", teamSelected);
        await updateDoc(teamDocRef, {
          available: false,
        });
      }
    } catch (error) {
      console.log("Error getting doc: ", error);
    }

    // Used for swapping of team selections
    // Check if team id is already present in any other player teamList
    // Remove if detected, and reset limitReached to false in case player had reached limit
    const playersCollection = collection(db, "players");
    const removeFromQuery = query(
      playersCollection,
      where("teamList", "array-contains", parseInt(name)),
    );
    const removeFromDoc = await getDocs(removeFromQuery);

    const removePromises = removeFromDoc.docs.map(async (docSnapshot) => {
      const playerDocRef = doc(db, "players", docSnapshot.id);
      await updateDoc(playerDocRef, {
        teamList: arrayRemove(parseInt(name)),
        limitReached: false,
      });
    });

    await Promise.all(removePromises);

    // For adding team selection to player teamList
    // Get current length of teamList array to use for validation if player has not maxed-out at 4 teams selected already
    // If maxed - do nothing
    // If this selection is the fourth and final selection, add to teamList then change limitReached property to true
    // If this is pick 1-3 then simply add to teamList
    try {
      const playerDoc = await getDoc(addToPlayerTeamList);
      const playerAddingDetails = playerDoc.data();
      const lengthOfArray = playerAddingDetails.teamList.length;

      if (lengthOfArray > 3) {
        return;
      } else if (lengthOfArray > 2) {
        await updateDoc(addToPlayerTeamList, {
          teamList: arrayUnion(parseInt(name)),
          limitReached: true,
        });
      } else {
        await updateDoc(addToPlayerTeamList, {
          teamList: arrayUnion(parseInt(name)),
        });
      }
    } catch (error) {
      console.log("Error getting doc: ", error);
    }

    // No need to manually refresh data - real-time listeners handle this automatically
  }

  return (
    <div className='draft-page'>
      <section>
        {draftDayCompleted ? (
          <h1>Draft Results {year}</h1>
        ) : (
          <h1>Draft Day is {fullDate}</h1>
        )}

        {adminUser?.adminUser ? (
          <DraftAdmin
            displayTeams={allTeams}
            selection={recordTeamSelection}
            draftManager={players}
            availableTeams={teams}
          />
        ) : null}
        {loading ? (
          <div className='loader-height'>
            <LoadingSpinner />
          </div>
        ) : (
          <DraftView
            availableTeams={teams}
            players={players}
            allTeams={allTeams}
          />
        )}
      </section>
    </div>
  );
}
export default Draft;
