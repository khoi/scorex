import React, { Component } from "react";
import "./Match.css";
import inhibitorIcon from "./assets/inhibitor.svg";
import baronIcon from "./assets/baron.svg";
import towerIcon from "./assets/tower.svg";
import killIcon from "./assets/kill.svg";
import Player from "./Player";
import moment from "moment";

const killSound = new Audio("/sounds/kill.wav");
const towerSound = new Audio("/sounds/tower.wav");
const inhiSound = new Audio("/sounds/inhi.wav");
const baronSound = new Audio("/sounds/baron.wav");
const dragonSound = new Audio("/sounds/dragon.wav");

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

function findLastIndex(array, fn) {
  if (!array) return -1;
  // eslint-disable-next-line
  if (!fn || typeof fn !== "function") throw `${fn} is not a function`;
  return array.reduceRight((prev, currentValue, currentIndex) => {
    if (prev > -1) return prev;
    if (fn(currentValue, currentIndex)) return currentIndex;
    return -1;
  }, -1);
}

function getRoundedTimeStamp(e) {
  return Math.floor(e / 10000) * 10000;
}

function formatTimeStamp(e) {
  return new Date(getRoundedTimeStamp(e)).toISOString();
}

function getLastFrame(window) {
  if (!window) return null;
  return window.frames[window.frames.length - 1];
}

function getBlueTeamGoldPercentage(window) {
  return (
    (getLastFrame(window).blueTeam.totalGold -
      getLastFrame(window).redTeam.totalGold +
      10000) /
    20000
  );
}

function getRedTeamGoldPercentage(window) {
  return 1 - getBlueTeamGoldPercentage(window);
}

function getBluePlayers(window) {
  return window.gameMetadata.blueTeamMetadata.participantMetadata;
}

function getRedPlayers(window) {
  return window.gameMetadata.redTeamMetadata.participantMetadata;
}

function getBluePlayersStatsForFrame(frame) {
  return frame.blueTeam.participants;
}

function getRedPlayersStatsForFrame(frame) {
  return frame.redTeam.participants;
}

function blueFirstBloodFrameIdx(window) {
  return findLastIndex(window.frames, (f) => f.blueTeam.totalKills > 0);
}

function redFirstBloodFrameIdx(window) {
  return findLastIndex(window.frames, (f) => f.redTeam.totalKills > 0);
}

function isBlueFB(window) {
  return blueFirstBloodFrameIdx(window) > redFirstBloodFrameIdx(window);
}

function isRedFB(window) {
  return redFirstBloodFrameIdx(window) > blueFirstBloodFrameIdx(window);
}

function getStartTime(frames) {
  let startFrames = Object.keys(frames)
    .filter(
      (k) =>
        frames[k].redTeam.totalGold === 2500 &&
        frames[k].blueTeam.totalGold === 2500
    )
    .sort();

  if (startFrames.length === 0) {
    return null;
  }

  return frames[startFrames[0]].rfc460Timestamp;
}

function getPlayDurationString(frames) {
  let startTime = getStartTime(frames);

  if (!startTime) {
    return "Unknown";
  }

  let sortedFrameKeys = Object.keys(frames).sort();

  let playTime = 0;
  let pauseTime = 0;
  zip(sortedFrameKeys.slice(0, -1), sortedFrameKeys.slice(1)).forEach(
    ([a, b]) => {
      let duration =
        new Date(frames[b].rfc460Timestamp) -
        new Date(frames[a].rfc460Timestamp);

      if (
        frames[b].gameState === "paused" ||
        frames[a].gameState === "paused"
      ) {
        pauseTime += duration;
      }
      if (
        frames[b].gameState === "in_game" ||
        frames[a].gameState === "in_game"
      ) {
        playTime += duration;
      }
    }
  );

  let g = moment.utc(playTime).format("HH:mm:ss");
  return g;
}

const Animatable = ({ value }) => (
  <span className="important animatable" key={value}>
    {value}
  </span>
);
class Match extends Component {
  async getEventDetails(id) {
    let res = await fetch(
      `https://esports-api.lolesports.com/persisted/gw/getEventDetails?hl=en-US&id=${id}`,
      {
        headers: {
          "x-api-key": "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z",
        },
      }
    );
    return res.json();
  }

