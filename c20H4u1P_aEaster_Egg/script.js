const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const circleArray = [];
//Color selection from colourlovers.com
const ballColorSelections = ['#00DAC1', '#94C2A5', '#FD8189', '#92737B', '#363640'];
const face = new Image(0, 0);
face.src = 'IMG_20190711_145540.png';
face.onload = createCircle;
//Global settings
const settings = {
	maxCount: 40,
	bounce: 0.008,
	force: -0.15,
	gravity: 0.15
}

//Just for my profile background, using the CSS here for it too ;)
document.body.style.overflow = 'hidden';

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

window.addEventListener('resize', function() {
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
});

class Circle {
  constructor() {
    this.positionX = Math.floor(Math.random() * window.innerWidth);
    this.positionY = Math.floor(Math.random() * window.innerHeight);
    this.radius = parseInt(((Math.random() * 160) - 1));
    this.velocityY = 120;
    this.velocityX = parseInt(((Math.random() * 20) - 10));
    this.color = ballColorSelections[Math.floor(Math.random() * 5)];
    this.angle = 0;
  }
}

function createCircle() {
	for (let i = 0; i < settings.maxCount; i++) {
		let circleObject = new Circle;
		circleObject.id = i;
		circleArray.push(circleObject);
	}
	moveCircle();
}

function drawCircle(object) {
	for (let i = 0; i < object.length; i++) {
    context.save();
    context.translate(object[i].positionX, object[i].positionY);
    context.rotate(object[i].angle);
    context.drawImage(face, -object[i].radius, -object[i].radius, object[i].radius * 2, object[i].radius * 2);
    context.restore();
	}
}

function moveCircle() {
	context.fillStyle = "#fffef7"; 
  context.fillRect(0,0,canvas.width,canvas.height);

	for (let i = 0; i < circleArray.length; i++) {
		collideCircle(circleArray, circleArray[i]);
		circleArray[i].velocityY += settings.gravity;
		circleArray[i].positionY += circleArray[i].velocityY;
		circleArray[i].positionX += circleArray[i].velocityX;

		if(circleArray[i].positionY <= canvas.height - circleArray[i].radius) {
			circleArray[i].positionY += circleArray[i].velocityY;
		} else {
			circleArray[i].velocityY = settings.force * circleArray[i].velocityY;
			circleArray[i].velocityX *= settings.force * -1;
			circleArray[i].positionY = canvas.height - circleArray[i].radius;
		}

		if(circleArray[i].positionX >= canvas.width - circleArray[i].radius) {
			circleArray[i].positionX = canvas.width - circleArray[i].radius;
			circleArray[i].velocityX *= settings.force;
		} else if(circleArray[i].positionX <= 0 + circleArray[i].radius) {
			circleArray[i].positionX = 0 + circleArray[i].radius;
			circleArray[i].velocityX *= settings.force;
		}
    circleArray[i].angle += circleArray[i].velocityX * Math.PI / 180;
	}

	function collideCircle(collideObject, circleObject) {
		for (let j = circleObject.id + 1; j < collideObject.length; j++) {
			let distanceX = collideObject[j].positionX - circleObject.positionX;
			let distanceY = collideObject[j].positionY - circleObject.positionY;
			let distance = Math.floor(Math.sqrt((distanceX * distanceX) + (distanceY * distanceY)));
			let minimumDistance = collideObject[j].radius + circleObject.radius;
			if (distance <= minimumDistance) {
				let angle = Math.atan2(distanceY, distanceX);
        let targetX = circleObject.positionX + Math.cos(angle) * minimumDistance;
        let targetY = circleObject.positionY + Math.sin(angle) * minimumDistance;
        let angleX = parseInt((targetX - collideObject[j].positionX) * settings.bounce);
        let angleY = parseInt((targetY - collideObject[j].positionY) * settings.bounce);
        circleObject.velocityX -= angleX;
        circleObject.velocityY -= angleY;
        collideObject[j].velocityX += angleX;
        collideObject[j].velocityY += angleY;
			}

		}
	}

	drawCircle(circleArray);
  
	requestAnimationFrame(moveCircle);
}

document.addEventListener('click', () => {
  circleArray.forEach(circle => {
    circle.velocityX += Math.random() * 20 - 10;
    circle.velocityY += Math.random() * 20 - 10;
  });
});

document.addEventListener('keydown', () => {
  circleArray.forEach(circle => {
    circle.velocityX = 0;
    circle.velocityY = 0;
  });
})