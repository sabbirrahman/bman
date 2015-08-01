angular
	.module('ColorService', [])
	.factory('Color', function(){
		// Service Object
		return {
			showImg: function(imgId, canvasId, h, w, hideImg) {
    			var srcImg = document.getElementById(imgId);
    			var canvas  = document.getElementById(canvasId);
		        var context = canvas.getContext && canvas.getContext('2d');
    			hideImg = hideImg == undefined ? true : hideImg;
    			if(hideImg) srcImg.setAttribute("hidden", "");
    			context.clearRect (0, 0, h, w);
				context.drawImage(srcImg, 0, 0, h, w);
			},
			autoDetectColor: function(imgId) {
    			var srcImg = document.getElementById(imgId);
				var colorThief = new ColorThief();
				return colorThief.getColor(srcImg);
			},
			pickColorFromImg: function($event, canvasId, offsetLeft, offsetTop) {
				var canvas  = document.getElementById(canvasId);
		        var context = canvas.getContext && canvas.getContext('2d');
				
				// getting user coordinates
				offsetLeft = offsetLeft? offsetLeft : 0;
				offsetTop  = offsetTop ? offsetTop  : 0;
				var x = $event.pageX - (canvas.offsetLeft + offsetLeft);
				var y = $event.pageY - (canvas.offsetTop + offsetTop);
				
				// getting image data and RGB values
				var img_data = context.getImageData(x, y, 1, 1).data;
				var rgb = {
					r : img_data[0],
					g : img_data[1],
					b : img_data[2]
				};
				return rgb;
			}
		};
	});