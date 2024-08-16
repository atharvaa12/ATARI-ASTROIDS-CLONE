const FPS = 30; // frames per second
var canvas = document.getElementById("gameCanvas");
var can = canvas.getContext("2d");
const SHIP_SIZE = 35; // ship height in pixels
const SHIP_THRUST = 5; //acceleration in pixels per second
const TURN_SPEED = 360; //turn speed in degrees per second
const FRICTION = 0.8; //friction coefficient of space (0= no friction, 1= lots of friction)
const ASTROIDS_NUM = 3;
const ASTROIDS_SIZE = 100;
const ASTROID_SPEED = 60;
const avgAstroidVertices = 10;
const ASTROID_ROUGHNESS = 0.4;
var ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: SHIP_SIZE / 2,
  angleOfAxis: 90, //angle of axis in degrees
  rot: 0, // angle of rotation in degrees
  thrusting: false,
  thrust: {
    x: 0,
    y: 0,
  },
};
var astroids = [];
function createAstroid(x, y) {
  var roid = {
    x: x,
    y: y,
    xv:
      ((Math.random() * ASTROID_SPEED) / FPS) * (Math.random() < 0.5 ? 1 : -1),
    yv:
      ((Math.random() * ASTROID_SPEED) / FPS) * (Math.random() < 0.5 ? 1 : -1),
    r: ASTROIDS_SIZE / 2,
    angle: Math.random() * Math.PI * 2, //in radians
    vertices: Math.floor(
      1 + Math.random() * avgAstroidVertices + avgAstroidVertices / 2
    ),
    offsets: [],
  };
  for (var i = 0; i < roid.vertices; i++) {
    roid.offsets.push(
      Math.random() * ASTROID_ROUGHNESS * 2 + 1 - ASTROID_ROUGHNESS
    );
  }
  return roid;
}
function distBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
function setUpAstroids() {
  astroids = [];
  for (var i = 0; i < ASTROIDS_NUM; i++) {
    var x, y;
    do {
      x = Math.floor(Math.random() * canvas.width);
      y = Math.floor(Math.random() * canvas.height);
    } while (
      distBetweenPoints(ship.x, ship.y, x, y) <
      ASTROIDS_SIZE + SHIP_SIZE
    );
    astroids.push(createAstroid(x, y));
  }
}
setUpAstroids();
console.log(astroids);
function degreestoRadians(degrees) {
  return degrees * (Math.PI / 180);
}
function keyDown(event) {
  if (event.keyCode === 37) {
    //rotate left

    ship.rot = TURN_SPEED / FPS;
  } else if (event.keyCode === 38) {
    //thrust
    ship.thrusting = true;
  } else if (event.keyCode === 39) {
    //rotate right
    ship.rot = -TURN_SPEED / FPS;
  }
}
function keyUp(event) {
  if (event.keyCode === 37) {
    //rotate left
    ship.rot = 0;
  } else if (event.keyCode === 38) {
    //thrust
    ship.thrusting = false;
  } else if (event.keyCode === 39) {
    //rotate right
    ship.rot = 0;
  }
}
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
setInterval(update, 1000 / FPS);
function update() {
  can.fillStyle = "black";
  can.fillRect(0, 0, canvas.width, canvas.height);
  can.strokeStyle = "white";
  can.lineWidth = SHIP_SIZE / 20;
  if (ship.thrusting) {
    ship.thrust.x +=
      (SHIP_THRUST * Math.cos(degreestoRadians(ship.angleOfAxis))) / FPS;
    ship.thrust.y -=
      (SHIP_THRUST * Math.sin(degreestoRadians(ship.angleOfAxis))) / FPS;
  } else {
    ship.thrust.x -= (FRICTION * ship.thrust.x) / FPS;
    ship.thrust.y -= (FRICTION * ship.thrust.y) / FPS;
  }
  can.beginPath();
  can.moveTo(
    ship.x + ship.r * Math.cos(degreestoRadians(ship.angleOfAxis)),
    ship.y - ship.r * Math.sin(degreestoRadians(ship.angleOfAxis))
  ); //nose of the ship
  can.lineTo(
    ship.x -
      ship.r *
        (Math.cos(degreestoRadians(ship.angleOfAxis)) +
          Math.sin(degreestoRadians(ship.angleOfAxis))),
    ship.y +
      ship.r *
        (Math.sin(degreestoRadians(ship.angleOfAxis)) -
          Math.cos(degreestoRadians(ship.angleOfAxis)))
  ); //rear left end
  can.lineTo(
    ship.x -
      ship.r *
        (Math.cos(degreestoRadians(ship.angleOfAxis)) -
          Math.sin(degreestoRadians(ship.angleOfAxis))),
    ship.y +
      ship.r *
        (Math.sin(degreestoRadians(ship.angleOfAxis)) +
          Math.cos(degreestoRadians(ship.angleOfAxis)))
  ); //rear right end

  can.closePath();
  can.stroke();
  // console.log(ship.rot);
  //drawing astroids

  can.strokeStyle = "slategray";
  can.lineWidth = SHIP_SIZE / 20;
  for (var i = 0; i < astroids.length; i++) {
    //console.log("here");
    can.beginPath();
    var x = astroids[i].x;
    var y = astroids[i].y;
    var r = astroids[i].r;
    var angle = astroids[i].angle;
    var vertices = astroids[i].vertices;
    var offsets = astroids[i].offsets;

    can.beginPath();
    can.moveTo(
      x + r * offsets[0] * Math.cos(angle),
      y + r * offsets[0] * Math.sin(angle)
    );
    for (var j = 1; j < vertices; j++) {
      can.lineTo(
        x + r * offsets[j] * Math.cos(angle + (Math.PI * 2 * j) / vertices),
        y + r * offsets[j] * Math.sin(angle + (Math.PI * 2 * j) / vertices)
      );
    }
    can.closePath();
    can.stroke();
    astroids[i].x += astroids[i].xv;
    astroids[i].y += astroids[i].yv;
    //handle edge case
    if (astroids[i].x < 0 - astroids[i].r) {
      astroids[i].x = canvas.width + astroids[i].r;
    } else if (astroids[i].x > canvas.width + astroids[i].r) {
      astroids[i].x = 0 - astroids[i].r;
    }
    if (astroids[i].y < 0 - astroids[i].r) {
      astroids[i].y = canvas.height + astroids[i].r;
    } else if (astroids[i].y > canvas.height + astroids[i].r) {
      astroids[i].y = 0 - astroids[i].r;
    }
  }

  ship.angleOfAxis += ship.rot;
  ship.x += ship.thrust.x;
  ship.y += ship.thrust.y;
  if (ship.x < 0 - ship.r) {
    ship.x = canvas.width + ship.r;
  } else if (ship.x > canvas.width + ship.r) {
    ship.x = 0 - ship.r;
  }
  if (ship.y < 0 - ship.r) {
    ship.y = canvas.height + ship.r;
  } else if (ship.y > canvas.height + ship.r) {
    ship.y = 0 - ship.r;
  }
}
