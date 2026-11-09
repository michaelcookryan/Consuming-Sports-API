import React, { useState, useEffect } from "react";

export default function GameStats({ showOwner, playerInfo, schedule, score }) {
  const [awayScoreTotal, setAwayScoreTotal] = useState(0);
  const [homeScoreTotal, setHomeScoreTotal] = useState(0);
  const [currentIntermission, setCurrentIntermission] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const [currentQuarterSecondsRemaining, setCurrentQuarterSecondsRemaining] =
    useState(null);

  const { awayTeam, homeTeam, playedStatus, startTime } = schedule;

  useEffect(() => {
    if (score) {
      setAwayScoreTotal();
      const {
        awayScoreTotal,
        homeScoreTotal,
        currentIntermission,
        currentQuarter,
        currentQuarterSecondsRemaining,
      } = score;

      setAwayScoreTotal(awayScoreTotal);
      setHomeScoreTotal(homeScoreTotal);
      setCurrentIntermission(currentIntermission);
      setCurrentQuarter(currentQuarter);
      setCurrentQuarterSecondsRemaining(currentQuarterSecondsRemaining);
    }
  }, [score]);

  const status = (quarter, playedState, date) => {
    let scheduledStart = "";

    if (date) {
      const dateObj = new Date(date);
      let hours = dateObj.getHours();
      let amOrPm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;

      let minutes = dateObj.getMinutes();
      minutes = minutes > 0 ? minutes : "0";
      minutes = minutes > 10 ? minutes : `0${minutes}`;

      const dateString = dateObj[Symbol.toPrimitive]("string");
      const day = dateString.slice(0, 3);
      const time = `${hours}:${minutes}${amOrPm}`;

      scheduledStart = `${day} ${time}`;
    }
    let qtr = quarter <= 4 ? `Qtr ${quarter} -` : "OT";

    let currentState = "";
    switch (playedState) {
      case "COMPLETED":
        currentState = "Final";
        break;
      case "COMPLETED_PENDING_REVIEW":
        currentState = "Final";
        break;
      case "LIVE":
        currentState = qtr;
        break;
      default:
        currentState = scheduledStart;
        break;
    }
    return currentState;
  };

  const timeRemaining = (time, playedStatus) => {
    let timeLeft = "";

    if (playedStatus === "LIVE") {
      const minutes = Math.floor(time / 60);
      let seconds = time - minutes * 60;
      if (seconds < 10) {
        if (seconds === 0) {
          seconds = "00";
        } else {
          seconds = `0${seconds}`;
        }
      }
      timeLeft = `${minutes}:${seconds}`;
    }

    return timeLeft;
  };

  const isWinner = (scoreA, scoreB, gameState) => {
    let family = "inherit";
    let bold = "Arial, sans-serif";
    const gameOver = gameState !== "LIVE";

    family = scoreA > scoreB && gameOver ? bold : family;
    let style = {
      fontFamily: family,
    };

    return style;
  };

  return (
    <div className='game'>
      <div className='game__statusDetails'>
        {!currentIntermission || currentIntermission === 4 ? (
          <div className='game__statusDetails-quater'>
            {status(currentQuarter, playedStatus, startTime)}
          </div>
        ) : (
          <div className='game__statusDetails-quater'>Halftime</div>
        )}
        {playedStatus === "LIVE" && !currentIntermission ? (
          <div className='game__statusDetails-timeRemaining'>
            {timeRemaining(currentQuarterSecondsRemaining, playedStatus)}
          </div>
        ) : null}
      </div>
      <div className='game__awayTeam'>
        {awayTeam.abbreviation.length > 0 ? (
          <>
            <div
              className='game__awayTeam-name'
              style={isWinner(awayScoreTotal, homeScoreTotal, playedStatus)}
            >
              {`${awayTeam.abbreviation}`}
              <p className='ownerName'>{`${showOwner(
                awayTeam.id,
                playerInfo.teams
              )}`}</p>
            </div>
            <div
              className='game__awayTeam-score'
              style={isWinner(awayScoreTotal, homeScoreTotal, playedStatus)}
            >
              {awayScoreTotal ? awayScoreTotal : 0}
            </div>
          </>
        ) : (
          <div className='game__awayTeam-bye-week'>
            {homeTeam.abbreviation}
            <span>{`Bye Week`}</span>
          </div>
        )}
      </div>
      {awayTeam.abbreviation.length > 0 ? (
        <div className='game__homeTeam'>
          <div
            className='game__homeTeam-name'
            style={isWinner(homeScoreTotal, awayScoreTotal, playedStatus)}
          >
            {`${homeTeam.abbreviation}`}
            <p className='ownerName'>{`${showOwner(
              homeTeam.id,
              playerInfo.teams
            )}`}</p>
          </div>
          <div
            className='game__homeTeam-score'
            style={isWinner(homeScoreTotal, awayScoreTotal, playedStatus)}
          >
            {homeScoreTotal ? homeScoreTotal : 0}
          </div>
        </div>
      ) : null}
    </div>
  );
}
