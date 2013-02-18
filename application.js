"use strict";

requirejs(
    ['./settings',
    './display',
    './player',
    './augmented',
    './virtual',
    './video',
    './profiler',
    './earth'],

function(settings, display, player, augmented, virtual, video, profiler, earth) {
    console.log("IMPORTANT: Firefox Aurora users: set media.navigator.enabled to TRUE in about:config"); 

    var application = (function() {
        var times = [];
        var lastTime = 0;
        var updater = undefined;
        var renderer = undefined;

        var createRadioButton = function( group, value, onclick, checked ) {
            var result = document.createElement("span");
            var radio = document.createElement("input");
            radio.type = "radio";
            radio.id = "radio"+value;
            radio.name = group;
            radio.value = value;
            radio.checked = checked;
            radio.onclick = onclick;
            var label = document.createElement("label");
            label.for = radio.id;
            label.appendChild( document.createTextNode(value) );
            result.appendChild(radio);
            result.appendChild(label);

            return result;
        }

        var createDevelopmentControls = function() {
            var radioButtonVirtual = createRadioButton("mode","virtual", setVirtualMode, true );
            var radioButtonAugmented = createRadioButton("mode","augmented", setAugmentedMode, false );
            var radioButtonEarth = createRadioButton("mode","earth", setEarthMode, false );
            document.getElementById("controls").appendChild(radioButtonVirtual);
            document.getElementById("controls").appendChild(radioButtonAugmented);
            document.getElementById("controls").appendChild(radioButtonEarth);

            document.getElementById("raiseVirtualCamera").onclick = function(e) { virtual.addDeltaToCameraAltitude(-100); };
            document.getElementById("lowerVirtualCamera").onclick = function(e) { virtual.addDeltaToCameraAltitude(100); };
        }

        var currentMode = undefined;
        var changeMode = function( newMode ) {
            if( currentMode ) {
                currentMode.deactivate();
            }
            currentMode = newMode;
            newMode.activate();
        }

        var setAugmentedMode = function() {
            changeMode( augmented );
            updater = updateAugmented;
            renderer = renderAugmented;
            display.mouseListener = augmented;
        }

        var setVirtualMode = function() {
            changeMode( virtual );
            updater = updateVirtual;
            renderer = renderVirtual;
            display.mouseListener = virtual;
        }

        var setEarthMode = function() {
            changeMode( earth );
        }

        var updateAugmented =  function(time) {
            video.update(time);
            augmented.update(time);
        }

        var renderAugmented = function() {
            display.renderer.clear();
            video.render(display);
            augmented.render(display);
        }

        var updateVirtual = function(time) {
            virtual.update(time);
        }

        var renderVirtual = function() {
            display.renderer.clear();
            virtual.render(display);
        }

        var render = function() {
            renderer();
        }

        var update = function(time) {
            player.update(time);
            updater(time);
        }

        display.mouseListener = this;
        createDevelopmentControls();
        setVirtualMode();

        return {
            render: render,
            update: update,
        }
    }());

    var mainLoop = function(time) {
        requestAnimationFrame( mainLoop );
        profiler.startSample();
        application.update(time);
        application.render();
        profiler.endSample();
    }

    mainLoop();
});
