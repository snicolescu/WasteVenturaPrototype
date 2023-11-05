// Generated code -- CC0 -- No Rights Reserved -- http://www.redblobgames.com/grids/hexagons/
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
function Pt(x, y) { return new Point(x, y); }
;
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
var Lens;
(function (Lens) {
    Lens[Lens["None"] = 0] = "None";
    Lens[Lens["Height"] = 1] = "Height";
})(Lens || (Lens = {}));
var lens = Lens.None;
function createLineElement(x1, y1, x2, y2) {
    var lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineElement.setAttribute("x1", x1.toString());
    lineElement.setAttribute("y1", y1.toString());
    lineElement.setAttribute("x2", x2.toString());
    lineElement.setAttribute("y2", y2.toString());
    lineElement.setAttribute("stroke", "black");
    lineElement.setAttribute("stroke-width", "5");
    return lineElement;
}
function rgbToHex(r, g, b) {
    return "#".concat(((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1));
}
function setTileGfx(element, tile) {
    switch (lens) {
        case Lens.Height:
            element.removeAttribute("class");
            element.setAttribute("fill", rgbToHex(tile.height * 50, tile.height * 50, tile.height * 50));
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
function setLens(button) {
    Object.keys(Lens).forEach(function (key) { if (button.value == key) {
        lens = Lens[key];
    } });
    hexmap.refreshGfx();
}
function idx(q, r) {
    return q + r * 1000;
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
var HexMap = /** @class */ (function () {
    function HexMap() {
        this.tiles = {};
        this.tileElements = {};
        this.layout = new Layout(Layout.flat, Pt(100, 100), Pt(0, 0));
    }
    HexMap.prototype.init = function () {
        this.mapHtml = document.getElementById("hexmap");
        var radius = 5;
        for (var x = -radius; x <= radius; x++) {
            for (var y = -radius; y <= radius; y++) {
                if (Math.abs(x + y) <= radius) {
                    this.addHexElement(x, y);
                }
            }
        }
        this.setCamera(0, 0, 0.5);
    };
    HexMap.prototype.setCamera = function (q, y, scale) {
        this.mapHtml.setAttribute("transform", "rotate(30) translate(".concat(q, ",").concat(y, ") scale(").concat(scale, ")"));
    };
    HexMap.prototype.getRandomIndex = function () {
        var keys = Object.keys(this.tiles);
        var index = Math.floor(Math.random() * keys.length);
        return parseInt(keys[index]);
    };
    HexMap.prototype.addHexElement = function (q, r) {
        var _this = this;
        var p = this.layout.getPixel(q, r);
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
        var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        // polygon.setAttribute("points", "100,0 50,-87 -50,-87 -100,-0 -50,87 50,87");
        polygon.setAttribute("points", "90,0 45,-78.3 -45,-78.3 -90,-0 -45,78.3 45,78.3");
        //polygon.setAttribute("points", "95,0 47.5,-82.65 -47.5,-82.65 -95,-0 -47.5,82.65 47.5,82.65");
        var lineElement1 = createLineElement(100, 0, 50, -87);
        var lineElement2 = createLineElement(-50, -87, -100, -0);
        var lineElement3 = createLineElement(-50, 87, 50, 87);
        newElement.appendChild(lineElement1);
        newElement.appendChild(lineElement2);
        newElement.appendChild(lineElement3);
        newElement.setAttribute("transform", "translate(".concat(p.x, ",").concat(p.y, ")"));
        newElement.appendChild(polygon);
        newElement.onclick = function () { _this.onHexClicked(q, r); };
        newElement.onmouseenter = function () { newElement.classList.add("hover"); };
        newElement.onmouseleave = function () { newElement.classList.remove("hover"); };
        this.mapHtml.appendChild(newElement);
        var tile = TileData.getRandomTile();
        this.tiles[idx(q, r)] = tile;
        setTileGfx(newElement, tile);
        this.tileElements[idx(q, r)] = newElement;
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
var Game = /** @class */ (function () {
    function Game() {
        this.clicks = 0;
    }
    Game.prototype.init = function () {
        this.scoreElement = document.getElementById("score");
        this.scoreElement.textContent = "Score:" + this.clicks;
    };
    Game.prototype.clicked = function (q, r) {
        this.clicks++;
        this.scoreElement.textContent = "Score:" + this.clicks;
        console.log("Clicked ", q, r);
    };
    return Game;
}());
var game = new Game;
var hexmap = new HexMap;
window.onload = function () {
    console.log("Loaded");
    hexmap.init();
    game.init();
    hexmap.onHexClicked = function (q, r) {
        game.clicked(q, r);
        game.scoreElement.textContent = "Height:" + hexmap.tiles[idx(q, r)].height;
    };
    //document.getElementById("clickme").onclick = () => { game.clicked(); };
};
//# sourceMappingURL=game.js.map