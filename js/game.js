const FPS = 30; // frames per second
var canvas = document.getElementById("gameCanvas");
var can = canvas.getContext("2d");
const SHIP_SIZE = 35; // ship height in pixels
const SHIP_THRUST = 5; //acceleration in pixels per second
const TURN_SPEED = 360; //turn speed in degrees per second
const FRICTION = 0.8; //friction coefficient of space (0= no friction, 1= lots of friction)
const ASTROIDS_NUM = 1;
const ASTROIDS_SIZE = 75;
const ASTROID_SPEED = 60;
const avgAstroidVertices = 10;
const ASTROID_ROUGHNESS = 0.4;
const SHIP_EXPLODE_DUR = 0.1; //duration of the ship explosion
const MAX_LASER = 5;
const LASER_SPEED = 500;
const LASER_EXPLODE_DUR = 0.1;
const TEXT_FADE_TIME = 2.5;
const TEXT_SIZE = 40;
const highScoreSaveKey = "highScore";
var laserAudio = new Sound("sounds/sounds/laser.m4a", 5, 0.5);
var explodeAudio = new Sound("sounds/sounds/explode.m4a", 5, 0.5);
var thrustAudio = new Sound("sounds/sounds/thrust.m4a", 1, 0.4);
var laserHitAudio = new Sound("sounds/sounds/hit.m4a", 5, 0.5);
var text, textOpacity;
var level = 0;
var ship;
var astroids = [];
var highScore;
var score=0;
function Sound(src, maxStreams = 1, vol = 1.0) {
  this.streamNum = 0;
  this.streams = [];
  for (var i = 0; i < maxStreams; i++) {
    this.streams.push(new Audio(src));
    this.streams[i].volume = vol;
  }
  this.play = function () {
    this.streams[this.streamNum].play();
    this.streamNum = (this.streamNum + 1) % maxStreams;
  };
  this.stop = function () {
    this.streams[this.streamNum].pause();
    this.streamNum = (this.streamNum + 1) % maxStreams;

    
  };
}
function createAstroid(x, y, r) {
  var levelMult = 1 + 0.1 * level;
  var roid = {
    x: x,
    y: y,
    xv:
      ((Math.random() * ASTROID_SPEED * levelMult) / FPS) *
      (Math.random() < 0.5 ? 1 : -1),
    yv:
      ((Math.random() * ASTROID_SPEED * levelMult) / FPS) *
      (Math.random() < 0.5 ? 1 : -1),
    r: r,
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
function newGame() {
   laserAudio = new Sound("sounds/sounds/laser.m4a", 5, 0.5);
  explodeAudio = new Sound("sounds/sounds/explode.m4a", 5, 0.5);
  thrustAudio = new Sound("sounds/sounds/thrust.m4a", 1, 0.4);
  laserHitAudio = new Sound("sounds/sounds/hit.m4a", 5, 0.5);
  if(score===highScore){
    localStorage.setItem(highScoreSaveKey,score);
  }
  level = 0;
  score=0;
  if(localStorage.getItem(highScoreSaveKey)===null){
    highScore=0;
  }
  else{
   
    highScore=parseInt(localStorage.getItem(highScoreSaveKey));
  }
  ship = setUpShip();
  setUpLevel();
}
function setUpLevel() {
  textOpacity = 1.0;
  level = level + 1;
  text = "Level " + level;
  astroids = [];
  setUpAstroids();
}
newGame();
function destroyAstroid(index) {
  var x = astroids[index].x;
  var y = astroids[index].y;
  var r = astroids[index].r;
  //split the astroid
  if (r == Math.ceil(ASTROIDS_SIZE)) {
    astroids.push(createAstroid(x, y, Math.ceil(ASTROIDS_SIZE / 2)));
    astroids.push(createAstroid(x, y, Math.ceil(ASTROIDS_SIZE / 2)));
  } else if (r == Math.ceil(ASTROIDS_SIZE / 2)) {
    astroids.push(createAstroid(x, y, Math.ceil(ASTROIDS_SIZE / 4)));
    astroids.push(createAstroid(x, y, Math.ceil(ASTROIDS_SIZE / 4)));
  }
  astroids.splice(index, 1);

  score=score+10;
  if(score>highScore){
    highScore=score;
  }
  if (astroids.length == 0) {
    setUpLevel();
  }
  
}
function setUpAstroids() {
  astroids = [];
  for (var i = 0; i < ASTROIDS_NUM + level; i++) {
    var x, y;
    do {
      x = Math.floor(Math.random() * canvas.width);
      y = Math.floor(Math.random() * canvas.height);
    } while (
      distBetweenPoints(ship.x, ship.y, x, y) <
      ASTROIDS_SIZE + SHIP_SIZE
    );
    astroids.push(createAstroid(x, y, ASTROIDS_SIZE));
  }
}

function setUpShip() {
  
  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    angleOfAxis: 90, //angle of axis in degrees
    rot: 0, // angle of rotation in degrees
    explodeDuration: 0,
    thrusting: false,
    thrust: {
      x: 0,
      y: 0,
    },
    canShoot: true,
    lasers: [],
    dead: false,
  };
}
function gameOver() {
  ship.dead = true;
  text = "Game Over";
  textOpacity = 1.0;
  setTimeout(newGame, 1000);
}
function degreestoRadians(degrees) {
  return degrees * (Math.PI / 180);
}
function keyDown(event) {
 
  if (event.keyCode === 32) {
    if(ship.dead===false && ((textOpacity <= 0 && text === "Game Over") || text === "Level " + level)){
    shootLaser();
    }
  } else if (event.keyCode === 37) {
    //rotate left

    ship.rot = TURN_SPEED / FPS;
  } else if (event.keyCode === 38) {
   
    
    if(ship.dead===false && ((textOpacity <= 0 && text === "Game Over") || text === "Level " + level)){
    //thrust
    ship.thrusting = true;
    thrustAudio.play();
    }
    else{
      return ;
    }
  } else if (event.keyCode === 39) {
    //rotate right
    ship.rot = -TURN_SPEED / FPS;
  }
}
function keyUp(event) {
  if (event.keyCode === 32) {
    ship.canShoot = true;
  } else if (event.keyCode === 37) {
    //rotate left
    ship.rot = 0;
  } else if (event.keyCode === 38) {
    //thrust
    thrustAudio.stop();
    ship.thrusting = false;
  } else if (event.keyCode === 39) {
    //rotate right
    ship.rot = 0;
  }
}
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
function explodeShip() {
  ship.explodeDuration = Math.ceil(SHIP_EXPLODE_DUR * FPS);
  ship.canShoot = false;
  thrustAudio.stop();
  explodeAudio.play();
}
function shootLaser() {
  //create laser

  if (ship.canShoot && ship.lasers.length < MAX_LASER) {
    ship.lasers.push({
      //from the nose of the ship
      x: ship.x + ship.r * Math.cos(degreestoRadians(ship.angleOfAxis)),

      y: ship.y - ship.r * Math.sin(degreestoRadians(ship.angleOfAxis)),
      xv: (LASER_SPEED * Math.cos(degreestoRadians(ship.angleOfAxis))) / FPS,
      yv: (-LASER_SPEED * Math.sin(degreestoRadians(ship.angleOfAxis))) / FPS,
      explodeDuration: 0,
    });
    laserAudio.play();
  }
}
setInterval(update, 1000 / FPS);

function update() {
  var exploding = ship.explodeDuration > 0;
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
  if (!exploding) {
    // console.log(text,"level "+level);
    if (
      ship.dead === false &&
      ((textOpacity <= 0 && text === "Game Over") || text === "Level " + level)
    ) {
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
    }
  } else {
    //draw explosion
    can.fillStyle = "red";

    can.beginPath();
    can.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
    can.fill();
    can.fillStyle = "orange";

    can.beginPath();
    can.arc(ship.x, ship.y, ship.r * 1.2, 0, Math.PI * 2, false);
    can.fill();
    can.fillStyle = "orange";

    can.beginPath();
    can.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
    can.fill();
    can.fillStyle = "yellow";

    can.beginPath();
    can.arc(ship.x, ship.y, ship.r * 0.4, 0, Math.PI * 2, false);
    can.fill();
  }
  //draw lasers
  for (var i = 0; i < ship.lasers.length; i++) {
    if (ship.lasers[i].explodeDuration === 0) {
      can.fillStyle = "yellow";
      can.beginPath();
      can.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        SHIP_SIZE / 20,
        0,
        Math.PI * 2,
        false
      );
      can.fill();
    } else {
      can.fillStyle = "red";
      can.beginPath();
      can.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.75,
        Math.PI * 2,
        false
      );
      can.fill();
      can.fillStyle = "orange";
      can.beginPath();
      can.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.5,
        Math.PI * 2,
        false
      );
      can.fill();
      can.fillStyle = "orange";
      can.beginPath();
      can.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.5,
        Math.PI * 2,
        false
      );
      can.fill();
      can.fillStyle = "yellow";
      can.beginPath();
      can.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.25,
        Math.PI * 2,
        false
      );
      can.fill();
    }
  }
  //drawing astroids

  can.strokeStyle = "slategray";
  can.lineWidth = SHIP_SIZE / 20;
  for (var i = 0; i < astroids.length; i++) {
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
  if (textOpacity > 0) {
    can.fillStyle = "rgba(255,255,255, " + textOpacity + ")";
    can.font = "small-caps " + TEXT_SIZE + "px Arial";
    can.fillText(text, canvas.width / 2 - TEXT_SIZE * 4, canvas.height * 0.4);
    textOpacity -= 1.0 / TEXT_FADE_TIME / FPS;
  }
  can.textAlign = "right";
  can.textBaseline = "middle";
  can.fillStyle = "white";
  can.font=TEXT_SIZE/4+" px Arial";
  can.fillText(" "+score,canvas.width-SHIP_SIZE/2,SHIP_SIZE);
  can.textAlign = "center";
  can.textBaseline = "middle";
  can.fillStyle = "white";
  can.font=TEXT_SIZE/4+" px Arial";
  can.fillText("Best: "+highScore,canvas.width/2,SHIP_SIZE);
  //detect laser hits
  var ax, ay, ar, lx, ly;
  for (var i = astroids.length - 1; i >= 0; i--) {
    ax = astroids[i].x;
    ay = astroids[i].y;
    ar = astroids[i].r;
    for (var j = ship.lasers.length - 1; j >= 0; j--) {
      lx = ship.lasers[j].x;
      ly = ship.lasers[j].y;
      if (
        ship.lasers[j].explodeDuration === 0 &&
        distBetweenPoints(ax, ay, lx, ly) < ar
      ) {
        ship.lasers[j].explodeDuration = Math.ceil(LASER_EXPLODE_DUR * FPS);
        laserHitAudio.play();
        destroyAstroid(i);
        break;
      }
    }
  }
  //check for collision
  if (!exploding) {
    if (
      ship.dead === false &&
      ((textOpacity <= 0 && text === "Game Over") || text === "Level " + level)
    ) {
      for (var i = 0; i < astroids.length; i++) {
        if (
          distBetweenPoints(ship.x, ship.y, astroids[i].x, astroids[i].y) <
          ship.r + astroids[i].r
        ) {
          explodeShip();
          destroyAstroid(i);
          gameOver();
        }
      }

      ship.angleOfAxis += ship.rot; //rotate ship
      //move ship
      ship.x += ship.thrust.x;
      ship.y += ship.thrust.y;
      //handle edge case
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
    } else {
      
      ship.explodeDuration--;
      if (ship.explodeDuration == 0) {
        ship = setUpShip();
      }
    }
  }

  //move lasers
  for (var i = 0; i < ship.lasers.length; i++) {
    if (ship.lasers[i].explodeDuration > 0) {
      ship.lasers[i].explodeDuration--;
      if (ship.lasers[i].explodeDuration === 0) {
        ship.lasers.splice(i, 1);
        continue;
      }
    } else {
      ship.lasers[i].x += ship.lasers[i].xv;
      ship.lasers[i].y += ship.lasers[i].yv;
    }
    if (
      ship.lasers[i].x < 0 ||
      ship.lasers[i].x > canvas.width ||
      ship.lasers[i].y < 0 ||
      ship.lasers[i].y > canvas.height
    ) {
      ship.lasers.splice(i, 1);
    }
  }

  for (var i = 0; i < astroids.length; i++) {
    var x = astroids[i].x;
    var y = astroids[i].y;
    var r = astroids[i].r;
    var angle = astroids[i].angle;
    var vertices = astroids[i].vertices;
    var offsets = astroids[i].offsets;
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
}
