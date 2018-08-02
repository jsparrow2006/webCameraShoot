'use strict';

class WebCamShoot {
    constructor(parentBlock, defaultWidth, defaultHeigth) {
        this.parent = parentBlock;
        this.cameraWidth = defaultWidth;
        this.cameraHeigth = defaultHeigth;
        console.log(this.cameraWidth)
        console.log(this.cameraHeigth)
        this.renderCamera()
        this.camera = document.getElementsByName('camera');
        this.frame = document.getElementsByClassName('mainFrame');
        this.info = document.getElementsByName('info');
        this.vid = document.getElementById('vid');
        this.cam = document.getElementById('cam');
        this.canvas = document.querySelector('#canvas');
        let scale = 1;
        this.brigtness = 1;
        this.contrast = 1;
        this.isSettings = false;

        cam.addEventListener( "contextmenu", this.settings.bind(this), false);
        cam.addEventListener("click", this.shootPhoto, false);
        vid.addEventListener("mousemove", this.movieCamera.bind(this), false);
        this.addOnWheel(this.cam, function(e) {
            let delta = e.deltaY || e.detail || e.wheelDelta;
            if (delta > 0) scale -= 0.05;
            else scale += 0.05;

            if (scale <= 0.6){scale = 0.6};
            if (scale >= 1.2){scale = 1.2};
            console.log(scale)
            console.log('W = ' + defaultWidth * scale)
            console.log('H = ' + defaultHeigth * scale)
            // cam.style.transform = cam.style.WebkitTransform = cam.style.MsTransform = 'scale(' + scale + ')';

            cam.style.width = Math.floor(defaultWidth * scale) + 'px';
            cam.style.height = Math.floor(defaultHeigth * scale) + 'px';
            cam.style.left = e.pageX - vid.offsetLeft - cam.offsetWidth / 2 + 'px';
            cam.style.top = e.pageY - vid.offsetTop - cam.offsetHeight / 2 + 'px';
            e.preventDefault();
        });
        this.startVideo();

    }

    renderCamera() {
        this.parent.innerHTML = `
        <video autoplay id="video" style="display:none;"></video>
        <div id="crop">
            <div id="mainFrame">
                <div id="vid" class="video">
                    <canvas id="canvas" width="640" height="400" style="border:1px solid #d3d3d3;"></canvas><br>
                    <div id="cam"></div>
                </div>
            </div>
            <div id="bottomPanel">
                <div id="gallery">
                </div>
            </div>
        </div>
        `;
    }

    addOnWheel(elem, handler) {
        if (elem.addEventListener) {
            if ('onwheel' in document) {
                // IE9+, FF17+
                elem.addEventListener("wheel", handler);
            } else if ('onmousewheel' in document) {
                // устаревший вариант события
                elem.addEventListener("mousewheel", handler);
            } else {
                // 3.5 <= Firefox < 17, более старое событие DOMMouseScroll пропустим
                elem.addEventListener("MozMousePixelScroll", handler);
            }
        } else { // IE8-
            cam.attachEvent("onmousewheel", handler);
        }
    }

    startVideo() {
        let video = document.querySelector("#video"),
            ctx = canvas.getContext('2d'),
            localMediaStream = null,
            onCameraFail = function (e) {
                console.log('Camera did not work.', e);
            };
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        window.URL = window.URL || window.webkitURL;
        navigator.getUserMedia({video: true}, function(stream) {
            video.src = window.URL.createObjectURL(stream);
            localMediaStream = stream;
        }, onCameraFail);

        let cameraInterval = setInterval(function(){
            if(localMediaStream){
                ctx.drawImage(video, 0, 0);
            }}, 1);
    }

    shootPhoto() {
        console.log('SHOOT');
        console.log('camX = ' + cam.offsetLeft);
        console.log('camY = ' + cam.offsetTop);
        console.log('camW = ' + cam.offsetWidth );
        console.log('camH = ' + cam.offsetHeight);
        let tempCanvas = document.createElement('canvas');
        tempCanvas.setAttribute('width', 243);
        tempCanvas.setAttribute('height', 325);
        let tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, cam.offsetLeft, cam.offsetTop, cam.offsetWidth, cam.offsetHeight, 0, 0, 243, 325);
        let photoQualityFull = tempCanvas.toDataURL('image/jpeg', 1.0);
        let gallery = document.getElementById('gallery');
        let newPhoto = document.createElement('img');
        newPhoto.setAttribute('class', 'previewImg');
        newPhoto.setAttribute('src', photoQualityFull);
        gallery.appendChild(newPhoto);
    }

    settings(e){
        e.preventDefault();
        console.log('SETTINGS')
        this.isSettings = true
    }

    movieCamera(e){
        if (!this.isSettings) {
            console.log(this.isSettings)
            cam.style.left = e.pageX - vid.offsetLeft - cam.offsetWidth / 2 + 'px';
            cam.style.top = e.pageY - vid.offsetTop - cam.offsetHeight / 2 + 'px';
        }
    }
}
