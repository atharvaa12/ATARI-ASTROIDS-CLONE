const FPS = 30; // frames per second
var canvas = document.getElementById("gameCanvas");
var can = canvas.getContext("2d");
const SHIP_SIZE = 35; // ship height in pixels
const SHIP_THRUST = 5; //acceleration in pixels per second
const TURN_SPEED = 360; //turn speed in degrees per second
const FRICTION = 0.8; //friction coefficient of space (0= no friction, 1= lots of friction)

var ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: SHIP_SIZE / 2,
  angleOfAxis: 90, //angle of axis in degrees
  rot:0, // angle of rotation in degrees
  thrusting:false,
  thrust: {
    x: 0,
    y: 0,
  },
};

function degreestoRadians(degrees) {
  return degrees * (Math.PI / 180);
}
function keyDown(event){
    if(event.keyCode===37){//rotate left
        
        ship.rot=TURN_SPEED/FPS;

    }
    else if(event.keyCode===38){//thrust
        ship.thrusting=true;
    }
    else if(event.keyCode===39){//rotate right
        ship.rot=-TURN_SPEED/FPS;
    }
}
function keyUp(event){
    if(event.keyCode===37){//rotate left
        ship.rot=0;

    }
    else if(event.keyCode===38){//thrust
        ship.thrusting=false;
    }
    else if(event.keyCode===39){//rotate right
        ship.rot=0;
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
    if(ship.thrusting){
        ship.thrust.x+=SHIP_THRUST*Math.cos(degreestoRadians(ship.angleOfAxis))/FPS;
        ship.thrust.y-=SHIP_THRUST*Math.sin(degreestoRadians(ship.angleOfAxis))/FPS;
       
        
    }
    else{
        
       ship.thrust.x-=FRICTION*ship.thrust.x/FPS;
       ship.thrust.y-=FRICTION*ship.thrust.y/FPS;
    }
  can.beginPath();
  can.moveTo(
    ship.x + ship.r * Math.cos(degreestoRadians(ship.angleOfAxis)),
    ship.y - ship.r * Math.sin(degreestoRadians(ship.angleOfAxis))
  ); //nose of the ship
  can.lineTo(
    ship.x - ship.r * (Math.cos(degreestoRadians(ship.angleOfAxis)) + Math.sin(degreestoRadians(ship.angleOfAxis))),
    ship.y + ship.r * (Math.sin(degreestoRadians(ship.angleOfAxis)) - Math.cos(degreestoRadians(ship.angleOfAxis)))
  ); //rear left end
  can.lineTo(
    ship.x - ship.r * (Math.cos(degreestoRadians(ship.angleOfAxis)) - Math.sin(degreestoRadians(ship.angleOfAxis))),
    ship.y + ship.r * (Math.sin(degreestoRadians(ship.angleOfAxis)) + Math.cos(degreestoRadians(ship.angleOfAxis)))
  );//rear right end

  can.closePath();
  can.stroke();
 // console.log(ship.rot);
  ship.angleOfAxis += ship.rot;
  ship.x+=ship.thrust.x;
  ship.y+=ship.thrust.y;
  if(ship.x<0 - ship.r){
    ship.x=canvas.width+ship.r;
  }
  else if(ship.x>canvas.width+ship.r){
    ship.x=0-ship.r;
  }
  if(ship.y<0 - ship.r){
    ship.y=canvas.height+ship.r;
  }
  else if(ship.y>canvas.height+ship.r){
    ship.y=0-ship.r;
  }

}
