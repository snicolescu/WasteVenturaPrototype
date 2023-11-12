// Generated code -- CC0 -- No Rights Reserved -- http://www.redblobgames.com/grids/hexagons/
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Hex = /** @class */ (function () {
    function Hex(q, r) {
        this.q = q;
        this.r = r;
    }
    Hex.neighbor = function (h, direction) {
        return new Hex(h.q + Hex.directions[direction].q, h.r + Hex.directions[direction].r);
    };
    Hex.diagonalNeighbor = function (h, direction) {
        return new Hex(h.q + Hex.diagonals[direction].q, h.r + Hex.diagonals[direction].r);
    };
    /*
    public add(b:Hex):Hex
    {
        return new Hex(this.q + b.q, this.r + b.r);
    }

    public subtract(b:Hex):Hex
    {
        return new Hex(this.q - b.q, this.r - b.r);
    }

    public scale(k:number):Hex
    {
        return new Hex(this.q * k, this.r * k);
    }


    public rotateLeft():Hex
    {
        let s = -this.q - this.r;
        return new Hex(-s, -this.q);
    }


    public rotateRight():Hex
    {
        let s = -this.q - this.r;
        return new Hex(-this.r, -s);
    }
    */
    Hex.directions = [new Hex(1, 0), new Hex(1, -1), new Hex(0, -1), new Hex(-1, 0), new Hex(-1, 1), new Hex(0, 1)];
    Hex.diagonals = [new Hex(2, -1), new Hex(1, -2), new Hex(-1, -1), new Hex(-2, 1), new Hex(-1, 2), new Hex(1, 1)];
    return Hex;
}());
var OffsetCoord = /** @class */ (function () {
    function OffsetCoord(col, row) {
        this.col = col;
        this.row = row;
    }
    OffsetCoord.qoffsetFromCube = function (offset, h) {
        var col = h.q;
        var row = h.r + (h.q + offset * (h.q & 1)) / 2;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new OffsetCoord(col, row);
    };
    OffsetCoord.qoffsetToCube = function (offset, h) {
        var q = h.col;
        var r = h.row - (h.col + offset * (h.col & 1)) / 2;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new Hex(q, r);
    };
    OffsetCoord.roffsetFromCube = function (offset, h) {
        var col = h.q + (h.r + offset * (h.r & 1)) / 2;
        var row = h.r;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new OffsetCoord(col, row);
    };
    OffsetCoord.roffsetToCube = function (offset, h) {
        var q = h.col - (h.row + offset * (h.row & 1)) / 2;
        var r = h.row;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new Hex(q, r);
    };
    OffsetCoord.EVEN = 1;
    OffsetCoord.ODD = -1;
    return OffsetCoord;
}());
var DoubledCoord = /** @class */ (function () {
    function DoubledCoord(col, row) {
        this.col = col;
        this.row = row;
    }
    DoubledCoord.qdoubledFromCube = function (h) {
        var col = h.q;
        var row = 2 * h.r + h.q;
        return new DoubledCoord(col, row);
    };
    DoubledCoord.prototype.qdoubledToCube = function () {
        var q = this.col;
        var r = (this.row - this.col) / 2;
        var s = -q - r;
        return new Hex(q, r);
    };
    DoubledCoord.rdoubledFromCube = function (h) {
        var col = 2 * h.q + h.r;
        var row = h.r;
        return new DoubledCoord(col, row);
    };
    DoubledCoord.prototype.rdoubledToCube = function () {
        var q = (this.col - this.row) / 2;
        var r = this.row;
        var s = -q - r;
        return new Hex(q, r);
    };
    return DoubledCoord;
}());
var Orientation = /** @class */ (function () {
    function Orientation(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
        this.f0 = f0;
        this.f1 = f1;
        this.f2 = f2;
        this.f3 = f3;
        this.b0 = b0;
        this.b1 = b1;
        this.b2 = b2;
        this.b3 = b3;
        this.start_angle = start_angle;
    }
    return Orientation;
}());
var Layout = /** @class */ (function () {
    function Layout(orientation, size, origin) {
        this.orientation = orientation;
        this.size = size;
        this.origin = origin;
    }
    Layout.prototype.hexToPixel = function (h) {
        var M = this.orientation;
        var size = this.size;
        var origin = this.origin;
        var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
        var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
        return new Point(x + origin.x, y + origin.y);
    };
    Layout.prototype.getPixel = function (q, r) {
        var M = this.orientation;
        var size = this.size;
        var origin = this.origin;
        var x = (M.f0 * q + M.f1 * r) * size.x;
        var y = (M.f2 * q + M.f3 * r) * size.y;
        return new Point(x + origin.x, y + origin.y);
    };
    Layout.prototype.pixelToHex = function (p) {
        var M = this.orientation;
        var size = this.size;
        var origin = this.origin;
        var pt = new Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
        var q = M.b0 * pt.x + M.b1 * pt.y;
        var r = M.b2 * pt.x + M.b3 * pt.y;
        return new Hex(q, r);
    };
    Layout.prototype.hexCornerOffset = function (corner) {
        var M = this.orientation;
        var size = this.size;
        var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6.0;
        return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
    };
    Layout.prototype.polygonCorners = function (h) {
        var corners = [];
        var center = this.hexToPixel(h);
        for (var i = 0; i < 6; i++) {
            var offset = this.hexCornerOffset(i);
            corners.push(new Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    };
    Layout.pointy = new Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
    Layout.flat = new Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);
    return Layout;
}());
/// <reference path="./hex.ts" />
/*
Game
- build waterways on edges
- water flowing logic
- tile watered state based on waterways

UI
- cleanup placeholder panels and buttons
- add elements (hex, line and corner) in separate layers so they draw and click correctly
    This means they need to be added in abs coordinates
- add a minimap that moves the map around

*/
// Game Data
var citizenNames = ["Cerbu", "Ioan", "Iulia", "Edi", "Silvia", "Sick", "Adi", "Andu", "Mihai", "Dan", "Vlad"];
var toxicityThresholds = [10, 20, 35, 55, 80];
var toxicityPerTurn = 0.2; // how much toxicity is spread by toxic tiles. multiplied by their toxicity level
var LineBuildings;
(function (LineBuildings) {
    LineBuildings[LineBuildings["Empty"] = 0] = "Empty";
    LineBuildings[LineBuildings["Waterway"] = 1] = "Waterway";
})(LineBuildings || (LineBuildings = {}));
;
var CornerBuildings;
(function (CornerBuildings) {
    CornerBuildings[CornerBuildings["Empty"] = 0] = "Empty";
    CornerBuildings[CornerBuildings["PowerPoint"] = 1] = "PowerPoint"; //Hehe
})(CornerBuildings || (CornerBuildings = {}));
;
function getToxicityLevel(toxicity) {
    for (var i = 0; i < toxicityThresholds.length; i++) {
        if (toxicity < toxicityThresholds[i]) {
            return i;
        }
    }
    return toxicityThresholds.length;
}
// Hex, Line & Point helpers
function Pt(x, y) { return new Point(x, y); }
;
// Starts in bottom right and goes anti-clockwise
// ! Careful, it has 7 points, the first and last are the same so we don't have to modulo when adding lines
var hexPoints = [Pt(50, 87), Pt(100, 0), Pt(50, -87), Pt(-50, -87), Pt(-100, -0), Pt(-50, 87), Pt(50, 87)];
var fullHexString = "50,87 100,0 50,-87 -50,-87 -100,-0 -50,87";
// const smallHexString = "40,69.6 80,-0 40,-69.6 -40,-69.6 -80,-0 -40,69.6"; // 80% of the full size
//const smallHexString = "42.5,73.95 85,0 42.5,-73.95 -42.5,-73.95 -85,-0 -42.5,73.95"; // 85% of the full size
var smallHexString = "45,78.3 90,-0 45,-78.3 -45,-78.3 -90,-0 -45,78.3"; // 90% of the full size
var Line = /** @class */ (function () {
    function Line(q, r, dir) {
        this.q = q;
        this.r = r;
        this.dir = dir;
    }
    return Line;
}());
var Corner = /** @class */ (function () {
    function Corner(q, r, dir) {
        this.q = q;
        this.r = r;
        this.dir = dir;
    }
    return Corner;
}());
function getHexNeighbours(hex) {
    return [new Hex(hex.q + Hex.directions[0].q, hex.r + Hex.directions[0].r),
        new Hex(hex.q + Hex.directions[1].q, hex.r + Hex.directions[1].r),
        new Hex(hex.q + Hex.directions[2].q, hex.r + Hex.directions[2].r),
        new Hex(hex.q + Hex.directions[3].q, hex.r + Hex.directions[3].r),
        new Hex(hex.q + Hex.directions[4].q, hex.r + Hex.directions[4].r),
        new Hex(hex.q + Hex.directions[5].q, hex.r + Hex.directions[5].r)];
}
// CRB: Basically each hex has 3 lines that "belong" to it.  The line is identified by the hex and the direction.
//  So to get the other three you look in the remaining three directions and point towards this hex
function getHexLines(hex) {
    var lines = [];
    lines.push(new Line(hex.q, hex.r, 0));
    lines.push(new Line(hex.q, hex.r, 1));
    lines.push(new Line(hex.q, hex.r, 2));
    lines.push(new Line(Hex.directions[3].q + hex.q, Hex.directions[3].r + hex.r, 0));
    lines.push(new Line(Hex.directions[4].q + hex.q, Hex.directions[4].r + hex.r, 1));
    lines.push(new Line(Hex.directions[5].q + hex.q, Hex.directions[5].r + hex.r, 2));
    return lines;
}
function getLineSides(line) {
    return [new Hex(line.q, line.r), new Hex(line.q + Hex.directions[line.dir].q, line.r + Hex.directions[line.dir].r)];
}
function getLineEnds(line) {
    return [new Hex(line.q + Hex.directions[(line.dir + 1) % 6].q, line.r + Hex.directions[(line.dir + 1) % 6].r),
        new Hex(line.q + Hex.directions[(line.dir + 5) % 6].q, line.r + Hex.directions[(line.dir + 5) % 6].r)];
}
function getLineHexes(line) {
    return [new Hex(line.q, line.r),
        new Hex(line.q + Hex.directions[line.dir].q, line.r + Hex.directions[line.dir].r),
        new Hex(line.q + Hex.directions[(line.dir + 1) % 6].q, line.r + Hex.directions[(line.dir + 1) % 6].r),
        new Hex(line.q + Hex.directions[(line.dir + 5) % 6].q, line.r + Hex.directions[(line.dir + 5) % 6].r),];
}
function getHexCorners(hex) {
    var corners = [];
    corners.push(new Corner(hex.q, hex.r, 0));
    corners.push(new Corner(hex.q, hex.r, 1));
    corners.push(new Corner(hex.q, hex.r, 2));
    corners.push(new Corner(Hex.directions[3].q + hex.q, Hex.directions[3].r + hex.r, 0));
    corners.push(new Corner(Hex.directions[4].q + hex.q, Hex.directions[4].r + hex.r, 1));
    corners.push(new Corner(Hex.directions[5].q + hex.q, Hex.directions[5].r + hex.r, 2));
    return corners;
}
function getCornerHexes(corner) {
    return [new Hex(corner.q, corner.r),
        new Hex(corner.q + Hex.directions[corner.dir].q, corner.r + Hex.directions[corner.dir].r),
        new Hex(corner.q + Hex.directions[(corner.dir + 5) % 6].q, corner.r + Hex.directions[(corner.dir + 5) % 6].r)];
}
function hexKey(q, r) {
    return q + r * 1000;
}
function lineKey(q, r, dir) {
    return dir + hexKey(q, r) * 4; //dir is 0-2
}
function cornerKey(q, r, dir) {
    return dir + hexKey(q, r) * 4; //dir is 0-2
}
// UI state
var Lens;
(function (Lens) {
    Lens[Lens["None"] = 0] = "None";
    Lens[Lens["Height"] = 1] = "Height";
})(Lens || (Lens = {}));
var lens = Lens.None;
function setLens(button) {
    Object.keys(Lens).forEach(function (key) { if (button.value == key) {
        lens = Lens[key];
    } });
    hexmap.refreshGfx();
}
var debugHexes = true;
// Helper functions
//function getRandomElement<Type>(dictionary: { [key: number]: Type; } ) : Type
//{
//    let keys = Object.keys(dictionary);
//    let index = Math.floor(Math.random() * keys.length);
//    return dictionary[keys[index]];
//}
function rgbToHexa(r, g, b) {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
// returns a random integer in the range [min, max]
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// SVG helpers
function createSmallHexElement() {
    var hexElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hexElement.setAttribute("points", smallHexString);
    return hexElement;
}
function createLineElement(x1, y1, x2, y2) {
    var lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineElement.setAttribute("x1", x1.toString());
    lineElement.setAttribute("y1", y1.toString());
    lineElement.setAttribute("x2", x2.toString());
    lineElement.setAttribute("y2", y2.toString());
    lineElement.setAttribute("stroke-width", "18");
    lineElement.setAttribute("stroke-linecap", "round");
    // Get the length of the line
    var length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    // Calculate the new start and end points
    var offset = 20;
    var newStartX = x1 + (offset / length) * (x2 - x1);
    var newStartY = y1 + (offset / length) * (y2 - y1);
    var newEndX = x2 - (offset / length) * (x2 - x1);
    var newEndY = y2 - (offset / length) * (y2 - y1);
    // Set the new start and end points
    lineElement.setAttribute("x1", newStartX.toString());
    lineElement.setAttribute("y1", newStartY.toString());
    lineElement.setAttribute("x2", newEndX.toString());
    lineElement.setAttribute("y2", newEndY.toString());
    return lineElement;
}
function createTextElement(x, y, text) {
    var textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute("x", x.toString());
    textElement.setAttribute("y", y.toString());
    textElement.textContent = text;
    return textElement;
}
function createCircleElement(x, y, radius) {
    var pointElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    pointElement.setAttribute("cx", x.toString());
    pointElement.setAttribute("cy", y.toString());
    pointElement.setAttribute("r", radius.toString());
    return pointElement;
}
// HTML helpers
var tempElements = [];
function clearTempElements() {
    tempElements.forEach(function (e) { return e.remove(); });
    tempElements = [];
}
function setTileGfx(element, tile) {
    switch (lens) {
        case Lens.Height:
            element.removeAttribute("class");
            element.setAttribute("fill", rgbToHexa(tile.height * 50, tile.height * 50, tile.height * 50));
            break;
        case Lens.None:
            element.removeAttribute("fill");
            element.removeAttribute("class");
            // type-specific style
            if (tile.toxicity > toxicityThresholds[0]) {
                var toxicityLevel = getToxicityLevel(tile.toxicity);
                element.classList.add("toxic" + clamp(toxicityLevel, 1, 4));
            }
            else if (tile.water > 0) {
                element.classList.add("water" + clamp(tile.water, 1, 3));
            }
            else {
                element.classList.add("land" + randInt(1, 3));
            }
            break;
    }
}
function setLineGfx(element, line) {
    switch (line.built) {
        case LineBuildings.Empty:
            element.setAttribute("class", "line-empty");
            break;
        case LineBuildings.Waterway:
            element.setAttribute("class", "line-waterway");
            break;
    }
}
function setCornerGfx(element, corner) {
    switch (corner.built) {
        case CornerBuildings.Empty:
            element.setAttribute("class", "corner-empty");
            break;
        case CornerBuildings.PowerPoint:
            element.setAttribute("class", "corner-power");
            break;
    }
}
function onSelectHex(hex) {
    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.add("selected");
}
function onHexHovered(hex) {
    clearTempElements();
    if (debugHexes) {
        var tile = hexmap.tiles[hexKey(hex.q, hex.r)];
        var text = "(" + hex.q + "," + hex.r + ")";
        if (tile.height > 0) {
            text += " h:" + tile.height;
        }
        if (tile.water > 0) {
            text += " w:" + tile.water;
        }
        if (tile.toxicity > 0) {
            text += " t:" + tile.toxicity;
        }
        var p = hexmap.layout.getPixel(hex.q, hex.r);
        var textElement = createTextElement(p.x, p.y, text);
        textElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(textElement);
        tempElements.push(textElement);
    }
    // number the neighbours
    for (var dir = 0; dir < 6; dir++) {
        var neighbour = Hex.neighbor(hex, dir);
        var neighbourText = "" + dir;
        var neighbourP = hexmap.layout.getPixel(neighbour.q, neighbour.r);
        var neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
        neighbourTextElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(neighbourTextElement);
        tempElements.push(neighbourTextElement);
    }
    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.add("hover");
}
function onHexUnhovered(hex) {
    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.remove("hover");
}
function onLineHovered(line) {
    clearTempElements();
    // number the neighbours
    getLineHexes(line).forEach(function (hex, index) {
        var neighbourText = "" + index;
        var neighbourP = hexmap.layout.getPixel(hex.q, hex.r);
        var neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
        neighbourTextElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(neighbourTextElement);
        tempElements.push(neighbourTextElement);
    });
    //BUG: Getting error hovering over edge lines
    hexmap.lineElements[lineKey(line.q, line.r, line.dir)].classList.add("line-hover");
}
function onCornerHovered(corner) {
    clearTempElements();
    // number the neighbours
    getCornerHexes(corner).forEach(function (hex, index) {
        var neighbourText = "" + index;
        var neighbourP = hexmap.layout.getPixel(hex.q, hex.r);
        var neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
        neighbourTextElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(neighbourTextElement);
        tempElements.push(neighbourTextElement);
    });
    hexmap.cornerElements[lineKey(corner.q, corner.r, corner.dir)].classList.add("corner-hover");
}
var TileData = /** @class */ (function () {
    function TileData() {
        this.coords = null;
        this.height = 0;
        this.water = 0;
        this.toxicity = 0;
    }
    TileData.toxicTile = function () {
        var tile = new TileData();
        tile.toxicity = toxicityThresholds[randInt(0, 3)];
        return tile;
    };
    TileData.waterTile = function () {
        var tile = new TileData();
        tile.water = randInt(1, 3);
        return tile;
    };
    TileData.landTile = function () {
        var tile = new TileData();
        return tile;
    };
    TileData.makeRandomTile = function () {
        var funcs = [TileData.toxicTile, TileData.waterTile, TileData.landTile];
        var tile = funcs[Math.floor(Math.random() * funcs.length)]();
        tile.height = Math.floor(Math.random() * 5);
        return tile;
    };
    return TileData;
}());
var LineData = /** @class */ (function () {
    function LineData() {
        this.coords = null;
        this.built = LineBuildings.Empty;
    }
    return LineData;
}());
var CornerData = /** @class */ (function () {
    function CornerData() {
        this.coords = null;
        this.built = CornerBuildings.Empty;
    }
    return CornerData;
}());
var HexMap = /** @class */ (function () {
    function HexMap() {
        // Game
        this.mapRadius = 5;
        this.tiles = {};
        this.lines = {};
        this.corners = {};
        // UI
        this.layout = new Layout(Layout.flat, Pt(100, 100), Pt(0, 0));
    }
    HexMap.prototype.init = function () {
        this.mapHtml = document.getElementById("hexmap");
        this.setCamera(0, 0, 0.5);
    };
    HexMap.prototype.populateWithRandomTiles = function () {
        for (var x = -this.mapRadius; x <= this.mapRadius; x++) {
            for (var y = -this.mapRadius; y <= this.mapRadius; y++) {
                if (Math.abs(x + y) <= this.mapRadius) {
                    this.addNewTile(x, y, TileData.makeRandomTile());
                }
            }
        }
    };
    HexMap.prototype.refreshGfx = function () {
        var _this = this;
        if (this.tileElements === undefined) {
            this.tileElements = {};
            var _loop_1 = function (key) {
                var tile = this_1.tiles[key];
                var hex = tile.coords;
                // tile hex
                var polygon = createSmallHexElement();
                polygon.onclick = function () { _this.onHexClicked(hex); };
                polygon.onmouseenter = function () { onHexHovered(hex); };
                polygon.onmouseleave = function () { onHexUnhovered(hex); };
                // move everything toghether
                var tileElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
                tileElement.appendChild(polygon);
                var p = this_1.layout.getPixel(hex.q, hex.r);
                tileElement.setAttribute("transform", "translate(" + p.x + "," + p.y + ")");
                this_1.tileElements[hexKey(hex.q, hex.r)] = tileElement;
                this_1.mapHtml.appendChild(tileElement);
            };
            var this_1 = this;
            for (var key in this.tiles) {
                _loop_1(key);
            }
        }
        for (var key in this.tiles) {
            var tile = this.tiles[key];
            var element = this.tileElements[key];
            setTileGfx(element, tile);
        }
        if (this.lineElements === undefined) {
            this.lineElements = {};
            var _loop_2 = function (key) {
                var lineData = this_2.lines[key];
                var line = lineData.coords;
                var hexCenter = this_2.layout.getPixel(line.q, line.r);
                var lineElement = createLineElement(hexCenter.x + hexPoints[line.dir].x, hexCenter.y + hexPoints[line.dir].y, hexCenter.x + hexPoints[line.dir + 1].x, hexCenter.y + hexPoints[line.dir + 1].y);
                lineElement.onclick = function () { _this.onLineClicked(line); };
                lineElement.onmouseenter = function () { onLineHovered(line); };
                lineElement.onmouseleave = function () { lineElement.classList.remove("line-hover"); };
                this_2.lineElements[key] = lineElement;
                this_2.mapHtml.appendChild(lineElement);
            };
            var this_2 = this;
            for (var key in this.lines) {
                _loop_2(key);
            }
        }
        for (var key in this.lines) {
            var line = this.lines[key];
            var element = this.lineElements[key];
            setLineGfx(element, line);
        }
        if (this.cornerElements === undefined) {
            this.cornerElements = {};
            var _loop_3 = function (key) {
                var cornerData = this_3.corners[key];
                var corner = cornerData.coords;
                var hexCenter = this_3.layout.getPixel(corner.q, corner.r);
                var pointElement = createCircleElement(hexCenter.x + hexPoints[corner.dir].x, hexCenter.y + hexPoints[corner.dir].y, 10);
                pointElement.onclick = function () { _this.onCornerClicked(corner); };
                pointElement.onmouseenter = function () { onCornerHovered(corner); };
                pointElement.onmouseleave = function () { pointElement.classList.remove("corner-hover"); };
                this_3.cornerElements[key] = pointElement;
                this_3.mapHtml.appendChild(pointElement);
            };
            var this_3 = this;
            for (var key in this.corners) {
                _loop_3(key);
            }
        }
        for (var key in this.corners) {
            var corner = this.corners[key];
            var element = this.cornerElements[key];
            setCornerGfx(element, corner);
        }
    };
    HexMap.prototype.getTileNeighbourTiles = function (tile) {
        var neighbours = [];
        for (var _i = 0, _a = getHexNeighbours(tile.coords); _i < _a.length; _i++) {
            var neighbourHex = _a[_i];
            var neighbour = this.tiles[hexKey(neighbourHex.q, neighbourHex.r)];
            if (neighbour) {
                neighbours.push(neighbour);
            }
        }
        return neighbours;
    };
    HexMap.prototype.isHexInMap = function (q, r) {
        return ((Math.abs(q) + Math.abs(r) + Math.abs(-q - r)) / 2) <= this.mapRadius; //hex.len() <= this.mapRadius;
    };
    HexMap.prototype.unselectHex = function () {
        this.mapHtml.querySelectorAll(".selected").forEach(function (e) { return e.classList.remove("selected"); });
    };
    HexMap.prototype.selectHex = function (q, r) {
        this.unselectHex();
        this.tileElements[hexKey(q, r)].classList.add("selected");
    };
    HexMap.prototype.setCamera = function (q, y, scale) {
        this.mapHtml.setAttribute("transform", "translate(" + q + "," + y + ") scale(" + scale + ")");
    };
    ///> Adds the tile to the map and creates the lines and corners
    HexMap.prototype.addNewTile = function (q, r, tile) {
        var hex = new Hex(q, r);
        // hex data
        tile.coords = hex;
        this.tiles[hexKey(q, r)] = tile;
        // hex lines
        var hexLines = getHexLines(hex);
        for (var lineNum = 0; lineNum < 6; lineNum++) {
            var line = hexLines[lineNum];
            if (lineNum < 3 || !this.isHexInMap(line.q, line.r)) {
                var lineData = new LineData();
                lineData.coords = line;
                this.lines[lineKey(line.q, line.r, line.dir)] = lineData;
            }
        }
        // hex corners (only on the inside of the map)
        var hexCorners = getHexCorners(hex);
        for (var cornerNum = 0; cornerNum < 3; cornerNum++) // only 3 corners since other 3 are covered by other hexes
         {
            var keepCorner = true;
            var corner = hexCorners[cornerNum];
            for (var _i = 0, _a = getCornerHexes(corner); _i < _a.length; _i++) {
                var hex_1 = _a[_i];
                if (!this.isHexInMap(hex_1.q, hex_1.r))
                    keepCorner = false;
            }
            if (!keepCorner)
                continue;
            // game logic data
            var cornerData = new CornerData();
            cornerData.coords = corner;
            this.corners[cornerKey(corner.q, corner.r, corner.dir)] = cornerData;
        }
    };
    return HexMap;
}());
var Citizen = /** @class */ (function () {
    function Citizen() {
        this.name = "ph_name";
        this.assignedTile = null;
        this.status = true;
    }
    return Citizen;
}());
var CitizensList = /** @class */ (function () {
    function CitizensList() {
        this.citizens = [];
        //CRB: This doesn't work because it's called in the constructor, but the html hasn't finished loading. Need to wait for onload
        //this.table = document.getElementById("citizens_table") as HTMLTableElement;
    }
    CitizensList.prototype.initUI = function () {
        this.table = document.getElementById("citizens_table");
        this.rows = this.table.rows;
    };
    CitizensList.prototype.loadCitizens = function (citizens) {
        this.citizens = citizens;
    };
    CitizensList.prototype.populateWithRandomCitizens = function () {
        this.citizens = [];
        for (var i = 0; i < 10; i++) {
            var citizen = new Citizen;
            citizen.name = citizenNames[Math.floor(Math.random() * citizenNames.length)];
            this.citizens.push(citizen);
        }
    };
    CitizensList.prototype.refreshGfx = function () {
        // clearTable
        for (var i = 0; i < this.citizens.length; i++) {
            this.table.deleteRow(-1);
        }
        // fill it based on citizens
        for (var i = 0; i < this.citizens.length; i++) {
            var citizen = this.citizens[i];
            var row = this.table.insertRow(-1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            cell1.innerHTML = citizen.name;
            cell2.innerHTML = citizen.assignedTile ? citizen.assignedTile[0] + "," + citizen.assignedTile[1] : "Idle";
            cell3.innerHTML = citizen.status ? "Alive" : "Dead";
        }
    };
    return CitizensList;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.clicks = 0;
    }
    Game.prototype.resetState = function () {
        localStorage.clear();
        this.loadState();
    };
    Game.prototype.loadState = function () {
        var saveName = "save1";
        var saveString = localStorage.getItem(saveName);
        if (saveString === null) {
            console.log("No saved data found. Generating new random one.");
            citizensList.populateWithRandomCitizens();
            hexmap.populateWithRandomTiles();
        }
        else {
            var saveJson = JSON.parse(saveString);
            console.log("Loaded saved data from " + saveName + ".");
            citizensList.loadCitizens(saveJson.citizens);
            hexmap.tiles = saveJson.tiles;
            hexmap.lines = saveJson.lines;
            hexmap.corners = saveJson.corners;
        }
        citizensList.refreshGfx();
        hexmap.refreshGfx();
    };
    Game.prototype.saveState = function () {
        var saveName = "save1";
        var saveJson = {
            citizens: citizensList.citizens,
            tiles: hexmap.tiles,
            lines: hexmap.lines,
            corners: hexmap.corners
        };
        var saveString = JSON.stringify(saveJson);
        localStorage.setItem(saveName, saveString);
        console.log("Saved data to " + saveName + ".");
    };
    Game.prototype.init = function () {
        var _this = this;
        //TODO: merge tile & game classes
        citizensList.initUI();
        hexmap.init();
        this.selectedTypeElement = document.getElementById("selected_type");
        this.slectedPositionElement = document.getElementById("selected_position");
        this.selectedHeightElement = document.getElementById("selected_height");
        this.selectedWaterElement = document.getElementById("selected_water");
        this.selectedToxicityElement = document.getElementById("selected_toxicity");
        document.getElementById("restart").onclick = function () { _this.resetState(); };
        document.getElementById("savegame").onclick = function () { _this.saveState(); };
        document.getElementById("loadgame").onclick = function () { _this.loadState(); };
        document.getElementById("nextturn").onclick = function () { _this.nextTurn(); };
        this.loadState();
    };
    Game.prototype.clicked = function (q, r) {
        this.clicks++;
        this.selectedTypeElement.textContent = "Score:" + this.clicks;
        console.log("Clicked ", q, r);
    };
    Game.prototype.nextTurn = function () {
        // spread toxicity
        for (var key in hexmap.tiles) {
            var tile = hexmap.tiles[key];
            if (tile.toxicity > toxicityThresholds[0]) {
                var toxicityLevel = getToxicityLevel(tile.toxicity);
                var maxToxicity = toxicityThresholds[toxicityLevel];
                for (var _i = 0, _a = hexmap.getTileNeighbourTiles(tile); _i < _a.length; _i++) {
                    var neighbor = _a[_i];
                    if (neighbor.toxicity < maxToxicity) {
                        neighbor.toxicity = clamp(neighbor.toxicity + toxicityPerTurn * toxicityLevel, 0, maxToxicity);
                    }
                }
            }
        }
        citizensList.refreshGfx();
        hexmap.refreshGfx();
    };
    return Game;
}());
var game = new Game;
var hexmap = new HexMap;
var citizensList = new CitizensList;
var selectedTile = [0, 0]; // Need to remember selected tile
window.onload = function () {
    console.log("Loaded");
    game.init();
    hexmap.onHexClicked = function (hex) {
        selectedTile = [hex.q, hex.r];
        hexmap.selectHex(hex.q, hex.r);
        game.selectedTypeElement.textContent = "Type: Hex";
        game.slectedPositionElement.textContent = "Position: " + hex.q + "," + hex.r + ",";
        game.selectedHeightElement.textContent = "Height: " + hexmap.tiles[hexKey(hex.q, hex.r)].height;
        game.selectedWaterElement.textContent = "Water: " + hexmap.tiles[hexKey(hex.q, hex.r)].water;
        var tox = hexmap.tiles[hexKey(hex.q, hex.r)].toxicity;
        game.selectedToxicityElement.textContent = "Toxicity: " + getToxicityLevel(tox) + " (" + tox + ")";
    };
    hexmap.onLineClicked = function (line) {
        game.selectedTypeElement.textContent = "Type: Edge";
        game.slectedPositionElement.textContent = "Position: " + line.q + "," + line.r + "," + line.dir;
        game.selectedHeightElement.textContent = "";
        game.selectedWaterElement.textContent = "";
        game.selectedToxicityElement.textContent = "";
    };
    hexmap.onCornerClicked = function (corner) {
        game.selectedTypeElement.textContent = "Type: Point";
        game.slectedPositionElement.textContent = "Position: " + corner.q + "," + corner.r + "," + corner.dir;
        game.selectedHeightElement.textContent = "";
        game.selectedWaterElement.textContent = "";
        game.selectedToxicityElement.textContent = "";
    };
};
//# sourceMappingURL=game.js.map