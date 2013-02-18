"use strict";

define(["domReady!","./settings"], function(doc, settings) {
    var displayCanvas = document.getElementById("display");
    var renderer = new THREE.WebGLRenderer({canvas:displayCanvas});
    renderer.setSize(settings.renderWindowSize.width, settings.renderWindowSize.height);
    renderer.autoClear = false;

    var beginOccluderRendering = function() {
        renderer.context.colorMask( false, false, false, false );
        renderer.context.depthMask( true );
    }

    var endOccluderRendering = function() {
        renderer.context.colorMask( true, true, true, true );
    }

    var that = {
        mouseListener: undefined,
        beginOccluderRendering: beginOccluderRendering,
        endOccluderRendering: endOccluderRendering,
        renderer: renderer,
    }

    var getEventPosition = function( event ) {
        var Ax = event.pageX - renderer.domElement.offsetLeft;
        var Ay = event.pageY + renderer.domElement.offsetTop - 25;
        var x = ( Ax / renderer.domElement.width ) * 2 - 1;
        var y = - ( Ay / renderer.domElement.height ) * 2 + 1;
        return new THREE.Vector3( x, y, 1.0 );
    }

    var onDocumentMouseMove = function(event) {
        event.preventDefault();
        that.mouseListener.onMouseMove.apply(that.mouseListener,[getEventPosition(event)]);
    }

    var onDocumentMouseDown = function(event) {
        event.preventDefault();
        that.mouseListener.onMouseDown.apply(that.mouseListener,[getEventPosition(event)]);
    }

    var onDocumentMouseUp = function(event) {
        event.preventDefault();
        that.mouseListener.onMouseUp.apply(that.mouseListener,[getEventPosition(event)]);
    }

    renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
    renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

    that.toScreenXY = function(position, camera) {
        var width = displayCanvas.width, height = displayCanvas.height;
        var widthHalf = width / 2, heightHalf = height / 2;

        var projector = new THREE.Projector();
        var vector = projector.projectVector( position.clone(), camera );

        vector.x = ( vector.x * widthHalf ) + widthHalf;
        vector.y = - ( vector.y * heightHalf ) + heightHalf;
        return vector;
    }

    return that;
});
