"use strict";

define([], function() {
    var items = {
        1: function() {
                return {
                    id:1,
                    name:"coin",
                }
           },
        2: function() {
                return {
                    id:2,
                    name:"redfilter",
                }
           },
        3: function() {
                return {
                    id:3,
                    name:"spacesuit",
                }
           }
    }

    var getItem = function(id) {
       var itemFunction = items[id];
       if( itemFunction ) {
           return itemFunction();
       }
       else {
           return undefined;
       }
    }

    return {
        items:items,
        getItem: getItem
    }
});
