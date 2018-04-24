// Sets step function to use 60fps
let animate = window.requestAnimateFrame || window.webkitRequestAnimateFrame || window.mozRequestAnimateFrame || function(callback){
  window.setTimeout(callback, 1000/60)
}


// Setup the canvas
const canvas = document.createElement('canvas');
let playerScore = document.getElementById('playerScore');
let computerScore = document.getElementById('computerScore');
// grabs 2d context for the canvas to show on screen
const context = canvas.getContext('2d');
const width = 400;
const height = 600;
// Player class
let player = new Player();
// Computer class
let computer = new Computer();
let ball = new Ball(200,300);
canvas.width = width;
canvas.height = height;
let playerVal = 0;
let computerVal = 0;
// Make sure the numbers are converted to actual numbers and not strings
playerScore.innerHTML = parseInt(playerVal);
computerScore.innerHTML = parseInt(computerVal);

// Setup the controls
let keyDown = {};
// Event listener for when the arrow keys are pressed
window.addEventListener("keydown", function(event){
  keyDown[event.keyCode] = true;
});
// Takes the listeners off when key is let go
window.addEventListener("keyup", function(event){
  delete keyDown[event.keyCode];
});


// When page load attachs canvas and calls step function inside the animate function
window.onload = function(){
  document.body.appendChild(canvas);
  animate(step);
};

// Update all objects, render the objects and calls animate on itself again
let step = function() {
  update();
  render();
  animate(step);
};

// Shifts all values back to the defaults in which they were initialized
let reset = function() {
  player = new Player();
  computer = new Computer();
  ball = new Ball(200,300);
  playerVal = 0;
  computerVal = 0;
  playerScore.innerHTML = parseInt(playerVal);
  computerScore.innerHTML = parseInt(computerVal);
};

// Function that groups all the custom prototype updates and runs when together
let update = function() {
  player.update();
  computer.update(ball);
  ball.update(player.paddle, computer.paddle);
};

// Renders the 2d context to the screen
let render = function() {
  context.fillStyle = "#0C2340";
  context.fillRect(0, 0, width, height);
  player.render();
  computer.render();
  ball.render();
};

// Create a paddle and give it an x,y position, width, height
function Paddle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height= height;
  this.x_speed = 0;
  this.y_speed = 0;
};

// Creates prototype method on paddle that will render the paddle to the screen
Paddle.prototype.render = function() {
  context.fillStyle = "#A1AAAD";
  context.fillRect(this.x, this.y, this.width, this.height);
};
Paddle.prototype.move = function(x, y){
  this.x += x;
  this.y += y;
  this.x_speed = x;
  this.y_speed = y;
  if(this.x < 0){ //all the way left
     this.x = 0;
     this.x_speed = 0;
  }else if(this.x + this.width > 400){ //all the way right;
    this.x = 400 -this.width;
    this.x_speed = 0;
  }
};

// Class function that creates a new player paddle
function Player(){
  this.paddle = new Paddle(175, 580, 50, 10);
};

// Class function that creates a new computer paddle
function Computer(){
  this.paddle = new Paddle(175, 10, 50, 10);
};

// Creates prototype method that renders player paddle
Player.prototype.render = function() {
  this.paddle.render();
};
// Prototype method that updates the player paddle based on which arrow key is pressed
Player.prototype.update = function() {
  for(let key in keyDown){
    let value = Number(key);
    if(value == 37) { //left arrow
      this.paddle.move(-4, 0);
    }else if(value == 39) { // right arrow
      this.paddle.move(4,0);
    }else {
      this.paddle.move(0,0);
    }
  }
};

// Creates prototype method that renders computer paddle
Computer.prototype.render = function() {
  this.paddle.render();
};
// Prototype method that updates the computer paddles position based on where the ball is
Computer.prototype.update = function() {
  // x_pos equals ball width numbber
  let x_pos = ball.x;

  let diff = -((this.paddle.x + (this.paddle.width/2)) - x_pos);
  if(diff < 0 && diff < -4){ //max speed left
    diff = -5;
  }else if(diff > 0 && diff > 4) { // max speed right
    diff = 5;
  }
  this.paddle.move(diff, 0);
  if(this.paddle.x < 0) {
    this.paddle.x = 0;
  }else if(this.paddle.x + this.paddle.width > 400) {
    this.paddle.x = 400 - this.paddle.width;
  }
};

// Creates ball class
function Ball(x, y){
  this.x = x;
  this.y = y;
  this.x_speed = 0;
  this.y_speed = 3;
  this.radius = 5;
};

// Prototype method that renders ball to screen
Ball.prototype.render = function(){
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = "#000000";
  context.fill();
};
// Updates ball pos based on walls and the paddles
Ball.prototype.update = function(paddle1, paddle2) {
  this.x += this.x_speed;
  this.y += this.y_speed;
  let top_x = this.x - 5;
  let top_y = this.y - 5;
  let bottom_x = this.x + 5;
  let bottom_y = this.y + 5;

  if (this.x - 5 < 0){ // Hitting the left wall
      this.x = 5;
      this.x_speed = -this.x_speed;
  }else if(this.x + 5 > 400){ // Hitting the right wall
      this.x = 395;
      this.x_speed = -this.x_speed;
  }

  if(this.y < 0){ // A point was scored
    this.x_speed = 0;
    this.y_speed = 3;
    // Resets ball back to starting location
    this.x = 200;
    this.y = 300;
    playerScore.innerHTML += +1;
    // Keeps players score
    playerVal += 1
    playerScore.innerHTML = parseInt(playerVal);
  }else if(this.y > 600){
    this.x_speed = 0;
    this.y_speed = 3;
    // Resets ball back to starting location
    this.x = 200;
    this.y = 300;
    // Keeps computers Score
    computerVal += 1
    computerScore.innerHTML = parseInt(computerVal);
  }

  if(top_y > 300){
    if(top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x +paddle1.width) && bottom_x > paddle1.x){//hit players paddle
      this.y_speed = -3;
      this.x_speed += (paddle1.x_speed/2);
      this.y += this.y_speed;
    }
  }else{
    if(top_y <(paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x){//hit computer paddle
      this.y_speed = 3;
      this.x_speed += (paddle2.x_speed/2);
      this.y += this.y_speed;
    }
  }
};
