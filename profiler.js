"use strict";
define(['./detector'], function(detector) {
    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.zIndex = '1000';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild( stats.domElement );

    if(DEBUG) {
        var debugCanvas = document.createElement('canvas');
        debugCanvas.id = 'debugCanvas';
        debugCanvas.width = detector.getSize().width+1;
        debugCanvas.height = detector.getSize().height;
        document.getElementById("subsystem").appendChild(debugCanvas);
    }

    return {
        startSample: stats.begin,
        endSample: stats.end
    }
});
