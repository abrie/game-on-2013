"use strict";
define(['./settings', './map', './player', './detector','./virtual',"./inventory","./hud"],
function(settings,map,player,detector,virtual, inventory, hud) {

    var createBaseModel = function() {
        var that = {};
        that.model = new THREE.Object3D();
        that.model.matrixAutoUpdate = false;
        that.transform = function(matrix) {
            that.model.matrix.setFromArray( matrix );
            that.model.matrixWorldNeedsUpdate = true;
        }
        return that;
    }

    var createFrameModel = function() {

        var generateFrameComponents = function(portalSize, frameSize, portalDepth, frameColor, emissive ) {

            var generateFrameComponent = function(params) {
                var material = emissive ?
                    new THREE.MeshLambertMaterial( {color:frameColor, emissive:frameColor, side:THREE.DoubleSide} ) :
                    new THREE.MeshLambertMaterial( {color:frameColor, side:THREE.DoubleSide} );

                var mesh = new THREE.Mesh(
                    new THREE.CubeGeometry( params.width, params.height, params.depth ),
                    material
                );
                mesh.position.set( params.x, params.y, params.z );
                return mesh;
            }

            var result = {};
            result.top = generateFrameComponent( {
                width:portalSize+frameSize,
                height:frameSize,
                depth:portalDepth,
                x:0,
                y:portalSize/2+frameSize/2,
                z:portalDepth/2
            });

            result.right = generateFrameComponent( {
                width:frameSize,
                height:portalSize+2*frameSize,
                depth:portalDepth,
                x:portalSize/2+frameSize/2,
                y:0,
                z:portalDepth/2
            });

            result.left = generateFrameComponent( {
                width:frameSize,
                height:portalSize+2*frameSize,
                depth:portalDepth,
                x:-portalSize/2-frameSize/2,
                y:0,
                z:portalDepth/2
            });

            result.bottom = generateFrameComponent( {
                width:portalSize+frameSize,
                height:frameSize,
                depth:portalDepth,
                x:0,
                y:-portalSize/2-frameSize/2,
                z:portalDepth/2
            });

            return result;
        }

        var components = generateFrameComponents(settings.portalSize, settings.frameSize, settings.portalDepth,0xf0ff00, false );
        var selectorComponents = generateFrameComponents( settings.portalSize*1.3, settings.frameSize/2, 0.25, 0xFFFF00, true );
        var button = new THREE.Object3D();
        button.add( selectorComponents.top );
        button.add( selectorComponents.bottom );
        button.add( selectorComponents.right );
        button.add( selectorComponents.left );
        button.position.set(
            0,
            0,
            -1);
        button.name = "button";
        button.visible = false;

        var back = new THREE.Mesh(
            new THREE.PlaneGeometry( settings.portalSize, settings.portalSize ),
            new THREE.MeshLambertMaterial( {color:0x111111, side:THREE.DoubleSide} ) 
        );
        back.position.set(0,0,settings.portalDepth+0.1);

        var hitbox = new THREE.Mesh(
            new THREE.PlaneGeometry( settings.portalSize, settings.portalSize ),
            new THREE.MeshLambertMaterial( {transparent:true, opacity:0.0, color:0xFFFFFF, side:THREE.DoubleSide} ) 
        );
        hitbox.position.set(0,0,0);

        var that = createBaseModel();
        that.model.add(components.top);
        that.model.add(components.bottom);
        that.model.add(components.left);
        that.model.add(components.right);
        that.model.add(back);
        that.model.add(hitbox);
        that.model.add(button);
        that.hitbox = hitbox;

        return that;
    }

    var createOccluderModel = function() {
        var gap = 0.5;
        var generateComponent = function(params) {
            var mesh = new THREE.Mesh(
                new THREE.PlaneGeometry( params.width, params.height ),
                new THREE.MeshLambertMaterial( {color:0xf0ff00, side:THREE.DoubleSide} )
            );
            mesh.position.set( params.x, params.y, params.z );
            mesh.rotation.y = params.ry;
            mesh.rotation.x = params.rx;
            return mesh;
        }

        var top = generateComponent( {
            width:settings.portalSize+2*(settings.frameSize+gap),
            height:settings.portalDepth,
            x:0,
            y:settings.portalSize/2+settings.frameSize+gap,
            z:settings.portalDepth/2,
            ry:0,
            rx:Math.PI/2
        });

        var bottom = generateComponent( {
            width:settings.portalSize+2*(settings.frameSize+gap),
            height:settings.portalDepth,
            x:0,
            y:-(settings.portalSize/2+settings.frameSize+gap),
            z:settings.portalDepth/2,
            ry:0,
            rx:Math.PI/2
        });

        var right = generateComponent( {
            width:settings.portalDepth,
            height:settings.portalSize+2*(settings.frameSize+gap),
            x:settings.portalSize/2+settings.frameSize+gap,
            y:0,
            z:settings.portalDepth/2,
            ry:Math.PI/2,
            rx:0
        });

        var left = generateComponent( {
            width:settings.portalDepth,
            height:settings.portalSize+2*(settings.frameSize+gap),
            x:-(settings.portalSize/2+settings.frameSize+gap),
            y:0,
            z:settings.portalDepth/2,
            ry:Math.PI/2,
            rx:0
        });

        var that = createBaseModel();
        that.model.add(top);
        that.model.add(bottom);
        that.model.add(left);
        that.model.add(right);

        return that;
    }


    var createWarpHole = function(portalWidth,portalHeight,id) {
        var that = {};
        that.id = id;
        that.frame = createFrameModel();
        that.occluder = createOccluderModel();
        that.mapContainer = createBaseModel();
        var mapObject = map.createObject( portalWidth, portalHeight, settings.portalDepth, map.WarpHolePoints[id], settings.warpHoleColumns, settings.warpHoleRows, player.filter );
        that.mapContainer.model.add( mapObject.model );
        mapObject.activate();
        var playerPresent = false;
        that.playerContainer = createBaseModel();
        var playerObject = player.createVirtualModel("warphole"+id, mapObject.tileWidth, mapObject.tileHeight);

        that.transform = function(matrix) {
            that.mapContainer.transform(matrix);
            that.frame.transform(matrix);
            that.playerContainer.transform(matrix);
            that.occluder.transform(matrix);
        }

        that.intersectsRay = function(raycaster) {
            var hits = raycaster.intersectObject( that.frame.hitbox );
            return(hits.length > 0); 
        }

        that.setHighlight = function( state ) {
            var obj = that.frame.model.getChildByName("button",true);
            obj.traverse( function(obj) { obj.visible = state; } );
        }

        var positionPlayer = function() {
            if( !playerPresent ) {
                return;
            }

            var position = mapObject.computePosition(player.mapPosition.x, player.mapPosition.y );
            playerObject.position.x = position.x;
            playerObject.position.y = position.y;
            playerObject.position.z = position.z;
            playerObject.__dirtyPosition = true;
            playerObject.updateMatrixWorld();
        }

        var insertPlayer = function() {
            addPlayer();
            player.setMapPosition( map.WarpHolePoints[that.id] );
        }

        var insertItem = function(item) {
           map.setItem( map.WarpHolePoints[that.id], item ); 
           map.reRenderItems();
        }

        var addPlayer = function() {
            that.playerContainer.model.add( playerObject );
            playerPresent = true;
        }

        var removePlayer = function() {
            that.playerContainer.model.remove( playerObject );
            playerPresent = false;
        }

        that.update = function(time) {
            if( playerPresent ) {
                if( player.isExtracted ) {
                    removePlayer();
                    return;
                }
                if( !that.containsPlayerMapPosition() ) {
                    removePlayer();
                    return;
                }
            }

            if( player.isExtracted ) {
                return;
            }

            if( !playerPresent && that.containsPlayerMapPosition() ) {
                addPlayer();
            }

            positionPlayer();
        }

        that.close = function() {
            playerObject.close();
            mapObject.close();
        }

        that.containsPlayerMapPosition = function() {
            return mapObject.containsPoint(player.mapPosition);
        }

        that.insertPlayer = insertPlayer;
        that.removePlayer = removePlayer;
        that.insertItem = insertItem;

        return that;
    };

    var createShelfItem = function(item, model) {
        var hitbox = model.getChildByName("hitbox");
        var selectionBox = model.getChildByName("selectionBox");
        var intersectsRay = function(raycaster) {
            var hits = raycaster.intersectObject( hitbox );
            return(hits.length > 0); 
        }

        var setSelected = function(state) {
            selectionBox.visible = state;
        }

        var isSelected = function() {
            return selectionBox.visible;
        }

        setSelected(false);

        var that = {
            item: item,
            model: model,
            setSelected: setSelected,
            isSelected: isSelected,
            intersectsRay: intersectsRay
        }

        return that;
    };

    var createView = function() {
        var scene = new THREE.Scene();
        var occlusionScene = new THREE.Scene();
        var extractedPlayerSize = 10;
        var camera = new THREE.Camera();
        var projection = detector.getCameraMatrix(10, 10000);
        camera.projectionMatrix.setFromArray(projection);
        var shelfItems = [];
        var playerPresent = false;
        var playerObject = player.createAugmentedModel("extracted", extractedPlayerSize, extractedPlayerSize);

        var spaceSuitInventoryItem = inventory.getItem(3);
        var spaceSuitObject = player.createInventoryModel( spaceSuitInventoryItem, extractedPlayerSize, extractedPlayerSize);
        var spaceSuitItem = createShelfItem( spaceSuitInventoryItem, spaceSuitObject );

        var taggedItems = [];
        var addShelfItem = function( item ) {
            shelfItems.push( item );
            taggedItems.push(item.model);
            scene.add( item.model );
        }

        var removeShelfItem = function( item ) {
            shelfItems = shelfItems.filter( function(i) { i !== item } );
            taggedItems = taggedItems.filter( function(taggedItem) {
                if(taggedItem.name == item.model.name) {
                    hud.removeTag(taggedItem);
                    return false;
                }
                return true;
            });
            scene.remove( item.model );
        }

        addShelfItem( spaceSuitItem ); 

        var positionPlayer = function() {
            if( !playerPresent ) {
                return;
            }

            var position = new THREE.Vector3(0,-35+4.5/2+extractedPlayerSize/2,250);
            playerObject.position.x = position.x;
            playerObject.position.y = position.y;
            playerObject.position.z = position.z;
            playerObject.rotation.y += Math.PI/360;
            playerObject.__dirtyPosition = true;
            playerObject.updateMatrixWorld();
        }

        var positionInventory = function() {
            var position = new THREE.Vector3(3*extractedPlayerSize,-35+4.5/2+extractedPlayerSize/2,250);
            spaceSuitObject.position.x = position.x;
            spaceSuitObject.position.y = position.y;
            spaceSuitObject.position.z = position.z;
            spaceSuitObject.rotation.y += Math.PI/360;
            spaceSuitObject.__dirtyPosition = true;
            spaceSuitObject.updateMatrixWorld();
        }

        var addPlayer = function() {
            scene.add(playerObject);
            playerPresent = true;
            player.isExtracted = true;
        }

        var removePlayer = function() {
            scene.remove(playerObject);
            playerPresent = false;
            player.isExtracted = false;
        }

        var extractOrInsertInto = function(warpHole) {
            shelfItems.forEach( function(shelfItem) {
                if(shelfItem.isSelected()) {
                    warpHole.insertItem(shelfItem.item);
                    removeShelfItem(shelfItem);
                }
            });
            if( playerPresent && player.isWearingSpaceSuit() ) {
                warpHole.insertPlayer();
                removePlayer();
            }
            else if( warpHole.containsPlayerMapPosition() && player.isWearingSpaceSuit() ){
                warpHole.removePlayer();
                addPlayer();
            }
        }

        var createShelf = function() {
            var mesh = new THREE.Mesh(
                new THREE.CubeGeometry( 100, 2.5, 50 ),
                new THREE.MeshLambertMaterial( {color:0x00ff00, side:THREE.DoubleSide} )
            );
            return mesh;
        }

        var shelf = createShelf();
        shelf.position.set(0,-35,250);
        scene.add(shelf);

        var light = new THREE.PointLight(0xcccccc);
        light.position.set(0, -1000, 5000);
        scene.add(light);

        var warpHoles = {};
        var projector = new THREE.Projector();

        var smoothMatrix = function(update, accumulated, elapsedTime) {
            var smoothing = 3;       
            for(var i=0; i < update.length; i++) {
                accumulated[i] += ( update[i] - accumulated[i] ) / ( smoothing );
            }
            return accumulated;
        }

        var detectWarpholes = function(time) {
            var detected = detector.detect();
            for (var idx = 0; idx<detected; idx++) {
                var number = detector.getMarkerNumber(idx);
                var warpHole = warpHoles[number];
                var transformMatrix = detector.getTransformMatrix(idx);
                if(!warpHole) {
                    warpHole = createWarpHole(100,100,number);
                    warpHole.filtered = new Float32Array(16);
                    warpHole.filtered.set( transformMatrix );
                    addWarpHole( warpHole );
                }
                warpHole.age = 0;
                warpHole.transformMatrix = transformMatrix;
            }

            for (var i in warpHoles) {
                var warpHole = warpHoles[i];
                if (warpHole.age > 1) {
                    removeWarpHole(warpHole);
                }
                else {
                    warpHole.age++;
                    var matrix = smoothMatrix( warpHole.transformMatrix, warpHole.filtered, time);
                    warpHole.update(time);
                    warpHole.transform(matrix);
                }
            }
        }

        var addWarpHole = function(warpHole) {
            warpHoles[warpHole.id] = warpHole;
            scene.add(warpHole.frame.model);
            scene.add(warpHole.mapContainer.model);
            scene.add(warpHole.playerContainer.model);
            occlusionScene.add(warpHole.occluder.model);
        }

        var removeWarpHole = function(warpHole) {
            warpHole.close();
            scene.remove(warpHole.frame.model);
            scene.remove(warpHole.mapContainer.model);
            scene.remove(warpHole.playerContainer.model);
            occlusionScene.remove(warpHole.occluder.model);
            delete warpHoles[warpHole.id];
        }

        var checkHoverIntersection = function(mv) {
            var vector = mv.clone();
            projector.unprojectVector( vector, camera );
            var raycaster = new THREE.Raycaster(
                camera.position,
                vector.sub( camera.position ).normalize());
            for( var i in warpHoles ) {
                var warpHole = warpHoles[i];
                var hits = warpHole.intersectsRay( raycaster );
                warpHole.setHighlight( hits );
            }
        };

        return {
            checkIntersection: function(vector) {
                projector.unprojectVector( vector, camera );
                var raycaster = new THREE.Raycaster(
                    camera.position,
                    vector.sub( camera.position ).normalize());
                for( var i in warpHoles ) {
                    var warpHole = warpHoles[i];
                    if( warpHole.intersectsRay( raycaster ) )
                    {
                        extractOrInsertInto(warpHole);
                    }
                };
                shelfItems.forEach( function(shelfItem) {
                    shelfItem.setSelected( shelfItem.intersectsRay( raycaster ) );
                });
            },
            addPlayer: addPlayer,
            removePlayer: removePlayer,
            update: function(time) {
                positionPlayer();
                positionInventory();
                detector.update();
                detectWarpholes(time);
                checkHoverIntersection(mouseVector);
            },
            render: function(provider) {
                provider.beginOccluderRendering();
                provider.renderer.render(occlusionScene, camera);
                provider.endOccluderRendering();
                provider.renderer.render(scene, camera);
                hud.positionTags(provider, camera);
            },
            activate: function() {
                taggedItems.forEach( function(itemMesh) {
                    hud.addTag(itemMesh, itemMesh.description);
                });
            },
            deactivate: function() {
                taggedItems.forEach( function(itemMesh) {
                    hud.removeTag(itemMesh);
                });
            }
        }
    };

    var view = createView();
    var mouseVector = new THREE.Vector3(0,0,0);

    return {
        onMouseMove: function(vector) {
            mouseVector = vector;
        },
        onMouseDown: function(vector) {
            view.checkIntersection(vector);
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
        activate: view.activate,
        deactivate: view.deactivate
    }
});
