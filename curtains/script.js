
function hidePreloader() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.remove(), 1000);
        setTimeout(() => canvas.classList.add('anim'), 1000);
    };
}

// Get a reference to the canvas element and its 2D context
const canvas = document.getElementById('distortionCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const img = document.getElementById('sourceImage');

let originalImageData = null;
let currentImageData = null;

// drawTextOverlay теперь использует текст из DOM
function drawTextOverlay(offsetX = 0, offsetY = 0) {
    const glitchText = document.getElementById('glitchText')?.innerText.trim() || '';
    ctx.save();
    ctx.font = "bold calc(30px + 10vw) Arial";
    ctx.fillStyle = "#f1f1f1";
    ctx.textAlign = "center";
    ctx.letterSpacing = "-0.07em";
    ctx.textBaseline = "bottom";
    ctx.shadowColor = "black";
    ctx.fillText(
        glitchText,
        canvas.width / 2 + offsetX,
        canvas.height - 40 + offsetY
    );
    ctx.restore();
}

// Distortion parameters
const distortionRadius = 150; // Radius of the distortion area
const maxShift = 25; // Maximum shift for color channels (in pixels)
const lerpSpeed = 0.1; // Speed of the mouse position interpolation
let mouseX = -999; // Initialize mouse coordinates off-screen
let mouseY = -999;
let distortX = -999;
let distortY = -999;

let parallaxX = 0, parallaxY = 0;
const imageParallaxStrength = 10;
const textParallaxStrength = 25;

function animateDistortion() {
    distortX += (mouseX - distortX) * lerpSpeed;
    distortY += (mouseY - distortY) * lerpSpeed;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    parallaxX += (((mouseX - centerX) / centerX) * imageParallaxStrength - parallaxX) * 0.1;
    parallaxY += (((mouseY - centerY) / centerY) * imageParallaxStrength - parallaxY) * 0.1;

    if (originalImageData) {
        // Update the image and text positions based on parallax effect
        loadImageAndInitialize(
            parallaxX, parallaxY,
            parallaxX * (textParallaxStrength / imageParallaxStrength),
            parallaxY * (textParallaxStrength / imageParallaxStrength)
        );
        drawDistortedImage();
    }
    requestAnimationFrame(animateDistortion);
}

// Set canvas size to match the window size
function resizeCanvas() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    parallaxX = 0;
    parallaxY = 0;
    if (img.complete && img.naturalWidth !== 0) {
        loadImageAndInitialize();
    }
}

// Safely get the pixel value from the original data / x, y: pixel coordinates / channel: 0=Red, 1=Green, 2=Blue, 3=Alpha
function getPixelValue(x, y, channel) {
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
        return 0;
    }
    const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
    return originalImageData.data[index + channel];
}

// Draw the distorted image
function drawDistortedImage() {
    if (!originalImageData) return;
    currentImageData.data.set(originalImageData.data);

    const pixels = currentImageData.data;
    const originalPixels = originalImageData.data;

    const startX = Math.max(0, Math.floor(distortX - distortionRadius));
    const startY = Math.max(0, Math.floor(distortY - distortionRadius));
    const endX = Math.min(canvas.width, Math.ceil(distortX + distortionRadius));
    const endY = Math.min(canvas.height, Math.ceil(distortY + distortionRadius));

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const dist = Math.sqrt(Math.pow(x - distortX, 2) + Math.pow(y - distortY, 2));
            if (dist < distortionRadius) {
                const normalizedDist = dist / distortionRadius;
                const strength = (1 - normalizedDist) * maxShift;

                const sourceX_R = x + strength;
                const sourceY_R = y + strength;
                const sourceX_G = x;
                const sourceY_G = y;
                const sourceX_B = x - strength;
                const sourceY_B = y - strength;

                const index = (y * canvas.width + x) * 4;
                pixels[index] = getPixelValue(sourceX_R, sourceY_R, 0);
                pixels[index + 1] = getPixelValue(sourceX_G, sourceY_G, 1);
                pixels[index + 2] = getPixelValue(sourceX_B, sourceY_B, 2);
                pixels[index + 3] = originalPixels[index + 3];
            }
        }
    }
    ctx.putImageData(currentImageData, 0, 0);
}

// Load the image and initialize data
function loadImageAndInitialize(imgOffsetX = 0, imgOffsetY = 0, textOffsetX = 0, textOffsetY = 0) {
   ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgAspect = img.width / img.height;
    const canvasAspect = canvas.width / canvas.height;
    const scale = 1.05; // Scale factor for the image
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgAspect > canvasAspect) {
        drawHeight = canvas.height * scale;
        drawWidth = drawHeight * imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = (canvas.height - drawHeight) / 2;
    } else {
        drawWidth = canvas.width * scale;
        drawHeight = drawWidth / imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(
        img,
        offsetX + imgOffsetX,
        offsetY + imgOffsetY,
        drawWidth,
        drawHeight
    );

    drawTextOverlay(textOffsetX, textOffsetY);

    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // drawDistortedImage();

    if (img.parentNode) img.parentNode.removeChild(img);
    // const glitchTextDiv = document.getElementById('glitchText');
    // if (glitchTextDiv && glitchTextDiv.parentNode) glitchTextDiv.parentNode.removeChild(glitchTextDiv);
}

// When the image is loaded, initialize the canvas
if (img.complete && img.naturalWidth !== 0) {
    hidePreloader();
    loadImageAndInitialize();
    distortX = mouseX;
    distortY = mouseY;
    animateDistortion();
} else {
    img.onload = () => {
        hidePreloader();
        loadImageAndInitialize();
        distortX = mouseX;
        distortY = mouseY;
        animateDistortion();
    };
}

// Mouse move event handler
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * window.devicePixelRatio;
    mouseY = (e.clientY - rect.top) * window.devicePixelRatio;
});

// Mouse leave event handler
canvas.addEventListener('mouseleave', () => {
    mouseX = -999;
    mouseY = -999;
    if (originalImageData) {
        ctx.putImageData(originalImageData, 0, 0);
    }
});

// Window resize handler to adapt the canvas
window.addEventListener('resize', resizeCanvas);

resizeCanvas();