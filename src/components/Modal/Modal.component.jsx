import React, { useState, useEffect } from "react";
import { getWeeklySchedules } from "../../api/api.js";
import GameStats from "../GameStats/GameStats.component.jsx";
import FutureGames from "../FutureGames/FutureGames.component.jsx";
import CustomButton from "../CustomButton/CustomButton.component.jsx";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.component.jsx";

const Modal = ({
  seasonGames,
  teamsByOwner,
  toggleModal,
  playerToView,
  playerInfo,
  weekInSeason,
}) => {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [gamesThisWeek, setGamesThisWeek] = useState([]);
  const [playerTeamGamesThisWeek, setPlayerTeamGamesThisWeek] = useState([]);
  const [playerTeamGamesNextWeek, setPlayerTeamGamesNextWeek] = useState([]);
  const [playerTeamGamesWeekAfter, setPlayerTeamGamesWeekAfter] = useState([]);
  const [gamesNextWeek, setGamesNextWeek] = useState([]);
  const [gamesWeekAfter, setGamesWeekAfter] = useState([]);

  const currentSeasonWeek = weekInSeason > 18 ? 18 : weekInSeason;
  const nextWeekInSeason = weekInSeason + 1 <= 18 ? weekInSeason + 1 : null;
  const weekAfterNextInSeason =
    weekInSeason + 2 <= 18 ? weekInSeason + 2 : null;

  const weekTitle =
    currentSeasonWeek > 17
      ? "Final Week (18)"
      : `Current Week ${currentSeasonWeek}`;
  // return all games for a particular week number
  const getWeeksGames = (schedule, week) => {
    const gamesForWeek = schedule.filter((game) => game.schedule.week === week);

    return gamesForWeek;
  };

  // Find games for the player's teams
  // If no game scheduled, then object is add to present as a Bye Week
  const getPlayerTeamsGames = (schedule, teams) => {
    const allPlayersTeamsGames = [];

    teams.map((team) => {
      let playersGame = schedule.find(
        (game) =>
          team.id === game.schedule.homeTeam.id ||
          team.id === game.schedule.awayTeam.id,
      );

      // show as bye week for current team
      if (!playersGame) {
        playersGame = {
          schedule: {
            awayTeam: {
              abbreviation: "",
            },
            homeTeam: {
              abbreviation: team.abbreviation,
            },
          },
        };
      }

      return allPlayersTeamsGames.push(playersGame);
    });

    const cleanDuplicates = new Set(allPlayersTeamsGames);
    const hasDuplicateGames = [...cleanDuplicates];
    const totalGames =
      allPlayersTeamsGames.length !== hasDuplicateGames
        ? hasDuplicateGames
        : allPlayersTeamsGames;
    return totalGames;
  };

  // find who owns team
  const findOwner = (teamId) => {
    let owner = teamsByOwner.find((team) => team?.teamList.includes(teamId));
    return owner?.id ? `(${owner.id})` : "";
  };

  // show owner's name
  const showOwner = (teamId, playerTeams) => {
    const teams = new Set();
    playerTeams.map((team) => {
      return teams.add(team.id);
    });

    return teams.has(teamId) ? "" : findOwner(teamId);
  };

  // load schedule on first load
  useEffect(() => {
    async function fetchGames() {
      const response = await getWeeklySchedules(currentSeasonWeek);
      setGames(response);
    }

    fetchGames();
    // eslint-disable-next-line
  }, []);

  // only get this week's games
  useEffect(() => {
    if (currentSeasonWeek > 0 && currentSeasonWeek <= 18) {
      const gamesForTheWeek = getWeeksGames(games, currentSeasonWeek);
      const gamesForNextWeek = getWeeksGames(seasonGames, nextWeekInSeason);
      const gamesForTheWeekAfter = getWeeksGames(
        seasonGames,
        weekAfterNextInSeason,
      );

      setGamesThisWeek(gamesForTheWeek);
      setGamesNextWeek(gamesForNextWeek);
      setGamesWeekAfter(gamesForTheWeekAfter);
    }
  }, [
    games,
    seasonGames,
    currentSeasonWeek,
    nextWeekInSeason,
    weekAfterNextInSeason,
  ]);

  // get all the games for the selected player's teams
  useEffect(() => {
    if (gamesThisWeek.length > 0 && playerInfo) {
      setPlayerTeamGamesThisWeek(
        getPlayerTeamsGames(gamesThisWeek, playerInfo.teams),
      );
      setPlayerTeamGamesNextWeek(
        getPlayerTeamsGames(gamesNextWeek, playerInfo.teams),
      );
      setPlayerTeamGamesWeekAfter(
        getPlayerTeamsGames(gamesWeekAfter, playerInfo.teams),
      );
    }
  }, [playerInfo, gamesThisWeek, gamesNextWeek, gamesWeekAfter]);

  useEffect(() => {
    if (playerTeamGamesThisWeek.length > 0) {
      setLoading(false);
    }
  }, [playerTeamGamesThisWeek]);

  return (
    <div className='modal'>
      <div className='modal__container'>
        <div className='modal__header' id={playerToView}>
          <h3>{`${playerToView}'s Match-Ups`}</h3>
          <CustomButton onClick={toggleModal}>Close</CustomButton>
        </div>
        <div className='modal__body'>
          <h4>{weekTitle}</h4>
          <hr />
          {loading ? (
            <div className='spinner-container'>
              <LoadingSpinner />
            </div>
          ) : (
            <div className='current-week-grid'>
              {playerTeamGamesThisWeek.map((game, index) => {
                return (
                  <GameStats
                    key={index}
                    index={index}
                    showOwner={showOwner}
                    playerInfo={playerInfo}
                    schedule={game.schedule}
                    score={game?.score}
                  />
                );
              })}
            </div>
          )}
        </div>
        <div className={`modal__footer ${playerToView}`}>
          {nextWeekInSeason && (
            <>
              <h4>Next Week</h4>
              <hr />
              <div className='next-week-grid'>
                {playerTeamGamesNextWeek.map((game, index) => {
                  return (
                    <FutureGames
                      key={index}
                      index={index}
                      showOwner={showOwner}
                      playerInfo={playerInfo}
                      schedule={game.schedule}
                      score={game.score}
                    />
                  );
                })}
              </div>
            </>
          )}
          {weekAfterNextInSeason && (
            <>
              <h4>In Two Weeks</h4>
              <hr />
              <div className='next-week-grid'>
                {playerTeamGamesWeekAfter.map((game, index) => {
                  return (
                    <FutureGames
                      key={index}
                      index={index}
                      showOwner={showOwner}
                      playerInfo={playerInfo}
                      schedule={game.schedule}
                      score={game.score}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