  async fetchLiveStatsWindow(id, formattedTimeStamp) {
    let res = await fetch(
      `https://feed.lolesports.com/livestats/v1/window/${id}?startingTime=${formattedTimeStamp}`
    );
    return res.json();
  }

  constructor(props) {
    super(props);
    this.state = {
      eventId: this.props.match.params.eventId,
      gameId: this.props.match.params.gameId,
      event: null,
      window: null,
    };
    this.fetchedWindowTimeStamp = [];
    this.fetchedFrames = {};
    this.prevTotalKills = 0;
    this.prevTotalTowers = 0;
    this.prevTotalBarons = 0;
    this.prevTotalInhis = 0;
    this.prevTotalDragons = 0;
    this.gameStartTime = null;
    this.lastDragonTime = null;
    this.lastBaronTime = null;
  }

  fetchEvent() {
    this.getEventDetails(this.state.eventId).then((res) => {
      if (!res.data) {
        return;
      }

      if (!this.state.gameId) {
        // no game id redirect to the most feasible game
        let possibleGames = res.data.event.match.games.filter(
          (g) => g.state !== "unneeded"
        );
        let g =
          possibleGames.find((a) => a.state === "inProgress") ||
          possibleGames[possibleGames.length - 1];
        window.location.href = `/match/${this.state.eventId}/${g.id}`;
        return;
      }

      document.title = `${res.data.event.match.teams[0].code} - ${res.data.event.match.teams[1].code}`;

      this.setState((prevState) => ({
        ...prevState,
        event: res.data.event,
      }));
    });
  }

  fetchWindow(date) {
    let roundedTimeStamp = getRoundedTimeStamp(date);
    let formattedTimeStamp = formatTimeStamp(roundedTimeStamp);

    this.fetchLiveStatsWindow(this.state.gameId, formattedTimeStamp).then(
      (res) => {
        if (!res || !res.esportsGameId) {
          return;
        }

        res.frames.forEach((f) => {
          this.fetchedFrames[f.rfc460Timestamp] = f;
        });

        this.fetchedWindowTimeStamp.push(roundedTimeStamp);

        this.setState((prevState) => ({
          ...prevState,
          window: res,
        }));
      }
    );
  }

  componentDidMount() {
    this.fetchEvent();

    this.fetchEventId = setInterval(() => {
      this.fetchEvent();
    }, 10000);

    this.fetchWindowId = setInterval(() => {
      if (this.fetchedWindowTimeStamp.length === 0) {
        this.fetchWindow(+new Date() - 50 * 1000); // initial fetch
        return;
      }

      let nextTimeStamp = this.fetchedWindowTimeStamp[
        this.fetchedWindowTimeStamp.length - 1
      ];

      this.fetchWindow(nextTimeStamp + 10 * 1000); // initial fetch
    }, 500);
  }

  componentWillUnmount() {
    clearInterval(this.fetchWindowId);
    clearInterval(this.fetchEventId);
  }

