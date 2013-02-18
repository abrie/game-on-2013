'use strict';

define(["./planes","./inventory","./hud"], function(planes, inventory, hud) {
    var wallMeshGenerator = function( tileDescription, size ) {
        return new THREE.Mesh(
            new THREE.PlaneGeometry( size.width, size.height ),
            new THREE.MeshLambertMaterial({ wireframe:false, color: tileDescription.color, side:THREE.DoubleSide })
        );
    }

    var redWallMeshGenerator = function( tileDescription, size ) {
        var result = new THREE.Mesh(
            new THREE.PlaneGeometry( size.width, size.height ),
            new THREE.MeshLambertMaterial({ wireframe:false, color: tileDescription.color, side:THREE.FrontSide })
        );
        return result;
    }

    var defaultFilter = function( type ) {
        return type;
    }

    var inShadowWorld = false;
    var setShadowWorld = function(state) {
        inShadowWorld = state;
    }

    var redWallFilter = function( type ) {
        console.log( inShadowWorld );
        return (type === 2 && inShadowWorld) ? 0 : type;
    }

    var itemMeshGenerator = function( tileDescription, size ) {
        return new THREE.Mesh(
            new THREE.CubeGeometry( size.width/2, size.height/2, size.depth ),
            new THREE.MeshLambertMaterial({ emissive: tileDescription.color, color: tileDescription.color })
        );
    }

    var generateTileMesh = function( plane, column, row, size, filter ) {
        var cell = plat.getCell(plane, column, row);
        if(cell.type===0) {
            return undefined; // this is an empty tile space
        }
        var tileDescription = tileDescriptions[plane][cell.type].stack;
        var mesh = tileDescription.meshGenerator( tileDescription, size );
        mesh.name = cell.name;
        mesh.description = tileDescriptions[plane][cell.type].description;
        return mesh;
    }

    var forEachTileDescriptionApplyFilterStack = function(filterStack) {
        for(var planeKey in tileDescriptions) {
            var plane = tileDescriptions[planeKey];
            for(var tileId in plane) {
                var tileDescription = plane[tileId];
                applyFilterStack( filterStack, tileDescription );
            }
        }
    }

    var applyFilterStack = function(filterStack, tileDescription) {
        filterStack.forEach( function(filter) {
            var p = tileDescription[filter];
            if( p ) {
                var newDescription = {
                    description:p.description,
                    color:p.color,
                    meshGenerator:p.meshGenerator,
                    filterer:p.filterer
                };
                tileDescription.stack = p;
            }
        });
    }

    var tileDescriptions = (function() {
        return {
            filterables: {
                2: { eye: {
                        description:"red-invisible wall",
                        color:0x880808,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     red: {
                        description:"red-invisible wall",
                        color:0xEEEEEE,
                        meshGenerator:redWallMeshGenerator,
                        filterer:redWallFilter
                     },
                     stack: undefined,
                },
            },
            walls: {
                1: { eye: {
                        description:"impermeable wall",
                        color:0x888888,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                2: { eye: {
                        description:"red-invisible wall",
                        color:0x880808,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                3: { eye: {
                        description:"impermeable wall",
                        color:0xCAE495,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                4: { eye: {
                        description:"impermeable wall",
                        color:0xB1D864,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                5: { eye: {
                        description:"impermeable wall",
                        color:0x99CC33,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                6: { eye: {
                        description:"impermeable wall",
                        color:0x4DCC33,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                7: { eye: {
                        description:"impermeable wall",
                        color:0x33CC66,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                8: { eye: {
                        description:"impermeable wall",
                        color:0x33CCB3,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                9: { eye: {
                        description:"impermeable wall",
                        color:0x3399CC,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                10: { eye: {
                        description:"impermeable wall",
                        color:0x334DCC,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                11: { eye: {
                        description:"impermeable wall",
                        color:0xAF95E4,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                12: { eye: {
                        description:"impermeable wall",
                        color:0x8B64D8,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                13: { eye: {
                        description:"impermeable wall",
                        color:0x6633CC,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                14: { eye: {
                        description:"impermeable wall",
                        color:0xCCB333,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                15: { eye: {
                        description:"impermeable wall",
                        color:0xCC6633,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                16: { eye: {
                        description:"impermeable wall",
                        color:0xCC334D,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                17: { eye: {
                        description:"impermeable wall",
                        color:0xCC3399,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
                18: { eye: {
                        description:"impermeable wall",
                        color:0xB333CC,
                        meshGenerator:wallMeshGenerator,
                        filterer:defaultFilter,
                     },
                     stack: undefined,
                },
            },
            items: {
                1: { eye: {
                        description:"coin",
                        color:0x0000F8,
                        meshGenerator:itemMeshGenerator
                     },
                     description:"coin",
                     stack: undefined,
                },
                2: { eye: {
                        description:"redfilter",
                        color:0xF800F8,
                        meshGenerator:itemMeshGenerator
                     },
                     description: "redfilter",
                     stack: undefined,
                },
                3: { eye: {
                        description:"spacesuit",
                        color:0xF8F80F,
                        meshGenerator:itemMeshGenerator
                     },
                     description: "spacesuit",
                     stack: undefined,
                },
            },
        }
    }());

    forEachTileDescriptionApplyFilterStack(["eye"]);

    var plat = (function(){
        var getCell = function(plane,x,y) {
            var island = planes.getIsland(0);
            return island[plane][y*island.width+x];
        }

        var setCell = function(plane,x,y,type) {
            var cell = getCell(plane,x,y);
            cell.type = type;
        }

        return {
            planes: planes.processed,
            getCell: getCell,
            setCell: setCell
        }
    }());

    var mapObjects = (function(){
        var list = [];
        var add = function(mapObject) {
            list.push(mapObject);
        }

        var remove = function(mapObject) {
            list = list.filter( function(item) { 
                return item !== mapObject;
             });
        }

        var removeTileObjectIfPresent = function(tile) {
            list.forEach( function(mapObject) {
                mapObject.removeTileObjectNamed(tile.name);
            });
        }

        var applyFilter = function(filter) {
            forEachTileDescriptionApplyFilterStack(filter);
            reRenderFilterables();
        }

        var reRenderFilterables = function() {
            list.forEach( function(mapObject) {
                mapObject.reRenderFilterables();
            });
        }

        var reRenderItems = function() {
            list.forEach( function(mapObject) {
                mapObject.reRenderItems();
            });
        }

        return {
            add: add,
            remove: remove,
            removeTileObjectIfPresent: removeTileObjectIfPresent,
            applyFilter: applyFilter,
            reRenderItems: reRenderItems,
        }
    }());


    var createObject = function(width, height, z, mapCenter, columns, rows, filter) {
        var model = new THREE.Object3D();
        var tilesPerRow = columns;
        var tilesPerColumn = rows;
        var tileWidth = width/tilesPerRow;
        var tileHeight = height/tilesPerColumn;
        var tileDepth = 0.01;
        var center = mapCenter;

        var tileDimensions = {width:tileWidth,height:tileHeight,depth:tileDepth};

        var leftmost = center.x - Math.floor( tilesPerRow / 2 ); 
        leftmost = leftmost >= 0 ? leftmost : 0;
        var topmost = center.y - Math.floor( tilesPerColumn / 2 );
        topmost = topmost >= 0 ? topmost : 0;

        var getTileModelX = function(x) {
            return (x - center.x) * tileWidth;
        }

        var getTileModelY = function(y) {
            return (center.y - y) * tileHeight;
        }

        var getTileModelZ = function() {
            return z;
        }

        var planeObjects = {};

        var reRenderPlane = function(name) {
            var planeObject = planeObjects[name];
            planeObject.parent.remove(planeObject);
            renderPlane(name);
        }

        var reRenderItemsPlane = function() {
            var planeObject = planeObjects["items"];
            taggedItems = taggedItems.filter( function(taggedItem) {
                hud.removeTag(taggedItem);
                return false;
            });
            planeObject.parent.remove(planeObject);
            renderPlane("items", function(newMesh) {
                taggedItems.push(newMesh);
                hud.addTag(newMesh, newMesh.description);
            });
        }

        var renderPlane = function(name, onNewMesh) {
            var planeObject = new THREE.Object3D();
            planeObjects[name] = planeObject;

            for( var row = topmost; row < topmost+tilesPerColumn; row++ ) {
                for( var column = leftmost; column < leftmost+tilesPerRow; column++ ) {
                    var mesh = generateTileMesh( name, column, row, tileDimensions, filter )
                    if( mesh ) {
                        mesh.position.set(
                            getTileModelX(column),
                            getTileModelY(row),
                            getTileModelZ());
                        planeObject.add(mesh);
                        if( onNewMesh ) {
                            onNewMesh(mesh);
                        }
                    }
                }
            }
            model.add(planeObject);
        }

        renderPlane("walls");
        renderPlane("filterables");
        var taggedItems = [];
        renderPlane("items", function(newMesh) {
            taggedItems.push(newMesh);
        });

        var containsPoint = function(point) {
            return (
                (point.x >= leftmost) &&
                (point.x < leftmost+tilesPerColumn) && 
                (point.y >= topmost) && 
                (point.y < topmost+tilesPerRow));
        }

        var computePosition = function(column,row) {
            return {
                x: getTileModelX(column),
                y: getTileModelY(row),
                z: getTileModelZ()
            }
        }

        var removeTileObjectNamed = function(name) {
            var tileObject = model.getChildByName( name, true );
            if( tileObject ) {
                console.log("removing",tileObject.description);
                taggedItems = taggedItems.filter( function(taggedItem) {
                    if(taggedItem.name == tileObject.name) {
                        hud.removeTag(tileObject);
                        return false;
                    }
                    return true;
                });
                tileObject.parent.remove(tileObject);
            }
        }

        var activate = function() {
            taggedItems.forEach( function(itemMesh) {
                hud.addTag(itemMesh, itemMesh.description);
            });
        }

        var deactivate = function() {
            taggedItems.forEach( function(itemMesh) {
                hud.removeTag(itemMesh);
            });
        }

        var that = {
            containsPoint: containsPoint,
            computePosition: computePosition,
            removeTileObjectNamed: removeTileObjectNamed,
            tileWidth: tileWidth,
            tileHeight: tileHeight,
            close: function() { deactivate(); mapObjects.remove(this); },
            reRenderFilterables: function() { reRenderPlane("filterables"); },
            reRenderItems: reRenderItemsPlane,
            model: model,
            activate: activate,
            deactivate: deactivate
        }

        mapObjects.add(that);
        return that;
    }

    var isOpenPosition = function( point ) {
        var cell = plat.getCell("walls", point.x,point.y);
        if( cell.type !== 0 ) {
            var filterer = tileDescriptions["walls"][cell.type].stack.filterer;
            var filteredType = filterer( cell.type );
            return filteredType === 0;
        }
        
        cell = plat.getCell("filterables", point.x, point.y);
        if( cell.type !== 0 ) {
            var filterer = tileDescriptions["filterables"][cell.type].stack.filterer;
            var filteredType = filterer( cell.type );
            return filteredType === 0;
        }

        return true;
    }

    var getItem = function( point ) {
        var cell = plat.getCell("items", point.x, point.y);
        var item = inventory.getItem( cell.type );
        if( item ) {
            cell.type = 0; // tile is passed by reference, so here the item is delted from the map.
            mapObjects.removeTileObjectIfPresent(cell);
        }
        return item;
    }

    var setItem = function( point, item ) {
        var cell = plat.getCell("items", point.x, point.y);
        if( cell.type !== 0 ) {
            console.log("item already present at this location.", point.x, point.y, cell.type);
        }
        else {
            plat.setCell("items", point.x, point.y, item.id);
        }
    }

    return {
        createObject: createObject,
        getItem: getItem,
        setItem: setItem,
        isOpenPosition: isOpenPosition,
        applyFilterToMapObjects: mapObjects.applyFilter,
        reRenderItems: mapObjects.reRenderItems,
        WarpHolePoints: planes.warpHoles,
        setShadowWorld: setShadowWorld,
    }
});
