function LightBoxEditor(canvas) {

    var IsometricProjection = {
        project: function(x, y, z) {
            /*
             Math: http://en.wikipedia.org/wiki/Isometric_projection#Overview
             More Theoiry: http://www.compuphase.com/axometr.htm
             Angles used: vertical rotation=45°, horizontal rotation=arctan(0,5)
             projection matrix:
             | 0,707  0     -0,707 |
             | 0,321  0,891  0,321 |
             | 0,630 -0,453  0,630 |

             Additional offset!
             Y Axis is inverted.
             */
            return {'x': IsometricProjection.offsetX + 0.707 * x - 0.707 * z, 'y': IsometricProjection.clientHeight - (IsometricProjection.offsetY + 0.321 * x + 0.891 * y + 0.321 * z)};
        }
    };

    /*
     Abstract class for drawable game elements
     */
    function DrawableElement() {
        this.type = null;

        this.init = function() {
            return null;
        };

        this.draw = function() {
            return null;
        };

        this.step = function() {
            return null;
        };

        this.move = function() {
            return null;
        };

        this.getType = function() {
            return this.type;
        };
    }

    /*
     A generic map element
     height defines the height of the element and is a weighted multiple of the edge length. values are 1, 2, ...
     x and y define the position of the map element in 2d coordinate space. (0, 0) is lower left corner
     */
    function Box(height, x, y) {
        this.type = "box";

        // dimension and position
        this.edgeLength = 50; // base is always a square so we only define length of one edge
        this.heightScale = 0.5; // the box height is weighted by this factor to make it look better
        this.height = height * this.heightScale;
        this.x = x; // the column number of the box within the 2D grid of the map
        this.y = y; // the row number of the box within the 2D grid of the map

        // visual values
        var colorTop = "#c9d3d9"; //#ffa605"; // color of top facet
        var colorFront = "#adb8bd"; // "#e28b00"; // color of front facet
        var colorSide = "#e5f0f5"; // "#ffc133"; // color of side facet
        var strokeColor = "#485256"; // color of the stroke
        var strokeWidth = 0.5; // width of the stroke

        this.getEdgeLength = function() {
            return this.edgeLength;
        };

        this.getHeight = function() {
            return this.height;
        };

        this.getHeightScale = function() {
            return this.heightScale;
        };

        this.drawFrontFace = function() {
            // front face: p1 is bottom left and rest is counter-clockwise;
            if (this.y == 0 || map.getHeight(this.x, this.y - 1) < this.height) {
                ctx.fillStyle = colorFront;
                var p1 = IsometricProjection.project(this.x * this.edgeLength, 0, this.y * this.edgeLength);
                var p2 = IsometricProjection.project((this.x + 1) * this.edgeLength, 0, this.y * this.edgeLength);
                var p3 = IsometricProjection.project((this.x + 1) * this.edgeLength, this.height * this.edgeLength, this.y * this.edgeLength);
                var p4 = IsometricProjection.project(this.x * this.edgeLength, this.height * this.edgeLength, this.y * this.edgeLength);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.lineTo(p4.x, p4.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.fill();
                ctx.stroke();
            }
        };

        this.drawSideFace = function() {
            // left side face: p1 is bottom front and rest is counter-clockwise;
            if (this.x == 0 || map.getHeight(this.x - 1, this.y) < this.height) {
                ctx.fillStyle = colorSide;
                var p1 = IsometricProjection.project(this.x * this.edgeLength, 0, this.y * this.edgeLength);
                var p2 = IsometricProjection.project(this.x * this.edgeLength, this.height * this.edgeLength, this.y * this.edgeLength);
                var p3 = IsometricProjection.project(this.x * this.edgeLength, this.height * this.edgeLength, (this.y + 1) * this.edgeLength);
                var p4 = IsometricProjection.project(this.x * this.edgeLength, 0, (this.y + 1) * this.edgeLength);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.lineTo(p4.x, p4.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.fill();
                ctx.stroke();
            }
        };

        this.drawTopFace = function() {
            // top face: p1 is front left and rest is counter-clockwise
            if (this.x == 0 || this.y == 0 || (map.getHeight(this.x - 1, this.y - 1) - this.height) < 2 * this.heightScale) { // difference of 1 is not enough to cover the block entirely
                ctx.fillStyle = colorTop;
                var p1 = IsometricProjection.project(this.x * this.edgeLength, this.height * this.edgeLength, this.y * this.edgeLength);
                var p2 = IsometricProjection.project((this.x + 1) * this.edgeLength, this.height * this.edgeLength, this.y * this.edgeLength);
                var p3 = IsometricProjection.project((this.x + 1) * this.edgeLength, this.height * this.edgeLength, (this.y + 1) * this.edgeLength);
                var p4 = IsometricProjection.project(this.x * this.edgeLength, this.height * this.edgeLength, (this.y + 1) * this.edgeLength);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.lineTo(p4.x, p4.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.fill();
                ctx.stroke();
            }
        };

        this.draw = function() {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;

            this.drawFrontFace();
            this.drawSideFace();
            this.drawTopFace();
        }
    }

    // Box extends DrawableElement
    Box.prototype = new DrawableElement();
    Box.prototype.constructor = Box;

    /*
     A light map element which extends the generic Box element
     */
    function LightBox(height, x, y) {
        this.type = "lightbox";

        // lightbox specified values
        var lightOn = false;

        // dimension and position
        this.height = height * this.heightScale;
        this.x = x;
        this.y = y;

        // visual values
        var colorTopLightOn = "#FFE545"; // "#e3e500";
        var colorTopLightOnOverlay = "#FEFBAF"; // "#ffff7c";
        var colorTopLightOff = "#0468fb";
        var colorTopLightOffOverlay = "#4c81ff";

        // pulse values (pulse is the lighter color in the middle of the top facet)
        var pulseGrowing = true; // controls the growth/shrink of the pulse animation
        var pulseSize = 0.5; // this represents the minimum percentage of surface that will be covered (0=disappears completely,1=always entire facet)
        var currentAnimationFrame = 0; // current animation frame, used internally to control the animation
        var animationFrames = 30; // # of frames for the pulse to fully grow/shrink

        this.isLightOn = function() {
            return lightOn;
        };

        this.toggleLight = function() {
            lightOn = !lightOn;
        };

        this.lightOff = function() {
            lightOn = false;
        };

        // overwrite default Box method
        this.drawTopFace = function() {
            // top face: p1 is front left and rest is counter-clockwise
            ctx.fillStyle = lightOn ? colorTopLightOn : colorTopLightOff;
            var p1 = IsometricProjection.project(this.x * this.edgeLength, this.height * this.edgeLength, this.y * this.edgeLength);
            var p2 = IsometricProjection.project((this.x + 1) * this.edgeLength, this.height * this.edgeLength, this.y * this.edgeLength);
            var p3 = IsometricProjection.project((this.x + 1) * this.edgeLength, this.height * this.edgeLength, (this.y + 1) * this.edgeLength);
            var p4 = IsometricProjection.project(this.x * this.edgeLength, this.height * this.edgeLength, (this.y + 1) * this.edgeLength);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.fill();
            ctx.stroke();

            // top face overlay: p1 is front left and rest is counter-clockwise
            var overlayOffset = (1 - (currentAnimationFrame / animationFrames)) * ((1 - pulseSize) * this.getEdgeLength() / 2);
            ctx.fillStyle = lightOn ? colorTopLightOnOverlay : colorTopLightOffOverlay;
            p1 = IsometricProjection.project(this.x * this.edgeLength + overlayOffset, this.height * this.edgeLength, this.y * this.edgeLength + overlayOffset);
            p2 = IsometricProjection.project((this.x + 1) * this.edgeLength - overlayOffset, this.height * this.edgeLength, this.y * this.edgeLength + overlayOffset);
            p3 = IsometricProjection.project((this.x + 1) * this.edgeLength - overlayOffset, this.height * this.edgeLength, (this.y + 1) * this.edgeLength - overlayOffset);
            p4 = IsometricProjection.project(this.x * this.edgeLength + overlayOffset, this.height * this.edgeLength, (this.y + 1) * this.edgeLength - overlayOffset);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.fill();
        };

        this.step = function() {
            if (pulseGrowing) {
                if (currentAnimationFrame + 1 >= animationFrames) { // stop 1 frame early to avoid overlap with stroke
                    pulseGrowing = false;
                } else {
                    currentAnimationFrame++;
                }
            } else {
                if (currentAnimationFrame <= 0) {
                    pulseGrowing = true;
                } else {
                    currentAnimationFrame--;
                }
            }
        };
    }

    /* LightBox extends Box */
    LightBox.prototype = new Box();
    LightBox.prototype.constructor = LightBox;

    /*
     The level map
     */
    function Map() {

        // map specific values
        var level = 0;
        var levelSize = {}; // the level size
        var mapRef = null; // the actual map values

        // map files
        var mapFileExtension = '.txt';

        this.init = function() {
            levelSize = {};
            mapRef = null;
        };

        this.resetMap = function() {
            for (var i = 0; i < levelSize.x; i++) {
                for (var j = 0; j < levelSize.y; j++) {
                    if (mapRef[i][j].getType() == 'lightbox') {
                        mapRef[i][j].lightOff();
                    }
                }
            }
        };

        this.loadMap = function() {
            var data = {
                          "direction": 0,
                          "map": [
                            [{"h":1, "t":"l"},{"h":1, "t":"b"},{"h":1, "t":"b"}, {"h":1, "t":"b"},{"h":1, "t":"b"}],
                            [{"h":1, "t":"b"},{"h":1, "t":"b"},{"h":1, "t":"b"}, {"h":1, "t":"b"},{"h":1, "t":"b"}],
                            [{"h":1, "t":"b"},{"h":1, "t":"b"},{"h":1, "t":"l"}, {"h":1, "t":"b"},{"h":1, "t":"b"}],
                            [{"h":1, "t":"b"},{"h":1, "t":"b"},{"h":1, "t":"b"}, {"h":1, "t":"b"},{"h":1, "t":"b"}],
                            [{"h":1, "t":"b"},{"h":1, "t":"b"},{"h":1, "t":"b"}, {"h":1, "t":"b"},{"h":1, "t":"b"}]
                          ],
                          "medals": {
                            "gold": 3,
                            "silver": 4,
                            "bronze": 5
                          }
                        };

            // map files are defined user-friendly so we have to adapt to that
            levelSize.x = data.map[0].length; // we suppose map is a rectangle
            levelSize.y = data.map.length;

            mapRef = new Array(levelSize.x);
            for (i = 0; i < levelSize.x; i++) {
                mapRef[i] = new Array(levelSize.y);
            }

            var botInMap = false;
            var nbrLights = 0;

            for (var i = 0; i < data.map.length; i++) {
                for (var j = 0; j < data.map[i].length; j++) {
                    switch (data.map[i][j].t) {
                        case 'x':
//                            if (botInMap) {
//                                console.error('Two bots in map file.')
//                            }
//                            bot.setPosition(j, data.map.length - i - 1);
//                            botInMap = true;
                            break;
                        case 'b':
                            mapRef[j][data.map.length - i - 1] = new Box(data.map[i][j].h, j, data.map.length - i - 1);
                            break;
                        case 'l':
                            mapRef[j][data.map.length - i - 1] = new LightBox(data.map[i][j].h, j, data.map.length - i - 1);
                            nbrLights++;
                            break;
                        default:
                            console.error('Map contains unsupported DrawableElement: ' + data.map[i][j].t);
                            // fall back to box element
                            mapRef[j][data.map.length - i - 1] = new Box(data.map[i][j].h, j, data.map.length - i - 1);
                    }
                }
            }
        };

        this.getEdgeLength = function(x, y) {
            return mapRef[x][y].getEdgeLength();
        };

        this.getHeight = function(x, y) {
            return mapRef[x][y].getHeight();
        };

        this.getHeightScale = function(x, y) {
            return mapRef[x][y].getHeightScale();
        };

        this.getLevelSize = function(dir) {
            return levelSize[dir];
        };

        this.toggleLight = function(x, y) {
            if (mapRef[x][y].getType() == 'lightbox') {
                mapRef[x][y].toggleLight();
            }
        };

        this.draw = function() {
            // order is important for occlusion
            for (var i = levelSize.x - 1; i >= 0; i--) {
                for (var j = levelSize.y - 1; j >= 0; j--) {
                    // draw the tile
                    mapRef[i][j].draw();
                }
            }
        };
    }

    Map.prototype = new DrawableElement();
    Map.prototype.constructor = Map;

    var ctx = canvas.get(0).getContext('2d');

    // isometric projection
    IsometricProjection.offsetX = canvas.get(0).width / 2; // jquery width() returns 0 since canvas is hidden
    IsometricProjection.offsetY = 50;
    IsometricProjection.clientHeight = canvas.get(0).height;

    // refresh rate and rendering loop
    var fps = 30;
    var fpsDelay = 1000 / fps;
    var fpsTimer = null;

    // game elements
    var bg = null;
    var map = null;

    this.init = function() {

        // create background
        var tmp = new Image();
        tmp.src = 'img/pattern.png';
        tmp.onload = function() {
            bg = ctx.createPattern(tmp, 'repeat');
        };

        // create map
        map = new Map();
    };

    this.reset = function() {
        map.init();
//        if (!fpsTimer) {
//            fpsTimer = setInterval($.proxy(this.draw, this), fpsDelay);
//        }
    };

    this.loadMap = function () {
        map.loadMap();
    };

    this.draw = function() {
        // draw the map and bot
        map.draw();
    };

    this.getMap = function() {
        return map;
    };
};