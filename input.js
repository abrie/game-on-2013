"use strict";

define( function() {
    var ActionNode = function(key, action, timing) {
        this.action = action;
        this.timing = timing ? timing : {expiration:15, recovery:0};
        this.looped = undefined;
        this.branch = {};
        this.clear = function() {
            this.looped = false;
            this.branch = {};
        }
        this.getTiming = function(into) {
            into.expiration = this.timing.expiration;
            into.recovery = this.timing.recovery;
            return into;
        }
        this.get = function( key ) {
            return this.branch[key];
        }
        this.add = function( key, action, timing ) {
            var newNode = new ActionNode(key, action, timing);
            this.branch[key] = newNode;
            return newNode;
        }
        this.loop = function( node ) {
            this.looped = node;
        }
        this.seek = function( sequence ) {
            var branch = this.branch[ sequence.shift() ];
            return branch ? branch.seek(sequence) : this;
        }
    }

    var playInput = (function () {
        var rootAction = new ActionNode();
        var thisAction = rootAction;
        var actionTime = rootAction.getTiming({});

        function notifyThenNext() {
            thisAction.getTiming(actionTime);
            actionDelegate.firePlayAction.apply(actionDelegate, [thisAction.action]);
            return thisAction.looped ? thisAction.looped : thisAction;
        }

        function inputOn(id) {
            if (!isEnabled) {
                return;
            }

            if (actionTime.recovery > 0) {
                return;
            }

            thisAction = thisAction.get(id);
            if (thisAction) {
                thisAction = notifyThenNext();
            }
            else {
                thisAction = rootAction.get(id);
                thisAction = thisAction ? notifyThenNext() : rootAction;
            }
        }

        function inputOff(id) {
            // nothing here except a comment.
        }

        var isEnabled = false;
        var actionDelegate = undefined;
        return {
            initialize: function () {
                this.reset();
                isEnabled = false;
            },
            getRootAction: function() {
                return rootAction;
            },
            setActionDelegate: function (delegate) {
                actionDelegate = delegate;
            },
            enable: function() {
                isEnabled = true;
                this.reset();
            },
            disable: function() {
                isEnabled = false;
            },
            reset: function() {
                thisAction = rootAction;
                thisAction.getTiming(actionTime);
            },
            inputOn: function(input) {
                inputOn(input);
            },
            inputOff: function(input) {
                inputOff(input);
            },
            advance: function () {
                if( actionTime.recovery > 0) {
                    if( --actionTime.recovery === 0) {
                        actionDelegate("RECOVERED");
                    }
                }
                else {
                    if( actionTime.expiration > 0 ) {
                        if( --actionTime.expiration === 0) {
                            actionDelegate("EXPIRED");
                            thisAction = rootAction;
                            thisAction.getTiming(actionTime);
                        }
                    }
                }
            }
        };
    }());

    var input = (function () {
        var isInputOn = {};
        function inputOn(id, destination) {
            if (isInputOn[id] ) {
                return;
            }

            isInputOn[id] = true;
            destination.inputOn.apply(destination, [id]);
        }

        function inputOff(id, destination) {
            if( isInputOn[id] ) {
                destination.inputOff.apply(destination, [id]);
            }
            isInputOn[id] = false;
        }

        var playKey = {76:1, 75:2, 74:3, 73:4, 32:5};
        function onKeyDown(keyCode) {
            if(playKey[keyCode]) {
                inputOn(playKey[keyCode], playInput);
                return false;
            }

            console.log("unmapped key down:", keyCode);
        }

        function onKeyUp(keyCode) {
            if(playKey[keyCode]) {
                inputOff(playKey[keyCode], playInput);
                return false;
            }
        }

        function handleKeyDown(e) {
            if(!e){ var e = window.event; }
            return onKeyDown(e.keyCode);
        }

        function handleKeyUp(e) {
            if(!e){ var e = window.event; }
            return onKeyUp(e.keyCode);
        }
        
        return {
            initialize: function () {
                playInput.initialize();
                document.onkeydown = handleKeyDown;
                document.onkeyup = handleKeyUp;
            },
            advance: function () {
                playInput.advance();
            }
        };
    }());

    return {
        input:input,
        playInput:playInput,
    };
});
