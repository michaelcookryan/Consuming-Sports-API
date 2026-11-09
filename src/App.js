import { React, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { getStats } from "../src/api/api";
import {
  auth,
  createUserProfileDocument,
  listenToAdminUser,
} from "./firebase/firebase.utils";
import "./styles/App.scss";
import Standings from "./pages/Standings/Standings.page";
import Header from "./components/Header/Header.component";
import Footer from "./components/Footer/Footer.component";
import Draft from "./pages/Draft/Draft.page";
import SignIn from "./pages/SignIn/SignIn.page";
import { findTeam, findTeamLogo, sortStandings } from "./utils/helpersOriginal";
import { hydratePlayerDoc } from "./utils/helpers";
import { db } from "./firebase/firebase.utils";

function App() {
  const seasonStartDay = process.env.REACT_APP_SEASON_OPENS;
  const draftDay = 1757034000000;
  const oneWeek = 604800000;

  const [lastUpdatedOn, setLastUpdatedOn] = useState("");

  const [allTeams, setAllTeams] = useState([]);

  const [players, setPlayers] = useState([]);
  const [sortedList, setSortedList] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [picks, setPicks] = useState([]);

  const current = Date.now();
  const startDay = parseInt(seasonStartDay);
  const seasonInProgress = current >= startDay;

  const diff = current - startDay;
  const weeksPassed = Math.floor(diff / oneWeek);
  const weekInSeason = weeksPassed >= 1 ? weeksPassed + 1 : weeksPassed;

  // Real-time listener for player picks
  useEffect(() => {
    const unsubscribePicks = onSnapshot(
      collection(db, "players"),
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((documentSnapshot) => {
          items.push(hydratePlayerDoc(documentSnapshot));
        });
        items.sort((a, b) => {
          return parseInt(a.draftOrder) - parseInt(b.draftOrder);
        });
        setPicks(items);
      },
      (error) => {
        console.error("Error listening to picks:", error);
      },
    );

    return unsubscribePicks;
  }, []);
  // Retrieves NFL league info from API
  useEffect(() => {
    async function fetchStats() {
      const response = await getStats();
      const { teamStatsTotals, lastUpdatedOn } = response;
      setLastUpdatedOn(lastUpdatedOn);
      setAllTeams(teamStatsTotals);
    }

    fetchStats();
    // eslint-disable-next-line
  }, []);

  // Sets sorted list of teams drafted by player
  useEffect(() => {
    if (picks?.length > 0 && allTeams?.length > 0) {
      const playerList = [];

      for (const player of picks) {
        const draftedTeam = [];

        for (const team of player?.teamList) {
          draftedTeam.push(findTeam(allTeams, team, player.id));
        }
        const teamLogo = findTeamLogo(allTeams, player.mainLogo);

        playerList.push({
          id: player.id,
          logo: teamLogo,
          teams: draftedTeam,
        });
      }
      setPlayers(playerList);
      setSortedList(sortStandings(playerList));
    }

    // eslint-disable-next-line
  }, [picks, allTeams]);

  // for loging in

  useEffect(() => {
    let unsubscribeFromUser = null;

    const unsubscribeFromAuth = auth.onAuthStateChanged(async (userAuth) => {
      // Clean up any existing user listener first
      if (unsubscribeFromUser) {
        unsubscribeFromUser();
        unsubscribeFromUser = null;
      }

      if (userAuth) {
        const userRef = await createUserProfileDocument(userAuth);

        // Use the new listenToAdminUser function for onSnapshot
        unsubscribeFromUser = listenToAdminUser(userAuth.uid, (userData) => {
          if (userData) {
            setAdminUser({
              adminUser: userData,
            });
          } else {
            setAdminUser({ adminUser: userAuth });
          }
        });
      } else {
        // When userAuth is null, always set adminUser to null (user signed out)
        setAdminUser({ adminUser: null });
      }
    });

    return () => {
      // Clean up both listeners
      if (unsubscribeFromUser) {
        unsubscribeFromUser();
      }
      unsubscribeFromAuth();
    };
  }, []);

  return (
    <div className='App'>
      <Header adminUser={adminUser} />

      <Routes>
        <Route
          exact='true'
          path='/'
          element={
            <Standings
              players={players}
              sortedList={sortedList}
              seasonInProgress={seasonInProgress}
              adminUser={adminUser}
              lastUpdatedOn={lastUpdatedOn}
              teamsByOwner={picks}
              weekInSeason={weekInSeason}
            />
          }
        />
        <Route
          path='/draft'
          element={
            <Draft
              allTeams={allTeams}
              adminUser={adminUser}
              scheduled={draftDay}
            />
          }
        />
        <Route
          path='/signin'
          element={
            adminUser?.adminUser ? (
              <Navigate to='/draft' replace={true} />
            ) : (
              <SignIn />
            )
          }
        />

      </Routes>

      <Footer />
    </div>
  );
}

export default App;