  render() {
    const lastFrame = getLastFrame(this.state.window);

    const blueInhibitors = lastFrame ? lastFrame.blueTeam.inhibitors : 0;
    const blueBarons = lastFrame ? lastFrame.blueTeam.barons : 0;
    const blueTowers = lastFrame ? lastFrame.blueTeam.towers : 0;
    const blueKills = lastFrame
      ? getBluePlayersStatsForFrame(lastFrame).reduce(
          (acc, val) => acc + val.kills,
          0
        )
      : 0;

    const redInhibitors = lastFrame ? lastFrame.redTeam.inhibitors : 0;
    const redBarons = lastFrame ? lastFrame.redTeam.barons : 0;
    const redTowers = lastFrame ? lastFrame.redTeam.towers : 0;
    const redKills = lastFrame
      ? getRedPlayersStatsForFrame(lastFrame).reduce(
          (acc, val) => acc + val.kills,
          0
        )
      : 0;

    if (lastFrame) {
      if (this.prevTotalKills < redKills + blueKills) {
        killSound.play();
        this.prevTotalKills = redKills + blueKills;
      }

      if (this.prevTotalTowers < redTowers + blueTowers) {
        towerSound.play();
        this.prevTotalTowers = redTowers + blueTowers;
      }

      if (this.prevTotalInhis < redInhibitors + blueInhibitors) {
        inhiSound.play();
        this.prevTotalInhis = redInhibitors + blueInhibitors;
      }

      if (this.prevTotalBarons < redBarons + blueBarons) {
        baronSound.play();
        this.prevTotalBarons = redBarons + blueBarons;
      }

      if (
        this.prevTotalDragons <
        lastFrame.blueTeam.dragons.length + lastFrame.redTeam.dragons.length
      ) {
        dragonSound.play();
        this.prevTotalDragons =
          lastFrame.blueTeam.dragons.length + lastFrame.redTeam.dragons.length;
      }
    }

    let header = this.state.event ? (
      <>
        <div className="overview-pane">
          <div className="event-header">
            <div className="EventMatchScore">
              <div className="match">
                <div className="teams">
                  <div className="team">
                    <div className="tricode">
                      {this.state.event.match.teams[0].name}
                    </div>
                    <div className="logo">
                      <img
                        alt=""
                        src={`https://images.weserv.nl/?url=${this.state.event.match.teams[0].image}`}
                        className="image"
                      />
                    </div>
                  </div>
                  <div className="separator">
                    {this.state.event.match.teams[0].result.gameWins} -{" "}
                    {this.state.event.match.teams[1].result.gameWins}
                  </div>
                  <div className="team">
                    <div className="tricode">
                      {this.state.event.match.teams[1].name} (
                      {this.state.event.league.name})
                    </div>
                    <div className="logo">
                      <img
                        alt=""
                        src={`https://images.weserv.nl/?url=${this.state.event.match.teams[1].image}`}
                        className="image"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="VodsGameSelector active-selection">
          <div className="games">
            <span className="label">GAME</span>
            {this.state.event.match.games
              .filter((g) => g.state !== "unneeded")
              .map((value, idx) => {
                return (
                  <a
                    key={idx}
                    href={`/match/${this.state.eventId}/${value.id}`}
                    className={
                      value.id === this.state.gameId ? "game selected" : "game"
                    }
                  >
                    {value.number}
                  </a>
                );
              })}
          </div>
        </div>
      </>
    ) : (
      <div>Loading</div>
    );

    let body =
      this.state.event && this.state.window ? (
        <>
          <div className="StatsTeams">
            <div className="StatsTeamsSummary">
              <div className="dragons">
                <div className="blue-team">
                  {lastFrame.blueTeam.dragons.map((d, i) => {
                    return <div key={i} className={"animatable dragon " + d} />;
                  })}
                </div>
                <div className="title">
                  {getPlayDurationString(this.fetchedFrames)}
                </div>
                <div className="red-team">
                  {lastFrame.redTeam.dragons.map((d, i) => {
                    return <div key={i} className={"animatable dragon " + d} />;
                  })}
                </div>
              </div>
              <div className="gold">
                <div className="bar">
                  <div
                    className="blue-team"
                    style={{
                      flex: `${getBlueTeamGoldPercentage(
                        this.state.window
                      )} 1 0%`,
                    }}
                  />
                  <div
                    className="red-team"
                    style={{
                      flex: `${getRedTeamGoldPercentage(
                        this.state.window
                      )} 1 0%`,
                    }}
                  />
                </div>
                <div className="totals">
                  <div className="blue-team">
                    {lastFrame.blueTeam.totalGold} (
                    {lastFrame.blueTeam.totalGold - lastFrame.redTeam.totalGold}
                    )
                  </div>
                  <div className="title">
                    {lastFrame.gameState.toUpperCase()}
                  </div>
                  <div className="red-team">
                    {lastFrame.redTeam.totalGold} (
                    {lastFrame.redTeam.totalGold - lastFrame.blueTeam.totalGold}
                    )
                  </div>
                </div>
              </div>
              <div className="details">
                <div className="blue-team">
                  <div className="stat inhibitors">
                    <img alt="" src={inhibitorIcon} />
                    <Animatable value={blueInhibitors} />
                  </div>
                  <div className="stat barons">
                    <img alt="" src={baronIcon} />
                    <Animatable value={blueBarons} />
                  </div>
                  <div className="stat towers">
                    <img alt="" src={towerIcon} />
                    <Animatable value={blueTowers} />
                  </div>
                  <div className="stat kills">
                    <img alt="" src={killIcon} />
                    <Animatable
                      value={`${blueKills} ${
                        isBlueFB(this.state.window) ? "F" : ""
                      }`}
                    />
                  </div>
                </div>
                <div className="red-team">
                  <div className="stat inhibitors">
                    <img alt="" src={inhibitorIcon} />
                    <Animatable value={redInhibitors} />
                  </div>
                  <div className="stat barons">
                    <img alt="" src={baronIcon} />
                    <Animatable value={redBarons} />
                  </div>
                  <div className="stat towers">
                    <img alt="" src={towerIcon} />
                    <Animatable value={redTowers} />
                  </div>
                  <div className="stat kills">
                    <img alt="" src={killIcon} />
                    <Animatable
                      value={`${redKills} ${
                        isRedFB(this.state.window) ? "F" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="StatsTeamsPlayers">
              <div className="blue-team">
                {getBluePlayers(this.state.window).map((p, i) => {
                  return (
                    <Player
                      key={i}
                      role={p.role}
                      summonerName={p.summonerName}
                      championId={p.championId}
                      currentHealth={
                        getBluePlayersStatsForFrame(lastFrame)[i].currentHealth
                      }
                      maxHealth={
                        getBluePlayersStatsForFrame(lastFrame)[i].maxHealth
                      }
                      lvl={getBluePlayersStatsForFrame(lastFrame)[i].level}
                      k={getBluePlayersStatsForFrame(lastFrame)[i].kills}
                      d={getBluePlayersStatsForFrame(lastFrame)[i].deaths}
                      a={getBluePlayersStatsForFrame(lastFrame)[i].assists}
                      cs={getBluePlayersStatsForFrame(lastFrame)[i].creepScore}
                      gold={getBluePlayersStatsForFrame(lastFrame)[i].totalGold}
                    />
                  );
                })}
              </div>
              <div className="gold-diffs">
                {[0, 1, 2, 3, 4].map((idx) => {
                  let blueP = getBluePlayersStatsForFrame(lastFrame)[idx];
                  let redP = getRedPlayersStatsForFrame(lastFrame)[idx];
                  let diff = blueP.totalGold - redP.totalGold;
                  return (
                    <div key={idx} className="wrapper">
                      <div className={"diff " + (diff > 0 ? "blue" : "red")}>
                        {Math.abs(diff)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="red-team">
                {getRedPlayers(this.state.window).map((p, i) => {
                  return (
                    <Player
                      key={i}
                      role={p.role}
                      summonerName={p.summonerName}
                      championId={p.championId}
                      currentHealth={
                        getRedPlayersStatsForFrame(lastFrame)[i].currentHealth
                      }
                      maxHealth={
                        getRedPlayersStatsForFrame(lastFrame)[i].maxHealth
                      }
                      lvl={getRedPlayersStatsForFrame(lastFrame)[i].level}
                      k={getRedPlayersStatsForFrame(lastFrame)[i].kills}
                      d={getRedPlayersStatsForFrame(lastFrame)[i].deaths}
                      a={getRedPlayersStatsForFrame(lastFrame)[i].assists}
                      cs={getRedPlayersStatsForFrame(lastFrame)[i].creepScore}
                      gold={getRedPlayersStatsForFrame(lastFrame)[i].totalGold}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div id="match_loading" style={{ fontSize: "40px" }}>
          LOADING CLICK ANYWHERE TO ENABLE SOUND
        </div>
      );

    return (
      <div className="App">
        {header}
        {body}
      </div>
    );
  }
}

export default Match;
