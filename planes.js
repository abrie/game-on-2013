"use strict";

define(["text!planes.json"], function(json){
    var uniqueId = 0;
    var process = function(arr) {
        return arr.map( function(type) {
            return {
                name: type > 0 ? uniqueId++ : undefined,
                type: type
            };
        });
    }

    var jsonObject = JSON.parse(json);
    var islands = jsonObject.islands;
    var warpHoles = jsonObject.warpHoles; 

    var processedIslands = {}; 
    for(var islandId in islands) {
        var island = islands[islandId];
        var processedIsland = {
            id: islandId,
            width: island.width,
            height: island.height,
            walls: process(island.walls),
            items: process(island.items),
            filterables: process(island.filterables),
        };
        processedIslands[islandId] = processedIsland;
    }

    var toJSON = function() {
        return JSON.stringify({
            warpHoles:warpHoles,
            islands:islands
        });
    }

    return {
        toJSON: toJSON,
        islands: islands,
        warpHoles: warpHoles, 
        getIsland: function(id) { return processedIslands[id]; }
    };
} );
