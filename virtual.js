define( ['./settings','./map','./player','./detector','./hud'], function(settings, map, player,detector,hud) {
    var createBaseModel = function() {
        var that = {};
        that.model = new THREE.Object3D();
        return that;
    }

    var mapContainer = createBaseModel();
    var mapCenter = {x:22, y:22};
    var zLevel = 350;
    var mapSprite =  map.createObject( 300, 300, 0, mapCenter, settings.worldSize.width, settings.worldSize.height, player.filter);
    mapSprite.model.position.set(0,0,0);
    mapContainer.model.position.set(0,0,zLevel);
    mapContainer.model.add(mapSprite.model);

    var playerPresent = false;
    var playerContainer = createBaseModel();
    var playerObject = player.createVirtualModel("virtual", mapSprite.tileWidth, mapSprite.tileHeight);
    playerObject.targetRotation = 0;
    playerContainer.model.position.set(0,0,zLevel);

    var createView = function() {
        var that = {};

        that.scene = new THREE.Scene();
        that.scene.add(mapContainer.model);
        that.scene.add(playerContainer.model);
        that.camera = new THREE.Camera();
        that.cameraAltitude = -600;
        var projection = detector.getCameraMatrix(10, 10000);
        that.camera.projectionMatrix.setFromArray(projection);
        that.light = new THREE.PointLight(0xffffff);
        that.light.position.set(0, 0, zLevel + 100);
        that.camera.position.set( 0, 0, that.cameraAltitude);
        that.scene.add(that.light);

        that.addPlayer = function() {
            playerContainer.model.add( playerObject );
            playerPresent = true;
        }

        that.removePlayer = function() {
            playerContainer.model.remove( playerObject );
            playerPresent = false;
        }

        var lookatPositionVector = new THREE.Vector3(0,0,0);
        var cameraPositionVector = new THREE.Vector3(0,0,0);

        var positionPlayer = function(time) {
            var position = mapSprite.computePosition(player.mapPosition.x, player.mapPosition.y );
            playerObject.position.x = position.x;
            playerObject.position.y = position.y;
            playerObject.position.z = position.z;
            playerObject.rotation.y = playerObject.rotation.y += (playerObject.targetRotation - playerObject.rotation.y)/8;
            playerObject.__dirtyPosition = true;
            playerObject.__dirtyRotation = true;
            playerObject.updateMatrixWorld();

            var position = mapSprite.computePosition(player.mapPosition.x, player.mapPosition.y );
            var center = playerContainer.model.localToWorld( new THREE.Vector3( position.x, position.y, position.z ) );
            lookatPositionVector.set( -center.x, -center.y, -zLevel+2*that.cameraAltitude);
            cameraPositionVector.set( 0, 0, that.cameraAltitude);
            that.camera.position = cameraPositionVector;
            that.camera.lookAt( lookatPositionVector );
        }

        that.update = function(time) {
            if( playerPresent ) {
                if( player.isExtracted ) {
                    that.removePlayer();
                    return;
                }
            }

            if( player.isExtracted ) {
                return;
            }

            if( !playerPresent ) {
                that.addPlayer();
            }

            positionPlayer();

        }

        that.render = function(provider) {
            provider.renderer.render(that.scene, that.camera);
            hud.positionTags(provider, that.camera);
        }

        that.onMouseMove = function(vector) {
            return;
        }

        that.onMouseDown = function(vector) {
            console.log(vector);
        }

        that.onMouseUp = function(vector) {
            console.log("mouse button up");
        }

        that.activate = function() {
            hud.addTag(playerObject, "character");
            mapSprite.activate();
        }

        that.deactivate = function() {
            hud.removeTag(playerObject);
            mapSprite.deactivate();
        }

        that.addDeltaToCameraAltitude = function(delta) {
            that.cameraAltitude += delta; 
            var shouldBeShadow = that.cameraAltitude >= 400;
            map.setShadowWorld( shouldBeShadow );
            playerObject.targetRotation = shouldBeShadow? Math.PI : 0;
        }
        // initialize the player inShadowWorld parameter
        that.addDeltaToCameraAltitude(0);

        return that;
    }

    var view = createView();
    view.addPlayer();

    return {
        onMouseMove: function(vector) {
            return;
        },
        onMouseDown: function(vector) {
            return;
        },
        onMouseUp: function(vector) {
            console.log("mouse button up");
        },
        update: function(time) {
            view.update(time);
        },
        render: function(display) {
            view.render( display );
        },
        addDeltaToCameraAltitude: view.addDeltaToCameraAltitude,
        view: view,
        activate: view.activate,
        deactivate: view.deactivate
    }
});
