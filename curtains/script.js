
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
const glitchText = document.getElementById('glitchText').innerText.trim();

let originalImageData = null;
let currentImageData = null;

// drawTextOverlay теперь использует текст из DOM
function drawTextOverlay() {
    ctx.save();
    ctx.font = "bold 10vw Arial";
    ctx.fillStyle = "#f9f9f9";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.shadowColor = "black";
    ctx.fillText(glitchText, canvas.width / 2, canvas.height - 40);
    ctx.restore();
}

// Distortion parameters
const distortionRadius = 150; // Radius of the distortion area
const maxShift = 25; // Maximum shift for color channels (in pixels)
let mouseX = -999; // Initialize mouse coordinates off-screen
let mouseY = -999;
let distortX = -999;
let distortY = -999;
const lerpSpeed = 0.05; // Speed of the mouse position interpolation

function animateDistortion() {
    distortX += (mouseX - distortX) * lerpSpeed;
    distortY += (mouseY - distortY) * lerpSpeed;

    if (originalImageData) {
        drawDistortedImage();
    }
    requestAnimationFrame(animateDistortion);
}

// Set canvas size to match the window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // If the image is already loaded, redraw it to fit the new size
    if (img.complete && img.naturalWidth !== 0) {
        loadImageAndInitialize();
    }
}

// Safely get the pixel value from the original data
// x, y: pixel coordinates
// channel: 0=Red, 1=Green, 2=Blue, 3=Alpha
function getPixelValue(x, y, channel) {
    // Check bounds to avoid errors
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
        return 0; // Return 0 for out-of-bounds pixels
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
                const sourceY_R = y;
                const sourceX_G = x;
                const sourceY_G = y;
                const sourceX_B = x - strength;
                const sourceY_B = y;

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
function loadImageAndInitialize() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate size and position for "contain"
    const imgAspect = img.width / img.height;
    const canvasAspect = canvas.width / canvas.height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgAspect > canvasAspect) {
        // Image is wider (относительно canvas) — растягиваем по высоте
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
    } else {
        // Image is выше (относительно canvas) — растягиваем по ширине
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgAspect;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
    }

    // Draw the image with preserved aspect ratio and centering
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    drawTextOverlay();

    // Get the original pixel data of the entire image
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawDistortedImage();

    // Remove the image and text from the DOM after loading
    if (img.parentNode) img.parentNode.removeChild(img);
    const glitchTextDiv = document.getElementById('glitchText');
    if (glitchTextDiv && glitchTextDiv.parentNode) glitchTextDiv.parentNode.removeChild(glitchTextDiv);
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
    mouseX = e.clientX;
    mouseY = e.clientY;
    // drawDistortedImage(); // Больше не вызываем здесь, анимация сама обновит
});

// Mouse leave event handler
canvas.addEventListener('mouseleave', () => {
    mouseX = -999;
    mouseY = -999;
    // drawDistortedImage(); // Больше не вызываем здесь
    if (originalImageData) {
        ctx.putImageData(originalImageData, 0, 0);
    }
});

// Window resize handler to adapt the canvas
window.addEventListener('resize', resizeCanvas);

resizeCanvas();