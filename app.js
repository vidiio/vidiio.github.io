(function() {
	/* Canvas */

	var canvas = document.getElementById('drawCanvas');
	var ctx = canvas.getContext('2d');
	var color = document.querySelector(':checked').getAttribute('data-color');

	canvas.width = Math.min(document.documentElement.clientWidth, window.innerWidth || 300);
	canvas.height = Math.min(document.documentElement.clientHeight, window.innerHeight || 300);
	 
	ctx.strokeStyle = color;
	ctx.lineWidth = '3';
	ctx.lineCap = ctx.lineJoin = 'round';

	/* Mouse and touch events */
	
	document.getElementById('colorSwatch').addEventListener('click', function() {
		color = document.querySelector(':checked').getAttribute('data-color');
	}, false);
	
	var isTouchSupported = 'ontouchstart' in window;
	var isPointerSupported = navigator.pointerEnabled;
	var isMSPointerSupported =  navigator.msPointerEnabled;
	
	var downEvent = isTouchSupported ? 'touchstart' : (isPointerSupported ? 'pointerdown' : (isMSPointerSupported ? 'MSPointerDown' : 'mousedown'));
	var moveEvent = isTouchSupported ? 'touchmove' : (isPointerSupported ? 'pointermove' : (isMSPointerSupported ? 'MSPointerMove' : 'mousemove'));
	var upEvent = isTouchSupported ? 'touchend' : (isPointerSupported ? 'pointerup' : (isMSPointerSupported ? 'MSPointerUp' : 'mouseup'));
	 	  
	canvas.addEventListener(downEvent, startDraw, false);
	canvas.addEventListener(moveEvent, draw, false);
	canvas.addEventListener(upEvent, endDraw, false);

	/* PubNub */

	var channel = 'demo';

	var pubnub = PUBNUB.init({
		publish_key     : 'pub-c-156a6d5f-22bd-4a13-848d-b5b4d4b36695',
		subscribe_key   : 'sub-c-f762fb78-2724-11e4-a4df-02ee2ddab7fe',
		leave_on_unload : true
	});

	pubnub.subscribe({
		channel: channel,
		callback: drawFromStream
	});

	function publish(data) {
		pubnub.publish({
			channel: channel,
			message: data
		});
     }

    /* Draw on canvas */

	$('#clear').click(function() {
		ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
		var url = document.getElementById("drawCanvas").style.backgroundImage;
		publish({
	  		draw: {
	  			color: 'clear',
	  			plots: 'clear',
	  			background: url.substring(4, url.length-1)
	  		}
	  	});
	});

	$('#imglink').keypress(function(e) {
      if(e.keyCode == 13) {
        var url = $('#imglink').val().trim();
        document.getElementById('drawCanvas').style.background="url('" + url + "') no-repeat";
      }
      publish({
	  		draw: {
	  			color: '',
	  			plots: '',
	  			background: url
	  		}
	  	});
    });

    function drawOnCanvas(color, plots) {
    	ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(plots[0].x, plots[0].y);

    	for(var i=1; i<plots.length; i++) {
	    	ctx.lineTo(plots[i].x, plots[i].y);
	    }
	    ctx.stroke();
    }

    function drawFromStream(message) {
		if(!message) {
			return;
		}
		if (message.draw.background !== document.getElementById("drawCanvas").style.backgroundImage ){
			document.getElementById('drawCanvas').style.background="url('" + message.draw.background + "') no-repeat";
		}
		if (message.draw.plots.length < 1 || message.draw.color === '') {
			return;
		}
		if (message.draw.color === 'clear') {
			ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
		}
		else {
			drawOnCanvas(message.draw.color, message.draw.plots);
		}
    }
    
    var isActive = false;
    var plots = [];

	function draw(e) {
		e.preventDefault(); // prevent continuous touch event process e.g. scrolling!
	  	if(!isActive) return;

    	var x = isTouchSupported ? (e.targetTouches[0].pageX - canvas.offsetLeft) : (e.offsetX || e.layerX - canvas.offsetLeft);
    	var y = isTouchSupported ? (e.targetTouches[0].pageY - canvas.offsetTop) : (e.offsetY || e.layerY - canvas.offsetTop);

    	plots.push({x: (x << 0), y: (y << 0)}); // round numbers for touch screens

    	drawOnCanvas(color, plots);
	}
	
	function startDraw(e) {
	  	e.preventDefault();
	  	isActive = true;
	}
	
	function endDraw(e) {
	  	e.preventDefault();
	  	isActive = false;
		var url = document.getElementById("drawCanvas").style.backgroundImage;
	  
	  	publish({
	  		draw: {
	  			color: color,
	  			plots: plots,
	  			background: url.substring(4, url.length-1)
	  		}
	  	});

	  	plots = [];
	}
})();