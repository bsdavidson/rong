"use strict";
import React from "react";
import { Game } from "./game";

export const KEY_ESCAPE = 27;
export const KEY_CODES = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65, 13];

export let Konami = React.createClass({
  componentDidMount: function () {
    window.addEventListener("keydown", this.handleCodeKeyDown);
  },
  componentWillUnmount: function () {
    window.removeEventListener("keydown", this.handleCodeKeyDown);
  },

  getInitialState: function () {
    return {
      wantedKeys: KEY_CODES,
      wantedKeyCount: 0,
      clicked: false
    };
  },

  handleClick: function () {
    this.setState({
      clicked: true
    });
  },

  handleCodeKeyDown: function (event) {
    if (event.keyCode === KEY_ESCAPE) {
      event.preventDefault();
      this.setState(this.getInitialState());
      return;
    }
    if (this.state.wantedKeys.length === 0) {
      return;
    }
    let wantedKey = this.state.wantedKeys[0];
    if (event.keyCode === wantedKey) {
      event.preventDefault();
      this.setState({
        wantedKeyCount: this.state.wantedKeyCount + 1,
        wantedKeys: this.state.wantedKeys.slice(1)
      });
    }
  },

  render: function () {
    let className;
    let game;
    if (this.state.wantedKeys.length === 0) {
      className = "clicked complete";
      game = <Game />;
    } else if (this.state.clicked) {
      className = `clicked key-${this.state.wantedKeyCount}`;
    }
    return <div id="konami" onClick={this.handleClick} className={className}>
      <div className="instructions" id="instructions">{this.state.clicked ? "Type Me" : "Pssst... Click Me"}</div>
      <div id="arrows">
        <span className="arrow" id="key-1">G</span>
        <span className="arrow" id="key-2">G</span>
        <span className="arrow" id="key-3">g</span>
        <span className="arrow" id="key-4">g</span>
        <span className="arrow" id="key-5">F</span>
        <span className="arrow" id="key-6">f</span>
        <span className="arrow" id="key-7">F</span>
        <span className="arrow" id="key-8">f</span>
        <span id="key-9">B</span>
        <span id="key-10">A</span>
        <span id="key-11">↵</span>
      </div>
      <div id="reactive-pong">
        {game}
      </div>

    </div>;
  }
});
