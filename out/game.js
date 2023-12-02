// Generated code -- CC0 -- No Rights Reserved -- http://www.redblobgames.com/grids/hexagons/
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
function PtAdd(a, b) { return new Point(a.x + b.x, a.y + b.y); }
function PtMultiply(a, n) { return new Point(a.x * n, a.y * n); }
function PtNormalize(a) { return PtMultiply(a, 1.0 / Math.sqrt(a.x * a.x + a.y * a.y)); }
function VectorAngleDeg(a) {
    return Math.atan2(a.y, a.x) * (180.0 / Math.PI);
}
class Hex {
    constructor(q, r) {
        this.q = q;
        this.r = r;
    }
    static neighbor(h, direction) {
        return new Hex(h.q + Hex.directions[direction].q, h.r + Hex.directions[direction].r);
    }
    static diagonalNeighbor(h, direction) {
        return new Hex(h.q + Hex.diagonals[direction].q, h.r + Hex.diagonals[direction].r);
    }
}
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
class OffsetCoord {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }
    static qoffsetFromCube(offset, h) {
        var col = h.q;
        var row = h.r + (h.q + offset * (h.q & 1)) / 2;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new OffsetCoord(col, row);
    }
    static qoffsetToCube(offset, h) {
        var q = h.col;
        var r = h.row - (h.col + offset * (h.col & 1)) / 2;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new Hex(q, r);
    }
    static roffsetFromCube(offset, h) {
        var col = h.q + (h.r + offset * (h.r & 1)) / 2;
        var row = h.r;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new OffsetCoord(col, row);
    }
    static roffsetToCube(offset, h) {
        var q = h.col - (h.row + offset * (h.row & 1)) / 2;
        var r = h.row;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new Hex(q, r);
    }
}
OffsetCoord.EVEN = 1;
OffsetCoord.ODD = -1;
class DoubledCoord {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }
    static qdoubledFromCube(h) {
        var col = h.q;
        var row = 2 * h.r + h.q;
        return new DoubledCoord(col, row);
    }
    qdoubledToCube() {
        var q = this.col;
        var r = (this.row - this.col) / 2;
        var s = -q - r;
        return new Hex(q, r);
    }
    static rdoubledFromCube(h) {
        var col = 2 * h.q + h.r;
        var row = h.r;
        return new DoubledCoord(col, row);
    }
    rdoubledToCube() {
        var q = (this.col - this.row) / 2;
        var r = this.row;
        var s = -q - r;
        return new Hex(q, r);
    }
}
class Orientation {
    constructor(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
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
}
class Layout {
    constructor(orientation, size, origin) {
        this.orientation = orientation;
        this.size = size;
        this.origin = origin;
    }
    hexToPixel(h) {
        var M = this.orientation;
        var size = this.size;
        var origin = this.origin;
        var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
        var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
        return new Point(x + origin.x, y + origin.y);
    }
    getPixel(q, r) {
        var M = this.orientation;
        var size = this.size;
        var origin = this.origin;
        var x = (M.f0 * q + M.f1 * r) * size.x;
        var y = (M.f2 * q + M.f3 * r) * size.y;
        return new Point(x + origin.x, y + origin.y);
    }
    pixelToHex(p) {
        var M = this.orientation;
        var size = this.size;
        var origin = this.origin;
        var pt = new Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
        var q = M.b0 * pt.x + M.b1 * pt.y;
        var r = M.b2 * pt.x + M.b3 * pt.y;
        return new Hex(q, r);
    }
    hexCornerOffset(corner) {
        var M = this.orientation;
        var size = this.size;
        var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6.0;
        return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
    }
    polygonCorners(h) {
        var corners = [];
        var center = this.hexToPixel(h);
        for (var i = 0; i < 6; i++) {
            var offset = this.hexCornerOffset(i);
            corners.push(new Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    }
}
Layout.pointy = new Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
Layout.flat = new Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);
// Helper functions
function assert(condition, msg) {
    if (!condition) {
        throw new Error(msg);
    }
}
function rgbToHexa(r, g, b) {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
// returns a random integer in the range [min, max]
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomElement(dictionary) {
    let keys = Object.keys(dictionary);
    let index = Math.floor(Math.random() * keys.length);
    return dictionary[keys[index]];
}
// HTML helpers
function createSmallHexElement() {
    var hexElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hexElement.setAttribute("points", smallHexString);
    return hexElement;
}
function createLineElement(x1, y1, x2, y2) {
    var lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineElement.setAttribute("stroke-linecap", "round");
    // Get the length of the line
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    // Calculate the new start and end points
    const offset = 20;
    const newStartX = x1 + (offset / length) * (x2 - x1);
    const newStartY = y1 + (offset / length) * (y2 - y1);
    const newEndX = x2 - (offset / length) * (x2 - x1);
    const newEndY = y2 - (offset / length) * (y2 - y1);
    // Set the new start and end points
    lineElement.setAttribute("x1", newStartX.toString());
    lineElement.setAttribute("y1", newStartY.toString());
    lineElement.setAttribute("x2", newEndX.toString());
    lineElement.setAttribute("y2", newEndY.toString());
    return lineElement;
}
const dirFwdX = [
    -Math.cos(Math.PI / 3),
    -Math.cos(2 * Math.PI / 3),
    -Math.cos(Math.PI),
    -Math.cos(4 * Math.PI / 3),
    -Math.cos(5 * Math.PI / 3),
    -Math.cos(0),
];
const dirFwdY = [
    Math.sin(Math.PI / 3),
    Math.sin(2 * Math.PI / 3),
    Math.sin(Math.PI),
    Math.sin(4 * Math.PI / 3),
    Math.sin(5 * Math.PI / 3),
    Math.sin(0),
];
function createSideElement(x1, y1, x2, y2, dir) {
    var element = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const wideX = dirFwdY[dir] * 5;
    const wideY = -dirFwdX[dir] * 5;
    x1 -= dirFwdX[dir] * 12;
    y1 -= dirFwdY[dir] * 12;
    x2 += dirFwdX[dir] * 12;
    y2 += dirFwdY[dir] * 12;
    element.setAttribute("points", `${x1 + wideX},${y1 + wideY} ${x1 - wideX},${y1 - wideY} ${x2 - wideX},${y2 - wideY} ${x2 + wideX},${y2 + wideY}`);
    return element;
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
function createArrowHead() {
    // <path d="M 0 0 l 20 20 l 0 -10 l 110.88457268119896 0 l -3 -10 l 3 -10 l -110.88457268119896 0 l 0 -10 Z" ></path>
    var element = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    //arrowElement.setAttribute("d", "M 0 0 l 20 20 l 0 -10 l 110.88457268119896 0 l -3 -10 l 3 -10 l -110.88457268119896 0 l 0 -10 Z");
    element.setAttribute("points", "-20,-10 20,0 -20,10");
    return element;
}
function createRectangleElement(width, height) {
    var element = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    let halfWidth = width / 2;
    let halfHeight = height / 2;
    element.setAttribute("points", `-${halfWidth},-${halfHeight} ${halfWidth},-${halfHeight} ${halfWidth},${halfHeight} -${halfWidth},${halfHeight}`);
    return element;
}
function addDropdownChild(parent, label, callback) {
    let dropdownItem1 = document.createElement("a");
    dropdownItem1.classList.add("dropdown-item");
    dropdownItem1.href = "#";
    dropdownItem1.textContent = label;
    dropdownItem1.onclick = callback;
    parent.appendChild(dropdownItem1);
}
// Hex, Line & Point helpers
function Pt(x, y) { return new Point(x, y); }
;
// Starts in bottom right and goes anti-clockwise
// ! Careful, it has 7 points, the first and last are the same so we don't have to modulo when adding lines
const hexPoints = [Pt(50, 87), Pt(100, 0), Pt(50, -87), Pt(-50, -87), Pt(-100, -0), Pt(-50, 87), Pt(50, 87)];
const fullHexString = "50,87 100,0 50,-87 -50,-87 -100,-0 -50,87";
// const smallHexString = "40,69.6 80,-0 40,-69.6 -40,-69.6 -80,-0 -40,69.6"; // 80% of the full size
//const smallHexString = "42.5,73.95 85,0 42.5,-73.95 -42.5,-73.95 -85,-0 -42.5,73.95"; // 85% of the full size
const smallHexString = "45,78.3 90,-0 45,-78.3 -45,-78.3 -90,-0 -45,78.3"; // 90% of the full size
class Line {
    constructor(q, r, dir) {
        this.q = q;
        this.r = r;
        this.dir = dir;
    }
}
class Corner {
    constructor(q, r, dir) {
        this.q = q;
        this.r = r;
        this.dir = dir;
    }
}
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
    let lines = [];
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
    let corners = [];
    corners.push(new Corner(hex.q, hex.r, 0));
    corners.push(new Corner(hex.q, hex.r, 1));
    corners.push(new Corner(Hex.directions[2].q + hex.q, Hex.directions[2].r + hex.r, 0));
    corners.push(new Corner(Hex.directions[3].q + hex.q, Hex.directions[3].r + hex.r, 1));
    corners.push(new Corner(Hex.directions[3].q + hex.q, Hex.directions[3].r + hex.r, 0));
    corners.push(new Corner(Hex.directions[4].q + hex.q, Hex.directions[4].r + hex.r, 1));
    return corners;
}
function getCornerHexes(corner) {
    return [new Hex(corner.q, corner.r),
        new Hex(corner.q + Hex.directions[(corner.dir + 5) % 6].q, corner.r + Hex.directions[(corner.dir + 5) % 6].r),
        new Hex(corner.q + Hex.directions[corner.dir].q, corner.r + Hex.directions[corner.dir].r),
    ];
}
function getCornerLines(corner) {
    if (corner.dir == 0)
        return [new Line(corner.q, corner.r, 0),
            new Line(corner.q, corner.r - 1, 1),
            new Line(corner.q, corner.r - 1, 2)];
    else if (corner.dir == 1)
        return [new Line(corner.q, corner.r, 0),
            new Line(corner.q, corner.r, 1),
            new Line(corner.q + 1, corner.r, 2)];
    else
        assert(false, "Invalid corner direction");
}
function getCornerNeighbours(corner) {
    if (corner.dir == 0)
        return [new Corner(corner.q, corner.r, 1),
            new Corner(corner.q + Hex.directions[4].q, corner.r + Hex.directions[4].r, 1),
            new Corner(corner.q + Hex.directions[5].q, corner.r + Hex.directions[5].r, 1),];
    else if (corner.dir == 1)
        return [new Corner(corner.q, corner.r, 0),
            new Corner(corner.q + Hex.directions[1].q, corner.r + Hex.directions[1].r, 0),
            new Corner(corner.q + Hex.directions[2].q, corner.r + Hex.directions[2].r, 0),];
    else
        assert(false, "Invalid corner direction");
}
function getLineBetweenCorners(c1, c2) {
    if (c2.dir == 0) {
        let c = c1;
        c1 = c2;
        c2 = c;
    }
    return new Line(c1.q, c2.r, c1.q - c2.q + c2.r - c1.r);
}
function getLineCorners(l) {
    if (l.dir == 0)
        return [new Corner(l.q, l.r, 0), new Corner(l.q, l.r, 1)];
    if (l.dir == 1)
        return [new Corner(l.q, l.r - 1, 0), new Corner(l.q, l.r, 1)];
    if (l.dir == 2)
        return [new Corner(l.q, l.r - 1, 0), new Corner(l.q - 1, l.r, 1)];
    assert(false, "Invalid line direction");
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
/// <reference path="./hex.ts" />
/// <reference path="./utils.ts" />
/*
TODO:
    merge hexmap into game class
    click lenses to have them stay on
    show citizens on worked tiles

    merge all gfx from onHovered into refreshGfx
    action cleanup
        show build in progress
        add dropdown for choosing citizen
        cancel button
        prevent selecting other tile
    polluted/clean water
        water sources are polluted, pipe it to waste treatment to clean it
        pump clean water out
        you can't cross water pipes with other pipes
    add a minimap that moves the map around

Gameplay
    humidifiers
    power system ()

*/
// Game Data
const citizenNames = ["Cerbu", "Ioan", "Iulia", "Edi", "Silvia", "Sick", "Adi", "Andu", "Mihai", "Dan", "Vlad"];
const toxicityThresholds = [10, 20, 35, 55, 80];
const toxicityPerTurn = 0.2; // how much toxicity is spread by toxic tiles. multiplied by their toxicity level
var LineBuilding;
(function (LineBuilding) {
    LineBuilding[LineBuilding["Empty"] = 0] = "Empty";
    LineBuilding[LineBuilding["Waterway"] = 1] = "Waterway";
})(LineBuilding || (LineBuilding = {}));
;
var CornerBuilding;
(function (CornerBuilding) {
    CornerBuilding[CornerBuilding["Empty"] = 0] = "Empty";
    CornerBuilding[CornerBuilding["PowerPoint"] = 1] = "PowerPoint";
    CornerBuilding[CornerBuilding["Pump"] = 2] = "Pump";
})(CornerBuilding || (CornerBuilding = {}));
;
var TileBuilding;
(function (TileBuilding) {
    TileBuilding[TileBuilding["Empty"] = 0] = "Empty";
    TileBuilding[TileBuilding["Greenhouse"] = 1] = "Greenhouse";
})(TileBuilding || (TileBuilding = {}));
;
var CitizenAction;
(function (CitizenAction) {
    CitizenAction[CitizenAction["Idle"] = 0] = "Idle";
    CitizenAction[CitizenAction["ClearToxicity"] = 1] = "ClearToxicity";
    CitizenAction[CitizenAction["Build"] = 2] = "Build";
    CitizenAction[CitizenAction["Harvest"] = 3] = "Harvest";
    CitizenAction[CitizenAction["Count"] = 4] = "Count";
})(CitizenAction || (CitizenAction = {}));
;
function getToxicityLevel(toxicity) {
    for (let i = 0; i < toxicityThresholds.length; i++) {
        if (toxicity < toxicityThresholds[i]) {
            return i;
        }
    }
    return toxicityThresholds.length;
}
// UI state
var Lens;
(function (Lens) {
    Lens[Lens["None"] = 0] = "None";
    Lens[Lens["Pipes"] = 1] = "Pipes";
    Lens[Lens["Humidity"] = 2] = "Humidity";
    Lens[Lens["Energy"] = 3] = "Energy";
    Lens[Lens["Toxicity"] = 4] = "Toxicity";
})(Lens || (Lens = {}));
let lens = Lens.None;
function setLens(button) {
    Object.keys(Lens).forEach(key => { if (button.value == key) {
        lens = Lens[key];
    } });
    hexmap.refreshGfx();
    if (lens > Lens.Pipes)
        hexmap.addTextToAllElements(button.value, button.value.toLowerCase());
}
function removeLens() {
    lens = Lens.None;
    hexmap.refreshGfx();
    hexmap.removeTextFromAllElements();
}
let debugHexes = false;
class ChangeActionFlow {
    constructor(action) {
        this.dude = null;
        this.target = null;
        this.info = null; // extra action data
        this.action = CitizenAction.Idle;
        this.action = action;
    }
}
let currentAction = null;
function confirmAction() {
    if (currentAction != null) {
        //TODO: Handle cancelling previous activity here
        currentAction.dude.chosenAction = currentAction.action;
        if (currentAction.target instanceof Hex)
            currentAction.dude.assignedHex = currentAction.target;
        else if (currentAction.target instanceof Line)
            currentAction.dude.assignedLine = currentAction.target;
        else if (currentAction.target instanceof Corner)
            currentAction.dude.assignedCorner = currentAction.target;
        currentAction.dude.actionStuff = currentAction.info;
        currentAction = null;
        citizensList.refreshWorked();
        citizensList.refreshGfx();
        hexmap.refreshGfx();
    }
}
let selectedTile = [0, 0]; // Need to remember selected tile
let tempElements = [];
function clearTempElements() {
    tempElements.forEach(e => e.remove());
    tempElements = [];
}
function setTileGfx(element, tile) {
    element.removeAttribute("class");
    if (lens == Lens.None) {
        element.removeAttribute("fill");
        if (tile.humidity > 0)
            element.classList.add("humid");
        // base color
        if (tile.toxicity > toxicityThresholds[0]) {
            let toxicityLevel = getToxicityLevel(tile.toxicity);
            element.classList.add("toxic" + clamp(toxicityLevel, 1, 4));
        }
        else {
            if (tile.water)
                element.classList.add("water3");
            else {
                if (tile.humidity > 0)
                    element.classList.add("land" + randInt(1, 3));
                else
                    element.classList.add("land-dry" + randInt(1, 3));
            }
        }
        // buildings
        let worker = citizensList.workedTiles.get(tile.coords);
        if (worker !== undefined) {
            if (worker.chosenAction == CitizenAction.Build)
                element.classList.add("under-construction");
        }
    }
    else {
        switch (lens) {
            case Lens.Humidity:
                if (tile.water)
                    element.classList.add("water3");
                element.setAttribute("fill", rgbToHexa(tile.humidity * 0, 250 - tile.humidity * 50, 250 - tile.humidity * 25));
                break;
            case Lens.Pipes:
                if (tile.water)
                    element.classList.add("water3");
                break;
            case Lens.Energy:
                element.setAttribute("fill", rgbToHexa(0, 0, 0));
                break;
            case Lens.Toxicity:
                element.setAttribute("fill", rgbToHexa(tile.toxicity * 3, tile.toxicity * 3, tile.toxicity * 3));
                break;
        }
    }
}
function setLineGfx(element, data) {
    switch (data.building) {
        case LineBuilding.Empty:
            element.setAttribute("class", "line-empty");
            break;
        case LineBuilding.Waterway:
            let hasWater = hexmap.wetPipes.has(lineKey(data.coords.q, data.coords.r, data.coords.dir));
            if (hasWater)
                element.setAttribute("class", "line-waterway");
            else
                element.setAttribute("class", "line-waterway-dry");
            break;
    }
    let worker = citizensList.workedLines.get(data.coords);
    if (worker !== undefined) {
        if (worker.chosenAction == CitizenAction.Build)
            element.classList.add("under-construction");
    }
}
function setCornerGfx(element, data) {
    switch (data.building) {
        case CornerBuilding.Empty:
            element.setAttribute("class", "corner-empty");
            break;
        case CornerBuilding.PowerPoint:
            element.setAttribute("class", "corner-power");
            break;
        case CornerBuilding.Pump:
            element.setAttribute("class", "corner-pump");
            break;
    }
    let worker = citizensList.workedCorners.get(data.coords);
    if (worker !== undefined) {
        if (worker.chosenAction == CitizenAction.Build)
            element.classList.add("under-construction");
    }
    if (lens == Lens.Pipes) {
        element.removeAttribute("class");
        let gray = clamp(255 - data.height * 50, 0, 255);
        element.setAttribute("fill", rgbToHexa(gray, gray, gray));
        /*
        for (let hex of getCornerHexes(data.coords))
        {
            let hexData = hexmap.tiles[hexKey(hex.q, hex.r)];
            if (hexData === undefined)
                continue;
            if (hexData.water)
                element.classList.add("corner-water");
        }
        */
        let thisPos = hexmap.layout.getPixel(data.coords.q, data.coords.r);
        thisPos = PtAdd(thisPos, hexPoints[data.coords.dir]);
        let thisKey = cornerKey(data.coords.q, data.coords.r, data.coords.dir);
        for (let neighbor of getCornerNeighbours(data.coords)) {
            let neighborKey = cornerKey(neighbor.q, neighbor.r, neighbor.dir);
            let neighborData = hexmap.corners[neighborKey];
            if (neighborData === undefined)
                continue;
            if (data.height < neighborData.height)
                continue;
            if (data.height == neighborData.height &&
                neighborKey < thisKey)
                continue;
            let line = getLineBetweenCorners(data.coords, neighbor);
            let lineData = hexmap.lines[lineKey(line.q, line.r, line.dir)];
            let neighborPos = hexmap.layout.getPixel(neighbor.q, neighbor.r);
            neighborPos = PtAdd(neighborPos, hexPoints[neighbor.dir]);
            let center = PtMultiply(PtAdd(thisPos, neighborPos), 0.5);
            let direction = VectorAngleDeg(PtNormalize(PtAdd(PtMultiply(thisPos, -1), neighborPos)));
            let arrow = (data.height == neighborData.height) ? createRectangleElement(55, 14) : createArrowHead();
            arrow.setAttribute("transform", `translate(${center.x},${center.y}) rotate(${direction})`);
            if (lineData.building == LineBuilding.Waterway)
                arrow.classList.add("canal-piped");
            else
                arrow.classList.add("canal-empty");
            hexmap.mapHtml.appendChild(arrow);
            tempElements.push(arrow);
        }
    }
    else
        element.removeAttribute("fill");
}
function onSelectHex(hex) {
    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.add("selected");
}
function onHexHovered(hex) {
    clearTempElements();
    if (debugHexes) {
        let tile = hexmap.tiles[hexKey(hex.q, hex.r)];
        let text = `(${hex.q},${hex.r})`;
        //if (tile.height > 0) {
        //    text += ` h:${tile.height}`;
        //}
        if (tile.humidity > 0) {
            text += ` w:${tile.humidity}`;
        }
        if (tile.toxicity > 0) {
            text += ` t:${tile.toxicity}`;
        }
        let p = hexmap.layout.getPixel(hex.q, hex.r);
        let textElement = createTextElement(p.x, p.y, text);
        textElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(textElement);
        tempElements.push(textElement);
        // number the neighbours
        for (let dir = 0; dir < 6; dir++) {
            let neighbour = Hex.neighbor(hex, dir);
            let neighbourText = `${dir}`;
            let neighbourP = hexmap.layout.getPixel(neighbour.q, neighbour.r);
            let neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
            neighbourTextElement.setAttribute("class", "debugText");
            hexmap.mapHtml.appendChild(neighbourTextElement);
            tempElements.push(neighbourTextElement);
        }
    }
    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.add("hover");
}
function onHexUnhovered(hex) {
    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.remove("hover");
}
function onLineHovered(line) {
    clearTempElements();
    if (debugHexes) {
        // number the neighbours
        getLineHexes(line).forEach((hex, index) => {
            let neighbourText = `${index}`;
            let neighbourP = hexmap.layout.getPixel(hex.q, hex.r);
            let neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
            neighbourTextElement.setAttribute("class", "debugText");
            hexmap.mapHtml.appendChild(neighbourTextElement);
            tempElements.push(neighbourTextElement);
        });
    }
    hexmap.lineElements[lineKey(line.q, line.r, line.dir)].classList.add("hover");
}
function onCornerHovered(corner) {
    clearTempElements();
    if (debugHexes) {
        // number the neighbours
        getCornerHexes(corner).forEach((hex, index) => {
            let neighbourText = `${index}`;
            let neighbourP = hexmap.layout.getPixel(hex.q, hex.r);
            let neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
            neighbourTextElement.setAttribute("class", "debugText");
            hexmap.mapHtml.appendChild(neighbourTextElement);
            tempElements.push(neighbourTextElement);
        });
        getCornerNeighbours(corner).forEach((neighbor, index) => {
            let neighbourText = `${index}`;
            let neighbourP = hexmap.layout.getPixel(neighbor.q, neighbor.r);
            neighbourP = PtAdd(neighbourP, hexPoints[neighbor.dir]);
            let neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
            neighbourTextElement.setAttribute("class", "debugText");
            hexmap.mapHtml.appendChild(neighbourTextElement);
            tempElements.push(neighbourTextElement);
        });
    }
    hexmap.cornerElements[cornerKey(corner.q, corner.r, corner.dir)].classList.add("hover");
}
function onHexClicked(hex) {
    selectedTile = [hex.q, hex.r];
    hexmap.selectHex(hex.q, hex.r);
    game.selectedTypeElement.textContent = "Type: Hex";
    game.slectedPositionElement.textContent = "Position: " + hex.q + "," + hex.r + ",";
    //game.selectedHeightElement.textContent = "Height: "     + hexmap.tiles[hexKey(hex.q,hex.r)].height;
    game.selectedWaterElement.textContent = "Is Water source: " + hexmap.tiles[hexKey(hex.q, hex.r)].water;
    game.selectedHumidityElement.textContent = "Humidity: " + hexmap.tiles[hexKey(hex.q, hex.r)].humidity;
    let tox = hexmap.tiles[hexKey(hex.q, hex.r)].toxicity;
    game.selectedToxicityElement.textContent = "Toxicity: " + getToxicityLevel(tox) + " (" + tox + ")";
    game.actionMenuElement.classList.remove("hidden");
    while (game.actionMenuElement.firstChild) {
        game.actionMenuElement.removeChild(game.actionMenuElement.firstChild);
    }
    if (hexmap.tiles[hexKey(hex.q, hex.r)].toxicity > 0) {
        addDropdownChild(game.actionMenuElement, "Clear Toxicity", () => {
            currentAction = new ChangeActionFlow(CitizenAction.ClearToxicity);
            currentAction.target = hex;
            citizensList.refreshGfx();
        });
    }
}
function onLineClicked(line) {
    let data = hexmap.lines[lineKey(line.q, line.r, line.dir)];
    game.selectedTypeElement.textContent = "Type: Edge";
    game.slectedPositionElement.textContent = "Position: " + line.q + "," + line.r + "," + line.dir;
    game.selectedHeightElement.textContent = "Built: " + data.building.toString();
    game.selectedWaterElement.textContent = hexmap.wetPipes.has(lineKey(line.q, line.r, line.dir)) ? "Water: Yes" : "Water: No";
    game.selectedHumidityElement.textContent = "";
    game.selectedToxicityElement.textContent = "";
    game.actionMenuElement.classList.remove("hidden");
    while (game.actionMenuElement.firstChild) {
        game.actionMenuElement.removeChild(game.actionMenuElement.firstChild);
    }
    addDropdownChild(game.actionMenuElement, "Build Waterway", () => {
        currentAction = new ChangeActionFlow(CitizenAction.Build);
        currentAction.target = line;
        currentAction.info = LineBuilding.Waterway;
        citizensList.refreshGfx();
    });
}
;
function onCornerClicked(corner) {
    game.selectedTypeElement.textContent = "Type: Point";
    game.slectedPositionElement.textContent = "Position: " + corner.q + "," + corner.r + "," + corner.dir;
    game.selectedHeightElement.textContent = "Height: " + hexmap.corners[cornerKey(corner.q, corner.r, corner.dir)].height;
    game.selectedWaterElement.textContent = "";
    game.selectedHumidityElement.textContent = "";
    game.selectedToxicityElement.textContent = "";
    game.actionMenuElement.classList.remove("hidden");
    while (game.actionMenuElement.firstChild) {
        game.actionMenuElement.removeChild(game.actionMenuElement.firstChild);
    }
    addDropdownChild(game.actionMenuElement, "Build Pump", () => {
        currentAction = new ChangeActionFlow(CitizenAction.Build);
        currentAction.target = corner;
        currentAction.info = CornerBuilding.Pump;
        citizensList.refreshGfx();
    });
}
;
function toggleDebug() {
    debugHexes = !debugHexes;
    if (debugHexes)
        document.getElementById("toggledebug").setAttribute("style", "background-color: #00c46b");
    else
        document.getElementById("toggledebug").setAttribute("style", "background-color: #c44600");
    hexmap.refreshGfx();
}
class TileData {
    constructor() {
        this.coords = null;
        this.water = false; // If it is a water source or not
        this.humidity = 0; // The humidity level of the tile 0 - 5
        this.toxicity = 0;
        this.energy = 0;
        this.building = TileBuilding.Empty;
        this.buildingData = null; // this will hold info about the building
    }
}
class LineData {
    constructor() {
        this.coords = null;
        this.building = LineBuilding.Empty;
    }
}
class CornerData {
    constructor() {
        this.coords = null;
        this.building = CornerBuilding.Empty;
        this.height = 0;
    }
}
class HexMap {
    constructor() {
        // Game
        this.mapRadius = 5;
        this.tiles = {};
        this.lines = {};
        this.corners = {};
        this.wetPipes = new Set();
        // UI
        this.layout = new Layout(Layout.flat, Pt(100, 100), Pt(0, 0));
    }
    init() {
        this.mapHtml = document.getElementById("hexmap");
        this.setCamera(0, 0, 0.5);
    }
    populateWithRandomTiles() {
        this.tiles = {};
        this.lines = {};
        this.corners = {};
        for (let x = -this.mapRadius; x <= this.mapRadius; x++) {
            for (let y = -this.mapRadius; y <= this.mapRadius; y++) {
                if (Math.abs(x + y) <= this.mapRadius) {
                    this.addNewTile(x, y, new TileData());
                }
            }
        }
        // pick 3-5 water source tiles
        for (let bla = 0; bla < randInt(3, 5); bla++) {
            let x = randInt(-this.mapRadius, this.mapRadius);
            let y = randInt(-this.mapRadius, this.mapRadius);
            if (Math.abs(x + y) > this.mapRadius)
                continue;
            let tile = this.tiles[hexKey(x, y)];
            tile.water = true;
        }
        // pick 3-5 toxic source tiles
        for (let bla = 0; bla < randInt(3, 5); bla++) {
            let x = randInt(-this.mapRadius, this.mapRadius);
            let y = randInt(-this.mapRadius, this.mapRadius);
            if (Math.abs(x + y) > this.mapRadius)
                continue;
            let tile = this.tiles[hexKey(x, y)];
            tile.toxicity = toxicityThresholds[randInt(1, 3)];
        }
        // pick a few corners to change their height randomly
        //TODO: We need to do this in a better way
        for (let bla = 0; bla < 150; bla++) {
            let x = randInt(-this.mapRadius, this.mapRadius);
            let y = randInt(-this.mapRadius, this.mapRadius);
            if (Math.abs(x + y) > this.mapRadius)
                continue;
            let randKey = cornerKey(x, y, randInt(0, 1));
            let corner = this.corners[randKey];
            if (corner === undefined)
                continue;
            let heightMin = Math.max(0, corner.height - 2);
            let heightMax = Math.min(5, corner.height + 2);
            getCornerNeighbours(corner.coords).forEach(c => {
                let neighbor = this.corners[cornerKey(c.q, c.r, c.dir)];
                if (neighbor !== undefined) {
                    heightMin = Math.max(heightMin, neighbor.height - 2);
                    heightMax = Math.min(heightMax, neighbor.height + 2);
                }
            });
            let height = randInt(heightMin, heightMax);
            corner.height = height;
        }
    }
    workOutWaterFlow() {
        // start for corners of water tiles
        let toVisit = [];
        for (let key in this.tiles) {
            let tile = this.tiles[key];
            if (tile.water == true) {
                tile.humidity = 5;
                getHexCorners(tile.coords).forEach(corner => { toVisit.push(this.corners[cornerKey(corner.q, corner.r, corner.dir)]); });
            }
            else
                tile.humidity = 0;
        }
        // flow water from corner to corner, keeping a list of wet pipes
        this.wetPipes.clear();
        while (toVisit.length > 0) {
            let corner = toVisit.pop();
            if (corner === undefined)
                continue;
            let height = corner.height;
            let hasPump = corner.building == CornerBuilding.Pump;
            for (let n of getCornerNeighbours(corner.coords)) {
                let neighbor = this.corners[cornerKey(n.q, n.r, n.dir)];
                if (neighbor === undefined)
                    continue;
                let line = getLineBetweenCorners(corner.coords, n);
                let lk = lineKey(line.q, line.r, line.dir);
                if (this.wetPipes.has(lk))
                    continue;
                let lineData = this.lines[lk];
                if (lineData === undefined ||
                    lineData.building != LineBuilding.Waterway)
                    continue;
                if ((height >= neighbor.height) || hasPump) {
                    this.wetPipes.add(lk);
                    toVisit.push(neighbor);
                }
            }
        }
        // now go through each line and set tile humidity if wet
        for (let key of this.wetPipes.keys()) {
            let line = this.lines[key];
            for (let hex of getLineSides(line.coords)) {
                let tile = this.tiles[hexKey(hex.q, hex.r)];
                if (tile === undefined)
                    continue;
                tile.humidity = 5;
                //TODO: Humidifiers go here
            }
        }
    }
    addTextToElement(element, text) {
        let textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.setAttribute("x", "0");
        textElement.setAttribute("y", "0");
        textElement.setAttribute("text-anchor", "middle");
        textElement.setAttribute("dominant-baseline", "middle");
        textElement.setAttribute("font-size", "42");
        textElement.setAttribute("fill", "white");
        textElement.textContent = text;
        element.appendChild(textElement);
    }
    addTextToAllElements(text, property) {
        for (let key in this.tileElements) {
            let element = this.tileElements[key];
            let textToAdd = this.tiles[key][property];
            if (typeof this.tiles[key][property] == "number") {
                textToAdd = Math.round(this.tiles[key][property]);
            }
            this.addTextToElement(element, textToAdd.toString());
        }
    }
    removeTextFromElement(element) {
        element.querySelectorAll("text").forEach(e => e.remove());
    }
    removeTextFromAllElements() {
        for (let key in this.tileElements) {
            let element = this.tileElements[key];
            this.removeTextFromElement(element);
        }
    }
    refreshGfx() {
        if (this.tileElements === undefined) {
            this.tileElements = {};
            for (let key in this.tiles) {
                let tile = this.tiles[key];
                let hex = tile.coords;
                // tile hex
                const polygon = createSmallHexElement();
                polygon.onclick = () => { onHexClicked(hex); };
                polygon.onmouseenter = () => { onHexHovered(hex); };
                polygon.onmouseleave = () => { onHexUnhovered(hex); };
                // move everything toghether
                const tileElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
                tileElement.appendChild(polygon);
                let p = this.layout.getPixel(hex.q, hex.r);
                tileElement.setAttribute("transform", `translate(${p.x},${p.y})`);
                this.tileElements[hexKey(hex.q, hex.r)] = tileElement;
                this.mapHtml.appendChild(tileElement);
            }
        }
        for (let key in this.tiles) {
            let tile = this.tiles[key];
            let element = this.tileElements[key];
            setTileGfx(element, tile);
        }
        if (this.lineElements === undefined) {
            this.lineElements = {};
            for (let key in this.lines) {
                let lineData = this.lines[key];
                let line = lineData.coords;
                let hexCenter = this.layout.getPixel(line.q, line.r);
                //let lineElement = createLineElement( 
                //    hexCenter.x + hexPoints[line.dir].x     , hexCenter.y + hexPoints[line.dir].y, 
                //    hexCenter.x + hexPoints[line.dir + 1].x , hexCenter.y + hexPoints[line.dir + 1].y);
                let lineElement = createSideElement(hexCenter.x + hexPoints[line.dir].x, hexCenter.y + hexPoints[line.dir].y, hexCenter.x + hexPoints[line.dir + 1].x, hexCenter.y + hexPoints[line.dir + 1].y, line.dir);
                lineElement.onclick = () => { onLineClicked(line); };
                lineElement.onmouseenter = () => { onLineHovered(line); };
                lineElement.onmouseleave = () => { lineElement.classList.remove("hover"); };
                this.lineElements[key] = lineElement;
                this.mapHtml.appendChild(lineElement);
            }
        }
        for (let key in this.lines) {
            let line = this.lines[key];
            let element = this.lineElements[key];
            setLineGfx(element, line);
        }
        if (this.cornerElements === undefined) {
            this.cornerElements = {};
            for (let key in this.corners) {
                let cornerData = this.corners[key];
                let corner = cornerData.coords;
                let hexCenter = this.layout.getPixel(corner.q, corner.r);
                let pointElement = createCircleElement(hexCenter.x + hexPoints[corner.dir].x, hexCenter.y + hexPoints[corner.dir].y, 8);
                pointElement.onclick = () => { onCornerClicked(corner); };
                pointElement.onmouseenter = () => { onCornerHovered(corner); };
                pointElement.onmouseleave = () => { pointElement.classList.remove("hover"); };
                this.cornerElements[key] = pointElement;
                this.mapHtml.appendChild(pointElement);
            }
        }
        for (let key in this.corners) {
            let corner = this.corners[key];
            let element = this.cornerElements[key];
            setCornerGfx(element, corner);
        }
    }
    getTileNeighbourTiles(tile) {
        let neighbours = [];
        for (let neighbourHex of getHexNeighbours(tile.coords)) {
            let neighbour = this.tiles[hexKey(neighbourHex.q, neighbourHex.r)];
            if (neighbour) {
                neighbours.push(neighbour);
            }
        }
        return neighbours;
    }
    isHexInMap(q, r) {
        return ((Math.abs(q) + Math.abs(r) + Math.abs(-q - r)) / 2) <= this.mapRadius; //hex.len() <= this.mapRadius;
    }
    unselectHex() {
        this.mapHtml.querySelectorAll(".selected").forEach(e => e.classList.remove("selected"));
    }
    selectHex(q, r) {
        this.unselectHex();
        this.tileElements[hexKey(q, r)].classList.add("selected");
    }
    setCamera(q, y, scale) {
        this.mapHtml.setAttribute("transform", `translate(${q},${y}) scale(${scale})`);
    }
    ///> Adds the tile to the map and creates the lines and corners
    addNewTile(q, r, tile) {
        const hex = new Hex(q, r);
        // hex data
        tile.coords = hex;
        this.tiles[hexKey(q, r)] = tile;
        // hex lines
        let hexLines = getHexLines(hex);
        for (let lineNum = 0; lineNum < 6; lineNum++) {
            let line = hexLines[lineNum];
            let numNeighbours = 0;
            for (let hex of getLineSides(line))
                if (this.isHexInMap(hex.q, hex.r))
                    numNeighbours++;
            if (numNeighbours < 2)
                continue;
            let key = lineKey(line.q, line.r, line.dir);
            if (this.lines[key] !== undefined)
                continue;
            let lineData = new LineData();
            lineData.coords = line;
            this.lines[lineKey(line.q, line.r, line.dir)] = lineData;
        }
        // hex corners (only on the inside of the map)
        let hexCorners = getHexCorners(hex);
        for (let cornerNum = 0; cornerNum < 6; cornerNum++) // only 2 corners since other 4 are covered by other hexes
         {
            let corner = hexCorners[cornerNum];
            let numNeighbours = 0;
            for (let hex of getCornerHexes(corner))
                if (this.isHexInMap(hex.q, hex.r))
                    numNeighbours++;
            if (numNeighbours < 2)
                continue;
            let key = cornerKey(corner.q, corner.r, corner.dir);
            if (this.corners[key] !== undefined)
                continue;
            // game logic data
            let cornerData = new CornerData();
            cornerData.coords = corner;
            cornerData.height = 3;
            this.corners[key] = cornerData;
        }
    }
}
class Citizen {
    constructor() {
        this.name = "ph_name";
        this.assignedHex = null;
        this.assignedLine = null;
        this.assignedCorner = null;
        this.chosenAction = CitizenAction.Idle;
        this.actionStuff = null; // this will hold info about the status of build actions
    }
}
class CitizensList {
    constructor() {
        this.workedTiles = new Map();
        this.workedLines = new Map();
        this.workedCorners = new Map();
        this.citizens = [];
    }
    initUI() {
        this.table = document.getElementById("citizens_table");
        this.rows = this.table.rows;
    }
    loadCitizens(citizens) {
        this.citizens = citizens;
        for (let i = 0; i < this.citizens.length; i++) {
            let citizen = this.citizens[i];
            if (citizen.assignedHex != null)
                citizen.assignedHex = new Hex(citizen.assignedHex.q, citizen.assignedHex.r);
            if (citizen.assignedLine != null)
                citizen.assignedLine = new Line(citizen.assignedLine.q, citizen.assignedLine.r, citizen.assignedLine.dir);
            if (citizen.assignedCorner != null)
                citizen.assignedCorner = new Corner(citizen.assignedCorner.q, citizen.assignedCorner.r, citizen.assignedCorner.dir);
        }
        this.refreshWorked();
    }
    refreshWorked() {
        this.workedTiles.clear();
        this.workedLines.clear();
        this.workedCorners.clear();
        for (let i = 0; i < this.citizens.length; i++) {
            let citizen = this.citizens[i];
            if (citizen.assignedHex != null)
                this.workedTiles.set(citizen.assignedHex, citizen);
            if (citizen.assignedLine != null)
                this.workedLines.set(citizen.assignedLine, citizen);
            if (citizen.assignedCorner != null)
                this.workedCorners.set(citizen.assignedCorner, citizen);
        }
    }
    populateWithRandomCitizens() {
        this.citizens = [];
        for (let i = 0; i < 10; i++) {
            let citizen = new Citizen;
            citizen.name = citizenNames[Math.floor(Math.random() * citizenNames.length)];
            this.citizens.push(citizen);
        }
    }
    doCitizensTurn() {
        for (let i = 0; i < this.citizens.length; i++) {
            let citizen = this.citizens[i];
            switch (citizen.chosenAction) {
                case CitizenAction.Idle:
                    break;
                case CitizenAction.ClearToxicity:
                    let tile = hexmap.tiles[hexKey(citizen.assignedHex.q, citizen.assignedHex.r)];
                    if (tile.toxicity > 0) {
                        tile.toxicity = Math.max(tile.toxicity - toxicityPerTurn * 10, 0);
                    }
                    break;
                case CitizenAction.Build:
                    if (citizen.assignedHex) {
                        let tile = hexmap.tiles[hexKey(citizen.assignedHex.q, citizen.assignedHex.r)];
                        tile.building = citizen.actionStuff;
                        citizen.assignedHex = null;
                    }
                    if (citizen.assignedLine) {
                        let line = hexmap.lines[lineKey(citizen.assignedLine.q, citizen.assignedLine.r, citizen.assignedLine.dir)];
                        line.building = citizen.actionStuff;
                        citizen.assignedLine = null;
                    }
                    if (citizen.assignedCorner) {
                        let corner = hexmap.corners[cornerKey(citizen.assignedCorner.q, citizen.assignedCorner.r, citizen.assignedCorner.dir)];
                        corner.building = citizen.actionStuff;
                        citizen.assignedCorner = null;
                    }
                    citizen.chosenAction = CitizenAction.Idle;
                    break;
                case CitizenAction.Harvest:
                    //TODO: Generate stuff based on assigned tile
                    break;
            }
        }
        this.refreshWorked();
    }
    refreshGfx() {
        //TODO: Don't rebuild every frame
        // clearTable
        for (let i = 0; i < this.citizens.length; i++) {
            this.table.deleteRow(-1);
        }
        // fill it based on citizens
        for (let i = 0; i < this.citizens.length; i++) {
            let citizen = this.citizens[i];
            let row = this.table.insertRow(-1);
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            let cell3 = row.insertCell(2);
            cell1.innerHTML = citizen.name;
            cell2.innerHTML = CitizenAction[citizen.chosenAction].toString();
            if (currentAction != null) {
                let actionButton = document.createElement("button");
                actionButton.type = "button";
                actionButton.classList.add("btn", "btn-primary", "btn-sm");
                actionButton.textContent = "Pick Me !";
                actionButton.onclick = () => { currentAction.dude = citizen; confirmAction(); };
                cell3.appendChild(actionButton);
            }
            else
                cell3.innerHTML = "Alive"; // status used to go here
            row.onmouseenter = () => {
                if (citizen.assignedHex != null)
                    onHexHovered(citizen.assignedHex);
                if (citizen.assignedLine != null)
                    onLineHovered(citizen.assignedLine);
                if (citizen.assignedCorner != null)
                    onCornerHovered(citizen.assignedCorner);
            };
            row.onmouseleave = () => {
                if (citizen.assignedHex != null)
                    hexmap.tileElements[hexKey(citizen.assignedHex.q, citizen.assignedHex.r)].classList.remove("hover");
                if (citizen.assignedLine != null)
                    hexmap.lineElements[lineKey(citizen.assignedLine.q, citizen.assignedLine.r, citizen.assignedLine.dir)].classList.remove("hover");
                if (citizen.assignedCorner != null)
                    hexmap.cornerElements[cornerKey(citizen.assignedCorner.q, citizen.assignedCorner.r, citizen.assignedCorner.dir)].classList.remove("hover");
            };
        }
    }
}
class Resources {
    constructor() {
        this.polymers = 0;
        this.metals = 0;
        this.minerals = 0;
        this.waste = 0;
    }
    addAmount(resource, amount) {
        this[resource] += amount;
    }
    moveAmount(other, resource, amount) {
        if (this[resource] >= amount) {
            this[resource] -= amount;
            other[resource] += amount;
        }
    }
    moveAll(other) {
        this.moveAmount(other, "polymers", this.polymers);
        this.moveAmount(other, "metals", this.metals);
        this.moveAmount(other, "minerals", this.minerals);
        this.moveAmount(other, "waste", this.waste);
    }
    refreshGfx() {
        document.getElementById("polymersLabel").textContent = "Polymers: " + this.polymers.toString();
        document.getElementById("metalsLabel").textContent = "Metals: " + this.metals.toString();
        document.getElementById("mineralsLabel").textContent = "Minerals: " + this.minerals.toString();
        document.getElementById("wasteLabel").textContent = "Waste: " + this.waste.toString();
    }
}
class Game {
    resetState() {
        localStorage.clear();
        this.loadState();
    }
    loadState() {
        let saveName = "save1";
        let saveString = localStorage.getItem(saveName);
        if (saveString === null) {
            console.log("No saved data found. Generating new random one.");
            citizensList.populateWithRandomCitizens();
            hexmap.populateWithRandomTiles();
            resources.polymers = 100;
            resources.metals = 125;
        }
        else {
            let saveJson = JSON.parse(saveString);
            console.log("Loaded saved data from " + saveName + ".");
            citizensList.loadCitizens(saveJson.citizens);
            for (let key in saveJson.tiles) {
                let tile = saveJson.tiles[key];
                tile.coords = new Hex(tile.coords.q, tile.coords.r);
                hexmap.tiles[key] = tile;
            }
            hexmap.lines = saveJson.lines;
            for (let key in hexmap.lines) {
                let line = hexmap.lines[key];
                line.coords = new Line(line.coords.q, line.coords.r, line.coords.dir);
            }
            hexmap.corners = saveJson.corners;
            for (let key in hexmap.corners) {
                let corner = hexmap.corners[key];
                corner.coords = new Corner(corner.coords.q, corner.coords.r, corner.coords.dir);
            }
            Object.assign(resources, saveJson.resources);
        }
        hexmap.workOutWaterFlow();
        citizensList.refreshGfx();
        hexmap.refreshGfx();
        resources.refreshGfx();
    }
    saveState() {
        let saveName = "save1";
        let saveJson = {
            citizens: citizensList.citizens,
            tiles: hexmap.tiles,
            lines: hexmap.lines,
            corners: hexmap.corners,
            resources: resources,
        };
        let saveString = JSON.stringify(saveJson);
        localStorage.setItem(saveName, saveString);
        console.log("Saved data to " + saveName + ".");
    }
    init() {
        //TODO: merge tile & game classes
        citizensList.initUI();
        hexmap.init();
        this.selectedTypeElement = document.getElementById("selected_type");
        this.slectedPositionElement = document.getElementById("selected_position");
        this.selectedHeightElement = document.getElementById("selected_height");
        this.selectedWaterElement = document.getElementById("selected_water");
        this.selectedHumidityElement = document.getElementById("selected_humidity");
        this.selectedToxicityElement = document.getElementById("selected_toxicity");
        this.actionMenuElement = document.getElementById("action_menu");
        document.getElementById("restart").onclick = () => { this.resetState(); };
        document.getElementById("savegame").onclick = () => { this.saveState(); };
        document.getElementById("loadgame").onclick = () => { this.loadState(); };
        document.getElementById("toggledebug").onclick = () => { toggleDebug(); };
        document.getElementById("nextturn").onclick = () => { this.endTurn(); };
        this.loadState();
    }
    endTurn() {
        // spread toxicity
        for (let key in hexmap.tiles) {
            let tile = hexmap.tiles[key];
            if (tile.toxicity > toxicityThresholds[0]) {
                let toxicityLevel = getToxicityLevel(tile.toxicity);
                let maxToxicity = toxicityThresholds[toxicityLevel];
                for (let neighbor of hexmap.getTileNeighbourTiles(tile)) {
                    if (neighbor.toxicity < maxToxicity) {
                        neighbor.toxicity = clamp(neighbor.toxicity + toxicityPerTurn * toxicityLevel, 0, maxToxicity);
                    }
                }
            }
        }
        citizensList.doCitizensTurn();
        hexmap.workOutWaterFlow();
        citizensList.refreshGfx();
        hexmap.refreshGfx();
    }
}
let game = new Game;
let hexmap = new HexMap;
let citizensList = new CitizensList;
let resources = new Resources;
window.onload = function () {
    console.log("Loaded");
    game.init();
};
//# sourceMappingURL=game.js.map