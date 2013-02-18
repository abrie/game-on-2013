define(['./map','./input','./kit'], function(map,input,kit) {
    var playerObjects = (function(){
        var list = [];
        var add = function(obj) {
            list.push(obj);
        }

        var remove = function(obj) {
            list = list.filter( function(object) {
                return object.name !== obj.name;
            });
        }

        var rerender = function() {
            list.forEach( function(object) {
                object.remove( object.getChildByName("redfilter") );
                object.remove( object.getChildByName("spacesuit") );
                object.remove( object.getChildByName("core") );
                object.add( createPlayerBaseMesh() );
                if( isWearingSpaceSuit ) {
                    object.add( createSpaceSuitModel() );
                }
                if( filterStack.indexOf("red") >= 0 ) {
                    object.add( createRedfilterModel() );
                }
            });
        }

        return {
            add:add,
            remove:remove,
            rerender: rerender
        }
    }());

    var createRedfilterModel = function() {
        var filterMesh = new THREE.Mesh(
            new THREE.CubeGeometry( 1, 0.1, 50 ),
            new THREE.MeshLambertMaterial( {color:0xFF0000, side:THREE.DoubleSide} )
        );
        filterMesh.position.set(0,0.33, -25 );
        filterMesh.name = "redfilter";
        return filterMesh;
    };
    
    var createHitbox = function() {
        var material = new THREE.MeshLambertMaterial( {
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            side:THREE.DoubleSide
        });

        var hitbox = new THREE.Mesh(
            new THREE.CubeGeometry( 1.2, 1.2, 200 ),
            material
        );
        hitbox.name = "hitbox";
        return hitbox
    }

    var createSelectionBox = function() {
        var material = new THREE.MeshLambertMaterial( {
            color: 0xffff00,
            wireframe: true,
        });

        var selectionBox = new THREE.Mesh(
            new THREE.CubeGeometry( 1.4, 1.4, 300 ),
            material
        );
        selectionBox.name = "selectionBox";
        return selectionBox
    }

    var createSpaceSuitModel = function() {
        var glass = new THREE.MeshLambertMaterial( {
            color: 0xffffff,
            opacity: 0.3,
            transparent: true,
            emissive: 0xffffff,
            side:THREE.DoubleSide
        });

        var suitMesh = new THREE.Mesh(
            new THREE.CubeGeometry( 1.2, 1.2, 200 ),
            glass
        );
        suitMesh.name = "spacesuit";
        return suitMesh;
    };

    var createPlayerBaseMesh = function() {
        var playerMesh = new THREE.Mesh(
            new THREE.CubeGeometry( 1, 1, 1 ),
            new THREE.MeshLambertMaterial( {color:0x00ff00, emissive:0x00FF00, side:THREE.DoubleSide} )
        );
        playerMesh.name = "core";
        return playerMesh;
    };

    var createPlayerModel = function(name, width, height) {
        var playerObject = new THREE.Object3D();
        playerObject.add( createPlayerBaseMesh() );
        if( isWearingSpaceSuit ) {
            playerObject.add( createSpaceSuitModel() );
        }
        if( filterStack.indexOf("red") >= 0 ) {
            playerObject.add( createRedfilterModel() );
        }
        playerObject.scale.set(width,height,0.01);
        playerObject.name = "player_"+name;
        playerObjects.add(playerObject);
        playerObject.close = function() { playerObjects.remove(playerObject); }
        return playerObject;
    };

    var createInventoryModel = function(item, width, height) {
        var inventoryObject = new THREE.Object3D();
        inventoryObject.add( createHitbox() );
        inventoryObject.add( createSelectionBox() );
        if( item.name === "spacesuit" ) {
            inventoryObject.add( createSpaceSuitModel() );
            inventoryObject.description = "spacesuit";
        }
        inventoryObject.scale.set(width,height,0.01);
        inventoryObject.name = "inventory_"+name;
        return inventoryObject;
    }

    var filterStack = ["eye"];
    var inventory = [];
    var isWearingSpaceSuit = false;

    var redFilterToggled = function(state) {
        filterStack = state === true ? ["eye","red"] : ["eye"]
        playerObjects.rerender();
        map.applyFilterToMapObjects(filterStack);
    }

    var spaceSuitToggled = function(state) {
        console.log("spacesuit:",state);
        isWearingSpaceSuit = state;
        playerObjects.rerender();
    }

    var addInventory = function(item) {
        inventory.push(item);
        console.log("item added to inventory:",item.name);
        if( item.name === "redfilter" ) {
            kit.addToggle("redfilter", false, redFilterToggled);
        }
        if( item.name === "spacesuit") {
            kit.addToggle("spacesuit", false, spaceSuitToggled);
        }
    }

    var that = {
        mapPosition:{x:26,y:32},
        isExtracted: false,
        firePlayAction: function(action) {
            if( that.isExtracted ) {
                return;
            }

            var newPosition = {x:that.mapPosition.x,y:that.mapPosition.y};
            switch(action) {
                case "RIGHT": newPosition.x+=1; break;
                case "LEFT": newPosition.x-=1; break;
                case "UP": newPosition.y+=1; break;
                case "DOWN": newPosition.y-=1; break;
                default:
                    console.log("unknown play action:", action);
                    break;
            }
            var item = map.getItem( newPosition ) 
            if(item) {
                addInventory(item);
            }
            if( map.isOpenPosition( newPosition ) ) {
                that.mapPosition = newPosition;
            }
        },
        setMapPosition: function(point) {
            that.mapPosition.x = point.x;
            that.mapPosition.y = point.y;
        },
        addInventory: addInventory,
        update: function(time) {
        },
        createVirtualModel: createPlayerModel,
        createAugmentedModel: createPlayerModel,
        createInventoryModel: createInventoryModel,
        isWearingSpaceSuit: function() { return isWearingSpaceSuit },
    };

    input.input.initialize();
    input.playInput.initialize();
    input.playInput.setActionDelegate(that);
    var rootAction = input.playInput.getRootAction();
    rootAction.clear();
    rootAction.add(1, "RIGHT");
    rootAction.add(3, "LEFT");
    rootAction.add(2, "UP");
    rootAction.add(4, "DOWN");
    rootAction.add(5, "JUMP");
    input.playInput.enable();

    return that;
});
