"use strict";
define(['./detector'],function(detector) {
    var camera = (function() {
        var URL = window.URL || window.webkitURL;

        if (!URL.createObjectURL) {
            throw new Error("URL.createObjectURL not found.");
        }

        var getUserMedia = function(t, onsuccess, onerror) {
            var result = undefined;
            if (navigator.getUserMedia) {
                result = navigator.getUserMedia(t, onsuccess, onerror);
            } else if (navigator.webkitGetUserMedia) {
                result = navigator.webkitGetUserMedia(t, onsuccess, onerror);
            } else if (navigator.mozGetUserMedia) {
                result = navigator.mozGetUserMedia(t, onsuccess, onerror);
            } else if (navigator.msGetUserMedia) {
                result = navigator.msGetUserMedia(t, onsuccess, onerror);
            } else {
                onerror(new Error("No getUserMedia implementation found."));
            }
            return result;
        };

        var onGetUserMediaSuccess = function(stream) {
            var element = document.querySelector('video');
            var url = URL.createObjectURL(stream);
            element.src = url;
            element.play();
        }

        var onGetUserMediaError = function(error) {
            alert("Couldn't access webcam.");
            console.log(error);
        }

        var element = document.createElement('video');
        element.width = 640;
        element.height = 480;
        element.loop = true;
        element.volume = 0;
        element.autoplay = true;
        element.controls = true;
        var subsystemElement = document.getElementById("subsystem");
        subsystemElement.appendChild(element);

        getUserMedia(
            {'video': true},
            onGetUserMediaSuccess, onGetUserMediaError
        );

        var canvas = document.createElement('canvas');
        canvas.width = element.width;
        canvas.height = element.width*3/4;
        var context = canvas.getContext('2d');

        return {
            canvas: canvas,
            update: function() {
                context.drawImage(element, 0, 0);
            }
        }
    }());

    var createRealityView = function(canvas) {
        var camera = new THREE.Camera();
        var scene = new THREE.Scene();
        var texture = new THREE.Texture(canvas);
        var plane = new THREE.Mesh(
           new THREE.PlaneGeometry(2, 2, 0),
           new THREE.MeshBasicMaterial({map: texture})
        );
        plane.material.depthTest = false;
        plane.material.depthWrite = false;
        scene.add(plane);

        return {
            update: function() {
                texture.needsUpdate = true;
            },
            render: function( provider ) {
                provider.renderer.render(scene, camera);
            }
        }
    }

    var viewReality = createRealityView(camera.canvas);

    return {
        viewReality: viewReality,
        update: function(time) {
            camera.update();
            viewReality.update();
        },
        render: function(display) {
            viewReality.render( display );
        },
        canvas: camera.canvas
    }
});
