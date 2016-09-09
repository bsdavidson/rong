# RONG
## The game of Pong made in React


![Rong Screenshot](/screenshots/rong_ss.png)

[Demo](https://briand.co/rong)


All the elements are simply DOM elements that are manipulated via
event handlers and methods. Every moving element is handled through
calling React setState at roughly 60 times per second and then simply
allowing Reacts renderer to redraw.

The collision detection code came from another project of mine
[Deathbot](https://github.com/bsdavidson/deathbot5000).
This was done simply as an experiment to see if I could make a playable
game using the DOM and React.

Please don't make games this way.

## Setup

```sh
git clone https://github.com/bsdavidson/rong.git
cd rong
npm install
```

From here you can run
```sh
npm start
```
This will start a webpack-dev-server where you can play it locally.
You can also run:
```sh
npm run dist
```
This will build a static version that can be run without any dependencies.

## Tests
There are tests!
```sh
npm run test
```