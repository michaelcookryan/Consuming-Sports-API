import React, { useEffect, useState } from "react";
import { getSchedules } from "../../api/api.js";
import Player from "../../components/Player/Player.component";
import Modal from "../../components/Modal/Modal.component";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner.component.jsx";

function Standings({
  players,
  sortedList,
  seasonInProgress,
  adminUser,
  lastUpdatedOn,
  teamsByOwner,
  weekInSeason,
}) {
  const updated = new Date(lastUpdatedOn).toLocaleString();
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState("");
  const [playerInfo, setPlayerInfo] = useState({});
  const [seasonGames, setSeasonGames] = useState([]);

  const getPlayerInfo = (players, id) => {
    const openPlayer = players.find((player) => player.id === id);
    setPlayerInfo(openPlayer);
  };

  const toggleModal = (e) => {
    const name = e.currentTarget.id;
    e.preventDefault();

    if (isOpen) {
      setPlayerOpen("");
      setIsOpen(false);
      setPlayerInfo({});
    } else {
      setPlayerOpen(name);
      setIsOpen(true);
      getPlayerInfo(sortedList, name);
    }
  };

  // load schedule on first load
  useEffect(() => {
    async function fetchGames() {
      const response = await getSchedules(weekInSeason);
      setSeasonGames(response);
    }

    fetchGames();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (sortedList.length > 0) {
      setLoading(false);
    }
  }, [sortedList]);

  return (
    <div className='standings'>
      {sortedList.length > 0 && (
        <div className='overall-section'>
          {seasonInProgress ? (
            <h3 className='overall-title'>
              Standings last updated at {updated}
            </h3>
          ) : (
            <h3 className='overall-title'>Upcoming Draft Order</h3>
          )}
          {/* <h3 className='overall-title'>Final Standings for 2023</h3> */}
        </div>
      )}

      <section>
        {loading ? (
          <div className='loader-height'>
            <LoadingSpinner />
          </div>
        ) : (
          <div className='players-team-records'>
            {sortedList.map((player, index) => {
              return (
                <div
                  id={player.id}
                  key={player.id}
                  className='players-team-records__player-group'
                >
                  <Player
                    name={player.id}
                    position={index}
                    allTeams={player.teams}
                    logo={player.logo}
                    key={player.id}
                    toggleModal={toggleModal}
                  />
                </div>
              );
            })}
          </div>
        )}
        {isOpen && (
          <Modal
            seasonGames={seasonGames}
            teamsByOwner={teamsByOwner}
            toggleModal={toggleModal}
            playerToView={playerOpen}
            playerInfo={playerInfo}
            weekInSeason={weekInSeason}
          />
        )}
      </section>
    </div>
  );
}
export default Standings;
