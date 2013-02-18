
"use strict";
define([], function() {
    var tags = [];
    var addTag = function(object, tagText) {
        var tagElement = document.createElement( 'div' );
        tagElement.style.position = 'absolute';
        tagElement.style.zIndex = 1000;
        tagElement.innerHTML = tagText;
        document.getElementById("output").appendChild(tagElement);
        tags.push( {element:tagElement,object:object} );
    }

    var removeTag = function(object) {
        tags = tags.filter( function(tag) {
            if( tag.object.name === object.name) {
                document.getElementById("output").removeChild(tag.element);
                return false;
            }
            else {
                return true;
            }
        });
    }

    var removeAllTags = function() {
        var parent = document.getElementById("output");
        tags.forEach( function(tag) {
            parent.removeChild(tag.element);
        });
        tags = [];
    }

    var positionTags = function(provider, camera) {
        tags.forEach( function(tag) {
            var worldPosition = tag.object.matrixWorld.getPosition();
            var screenPosition = provider.toScreenXY(worldPosition, camera);   
            tag.element.style.left = screenPosition.x + 'px';
            tag.element.style.top = screenPosition.y + 'px';
        });
    }

    return {
        addTag: addTag,
        removeTag: removeTag,
        removeAllTags: removeAllTags,
        positionTags: positionTags
    }
});
