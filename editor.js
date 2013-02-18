"use strict";

requirejs(
    ["domReady!", "./planes","./settings"],
function(doc, planes, settings) {
    console.log("IMPORTANT: Firefox Aurora users: set media.navigator.enabled to TRUE in about:config"); 

    var application = (function() {
        var createRadioButton = function( group, value, onclick, checked ) {
            var result = document.createElement("span");
            var radio = document.createElement("input");
            radio.type = "radio";
            radio.id = "radio"+value;
            radio.name = group;
            radio.value = value;
            radio.checked = checked;
            radio.onclick = onclick;
            var label = document.createElement("label");
            label.for = radio.id;
            label.appendChild( document.createTextNode(value) );
            result.appendChild(radio);
            result.appendChild(label);

            return result;
        }

        var createCheckbox = function( group, value, onclick, checked ) {
            var result = document.createElement("span");
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = "checkbox"+value;
            checkbox.name = group;
            checkbox.value = value;
            checkbox.checked = checked;
            checkbox.onclick = onclick;
            var label = document.createElement("label");
            label.for = checkbox.id;
            label.appendChild( document.createTextNode(value) );
            result.appendChild(checkbox);
            result.appendChild(label);

            return result;
        }

        function uid() {
            var S4 = function() {
                return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            }

            return S4();
        }

        var createControls = function() {
            var radioButtonVirtual = createRadioButton("mode","walls", function() { setActivePlane("walls"); }, true );
            var radioButtonFilterables = createRadioButton("mode","filterables", function() { setActivePlane("filterables"); }, false );
            var radioButtonAugmented = createRadioButton("mode","items", function() { setActivePlane("items"); }, false );
            var radioButtonWarpHoles = createRadioButton("mode","warpholes", function() { setActivePlane("warpHoles"); }, false );
            var checkboxGrid = createCheckbox("mode","grid", function(e) { setGridDisplay( e.srcElement.checked ); }, true ); 
            document.getElementById("planes").appendChild(radioButtonVirtual);
            document.getElementById("planes").appendChild(radioButtonFilterables);
            document.getElementById("planes").appendChild(radioButtonAugmented);
            document.getElementById("planes").appendChild(radioButtonWarpHoles);
            document.getElementById("controls").appendChild(checkboxGrid);
            document.getElementById("toJSON").onclick = function(e) { console.log(planes.toJSON()); };
            
            var islandSelectElement = document.getElementById("islandSelect");
            for( var islandId in planes.islands ) {
                var opt = document.createElement("option");
                opt.value = islandId;
                opt.text = islandId;
                islandSelectElement.appendChild(opt);
            }
            islandSelectElement.onchange = function(e) {
                that.currentIsland = this.value;
                updateControls();
            }

            var addIslandButton = document.getElementById("addIsland");
            addIslandButton.onclick = function(e) {
                var newId = uid();
                createNewIsland(newId);
                initialize(newId);
                var opt = document.createElement("option");
                opt.value = newId;
                opt.text = newId;
                islandSelectElement.appendChild(opt);
            }

            var clearIslandButton = document.getElementById("clearIsland");
            clearIslandButton.onclick = function(e) {
                initialize(that.currentIsland);
            }
        }

        var updateControls = function() {
            var island = planes.islands[that.currentIsland];    
            document.getElementById("islandX").value = island.x;
            document.getElementById("islandY").value = island.y;
        }

        var createNewIsland = function(id) {
            var newIsland = {
                id: id, 
                width: columns,
                height: rows,
                walls: [],
                items: [],
            }
            planes.islands[id] = newIsland;
        }

        var canvas = document.getElementById("display");
        var ctx = canvas.getContext("2d");
        var columns = settings.worldSize.width;
        var rows = settings.worldSize.height;
        var cellWidth = canvas.width/columns;
        var cellHeight = canvas.height/rows;

        var renderGrid = function() {
            for( var column = 0; column < columns; column++ ) {
                ctx.beginPath();
                ctx.moveTo(column*cellWidth,0);
                ctx.lineTo(column*cellWidth,canvas.height);
                ctx.closePath();
                ctx.stroke();
            }

            for( var row = 0; row < rows; row++ ) {
                ctx.beginPath();
                ctx.moveTo(0, row*cellHeight);
                ctx.lineTo(canvas.width, row*cellHeight);
                ctx.closePath();
                ctx.stroke();
            }
        }

        var initialize = function(islandId) {
            var island = planes.islands[islandId];    
            island.width = settings.worldSize.width;
            island.height = settings.worldSize.height;
            island.walls.length = 0;
            island.items.length = 0;
            island.filterables.length = 0;
            for(var i = 0; i < island.width*island.height; i++ ) {
                island.walls.push(0);
                island.items.push(0);
                island.filterables.push(0);
            }

            for(var i=0; i < rows; i++) {
                island.walls[i] = 1;
                island.walls[island.height*(island.width-1)+i] = 1;
            }

            for(var i=0; i < rows; i++) {
                island.walls[i*island.width] = 1;
                island.walls[i*island.width+island.width-1] = 1;
            }
        }

        var colors = {
            0: "#FFFFFF",
            1: "#AAAAAA",
            2: "#FF0000",
            3: "#CAE495",
            4: "#B1D864",
            5: "#99CC33",
            6: "#4DCC33",
            7: "#33CC66",
            8: "#33CCB3",
            9: "#3399CC",
            10: "#334DCC",
            11: "#AF95E4",
            12: "#8B64D8",
            13: "#6633CC",
            14: "#CCB333",
            15: "#CC6633",
            16: "#CC334D",
            17: "#CC3399",
            18: "#B333CC"
        };

        var updateEditorVisibility = function() {
            var editorElement = document.getElementById("warpHoleEditor");
            editorElement.style.visibility = that.activePlane === "warpHoles" ? "visible" : "hidden";
        }

        var setActivePlane = function(plane) {
            that.activePlane = plane;
            updateEditorVisibility();
        }

        var setGridDisplay = function(state) {
            that.displayGrid = state;
        }

        var updateWarpHoleEditor = function(warpHole) {
            var nameElement = document.getElementById("warphole-name");
            var activeElement = document.getElementById("warphole-active");
            activeElement.checked = warpHole.active;
            nameElement.value = warpHole.id;
            activeElement.onclick = function(e) {
                warpHole.active = e.srcElement.checked;
            }
        }

        var that = {
            currentIsland: 0,
            currentCell: {x:0,y:0},
            currentWarpHole: undefined,
            activePlane: "walls",
            displayGrid: true,
        }

        var highlightCell = function( x, y ) {
            ctx.lineWidth = 3;
            ctx.strokeRect(x*cellWidth,y*cellHeight,cellWidth,cellHeight);
            ctx.lineWidth = 1;
        }

        var drawCell = function( context, x, y, width, height, type ) {
            context.lineWidth = 3;
            context.fillStyle = colors[type];
            context.fillRect(x*width,y*height,width,height);
            context.lineWidth = 1;
        }

        var drawWarpHole = function( context, warpHole ) {
            var width = cellWidth*Math.ceil(settings.warpHoleColumns/2)*2;
            var height = cellHeight*Math.ceil(settings.warpHoleRows/2)*2;
            context.lineWidth = 3;
            context.fillStyle = "#000000";
            if( warpHole.active ) {
                context.fillRect(
                    warpHole.x*cellWidth-width/2,
                    warpHole.y*cellHeight-height/2,
                    width, height);
            }
            context.fillStyle = "#FFFF00";
            context.strokeRect(warpHole.x*cellWidth, warpHole.y*cellHeight, cellWidth, cellHeight);
            context.lineWidth = 1;
        }

        var getEventPosition = function( event, width, height ) {
            var Ax = event.pageX - canvas.offsetLeft;
            var Ay = event.pageY - canvas.offsetTop;
            var x = Math.floor(Ax/width);
            var y = Math.floor(Ay/height);
            return { x:x, y:y };
        }

        var onDocumentMouseMove = function(event) {
            event.preventDefault();
            that.currentCell = getEventPosition(event, cellWidth, cellHeight);
            if(that.mouseDown) {
                planes.islands[that.currentIsland][that.activePlane][ that.currentCell.y * columns + that.currentCell.x ] = tool.tileType;
            }
        }


        var onDocumentMouseDown = function(event) {
            that.mouseDown = true;
            event.preventDefault();
        }

        var onDocumentMouseUp = function(event) {
            that.mouseDown = false;
            event.preventDefault();
        }

        var getWarpHole = function(point) {
            for(var id in planes.warpHoles) {
                var warpHole = planes.warpHoles[id];
                if(warpHole.x === point.x && warpHole.y === point.y) {
                    return warpHole;
                }
            }
            return undefined;
        }

        var onDocumentMouseClick = function(event) {
            event.preventDefault();
            if( that.activePlane === "warpHoles" ) {
                var warpHoleAtCell = getWarpHole( that.currentCell );
                if( warpHoleAtCell ) {
                    that.currentWarpHole = warpHoleAtCell;
                    updateWarpHoleEditor(that.currentWarpHole);
                }
                else if(that.currentWarpHole) {
                    that.currentWarpHole.x = that.currentCell.x;
                    that.currentWarpHole.y = that.currentCell.y;
                }

            }
            else {
                planes.islands[that.currentIsland][that.activePlane][ that.currentCell.y * columns + that.currentCell.x ] = tool.tileType;
            }
        }

        canvas.addEventListener( 'mousemove', onDocumentMouseMove, false );
        canvas.addEventListener( 'mousedown', onDocumentMouseDown, false );
        canvas.addEventListener( 'mouseup', onDocumentMouseUp, false );
        canvas.addEventListener( 'click', onDocumentMouseClick, false );

        var clear = function() {
            ctx.clearRect(0,0,canvas.width,canvas.height)
        }

        var renderFilterableTiles = function() {
            ctx.globalAlpha = that.activePlane === "filterables" ? 0.9 : 0.3;
            renderTiles("filterables");
        }

        var renderWallTiles = function() {
            ctx.globalAlpha = that.activePlane === "walls" ? 0.9 : 0.3;
            renderTiles("walls");
        }

        var renderItemTiles = function() {
            ctx.globalAlpha = that.activePlane === "items" ? 0.9 : 0.3;
            renderTiles("items");
        }

        var renderTiles = function(plane) {
            for(var row = 0; row < rows; row++) {
                for(var column = 0; column < columns; column++) {
                    var p = planes.islands[that.currentIsland][plane][row*rows+column];
                    if( p ) {
                        drawCell(ctx, column, row, cellWidth, cellHeight, p);
                    }
                }
            }
        }

        var renderWarpHoles = function() {
            ctx.globalAlpha = 0.5;
            for(var id in planes.warpHoles) {
                var warpHole = planes.warpHoles[id];
                drawWarpHole(ctx, warpHole);
            }
        }

        var render = function() {
            clear();
            if(that.displayGrid) {
                renderGrid();
            }
            highlightCell( that.currentCell.x, that.currentCell.y );
            renderItemTiles();
            renderWallTiles();
            renderFilterableTiles();
            renderWarpHoles();
        }

        var update = function() {
        }

        var toolCanvas = document.getElementById("toolbox");
        var toolCtx = toolCanvas.getContext("2d");

        var tool = {
            tileType:0,
        }

        var onToolCanvasMouseClick = function(event) {
            event.preventDefault();
            var position = getEventPosition(event, cellWidth*2.5, cellHeight*2.5);
            tool.tileType = position.y;
        }

        toolCanvas.addEventListener( 'click', onToolCanvasMouseClick, false );
        createControls();
        updateEditorVisibility();
        updateControls();
        //initialize(0);

        var y = 1;
        for(var index in colors) {
            drawCell(toolCtx, 0, y, cellWidth*2.5, cellHeight*2.5, y);
            y++;
        }

        return {
            render: render,
            update: update,
        }
    }());

    var mainLoop = function(time) {
        requestAnimationFrame( mainLoop );
        application.update(time);
        application.render();
    }

    mainLoop();
});
