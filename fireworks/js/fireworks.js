let canvas = document.querySelector('.fireworks'),
  ctx = canvas.getContext('2d');

  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  //particle object arrays
  fireworks = [], 
  boomBooms = [],
  smokePuffs = [],
  maxSmokeVelocity = 1,
  hue = 120;

  //when launching fireworks, too many particles will be emitted without limitation
  //limit launches to one per 5 loop ticks
let limiterTotal = 5;
let limiterTick = 0;

  //auto launch a firework per 80 loop ticks
let timerTotal = 80;
let timerTick = 0;
let mouseDown = false;
let mouseXPosition;
let mouseYposition;

let smokeImage = new Image();

smokeImage.src = 'smokeImages/smoke.png';

canvas.width = canvasWidth;
canvas.height = canvasHeight;

function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

function calculateDistance(point1X, point1Y, point2X, point2Y) {
  return Math.sqrt(Math.pow(point2X - point1X, 2) + Math.pow((point2Y - point1Y), 2));
}

class Firework {

  //constructor
  constructor(startX, startY, targetX, targetY) {
    this.x = startX;
    this.y = startY;

    this.startX = startX;
    this.startY = startY;

    this.targetX = targetX;
    this.targetY = targetY;

    this.distanceToTarget = calculateDistance(startX, startY, targetX, targetY);

    this.distanceTraveled = 0;

    this.coordinates = [];
    this.coordinateCount = Math.floor(randRange(1, 7));

    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }

    this.angle = Math.atan2(targetY - startY, targetX - startX);

    this.speed = 2;
    this.acceleration = 1.2;
    this.brightness = randRange(50,70);

    this.targetRadius=1;
  }
    
    //create methods for firework class
  draw = () => {
      ctx.beginPath();

      //move the last tracked coordinate into our coordinates array. 
      //that'll be the starting point
      ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);

      //specify ending point
      ctx.lineTo(this.x, this.y);

      //draw the line
      ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
      ctx.stroke();

      //draw a circle to represent the target point
      ctx.beginPath();
      ctx.arc(this.targetX, this.targetY, this.targetRadius, 0, Math.PI * 2);
      ctx.stroke();
  };

  update = index => {
    //console.log("updating");

    //remove the last element from coordinates array
    this.coordinates.pop();

    //add the current point to the beginning of coordinates array
    this.coordinates.unshift([this.x, this.y]);

    //make the target circle pulse
    if (this.targetRadius < 8) {
      this.targetRadius += 0.3;
    } else {
      this.targetRadius = 1;
    }

    //speed up firework
    this.speed *= this.acceleration;

    //calculate current velocities based on angle and speed
    let velX = Math.cos(this.angle) * this.speed,
      velY = Math.sin(this.angle) * this.speed;
    
    this.distanceTraveled = calculateDistance(this.startX, this.startY, this.x + velX, this.y + velY);

    if (this.distanceTraveled >= this.distanceToTarget) {
      //has arrived at target
      createExplosion(this.targetX, this.targetY);

      //create smoke
      createSmoke(this.targetX, this.targetY);

      //cleanup
      fireworks.splice(index, 1);
    } else {
      //still traveling, update position
      this.x += velX;
      this.y += velY;
    }


  };
}//end class firework

function createExplosion(x, y) {
  let randType = Math.floor(randRange(0, 10));
  //randType = 6
  let particleCount = Math.floor(randRange(60, 80));
  for (let i = particleCount; i >= 0; i--) {
    boomBooms.push(new ExplosionParticle(x, y, randType));
  }
}




