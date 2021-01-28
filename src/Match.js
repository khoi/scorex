import React, { Component } from "react";
import "./Match.css";
import inhibitorIcon from "./assets/inhibitor.svg";
import baronIcon from "./assets/baron.svg";
import towerIcon from "./assets/tower.svg";
import killIcon from "./assets/kill.svg";
import Player from "./Player";

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
  return window.frames[window.frames.length - 1];
}

function getBlueTeamGoldPercentage(window) {
  return (
    getLastFrame(window).blueTeam.totalGold /
    (getLastFrame(window).blueTeam.totalGold +
      getLastFrame(window).redTeam.totalGold)
  );
}

function getRedTeamGoldPercentage(window) {
  return (
    getLastFrame(window).redTeam.totalGold /
    (getLastFrame(window).blueTeam.totalGold +
      getLastFrame(window).redTeam.totalGold)
  );
}

function getBluePlayers(window) {
  return window.gameMetadata.blueTeamMetadata.participantMetadata;
}

function getRedPlayers(window) {
  return window.gameMetadata.redTeamMetadata.participantMetadata;
}

function getBluePlayersStats(window) {
  return getLastFrame(window).blueTeam.participants;
}

function getRedPlayersStats(window) {
  return getLastFrame(window).redTeam.participants;
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

const Animatable = ({ value }) => (
  <span class="important animatable" key={value}>
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
        if (!res.esportsGameId) {
          return;
        }
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
        this.fetchWindow(+new Date() - 30 * 1000); // initial fetch
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
    console.log(this.state);

    const blueInhibitors = this.state.window
      ? getLastFrame(this.state.window).blueTeam.inhibitors
      : 0;
    const blueBarons = this.state.window
      ? getLastFrame(this.state.window).blueTeam.barons
      : 0;
    const blueTowers = this.state.window
      ? getLastFrame(this.state.window).blueTeam.towers
      : 0;
    const blueKills = this.state.window
      ? getBluePlayersStats(this.state.window).reduce(
          (acc, val) => acc + val.kills,
          0
        )
      : 0;

    const redInhibitors = this.state.window
      ? getLastFrame(this.state.window).redTeam.inhibitors
      : 0;
    const redBarons = this.state.window
      ? getLastFrame(this.state.window).redTeam.barons
      : 0;
    const redTowers = this.state.window
      ? getLastFrame(this.state.window).redTeam.towers
      : 0;
    const redKills = this.state.window
      ? getRedPlayersStats(this.state.window).reduce(
          (acc, val) => acc + val.kills,
          0
        )
      : 0;

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
                  {getLastFrame(this.state.window).blueTeam.dragons.map(
                    (d, i) => {
                      return (
                        <div key={i} className={"animatable dragon " + d} />
                      );
                    }
                  )}
                </div>
                <div className="title">DRAGONS</div>
                <div className="red-team">
                  {getLastFrame(this.state.window).redTeam.dragons.map(
                    (d, i) => {
                      return (
                        <div key={i} className={"animatable dragon " + d} />
                      );
                    }
                  )}
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
                    {getLastFrame(this.state.window).blueTeam.totalGold} (
                    {getLastFrame(this.state.window).blueTeam.totalGold -
                      getLastFrame(this.state.window).redTeam.totalGold}
                    )
                  </div>
                  <div className="title">
                    {getLastFrame(this.state.window).gameState.toUpperCase()}
                  </div>
                  <div className="red-team">
                    {getLastFrame(this.state.window).redTeam.totalGold} (
                    {getLastFrame(this.state.window).redTeam.totalGold -
                      getLastFrame(this.state.window).blueTeam.totalGold}
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
                        getBluePlayersStats(this.state.window)[i].currentHealth
                      }
                      maxHealth={
                        getBluePlayersStats(this.state.window)[i].maxHealth
                      }
                      lvl={getBluePlayersStats(this.state.window)[i].level}
                      k={getBluePlayersStats(this.state.window)[i].kills}
                      d={getBluePlayersStats(this.state.window)[i].deaths}
                      a={getBluePlayersStats(this.state.window)[i].assists}
                      cs={getBluePlayersStats(this.state.window)[i].creepScore}
                      gold={getBluePlayersStats(this.state.window)[i].totalGold}
                    />
                  );
                })}
              </div>
              <div className="gold-diffs">
                {[0, 1, 2, 3, 4].map((idx) => {
                  let blueP = getBluePlayersStats(this.state.window)[idx];
                  let redP = getRedPlayersStats(this.state.window)[idx];
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
                        getRedPlayersStats(this.state.window)[i].currentHealth
                      }
                      maxHealth={
                        getRedPlayersStats(this.state.window)[i].maxHealth
                      }
                      lvl={getRedPlayersStats(this.state.window)[i].level}
                      k={getRedPlayersStats(this.state.window)[i].kills}
                      d={getRedPlayersStats(this.state.window)[i].deaths}
                      a={getRedPlayersStats(this.state.window)[i].assists}
                      cs={getRedPlayersStats(this.state.window)[i].creepScore}
                      gold={getRedPlayersStats(this.state.window)[i].totalGold}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div>Loading</div>
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
