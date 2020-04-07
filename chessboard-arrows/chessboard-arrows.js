/*

A library that extends any chessboard library to allow users to draw arrows and circles.
Right-click to draw arrows and circles, left-click to clear the drawings.

Author: Brendon McBain
Date: 07/04/2020

*/

var ChessboardArrows = function (id, RES_FACTOR = 2, COLOUR = 'rgb(50, 104, 168)') {

const NUM_SQUARES = 8;
var resFactor, colour, drawCanvas, drawContext, primaryCanvas, primaryContext, initialPoint, mouseDown

resFactor = RES_FACTOR;
colour = COLOUR; 

// drawing canvas
drawCanvas = document.getElementById('drawing_canvas');
drawContext = changeResolution(drawCanvas, resFactor);
setContextStyle(drawContext);

// primary canvas
primaryCanvas = document.getElementById('primary_canvas');
primaryContext = changeResolution(primaryCanvas, resFactor);
setContextStyle(primaryContext);

// setup mouse event callbacks
var board = document.getElementById(id);
board.addEventListener("mousedown", function(event) { onMouseDown(event); });
board.addEventListener("mouseup", function(event) { onMouseUp(event); });
board.addEventListener("mousemove", function(event) { onMouseMove(event); });
board.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);

// initialise vars
initialPoint = { x: null, y: null };
finalPoint = { x: null, y: null };
arrowWidth = 15;
mouseDown = false;


// source: https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
function drawArrow(context, fromx, fromy, tox, toy, r) {
	var x_center = tox;
	var y_center = toy;
	var angle, x, y;
	
	context.beginPath();
	
	angle = Math.atan2(toy-fromy,tox-fromx)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;

	context.moveTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;
	
	context.lineTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;
	
	context.lineTo(x, y);
	context.closePath();
	context.fill();
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: Q(evt.clientX - rect.left),
      y: Q(evt.clientY - rect.top)
    };
}

function setContextStyle(context) {
    context.strokeStyle = context.fillStyle = colour;
    context.lineJoin = 'butt';
}

function onMouseDown(event) {
    if (event.which == 3) { // right click
        mouseDown = true;
        initialPoint = finalPoint = getMousePos(drawCanvas, event);
        drawCircle(drawContext, initialPoint.x, initialPoint.y, primaryCanvas.width/(resFactor*NUM_SQUARES*2) - 1);
    }
}

function onMouseUp(event) {
    if (event.which == 3) { // right click
        mouseDown = false;
        // if starting position == ending position, draw a circle to primary canvas
        if (initialPoint.x == finalPoint.x && initialPoint.y == finalPoint.y) {
            drawCircle(primaryContext, initialPoint.x, initialPoint.y, primaryCanvas.width/(resFactor*NUM_SQUARES*2) - 1); // reduce radius of square by 1px
        }
        // otherwise draw an arrow 
        else {
            drawArrowToCanvas(primaryContext);
        }
        drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    }
    else if (event.which == 1) { // left click
        // clear canvases
        drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        primaryContext.clearRect(0, 0, primaryCanvas.width, primaryCanvas.height);
    }
}

function onMouseMove(event) {
    finalPoint = getMousePos(drawCanvas, event);

    if (!mouseDown) return;
    if (initialPoint.x == finalPoint.x && initialPoint.y == finalPoint.y) return;

    drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawArrowToCanvas(drawContext);
}

function drawArrowToCanvas(context) {
    // offset finalPoint so the arrow head hits the center of the square
    var xFactor, yFactor, offsetSize;
    if (finalPoint.x == initialPoint.x) {
        yFactor = Math.sign(finalPoint.y - initialPoint.y)*arrowWidth;
        xFactor = 0
    }
    else if (finalPoint.y == initialPoint.y) {
        xFactor = Math.sign(finalPoint.x - initialPoint.x)*arrowWidth;
        yFactor = 0;
    }
    else {
        // find delta x and delta y to achieve hypotenuse of arrowWidth
        slope_mag = Math.abs((finalPoint.y - initialPoint.y)/(finalPoint.x - initialPoint.x));
        xFactor = Math.sign(finalPoint.x - initialPoint.x)*arrowWidth/Math.sqrt(1 + Math.pow(slope_mag, 2));
        yFactor = Math.sign(finalPoint.y - initialPoint.y)*Math.abs(xFactor)*slope_mag;
    }

    // draw line
    context.beginPath();
    context.lineCap = "round";
    context.lineWidth = 8;
    context.moveTo(initialPoint.x, initialPoint.y);
    context.lineTo(finalPoint.x - xFactor, finalPoint.y - yFactor);
    context.stroke();

    // draw arrow head
    drawArrow(context, initialPoint.x, initialPoint.y, finalPoint.x - xFactor, finalPoint.y - yFactor, arrowWidth);
}

function Q(x, d) {  // mid-tread quantiser
    d = primaryCanvas.width/(resFactor*NUM_SQUARES);
    return d*(Math.floor(x/d) + 0.5);
}

function drawCircle(context, x, y, r) {
    context.beginPath();
    context.lineWidth = 3;
    context.arc(x, y, r, 0, 2 * Math.PI);
    context.stroke();
}

// source: https://stackoverflow.com/questions/14488849/higher-dpi-graphics-with-html5-canvas
function changeResolution(canvas, scaleFactor) {
    // Set up CSS size.
    canvas.style.width = canvas.style.width || canvas.width + 'px';
    canvas.style.height = canvas.style.height || canvas.height + 'px';

    // Resize canvas and scale future draws.
    canvas.width = Math.ceil(canvas.width * scaleFactor);
    canvas.height = Math.ceil(canvas.height * scaleFactor);
    var ctx = canvas.getContext('2d');
    ctx.scale(scaleFactor, scaleFactor);
    return ctx;
}

}
