"use strict";

define(function() {
    var factor = 1.5;
    var renderWindowSize = {
        width:960/factor,
        height:720/factor
    };

    return {
        factor:factor,
        renderWindowSize: renderWindowSize,
        renderAspectRatio: renderWindowSize.width/renderWindowSize.height,
        portalDepth: 36,
        portalSize: 100,
        worldSize: {width:60, height:60},
        warpHoleColumns: 11,
        warpHoleRows: 11,
        frameSize: 9.09,
        FLARThreshold: 64
    }
});
