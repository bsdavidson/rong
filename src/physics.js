"use strict";

export class Box {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  copy() {
    return new Box(this.x, this.y, this.w, this.h);
  }

  inflate(paddingX, paddingY) {
    return new Box(
      this.x - paddingX / 2,
      this.y - paddingY / 2,
      this.w + paddingX,
      this.h + paddingY);
  }
}

export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export const EPSILON = 1 / 32;

export class Physics {
  intersectSegmentIntoBox(segmentPos, segmentDelta, paddedBox) {
    // drawBox(paddedBox.x, paddedBox.y, paddedBox.w, paddedBox.h, 'gray');
    let nearXPercent, farXPercent;
    if (segmentDelta.x >= 0) {
      // going left to right
      nearXPercent = (paddedBox.x - segmentPos.x) / segmentDelta.x;
      farXPercent = ((paddedBox.x + paddedBox.w) -
        segmentPos.x) / segmentDelta.x;
    } else {
      // going right to left
      nearXPercent = (
        ((paddedBox.x + paddedBox.w) - segmentPos.x) / segmentDelta.x);
      farXPercent = (paddedBox.x - segmentPos.x) / segmentDelta.x;
    }

    let nearYPercent, farYPercent;
    if (segmentDelta.y >= 0) {
      // going top to bottom
      nearYPercent = (paddedBox.y - segmentPos.y) / segmentDelta.y;
      farYPercent = ((paddedBox.y + paddedBox.h) -
        segmentPos.y) / segmentDelta.y;
    } else {
      // going bottom to top
      nearYPercent = (
        ((paddedBox.y + paddedBox.h) - segmentPos.y) / segmentDelta.y);
      farYPercent = (paddedBox.y - segmentPos.y) / segmentDelta.y;
    }

    // calculate the further of the two near percents
    let nearPercent;
    if (nearXPercent > nearYPercent) {
      nearPercent = nearXPercent;
    } else {
      nearPercent = nearYPercent;
    }

    // calculate the nearest of the two far percent
    let farPercent;
    if (farXPercent < farYPercent) {
      farPercent = farXPercent;
    } else {
      farPercent = farYPercent;
    }

    let hit;
    if (nearXPercent > farYPercent || nearYPercent > farXPercent) {
      // Where the segment hits the left edge of the box, has to be between
      // the top and bottom edges of the box. Otherwise, the segment is
      // passing the box vertically before it hits the left side.
      hit = false;
    } else if (nearPercent > 1) {
      // the box is past the end of the line
      hit = false;
    } else if (farPercent < 0) {
      // the box is before the start of the line
      hit = false;
    } else {
      hit = true;
    }

    let hitPercent = nearPercent;
    let hitNormal = {};
    if (nearXPercent > nearYPercent) {
      // collided with the left or right edge
      if (segmentDelta.x >= 0) {
        // collided with the left edge
        hitNormal.x = -1;
      } else {
        // collided with the right edge
        hitNormal.x = 1;
      }
      hitNormal.y = 0;
    } else {
      // collided with the to or bottom edge
      hitNormal.x = 0;
      if (segmentDelta.y >= 0) {
        // collided with the top edge
        hitNormal.y = -1;
      } else {
        // collided with the bottom edge
        hitNormal.y = 1;
      }
    }
    if (hitPercent < 0) {
      hitPercent = 0;
    }

    return {
      hit: hit,
      hitNormal: hitNormal,
      hitPercent: hitPercent,
      hitPos: {
        x: segmentPos.x + (segmentDelta.x * hitPercent) + hitNormal.x * EPSILON,
        y: segmentPos.y + (segmentDelta.y * hitPercent) + hitNormal.y * EPSILON
      },
      nearPercent: nearPercent,
      nearXPercent: nearXPercent,
      nearYPercent: nearYPercent,
      farPercent: farPercent,
      farXPercent: farXPercent,
      farYPercent: farYPercent,
      hitBox: paddedBox
    };
  }

  sweepBoxIntoBox(movingBox, segmentDelta, staticBox) {
    let segmentPos = {
      x: movingBox.x + movingBox.w / 2,
      y: movingBox.y + movingBox.h / 2
    };
    let paddedBox = new Box(
      staticBox.x - movingBox.w / 2,
      staticBox.y - movingBox.h / 2,
      staticBox.w + movingBox.w,
      staticBox.h + movingBox.h);
    return this.intersectSegmentIntoBox(segmentPos, segmentDelta, paddedBox);
  }

  // Sweep movingBox, along the movement described by segmentDelta, into each
  // box in the list of staticBoxes. Return a result object describing the first
  // static box that movingBox hits, or null.
  sweepBoxIntoBoxes(movingBox, segmentDelta, staticBoxes) {
    let nearestResult = null;
    for (let i = 0, il = staticBoxes.length; i < il; i++) {
      let staticBox = staticBoxes[i];
      let result = this.sweepBoxIntoBox(movingBox, segmentDelta, staticBox);
      if (result.hit) {
        if (!nearestResult || result.hitPercent < nearestResult.hitPercent) {
          nearestResult = result;
        }
      }
    }
    if (nearestResult) {
      return nearestResult;
    }
    return {
      hit: false,
      hitPercent: 1.0,
      hitPos: {
        x: movingBox.x + segmentDelta.x + (movingBox.w / 2),
        y: movingBox.y + segmentDelta.y + (movingBox.h / 2)
      }
    };
  }
}