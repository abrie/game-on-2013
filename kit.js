"use strict";

define( function(doc, settings) {
    var kitElement = document.getElementById("kit");

    var createCheckbox = function(text, checked, onclick ) {
        var result = document.createElement("span");
        var input = document.createElement("input");
        input.type = "checkbox";
        input.id = "kitToggle"+text;
        input.value = checked;
        input.onclick = onclick;
        var label = document.createElement("label");
        label.for = input.id;
        label.appendChild( document.createTextNode(text) );
        result.appendChild(input);
        result.appendChild(label);

        return result;
    }

    var createToggle = function( name, initialState, onToggle ) {
        var that = {
            elementToggled : function(e) {
                onToggle( e.srcElement.checked );
            },
        }

        that.checkbox = createCheckbox(name, initialState, that.elementToggled)
        kitElement.appendChild(that.checkbox);
        return that;
    }

    var toggles = {};
    var addToggle = function( name, initialState, onToggle ) {
        toggles[name] = createToggle( name, initialState, onToggle );
        onToggle(initialState);
    }

    return {
        addToggle:addToggle,
    }
});
