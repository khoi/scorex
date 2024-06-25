import kdaIcon from "./assets/kda.svg";
import csIcon from "./assets/cs.svg";
import goldIcon from "./assets/gold.svg";
import heartIcon from "./assets/heart.svg";
import React from "react";

function isDead(currentHealth, maxHealth) {
  return maxHealth !== currentHealth && currentHealth <= 0;
}

function isLow(currentHealth, maxHealth) {
  return currentHealth / maxHealth < 0.5;
}

function playerClassName(currentHealth, maxHealth) {
  if (isDead(currentHealth, maxHealth)) return "dead";
  return isLow(currentHealth, maxHealth) ? "low" : "";
}

function healthColor(currentHealth, maxHealth) {
  if (isDead(currentHealth, maxHealth)) return "red";
  return isLow(currentHealth, maxHealth) ? "yellow" : "";
}

function Player({
  role,
  summonerName,
  championId,
  currentHealth,
  maxHealth,
  lvl,
  k,
  d,
  a,
  cs,
  gold,
}) {
  return (
    <div
      className={`player ${role} ${playerClassName(currentHealth, maxHealth)}`}
    >
      <div className="name">{summonerName}</div>
      <div className="portrait">
        <div className="wrapper">
          <img
            alt=""
            className="image"
            src={`https://ddragon.leagueoflegends.com/cdn/13.1.1/img/champion/${championId}.png`}
          />
        </div>
        <div className="level">{lvl}</div>
      </div>
      <div className="details">
        <div className="stat kda">
          <img alt="" src={kdaIcon} className="icon" />
          <span className="kills">{k}</span>&nbsp;/&nbsp;
          <span className="deaths">{d}</span>&nbsp;/&nbsp;
          <span className="assists">{a}</span>
        </div>
        <div className="stat cs">
          <img alt="" src={csIcon} className="icon" />
          {cs}
        </div>
        <div className="stat gold">
          <img alt="" src={goldIcon} className="icon" />
          {gold}
        </div>
        <div className="stat health">
          <img alt="" src={heartIcon} className="icon" />
          <span style={{ color: healthColor(currentHealth, maxHealth) }}>
            {currentHealth} / {maxHealth}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Player;
