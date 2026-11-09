import React from "react";
import CustomButton from "../CustomButton/CustomButton.component";
import { v4 as uuidv4 } from "uuid";
import firebase from "../../firebase/firebase.utils";

function LoadTeams({ displayTeams }) {
  const refTeams = firebase.firestore().collection("teams");

  // Only used once per year at begining of draft to make sure all id's and teams are up to date with what is provided by api
  // *** COLLECTION MUST BE REMOVED INSIDE DB DASHBOARD FIRST BEFORE RUNNING ***
  // Note: if process fails, try removing 'return' statement before the refTeams.doc().set()
  function loadAllTeamsToDataBase(arr) {
    arr.map(async (team) => {
      console.log(`team being written: ${team.team.name}`);
      let docId = uuidv4();
      let id = team.team.id;
      let abbreviation = team.team.abbreviation;
      let city = team.team.city;
      let name = team.team.name;
      let logoImageSrc = team.team.officialLogoImageSrc;

      return refTeams
        .doc(docId)
        .set({
          docId: docId,
          id: id,
          abbreviation: abbreviation,
          city: city,
          name: name,
          logoImageSrc: logoImageSrc,
          available: true,
        })
        .then(() => {
          console.log("Doc successfully written");
        })
        .catch((error) => {
          console.error("Error writing doc: ", error);
        });
    });
  }

  return (
    <CustomButton
      type="submit"
      disabled
      onClick={() => loadAllTeamsToDataBase(displayTeams)}
    >
      Load Teams for the Year
    </CustomButton>
  );
}
export default LoadTeams;
