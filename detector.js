"use strict";

define(['./settings','./video'],function(settings, video) {
    var raster = (function() {
        var size = {width:320, height:240};
        var canvas = document.createElement('canvas');
        canvas.width = size.width;
        canvas.height = size.height;
        var subsystemElement = document.getElementById("subsystem");
        subsystemElement.appendChild(canvas);

        var context = canvas.getContext('2d');
        context.font = "24px URW Gothic L, Arial, Sans-serif";

        var object = new NyARRgbRaster_Canvas2D(canvas);

        return {
            object: object,
            update: function(source) {
              context.drawImage(source, 0, 0, size.width, size.height);
              canvas.changed = true;
            }
        }

    }());


    var threshold = settings.FLARThreshold;
    var size = {width:320,height:240};
    var FLARParameters = new FLARParam(size.width, size.height);
    var FLARDetector = new FLARMultiIdMarkerDetector(FLARParameters, 120);
    FLARDetector.setContinueMode(true);

    THREE.Matrix4.prototype.setFromArray = function(m) {
        return this.set(
          m[0], m[4], m[8], m[12],
          m[1], m[5], m[9], m[13],
          m[2], m[6], m[10], m[14],
          m[3], m[7], m[11], m[15]
        );
    }

    function copyMatrix(mat, cm) {
        cm[0] = mat.m00;
        cm[1] = -mat.m10;
        cm[2] = mat.m20;
        cm[3] = 0;
        cm[4] = mat.m01;
        cm[5] = -mat.m11;
        cm[6] = mat.m21;
        cm[7] = 0;
        cm[8] = -mat.m02;
        cm[9] = mat.m12;
        cm[10] = -mat.m22;
        cm[11] = 0;
        cm[12] = mat.m03;
        cm[13] = -mat.m13;
        cm[14] = mat.m23;
        cm[15] = 1;
    }

    var convertArToGl = function(ar) {
        var result = new Float32Array(16);
        copyMatrix(ar,result);
        return result;
    }

    var getSize = function() {
        return size;
    }

    var detect = function() {
        return FLARDetector.detectMarkerLite(raster.object, threshold); 
    }

    var getMarkerNumber = function(idx) {
        var data = FLARDetector.getIdMarkerData(idx);
        if (data.packetLength > 4) {
            return -1;
        } 
        
        var result=0;
        for (var i = 0; i < data.packetLength; i++ ) {
            result = (result << 8) | data.getPacketData(i);
        }
        return result;
    }

    var getCameraMatrix = function(zNear, zFar) {
        var result = new Float32Array(16);
        FLARParameters.copyCameraMatrix(result, zNear, zFar);
        return result;
    }

    var getTransformMatrix = function(idx) {
        var resultMat = new NyARTransMatResult();
        FLARDetector.getTransformMatrix(idx, resultMat);
        return convertArToGl(resultMat);
    }

    var update = function() {
        raster.update( video.canvas );
    }       

    return {
        getMarkerNumber: getMarkerNumber,
        getTransformMatrix: getTransformMatrix,
        getCameraMatrix: getCameraMatrix,
        getSize: getSize,
        detect: detect,
        update: update,
    }
});
