'use strict';

class WebCamShoot {
    constructor(parentBlock, defaultWidth, defaultHeigth, getPhotoFunc) {
        this.parent = parentBlock;
        this.cameraWidth = defaultWidth;
        this.cameraHeigth = defaultHeigth;
        console.log(this.cameraWidth)
        console.log(this.cameraHeigth)
        this.renderCamera()
        this.camera = document.getElementsByName('camera');
        this.mainFrame = document.getElementsByClassName('mainFrame');
        this.info = document.getElementsByName('info');
        this.vid = document.getElementById('vid');
        this.cam = document.getElementById('cam');
        this.canvas = document.querySelector('#canvas');
        this.mainCtx = this.canvas.getContext('2d')
        this.modeEdit = false;
        let scale = 1;
        this.brightness = 1;
        this.contrast = 1;
        this.isSettings = false;
        this.userPhoto = {
            id: -1,
            imgData:''
        };
        this.editablePhoto = {
            data: '',
            width: 0,
            height: 0,
            sX: 0,
            Sy: 0
        }
        this.selectedPhoto = '';
        this.isCameraConnected = false;
        this.getPhoto = getPhotoFunc;

        let cameraConnect = setInterval(function () {
            if (!this.isCameraConnected) {
                this.vid.classList.add('noCamera');
                this.startVideo();
            } else {
                this.vid.classList.remove('noCamera')
            }
        }.bind(this), 1);

        cam.addEventListener("contextmenu", this.settings.bind(this), false);
        cam.addEventListener("click", this.shootPhoto.bind(this), false);
        vid.addEventListener("mousemove", this.movieCamera.bind(this), false);
        this.addOnWheel(this.cam, function (e) {
            let delta = e.deltaY || e.detail || e.wheelDelta;
            if (delta > 0) scale -= 0.05;
            else scale += 0.05;

            if (scale <= 0.6) {
                scale = 0.6
            }
            if (scale >= 1.2) {
                scale = 1.2
            }
            console.log(scale)
            console.log('W = ' + defaultWidth * scale)
            console.log('H = ' + defaultHeigth * scale)
            // cam.style.transform = cam.style.WebkitTransform = cam.style.MsTransform = 'scale(' + scale + ')';

            cam.style.width = Math.floor(defaultWidth * scale) + 'px';
            cam.style.height = Math.floor(defaultHeigth * scale) + 'px';
            cam.style.left = e.pageX - vid.getBoundingClientRect().left - cam.offsetWidth / 2 + 'px';
            cam.style.top = e.pageY - this.parent.offsetTop - cam.offsetHeight + 10 + 'px';
            e.preventDefault();
        });

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
        console.log('Start camera!')
        let video = document.querySelector("#video"),
            ctx = canvas.getContext('2d'),
            localMediaStream = null,
            onCameraFail = function (e) {
                this.isCameraConnected = false;
            };
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        window.URL = window.URL || window.webkitURL;
        this.isCameraConnected = true;
        navigator.getUserMedia({video: true}, function (stream) {
            //
            video.src = window.URL.createObjectURL(stream);
            localMediaStream = stream;
        }.bind(this), onCameraFail.bind(this));
        let cameraInterval = setInterval(function () {
            if (localMediaStream || this.modeEdit) {
                ctx.filter = `brightness(${this.brightness * 100}%) contrast(${this.contrast * 100}%)`;
                if (!this.modeEdit) {
                    ctx.drawImage(video, 0, 0);
                } else {
                    ctx.drawImage(this.editablePhoto.data, this.editablePhoto.sX, this.editablePhoto.sY, this.editablePhoto.width, this.editablePhoto.height);
                }
            }
        }.bind(this), 1);
    }

