import React from "react";
import ReactDOM from "react-dom";
import { Konami } from "./konami";
import { Game } from "./game";

let target = document.getElementById("react-pong");

if (target.dataset.konami === "true") {
  ReactDOM.render(<Konami />, target);
} else {
  ReactDOM.render(<Game />, target);
}
