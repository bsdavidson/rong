import React from "react";
import { assert } from "chai";
import { Game, KEY_LEFT, KEY_RIGHT } from "../src/game";
import { mount, shallow } from "enzyme";

describe("<Game />", () => {
  it("renders the game", () => {
    let wrapper = shallow(<Game />);
    assert.equal(wrapper.find("#arena").length, 1);
    assert.equal(wrapper.find("h1").text(), "Rong");
    assert.equal(wrapper.find("h2").text(), "Arrows to move Paddle Click to Play");
  });

  it("starts game when marquee is clicked", () => {
    let wrapper = shallow(<Game />);
    let marquee = wrapper.find("#marquee");
    assert.equal(marquee.text(), "RongArrows to move Paddle Click to Play");
    marquee.simulate("click");
    marquee = wrapper.find("#marquee");
    assert.equal(marquee.length, 0);
    let state = wrapper.instance().state;
    assert.equal(state.gameState, "play");
    assert.equal(state.lives, 3);
    assert.equal(state.score, 0);
  });

  it("increments score when ball passes top of screen", () => {
    let wrapper = mount(<Game />);
    let game = wrapper.instance();
    wrapper.find("#marquee").simulate("click");
    assert.equal(game.state.score, 0);
    game.state.ball.y = -1000;
    game.handleFrame();
    assert.equal(game.state.score, 1);
    assert.equal(game.state.ball.y, 200);
  });

  it("decrements lives when ball passes bottom of screen", () => {
    let wrapper = mount(<Game />);
    let game = wrapper.instance();
    wrapper.find("#marquee").simulate("click");
    assert.equal(game.state.lives, 3);
    for (let expectedLives = 2; expectedLives >= 0; expectedLives--) {
      game.state.ball.y = 9001;
      game.handleFrame();
      assert.equal(game.state.lives, expectedLives);
      assert.equal(game.state.ball.y, 200);
      game.ballPauseTimer = 0;
    }
    assert.equal(game.state.gameState, "dead");
    assert.equal(wrapper.find("#marquee h1").text(), "Game Over");
  });

  it("moves paddle when arrows are pressed", () => {
    let wrapper = mount(<Game />);
    let game = wrapper.instance();
    let movePaddle = (key) => {
      game.handleKeyDown({
        preventDefault: () => {},
        keyCode: key
      });
      for (let i = 0; i < 2; i++) {
        game.handleFrame();
      }
      game.handleKeyUp({
        preventDefault: () => {},
        keyCode: key
      });
    };

    wrapper.find("#marquee").simulate("click");
    let x = game.state.paddle2.x;
    movePaddle(KEY_LEFT);
    assert.isBelow(game.state.paddle2.x, x);
    assert.notEqual(game.state.paddle2.x, 0);
    let newX = game.state.paddle2.x;
    // Advance 2 frames to test if paddle has stopped moving
    for (let i = 0; i < 2; i++) {
      game.handleFrame();
    }
    assert.equal(game.state.paddle2.x, newX);
    movePaddle(KEY_RIGHT);
    assert.isAbove(game.state.paddle2.x, newX);
  });

  it("ball bounces when hitting wall", () => {
    let wrapper = mount(<Game />);
    let game = wrapper.instance();
    wrapper.find("#marquee").simulate("click");
    let ballX = game.state.ball.x = game.rightEdge.x - game.state.ball.w - 5;
    let ballY = game.state.ball.y = game.rightEdge.h / 2;
    game.ballDirX = 1;
    game.ballDirY = -1;
    for (let i = 0; i < 10; i++) {
      game.handleFrame();
    }
    assert.isBelow(game.state.ball.x, ballX);
    assert.isBelow(game.state.ball.y, ballY);
    assert.equal(game.ballDirX, -1);
    assert.equal(game.ballDirY, -1);
  });
});
