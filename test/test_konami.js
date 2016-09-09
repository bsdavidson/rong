import React from "react";
import { assert } from "chai";
import { Konami, KEY_CODES, KEY_ESCAPE } from "../src/konami";
import { Game } from "../src/game";
import { mount } from "enzyme";

describe("Renders Konami Code and loads Game", () => {
  it("Renders the Click me block", () => {
    let konami = mount(<Konami />);
    assert.equal(konami.find(".instructions").text(), "Pssst... Click Me");
    assert.equal(konami.find(Game).length, 0);
  });

  it("shows code when clicked", () => {
    let konami = mount(<Konami />);
    konami.simulate("click");
    assert.equal(konami.find(".instructions").text(), "Type Me");
    assert.equal(konami.find(Game).length, 0);
  });

  it("starts game when Konami code is entered", () => {
    let konami = mount(<Konami />);
    KEY_CODES.forEach((keyCode) => {
      konami.instance().handleCodeKeyDown({
        keyCode: keyCode,
        preventDefault: () => {}
      });
    });
    assert.isTrue(konami.find("#konami").hasClass("complete"));
    assert.equal(konami.find(Game).length, 1);
  });

  it("kills game when Konami escape is pressed", () => {
    let konami = mount(<Konami />);
    KEY_CODES.forEach((keyCode) => {
      konami.instance().handleCodeKeyDown({
        keyCode: keyCode,
        preventDefault: () => {}
      });
    });
    assert.isTrue(konami.find("#konami").hasClass("complete"));
    assert.equal(konami.find(Game).length, 1);
    konami.instance().handleCodeKeyDown({
      keyCode: KEY_ESCAPE,
      preventDefault: () => {}
    });
    assert.equal(konami.find(Game).length, 0);
  });
});