    shootPhoto() {
        if (!this.isSettings) {

            console.log('SHOOT');
            console.log('camX = ' + cam.offsetLeft);
            console.log('camY = ' + cam.offsetTop);
            console.log('camW = ' + cam.offsetWidth);
            console.log('camH = ' + cam.offsetHeight);

            let tempCanvas = document.createElement('canvas');
            tempCanvas.setAttribute('width', 243);
            tempCanvas.setAttribute('height', 325);
            let tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(canvas, cam.offsetLeft, cam.offsetTop, cam.offsetWidth, cam.offsetHeight, 0, 0, 243, 325);
            let photoQualityFull = tempCanvas.toDataURL('image/jpeg', 1.0);
            this.userPhoto.imgData = photoQualityFull;
            let gallery = document.getElementById('gallery');
            gallery.innerHTML = gallery.innerHTML + `
                    <div class="tumbnail">
                    <img class="previewImg" src="${photoQualityFull}" alt="">
                    <div class="tumbPanel" onclick="this.getPhoto(this.parentElement.getElementsByClassName('previewImg')[0].src)"></div>
                </div>`
        }
    }

    settings(e) {
        e.preventDefault();
        this.isSettings = !this.isSettings;
        console.log('SETTINGS MODE = ' + this.isSettings);
        if (this.isSettings) {
            this.cam.innerHTML = `
            <div id="settings">
                <div id="headerSettings">
                    Параметры цвета:
                </div>
                <div id="panelSettings">
                    <div class="wraperRange">
                        <span>Яркость:</span>
                        <input id="camBrightness" type="range" min="0" max="2" step="0.1" value="${this.brightness}">
                    </div>
                    <div class="wraperRange">
                         <span>Контрастность:</span>
                         <input id="camContrast" type="range" min="0" max="2" step="0.1" value="${this.contrast}">
                    </div>
                </div>
            </div>
            `;
            let brightness = document.getElementById('camBrightness');
            let contrast = document.getElementById('camContrast');
            brightness.addEventListener("input", function() {
                this.brightness = brightness.value;
                console.log('Brightnes = ' + this.brightness * 100 + '%');
            }.bind(this), false);
            contrast.addEventListener("input", function() {
                this.contrast = contrast.value;
                console.log('Contrast = ' + this.contrast * 100 + '%');
            }.bind(this), false);
        } else {
            this.cam.innerHTML = '';
        }
    }

    movieCamera(e) {
        if (!this.isSettings) {
            console.log(this.parent.offsetTop)
            cam.style.left = e.pageX - vid.getBoundingClientRect().left - cam.offsetWidth / 2 + 'px';
            cam.style.top = e.pageY - this.parent.offsetTop - cam.offsetHeight + 10 + 'px';
        }
    }

    newPhoto(id){
        this.modeEdit = false;
        this.userPhoto.id = id;
        this.selectedPhoto = '';
        document.getElementById('gallery').innerHTML = '';
    }

    editPhoto(id, imgUrl){
        this.modeEdit = true;
        this.userPhoto.id = id;
        document.getElementById('gallery').innerHTML = '';
        this.selectedPhoto = '';
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            console.log(`Load image ${imgUrl} width =  ${img.width} height = ${img.height}`)
            this.mainCtx.clearRect(0,0,640,400);
            this.editablePhoto.data = img;
            if (img.width > img.height){
                let resize = 640 / img.width;
                this.editablePhoto.width = img.width * resize;
                this.editablePhoto.height = img.height * resize;
                this.editablePhoto.sX = 0;
                this.editablePhoto.sY = (400 - (img.height * resize)) / 2
            } else {
                let resize = 400 / img.height;
                this.editablePhoto.width = img.width * resize;
                this.editablePhoto.height = img.height * resize;
                this.editablePhoto.sX = (640 - (img.width * resize)) / 2;
                this.editablePhoto.sY = 0;
            }
        }.bind(this);
        img.src = imgUrl;
    }

    // getPhoto(){
    //     if(this.userPhoto.id !== -1){
    //         return this.userPhoto;
    //     }
    // }
}
