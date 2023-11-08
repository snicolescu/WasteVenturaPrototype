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
    Hex.prototype.add = function (b) {
        return new Hex(this.q + b.q, this.r + b.r);
    };
    Hex.prototype.subtract = function (b) {
        return new Hex(this.q - b.q, this.r - b.r);
    };
    Hex.prototype.scale = function (k) {
        return new Hex(this.q * k, this.r * k);
    };
    Hex.prototype.rotateLeft = function () {
        var s = -this.q - this.r;
        return new Hex(-s, -this.q);
    };
    Hex.prototype.rotateRight = function () {
        var s = -this.q - this.r;
        return new Hex(-this.r, -s);
    };
    Hex.direction = function (direction) {
        return Hex.directions[direction];
    };
    Hex.prototype.neighbor = function (direction) {
        return this.add(Hex.direction(direction));
    };
    Hex.prototype.diagonalNeighbor = function (direction) {
        return this.add(Hex.diagonals[direction]);
    };
    Hex.prototype.len = function () {
        var s = -this.q - this.r;
        return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(s)) / 2;
    };
    Hex.prototype.distance = function (b) {
        return this.subtract(b).len();
    };
    Hex.prototype.lerp = function (b, t) {
        return new Hex(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t);
    };
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
/* TODO:
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
// Hex, Line & Point helpers
function Pt(x, y) { return new Point(x, y); }
;
// Starts in bottom right and goes anti-clockwise
// ! Careful, it has 7 points, the first and last are the same so we don't have to modulo when adding lines
var hexPoints = [Pt(50, 87), Pt(100, 0), Pt(50, -87), Pt(-50, -87), Pt(-100, -0), Pt(-50, 87), Pt(50, 87)];
var fullHexString = "50,87 100,0 50,-87 -50,-87 -100,-0 -50,87";
// const smallHexString = "40,69.6 80,-0 40,-69.6 -40,-69.6 -80,-0 -40,69.6"; // 80% of the full size
var smallHexString = "42.5,73.95 85,0 42.5,-73.95 -42.5,-73.95 -85,-0 -42.5,73.95"; // 85% of the full size
// const smallHexString = "45,78.3 90,-0 45,-78.3 -45,-78.3 -90,-0 -45,78.3"; // 90% of the full size
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
    return "#".concat(((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1));
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
            // type-specific style
            if (tile.toxicity > 0) {
                element.setAttribute("class", "toxic");
            }
            else if (tile.water > 0) {
                element.setAttribute("class", "water");
            }
            else {
                element.setAttribute("class", "land");
            }
            break;
    }
}
function setLineGfx(element, line) {
}
function setCornerGfx(element, corner) {
}
function onSelectHex(hex) {
    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.add("selected");
}
function onHexHovered(hex) {
    clearTempElements();
    if (debugHexes) {
        var tile = hexmap.tiles[hexKey(hex.q, hex.r)];
        var text = "(".concat(hex.q, ",").concat(hex.r, ")");
        if (tile.height > 0) {
            text += " h:".concat(tile.height);
        }
        if (tile.water > 0) {
            text += " w:".concat(tile.water);
        }
        if (tile.toxicity > 0) {
            text += " t:".concat(tile.toxicity);
        }
        var p = hexmap.layout.getPixel(hex.q, hex.r);
        var textElement = createTextElement(p.x, p.y, text);
        textElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(textElement);
        tempElements.push(textElement);
    }
    // number the neighbours
    for (var dir = 0; dir < 6; dir++) {
        var neighbour = hex.neighbor(dir);
        var neighbourText = "".concat(dir);
        var neighbourP = hexmap.layout.getPixel(neighbour.q, neighbour.r);
        var neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
        neighbourTextElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(neighbourTextElement);
        tempElements.push(neighbourTextElement);
    }
    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.add("hover");
}
function onLineHovered(line) {
    clearTempElements();
    // number the neighbours
    getLineHexes(line).forEach(function (hex, index) {
        var neighbourText = "".concat(index);
        var neighbourP = hexmap.layout.getPixel(hex.q, hex.r);
        var neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
        neighbourTextElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(neighbourTextElement);
        tempElements.push(neighbourTextElement);
    });
    hexmap.lineElements[lineKey(line.q, line.r, line.dir)].classList.add("line_hover");
}
function onCornerHovered(corner) {
    clearTempElements();
    // number the neighbours
    getCornerHexes(corner).forEach(function (hex, index) {
        var neighbourText = "".concat(index);
        var neighbourP = hexmap.layout.getPixel(hex.q, hex.r);
        var neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
        neighbourTextElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(neighbourTextElement);
        tempElements.push(neighbourTextElement);
    });
    hexmap.pointElements[lineKey(corner.q, corner.r, corner.dir)].classList.add("point_hover");
}
var TileData = /** @class */ (function () {
    function TileData() {
        this.height = 0;
        this.water = 0;
        this.toxicity = 0;
    }
    TileData.toxicTile = function () {
        var tile = new TileData();
        tile.toxicity = 1;
        return tile;
    };
    TileData.waterTile = function () {
        var tile = new TileData();
        tile.water = 1;
        return tile;
    };
    TileData.getRandomTile = function () {
        var funcs = [TileData.toxicTile, TileData.waterTile];
        var tile = funcs[Math.floor(Math.random() * funcs.length)]();
        tile.height = Math.floor(Math.random() * 5);
        return tile;
    };
    return TileData;
}());
var LineData = /** @class */ (function () {
    function LineData() {
    }
    return LineData;
}());
var CornerData = /** @class */ (function () {
    function CornerData() {
    }
    return CornerData;
}());
var HexMap = /** @class */ (function () {
    function HexMap() {
        this.mapRadius = 5;
        this.tiles = {};
        this.tileElements = {};
        this.lines = {};
        this.lineElements = {};
        this.points = {};
        this.pointElements = {};
        this.layout = new Layout(Layout.flat, Pt(100, 100), Pt(0, 0));
    }
    HexMap.prototype.init = function () {
        this.mapHtml = document.getElementById("hexmap");
        for (var x = -this.mapRadius; x <= this.mapRadius; x++) {
            for (var y = -this.mapRadius; y <= this.mapRadius; y++) {
                if (Math.abs(x + y) <= this.mapRadius) {
                    this.addHexElement(x, y);
                }
            }
        }
        this.setCamera(0, 0, 0.5);
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
        this.mapHtml.setAttribute("transform", "translate(".concat(q, ",").concat(y, ") scale(").concat(scale, ")"));
    };
    HexMap.prototype.addHexElement = function (q, r) {
        var _this = this;
        var p = this.layout.getPixel(q, r);
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
        // tile hex
        var polygon = createSmallHexElement();
        polygon.onclick = function () { _this.onHexClicked(q, r); };
        polygon.onmouseenter = function () { onHexHovered(new Hex(q, r)); };
        polygon.onmouseleave = function () { polygon.classList.remove("hover"); };
        newElement.appendChild(polygon);
        // game logic data
        var tile = TileData.getRandomTile();
        this.tiles[hexKey(q, r)] = tile;
        setTileGfx(polygon, tile);
        this.tileElements[hexKey(q, r)] = polygon;
        var hex = new Hex(q, r);
        // hex lines
        var hexLines = getHexLines(hex);
        var _loop_1 = function (lineNum) {
            var line = hexLines[lineNum];
            if (lineNum < 3 || !this_1.isHexInMap(line.q, line.r)) {
                var lineElement_1 = createLineElement(hexPoints[lineNum].x, hexPoints[lineNum].y, hexPoints[lineNum + 1].x, hexPoints[lineNum + 1].y);
                lineElement_1.onclick = function () { _this.onLineClicked(q, r, lineNum); };
                lineElement_1.onmouseenter = function () { onLineHovered(line); };
                lineElement_1.onmouseleave = function () { lineElement_1.classList.remove("line_hover"); };
                newElement.appendChild(lineElement_1);
                // game logic data
                var lineData = new LineData();
                this_1.lines[lineKey(q, r, lineNum)] = lineData;
                setLineGfx(lineElement_1, lineData);
                this_1.lineElements[lineKey(q, r, lineNum)] = lineElement_1;
            }
        };
        var this_1 = this;
        for (var lineNum = 0; lineNum < 6; lineNum++) {
            _loop_1(lineNum);
        }
        // hex corners (only on the inside of the map)
        var hexCorners = getHexCorners(hex);
        var _loop_2 = function (cornerNum) {
            var keepCorner = true;
            var corner = hexCorners[cornerNum];
            for (var _i = 0, _a = getCornerHexes(corner); _i < _a.length; _i++) {
                var hex_1 = _a[_i];
                if (!this_2.isHexInMap(hex_1.q, hex_1.r))
                    keepCorner = false;
            }
            if (!keepCorner)
                return "continue";
            var pointElement = createCircleElement(hexPoints[cornerNum].x, hexPoints[cornerNum].y, 10);
            pointElement.onclick = function () { _this.onCornerClicked(q, r, cornerNum); };
            pointElement.onmouseenter = function () { onCornerHovered(corner); };
            pointElement.onmouseleave = function () { pointElement.classList.remove("point_hover"); };
            newElement.appendChild(pointElement);
            // game logic data
            var cornerData = new CornerData();
            this_2.points[cornerKey(q, r, cornerNum)] = cornerData;
            setCornerGfx(pointElement, cornerData);
            this_2.pointElements[cornerKey(q, r, cornerNum)] = pointElement;
        };
        var this_2 = this;
        for (var cornerNum = 0; cornerNum < 3; cornerNum++) // only 3 corners since other 3 are covered by other hexes
         {
            _loop_2(cornerNum);
        }
        // move everything toghether
        newElement.setAttribute("transform", "translate(".concat(p.x, ",").concat(p.y, ")"));
        this.mapHtml.appendChild(newElement);
        return newElement;
    };
    HexMap.prototype.refreshGfx = function () {
        for (var key in this.tiles) {
            var tile = this.tiles[key];
            var element = this.tileElements[key];
            setTileGfx(element, tile);
        }
    };
    return HexMap;
}());
var Citizen = /** @class */ (function () {
    function Citizen() {
        this.name = "ph_name";
        this.assignedTile = null;
        this.status = false;
    }
    return Citizen;
}());
var CitizensList = /** @class */ (function () {
    function CitizensList() {
        this.citizens = [];
        this.citizenNames = ["Cerbu", "Ioan", "Iulia", "Edi", "Silvia", "Sick", "Adi", "Andu", "Mihai", "Dan", "Vlad"];
        this.table = document.getElementById("citizens_table");
        // this.rows = this.table.getElementsByTagName("tr"); // It doesn't work sadly
    }
    CitizensList.prototype.addCitizen = function () {
        this.citizens.push(new Citizen);
    };
    CitizensList.prototype.removeCitizen = function () {
        this.citizens.pop();
    };
    CitizensList.prototype.populateWithRandomCitizens = function () {
        for (var i = 0; i < 10; i++) {
            var citizen = new Citizen;
            citizen.name = this.citizenNames[Math.floor(Math.random() * this.citizenNames.length)];
            this.addCitizen();
        }
    };
    CitizensList.prototype.clearTable = function () {
        for (var i = this.rows.length - 1; i > 0; i--) {
            this.table.deleteRow(i);
        }
    };
    return CitizensList;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.clicks = 0;
    }
    Game.prototype.init = function () {
        this.selectedTypeElement = document.getElementById("selected_type");
        this.slectedPositionElement = document.getElementById("selected_position");
        this.selectedHeightElement = document.getElementById("selected_height");
        this.selectedWaterElement = document.getElementById("selected_water");
        this.selectedToxicityElement = document.getElementById("selected_toxicity");
    };
    Game.prototype.clicked = function (q, r) {
        this.clicks++;
        this.selectedTypeElement.textContent = "Score:" + this.clicks;
        console.log("Clicked ", q, r);
    };
    return Game;
}());
var game = new Game;
var hexmap = new HexMap;
var citizensList = new CitizensList;
// citizensList.populateWithRandomCitizens();
// citizensList.clearTable();
var selectedTile = [0, 0]; // Need to remember selected tile
window.onload = function () {
    console.log("Loaded");
    //TODO: merge tile & game classes
    hexmap.init();
    game.init();
    hexmap.onHexClicked = function (q, r) {
        selectedTile = [q, r];
        hexmap.selectHex(q, r);
        game.selectedTypeElement.textContent = "Type: Hex";
        game.slectedPositionElement.textContent = "Position: " + q + "," + r + ",";
        game.selectedHeightElement.textContent = "Height: " + hexmap.tiles[hexKey(q, r)].height;
        game.selectedWaterElement.textContent = "Water: " + hexmap.tiles[hexKey(q, r)].water;
        game.selectedToxicityElement.textContent = "Toxicity: " + hexmap.tiles[hexKey(q, r)].toxicity;
    };
    hexmap.onLineClicked = function (q, r, dir) {
        game.selectedTypeElement.textContent = "Type: Edge";
        game.slectedPositionElement.textContent = "Position: " + q + "," + r + "," + dir;
        game.selectedHeightElement.textContent = "";
        game.selectedWaterElement.textContent = "";
        game.selectedToxicityElement.textContent = "";
    };
    hexmap.onCornerClicked = function (q, r, dir) {
        game.selectedTypeElement.textContent = "Type: Point";
        game.slectedPositionElement.textContent = "Position: " + q + "," + r + "," + dir;
        game.selectedHeightElement.textContent = "";
        game.selectedWaterElement.textContent = "";
        game.selectedToxicityElement.textContent = "";
    };
};
//# sourceMappingURL=game.js.map