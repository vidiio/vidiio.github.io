// Get the canvas and a 2-dimensional drawing context
var canvas = document.getElementById('scene');
var ctx = canvas.getContext('2d');
// Get the canvas width and height
var width = canvas.width, height = canvas.height;
// Name some colors
var red = '#F00', green = '#0F0', blue = '#00F', purple = '#A0F';
// Create an array to save circle properties
var circles = [ ];

// Draw a circle with the given parameters:
//   center: float array [x, y]
//   radius: float > 0
//   color: string "#RGB"
//   fill: boolean
function drawCircle(center, radius, color, fill) {
  // Make an closed arc with a complete rotation
  ctx.beginPath();
  ctx.arc(center[0], center[1], radius, 0, 2*Math.PI);
  ctx.closePath();
  ctx.lineWidth = 4;
  // Choose whether to fill or outline the circle
  if (fill) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}

// Transform Leap coordinates to canvas scene coordinates
function leapToScene(position) {
  var x = position[0];
  var y = position[1];
  // Shift the Leap origin to the canvas's bottom center and invert the y-axis
  return [width/2 + x, height - y];
}

// Create a Leap controller to access frame data
var controller = new Leap.Controller();

// Register a callback to process frame data
controller.on('frame', function(frame) {
  // Clear the canvas so we can repaint
  ctx.clearRect(0, 0, width, height);
  
  // Draw a green circle to test the canvas
  drawCircle([width/2, 50], 20, green);
  
  // Make sure we have accumulated at most 200 circles
  if (circles.length > 200) {
    circles = circles.slice(-200); // Last 200 circles
  }
  
  // Redraw accumulated circles
  for (var c = 0; c < circles.length; c = c+1) {
    // Retrieve the circle properties
    var center = circles[c].center;
    var radius = circles[c].radius;
    // Redraw the circle filled in purple
    drawCircle(center, radius, purple, true);
  }
  
  // Draw finger tips as colored circles
  for (var f = 0; f < frame.fingers.length; f = f+1) {
    var finger = frame.fingers[f];
    // Calculate the circle center and radius
    var center = leapToScene(finger.tipPosition);
    var radius = Math.abs(finger.touchDistance) * 30;
    // Determine if the finger is touching or not
    var touching = finger.touchZone == 'touching';
    // Decide the circle color and whether to fill it
    var color;
    var fill;
    if (touching) {
      color = red;
      fill = true;
      // Save the circle properties to redraw it later
      var circle = {center: center, radius: radius};
      circles.push(circle);
    }
    else {
      color = blue;
      fill = false;
    }
    // Finally, draw the circle
    drawCircle(center, radius, color, fill);
  }
});

// Connect the controller to start receiving data
controller.connect();