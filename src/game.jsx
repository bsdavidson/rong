/* globals ga: false */
import React from "react";
import { Box, Physics, Point, EPSILON } from "./physics";

require("../style.scss");

let physics = new Physics();

export const KEY_LEFT = 37;
export const KEY_RIGHT = 39;
const PADDLE_SPEED = 150;
const BALL_SPEED = 200;

export let Game = React.createClass({
  leftEdge: new Box(-10, 0, 10, 400),
  rightEdge: new Box(240, 0, 10, 400),
  ballPauseTimer: 0,
  ballSpeedX: 1,
  ballSpeedY: 1,
  frameTime: 1 / 60,
  componentDidMount: function () {
    if (typeof ga !== "undefined") {
      ga("send", {
        hitType: "event",
        eventCategory: "Game",
        eventAction: "play",
        eventLabel: "Contra"
      });
    }
    this.dirX = 1;
    this.ballDirX = 1;
    this.ballDirY = -1;
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.handleFrame();
  },

  componentWillUnmount: function () {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    cancelAnimationFrame(this.requestId);
  },

  getInitialState: function () {
    return {
      gameState: "init", // "init, play, dead"
      score: 0,
      lives: 3,
      paddle1: new Box(10, 10, 60, 10),
      paddle2: new Box(90, 380, 60, 10),
      ball: new Box(120, 200, 10, 10)
    };
  },

  updateComputerPaddle: function (paddle, ball) {
    if (this.ballPauseTimer === 0) {
      if (paddle.x + (paddle.w / 2) < ball.x) {
        this.dirX = 1;
      } else {
        this.dirX = -1;
      }
    }

    let x = paddle.x + this.dirX * PADDLE_SPEED * this.frameTime;

    // Prevent from moving past the edges.
    if (x < (this.leftEdge.x + this.leftEdge.w)) {
      x = this.leftEdge.x + this.leftEdge.w;
    }
    if (x + paddle.w > this.rightEdge.x) {
      x = this.rightEdge.x - paddle.w;
    }

    let delta = new Point(x - paddle.x, 0);
    let result = physics.sweepBoxIntoBoxes(paddle, delta, [ball]);
    paddle.x = x;

    if (result.hit) {
      // Because the Paddle only move horizontally, it isn't possible for a paddle
      // to cause a vertical collision. In the event that the paddle hits the ball
      // our hitNormal.x will always have a value of -1 or 1.
      this.ballDirY = 1;
      if (result.hitNormal.x > 0) {
        // The paddles left side hit the ball
        ball.x = paddle.x - ball.w - EPSILON;
        if (ball.x < this.leftEdge.x + this.leftEdge.w) {
          ball.x = this.leftEdge.x + this.leftEdge.w + EPSILON;
          ball.y = paddle.y + paddle.h + EPSILON;
        }
      } else {
        ball.x = paddle.x + paddle.w + EPSILON;
        if (ball.x + ball.w > this.rightEdge.x) {
          ball.x = this.rightEdge.x - ball.w - EPSILON;
          ball.y = paddle.y + paddle.h + EPSILON;
        }
      }
    } else {
      paddle.x = result.hitPos.x - (paddle.w / 2);
    }
  },

  updatePlayerPaddle: function (paddle, ball) {
    let x = paddle.x;
    if (this.keyRightDown) {
      x += PADDLE_SPEED * this.frameTime;
    }
    if (this.keyLeftDown) {
      x -= PADDLE_SPEED * this.frameTime;
    }
    if (x < (this.leftEdge.x + this.leftEdge.w)) {
      x = this.leftEdge.x + this.leftEdge.w;
    }
    if (x + paddle.w > this.rightEdge.x) {
      x = this.rightEdge.x - paddle.w;
    }

    let delta = new Point(x - paddle.x, 0);
    let result = physics.sweepBoxIntoBoxes(paddle, delta, [ball]);
    paddle.x = x;

    if (result.hit) {
      // Because the Paddle only move horizontally, it isn't possible for a paddle
      // to cause a vertical collision. In the event that the paddle hits the ball
      // our hitNormal.x will always have a value of -1 or 1.
      this.ballDirY = -1;
      if (result.hitNormal.x > 0) {
        // The paddles left side hit the ball
        ball.x = paddle.x - ball.w - EPSILON;
        if (ball.x < this.leftEdge.x + this.leftEdge.w) {
          ball.x = this.leftEdge.x + this.leftEdge.w + EPSILON;
          ball.y = paddle.y - ball.h - EPSILON;
        }
      } else {
        ball.x = paddle.x + paddle.w + EPSILON;
        if (ball.x + ball.w > this.rightEdge.x) {
          ball.x = this.rightEdge.x - ball.w - EPSILON;
          ball.y = paddle.y - ball.h - EPSILON;
        }
      }
    } else {
      paddle.x = result.hitPos.x - (paddle.w / 2);
    }
  },

  resetBall: function (ball, ballDirY) {
    ball.y = 200;
    ball.x = 110;
    this.ballDirY = ballDirY;
    this.ballDirX = Math.random() > 0.5 ? 1 : -1;
    this.ballPauseTimer = 100;
    this.ballSpeedX = 1;
    this.setState({
        ball: new Box(120, 200, 10, 10)
      });
  },

  updateBall: function (ball) {
    let delta = new Point(this.ballDirX * (BALL_SPEED * this.ballSpeedX) * this.frameTime,
      this.ballDirY * (BALL_SPEED * this.ballSpeedY) * this.frameTime);
    let result = physics.sweepBoxIntoBoxes(ball, delta, [
      this.state.paddle1,
      this.state.paddle2,
      this.leftEdge,
      this.rightEdge
    ]);
    ball.x = result.hitPos.x - (ball.w / 2);
    ball.y = result.hitPos.y - (ball.h / 2);
    if (result.hit) {
      if (result.hitNormal.x) {
        this.ballDirX *= -1;
      } else {
        this.ballDirY *= -1;
        let paddleHitPercent = (result.hitPos.x - result.hitBox.x) / result.hitBox.w;
        let speedModifier = ((paddleHitPercent * 2) -1) * 0.4;

        // Make it work in the direction of ball travel
        this.ballSpeedX += speedModifier * this.ballDirX;
      }
    }

    // reset ball if it passes top or bottom of play field
    if (ball.y < 0) {
      this.resetBall(ball, 1);
      this.setState({
        score: this.state.score + 1
      });
    }
    if (ball.y > 390) {
      this.resetBall(ball, -1);
      let state = {lives: this.state.lives -  1}
      if (state.lives <= 0) {
        state.gameState = "dead";
      }
      this.setState(state);
    }
  },

  handleFrame: function (timestamp) {
    // console.log(this.frameTime, timestamp, this.lastTimeStamp);

    if (this.lastTimeStamp) {
      this.frameTime = (timestamp - this.lastTimeStamp) / 1000;
      this.lastTimeStamp = timestamp;
    } else {
      this.lastTimeStamp = timestamp;
      this.frameTime = 1 / 60;
    }

    this.requestId = requestAnimationFrame(this.handleFrame);
    if (this.state.gameState !== "play") {
      return;
    }
    let paddle1 = this.state.paddle1.copy();
    let paddle2 = this.state.paddle2.copy();
    let ball = this.state.ball.copy();
    this.updateComputerPaddle(paddle1, ball);
    this.updatePlayerPaddle(paddle2, ball);
    if (this.ballPauseTimer === 0) {
      this.updateBall(ball);
    } else {
      this.ballPauseTimer -= 1;
    }
    this.setState({
      paddle1: paddle1,
      paddle2: paddle2,
      ball: ball
    });

  },

  handleStartClick: function () {
    this.setState({
      gameState: "play"
    });
    this.handleFrame();
  },

  handleRestartClick: function () {
    let state = this.getInitialState();
    state.gameState = "play";
    this.setState(state);
    this.handleFrame();
  },

  handleKeyDown: function (event) {
    switch (event.keyCode) {
    case KEY_LEFT:
      this.keyLeftDown = true;
      break;
    case KEY_RIGHT:
      this.keyRightDown = true;
      break;
    default:
      return;
    }
    event.preventDefault();
  },

  handleKeyUp: function (event) {
    switch (event.keyCode) {
    case KEY_LEFT:
      this.keyLeftDown = false;

      break;
    case KEY_RIGHT:
      this.keyRightDown = false;
      break;
    default:
      return;
    }
    event.preventDefault();
  },

  render: function () {
    let paddleStyle1 = {
      left: `${this.state.paddle1.x}px`,
      top: `${this.state.paddle1.y}px`,
      width: `${this.state.paddle1.w}px`,
      height: `${this.state.paddle1.h}px`
    };
    let paddleStyle2 = {
      left: `${this.state.paddle2.x}px`,
      top: `${this.state.paddle2.y}px`,
      width: `${this.state.paddle2.w}px`,
      height: `${this.state.paddle2.h}px`
    };
    var bx = this.state.ball.x;
    var by = this.state.ball.y;
    if (this.round) {
      bx = Math.round(bx);
      by = Math.round(by);
    }
    let ballStyle = {
      left: `${bx}px`,
      top: `${by}px`,
      width: `${this.state.ball.w}px`,
      height: `${this.state.ball.h}px`
    };
    let marquee;
    if (this.state.gameState == "init") {
      marquee = <div id="marquee" onClick={this.handleStartClick}>
        <h1>Rong</h1>
        <h2>Arrows to move Paddle <br />Click to Play</h2>
      </div>;
    } else if (this.state.gameState === "dead") {
      if (typeof ga !== "undefined") {
        ga("send", {
          hitType: "event",
          eventCategory: "Game",
          eventAction: "GameOver",
          eventLabel: "Score:" + this.state.score
        });
      }
      marquee = <div id="marquee" onClick={this.handleRestartClick}>
        <h1>Game Over</h1>
        <h2>Thank you For Playing! <br /> Click to Play</h2>
      </div>;
    }

    return <div className="game" id="game">
      <div id="lives">Lives: {this.state.lives}</div>
      <div id="score">Score: {this.state.score}</div>
      <div id="arena">
        <div className="paddle" id="paddle1" style={paddleStyle1} />
        <div className="paddle" id="paddle2" style={paddleStyle2} />
        <div id="ball" style={ballStyle} />
        {marquee}
      </div>
       <div id="ghpong">
          <p>
            <a href="https://briand.co/rong/" title="more info">What's up with this?</a>
          </p>
        </div>
    </div>;
  }
});