class ExplosionParticle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.ratio = 1;

    this.coordinates = [];
    this.coordinateCount = Math.floor(randRange(10, 20));

    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }

    this.angle = randRange(0, Math.PI * 2);

    if (type >= 8) { //circle
      this.speed = 5;
    }
    else if (type >= 6 && type <= 7) { //star
      let segmentAngle = (Math.PI * 2) / 10
      let segment = Math.floor(this.angle / segmentAngle)
      if (segment % 2 == 0) {
        this.ratio = ((this.angle - (segment * segmentAngle)) / ((Math.PI *2) / 10)) + 1
      } else {
        this.ratio = (1 - (this.angle - (segment * segmentAngle)) / ((Math.PI *2) / 10)) + 1
      }
      this.speed = 3 * this.ratio;
    }
    else { //normal random
      this.speed = randRange(1,10);
    }
    
    

    this.friction = .95;
    this.gravity = 1;

    this.hue = randRange(hue - 20, hue + 20);
    this.brightness = randRange(50, 80);

    this.alpha = 1;
    this.decay = randRange(.003, .006);

  }

  draw = () => {
    ctx.beginPath();
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);

    ctx.quadraticCurveTo(this.x + 1, this.y - Math.round(randRange(5, 10)), this.x, this.y);

    ctx.strokeStyle =`hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
    ctx.stroke();

  }

  update = index => {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);

    //slow down descent of particle
    this.speed *= this.friction;

    //update position
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;

    //fade out particles
    this.alpha -= this.decay;

    //clean up
    if (this.alpha <= this.decay) {
      boomBooms.splice(index, 1);
    }

  }
} //end ExplosionParticle

createSmoke = (x, y) => {
  let puffCount = 2;

  for (let i = 0; i < puffCount; i++) {
    smokePuffs.push(new SmokePuff(x, y));
  }
};

class SmokePuff {

  constructor(x, y) {

    this.x = randRange(x - 25, x + 25);
    this.y = randRange(y - 15, y + 15);

    this.xVelocity = randRange(0.2, maxSmokeVelocity);
    this.yVelocity = randRange(-0.1, -maxSmokeVelocity);

    this.alpha = 0.4;
  }

  draw = () => {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(smokeImage, this.x - (smokeImage.width / 2), this.y - (smokeImage.height / 2));
    ctx.restore();


  };

  update = index => {

    this.x += this.xVelocity;
    this.y += this.yVelocity;

    this.alpha -= .001

    if (this.alpha <= 0) {
      smokePuffs.splice(index, 1);
    }

  };

} //end class SmokePuff

function heartbeat() {
  requestAnimationFrame(heartbeat);

  hue = randRange(1,360);

  ctx.globalCompositionOperation = 'destination-out';

  ctx.fillStyle = `rgba(0, 0, 0, .5)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositionOperation = 'lighter';

  //loop through fireworks and animate them
  let i = fireworks.length;
  while (i--) {
    fireworks[i].draw();
    fireworks[i].update(i);
  }

  //loop through exploisionParticles and animate them
  for (j = boomBooms.length - 1; j >= 0; j--) {
    boomBooms[j].draw();
    boomBooms[j].update(j);
  }

  for (k = smokePuffs.length - 1; k >= 0; k--) {
    smokePuffs[k].draw();
    smokePuffs[k].update(k);
  }

  if (timerTick >= timerTotal) {

    if (!mouseDown) {
      //launch a firework from the bottom senter, set a random target
      //y coordinate must be in the top half of the screen
      fireworks.push(new Firework(canvasWidth/2, canvasHeight, randRange(0,canvasWidth), randRange(0,canvasHeight/2)));
      timerTick = 0;
    }
  } else {
    timerTick++;
  }

  //launch firework on click
  if (limiterTick >= limiterTotal) {
    if(mouseDown) {
      fireworks.push(new Firework(canvasWidth/2, canvasHeight, mouseXPosition, mouseYposition));
      limiterTick = 0;
    }
  } else {
    limiterTick++;
  }
}//end funciton heartbeat

//event listeners
canvas.addEventListener('mousedown', function(e) {
  e.preventDefault();
  mouseDown = true;
});

canvas.addEventListener('mouseup', function(e) {
  e.preventDefault();
  mouseDown = false;
});

canvas.addEventListener('mousemove', function(e) {
  mouseXPosition = e.offsetX;
  mouseYposition = e.offsetY;
});

window.onload = heartbeat;