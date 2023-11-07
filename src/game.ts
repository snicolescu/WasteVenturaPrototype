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

function Pt(x : number, y : number) : Point { return new Point(x, y); };

// Starts in bottom right and goes anti-clockwise
// ! Careful, it has 7 points, the first and last are the same so we don't have to modulo when adding lines
const hexPoints = [ Pt(50,87), Pt(100,0), Pt(50,-87), Pt(-50,-87), Pt(-100,-0), Pt(-50,87), Pt(50,87)];
const fullHexString = "50,87 100,0 50,-87 -50,-87 -100,-0 -50,87";
// const smallHexString = "40,69.6 80,-0 40,-69.6 -40,-69.6 -80,-0 -40,69.6"; // 80% of the full size
const smallHexString = "42.5,73.95 85,0 42.5,-73.95 -42.5,-73.95 -85,-0 -42.5,73.95"; // 85% of the full size
// const smallHexString = "45,78.3 90,-0 45,-78.3 -45,-78.3 -90,-0 -45,78.3"; // 90% of the full size


class Line {
    constructor( public q:number, public r:number, public dir:number) { }
}

class Corner {
    constructor( public q:number, public r:number, public dir:number) { }
}

// CRB: Basically each hex has 3 lines that "belong" to it.  The line is identified by the hex and the direction.
//  So to get the other three you look in the remaining three directions and point towards this hex
function getHexLines( hex: Hex) : Line[] {
    let lines = [];
    lines.push( new Line( hex.q, hex.r, 0));
    lines.push( new Line( hex.q, hex.r, 1));
    lines.push( new Line( hex.q, hex.r, 2));
    lines.push( new Line( Hex.directions[3].q + hex.q, Hex.directions[3].r + hex.r, 0));
    lines.push( new Line( Hex.directions[4].q + hex.q, Hex.directions[4].r + hex.r, 1));
    lines.push( new Line( Hex.directions[5].q + hex.q, Hex.directions[5].r + hex.r, 2));
    return lines;
}

function getLineSides( line: Line) : Hex[] {
    return [ new Hex( line.q, line.r), new Hex( line.q + Hex.directions[line.dir].q, line.r + Hex.directions[line.dir].r)];
}

function getLineEnds( line: Line) : Hex[] {
    return [new Hex( line.q + Hex.directions[(line.dir + 1) % 6].q, line.r + Hex.directions[(line.dir + 1) % 6].r),
            new Hex( line.q + Hex.directions[(line.dir + 5) % 6].q, line.r + Hex.directions[(line.dir + 5) % 6].r)];
}

function getLineHexes( line: Line) : Hex[] {
    return [new Hex( line.q, line.r),
            new Hex( line.q + Hex.directions[line.dir].q, line.r + Hex.directions[line.dir].r),
            new Hex( line.q + Hex.directions[(line.dir + 1) % 6].q, line.r + Hex.directions[(line.dir + 1) % 6].r),
            new Hex( line.q + Hex.directions[(line.dir + 5) % 6].q, line.r + Hex.directions[(line.dir + 5) % 6].r),];
}

function getHexCorners( hex: Hex) : Corner[] {
    let corners = [];
    corners.push( new Corner( hex.q, hex.r, 0));
    corners.push( new Corner( hex.q, hex.r, 1));
    corners.push( new Corner( hex.q, hex.r, 2));
    corners.push( new Corner( Hex.directions[3].q + hex.q, Hex.directions[3].r + hex.r, 0));
    corners.push( new Corner( Hex.directions[4].q + hex.q, Hex.directions[4].r + hex.r, 1));
    corners.push( new Corner( Hex.directions[5].q + hex.q, Hex.directions[5].r + hex.r, 2));
    return corners;
}

function getCornerHexes( corner : Corner) : Hex[] {
    return [new Hex( corner.q, corner.r), 
            new Hex( corner.q + Hex.directions[corner.dir].q, corner.r + Hex.directions[corner.dir].r),
            new Hex( corner.q + Hex.directions[(corner.dir + 5) % 6].q, corner.r + Hex.directions[(corner.dir + 5) % 6].r)];
}

function hexKey( q : number, r: number) : number
{
    return q + r * 1000;
}

function lineKey( q: number, r: number, dir: number) : number
{
    return dir + hexKey(q,r) * 4; //dir is 0-2
}

function cornerKey( q: number, r: number, dir: number) : number
{
    return dir + hexKey(q,r) * 4; //dir is 0-2
}

// UI state

enum Lens {
    None,
    Height
}

let lens = Lens.None;

function setLens( button: HTMLInputElement)
{
    Object.keys(Lens).forEach( key => { if (button.value == key) { lens = Lens[key]; } });

    hexmap.refreshGfx();
}

let debugHexes = true;

// Helper functions

//function getRandomElement<Type>(dictionary: { [key: number]: Type; } ) : Type
//{
//    let keys = Object.keys(dictionary);
//    let index = Math.floor(Math.random() * keys.length);
//    return dictionary[keys[index]];
//}

function rgbToHexa(r: number, g: number, b: number) {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// SVG helpers

function createSmallHexElement() {
    var hexElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hexElement.setAttribute("points", smallHexString);
    return hexElement;
}

function createLineElement(x1: number, y1: number, x2: number, y2: number) {
    var lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineElement.setAttribute("x1", x1.toString());
    lineElement.setAttribute("y1", y1.toString());
    lineElement.setAttribute("x2", x2.toString());
    lineElement.setAttribute("y2", y2.toString());
    lineElement.setAttribute("stroke-width", "18");
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

function createTextElement( x: number, y: number, text: string) {
    var textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute("x", x.toString());
    textElement.setAttribute("y", y.toString());
    textElement.textContent = text;
    return textElement;
}

function createCircleElement( x: number, y: number, radius :number) {
    var pointElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    pointElement.setAttribute("cx", x.toString());
    pointElement.setAttribute("cy", y.toString());
    pointElement.setAttribute("r", radius.toString());
    return pointElement;
}

// HTML helpers

let tempElements : Element[] = [];

function clearTempElements() {
    tempElements.forEach( e => e.remove());
    tempElements = [];
}

function setTileGfx( element : Element, tile : TileData)
{
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
            } else if (tile.water > 0) {
                element.setAttribute("class", "water");
            } else {
                element.setAttribute("class", "land");
            }

            break;
    }
}

function setLineGfx( element : Element, line : LineData)
{

}

function setCornerGfx( element : Element, corner : CornerData)
{

}

function onSelectHex( hex: Hex) {
    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.add("selected");

}

function onHexHovered(hex: Hex) {
    clearTempElements();
    if (debugHexes) {

        let tile = hexmap.tiles[hexKey(hex.q, hex.r)];

        let text = `(${hex.q},${hex.r})`;
        if (tile.height > 0) {
            text += ` h:${tile.height}`;
        }
        if (tile.water > 0) {
            text += ` w:${tile.water}`;
        }
        if (tile.toxicity > 0) {
            text += ` t:${tile.toxicity}`;
        }

        let p = hexmap.layout.getPixel(hex.q, hex.r);
        let textElement = createTextElement(p.x, p.y, text);
        textElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(textElement);
        tempElements.push(textElement);

    }

    // number the neighbours
    for (let dir = 0; dir < 6; dir++) {
        let neighbour = hex.neighbor(dir);
        let neighbourText = `${dir}`;
        let neighbourP = hexmap.layout.getPixel(neighbour.q, neighbour.r);
        let neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
        neighbourTextElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(neighbourTextElement);
        tempElements.push(neighbourTextElement);
    }

    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.add("hover");
}

function onLineHovered(line: Line) {
    clearTempElements();

    // number the neighbours
    getLineHexes(line).forEach( (hex, index) => {
        let neighbourText = `${index}`;
        let neighbourP = hexmap.layout.getPixel(hex.q, hex.r);
        let neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
        neighbourTextElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(neighbourTextElement);
        tempElements.push(neighbourTextElement);
    });
}

function onCornerHovered(corner: Corner) {
    clearTempElements();

    // number the neighbours
    getCornerHexes(corner).forEach( (hex, index) => {
        let neighbourText = `${index}`;
        let neighbourP = hexmap.layout.getPixel(hex.q, hex.r);
        let neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
        neighbourTextElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(neighbourTextElement);
        tempElements.push(neighbourTextElement);
    });
}


class TileData
{
    public height : number = 0;
    public water : number = 0;
    public toxicity : number = 0;

    static toxicTile() : TileData
    {
        let tile = new TileData();
        tile.toxicity = 1;
        return tile;
    }

    public static waterTile() : TileData
    {
        let tile = new TileData();
        tile.water = 1;
        return tile;
    }

    public static getRandomTile() : TileData
    {
        let funcs = [ TileData.toxicTile, TileData.waterTile ];
        let tile = funcs[Math.floor(Math.random() * funcs.length)]();
        tile.height = Math.floor(Math.random() * 5);
        return tile;
    }
}

class LineData
{

}

class CornerData
{

}

class HexMap
{
    public layout : Layout;
    public mapHtml: Element;
    public mapRadius: number = 5;

    public tiles : { [key: number]: TileData; } = { };
    public tileElements : { [key: number]: Element; } = { };
    public lines : { [key: number]: LineData; } = { };
    public lineElements : { [key: number]: Element; } = { };
    public points : { [key: number]: CornerData; } = { };
    public pointElements : { [key: number]: Element; } = { };

    public onHexClicked : (q:number, r:number) => void;
    public onLineClicked : (q:number, r:number, dir:number) => void;
    public onCornerClicked : (q:number, r:number, dir:number) => void;

    constructor()
    {
        this.layout = new Layout( Layout.flat, Pt(100, 100), Pt(0,0));
    }
    
    init()
    {
        this.mapHtml = document.getElementById("hexmap");

        for (let x = -this.mapRadius; x <= this.mapRadius; x++) {
            for (let y = -this.mapRadius; y <= this.mapRadius; y++) {
                if (Math.abs(x + y) <= this.mapRadius) {
                    this.addHexElement( x, y);
                }
            }
        }

        this.setCamera( 0, 0, 0.5);
    }

    isHexInMap( q:number, r:number) : boolean
    {
        return ((Math.abs(q) + Math.abs(r) + Math.abs(-q-r)) / 2) <= this.mapRadius; //hex.len() <= this.mapRadius;
    }

    unselectHex() {
        this.mapHtml.querySelectorAll(".selected").forEach( e => e.classList.remove("selected"));
    }

    selectHex( q:number, r:number) {
        this.unselectHex();
        this.tileElements[hexKey(q,r)].classList.add("selected");
    }

    setCamera( q:number, y:number, scale:number)
    {
        this.mapHtml.setAttribute("transform", `translate(${q},${y}) scale(${scale})`);
    }

    addHexElement( q:number, r:number) : Element
    {
        let p = this.layout.getPixel( q, r);

        const newElement = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // tile hex
        const polygon = createSmallHexElement();
        polygon.onclick = () => { this.onHexClicked(q,r); };
        polygon.onmouseenter = () => { onHexHovered( new Hex(q,r)); };
        polygon.onmouseleave = () => { polygon.classList.remove("hover") };
        newElement.appendChild(polygon);
        // game logic data
        let tile = TileData.getRandomTile();
        this.tiles[hexKey(q,r)] = tile;
        setTileGfx( polygon, tile);
        this.tileElements[hexKey(q,r)] = polygon;

        
        let hex = new Hex(q,r);
        // hex lines
        let hexLines = getHexLines(hex);
        for (let lineNum = 0; lineNum < 6; lineNum++)
        {
            let line = hexLines[lineNum];
            if ( lineNum < 3 || !this.isHexInMap( line.q, line.r) )
            {
                let lineElement = createLineElement( hexPoints[lineNum].x, hexPoints[lineNum].y, hexPoints[lineNum + 1].x, hexPoints[lineNum + 1].y);
                lineElement.onclick = () => { this.onLineClicked(q,r,lineNum); };
                lineElement.onmouseenter = () => { onLineHovered( line); };
                newElement.appendChild(lineElement);

                // game logic data
                let lineData = new LineData();
                this.lines[lineKey(q,r,lineNum)] = lineData;
                setLineGfx(lineElement, lineData);
                this.lineElements[lineKey(q,r,lineNum)] = lineElement;
            }
        }

        // hex corners (only on the inside of the map)
        let hexCorners = getHexCorners(hex);
        for (let cornerNum = 0; cornerNum < 3; cornerNum++) // only 3 corners since other 3 are covered by other hexes
        {
            let keepCorner = true;
            let corner = hexCorners[cornerNum];
            for ( let hex of getCornerHexes(corner) )
                if ( !this.isHexInMap( hex.q, hex.r) )
                    keepCorner = false;
            if (!keepCorner)
                continue;

            let pointElement = createCircleElement( hexPoints[cornerNum].x, hexPoints[cornerNum].y, 10);
            pointElement.onclick = () => { this.onCornerClicked(q,r,cornerNum); };
            pointElement.onmouseenter = () => { onCornerHovered( corner); };
            newElement.appendChild(pointElement);
            
            // game logic data
            let cornerData = new CornerData();
            this.points[cornerKey(q,r,cornerNum)] = cornerData;
            setCornerGfx(pointElement, cornerData);
            this.pointElements[cornerKey(q,r,cornerNum)] = pointElement;
        }

        // move everything toghether
        newElement.setAttribute("transform", `translate(${p.x},${p.y})`);
        this.mapHtml.appendChild(newElement);

        return newElement;
    }

    refreshGfx() {
        for (let key in this.tiles) {
            let tile = this.tiles[key];
            let element = this.tileElements[key];
            setTileGfx( element, tile);
        }
    }
}

class Game
{
    constructor() {
        this.clicks = 0;
    }

    clicks : number;
    selectedTypeElement : Element;
    slectedPositionElement : Element;
    selectedHeightElement : Element;
    selectedWaterElement : Element;
    selectedToxicityElement : Element;

    init() {
        this.selectedTypeElement = document.getElementById("selected_type");
        this.slectedPositionElement = document.getElementById("selected_position");
        this.selectedHeightElement = document.getElementById("selected_height");
        this.selectedWaterElement = document.getElementById("selected_water");
        this.selectedToxicityElement = document.getElementById("selected_toxicity");
    }

    clicked( q:number, r:number) {
        this.clicks++;

        this.selectedTypeElement.textContent = "Score:" + this.clicks;

        console.log("Clicked ", q, r);
    }
}

let game = new Game;
let hexmap = new HexMap;
var selectedTile:number[] = [0,0]; // Need to remember selected tile

window.onload = function () {
    console.log("Loaded");

    //TODO: merge tile & game classes
    hexmap.init();
    game.init();
    hexmap.onHexClicked = (q:number, r:number) => { 
        selectedTile = [q ,r];
        hexmap.selectHex(q,r);

        game.selectedTypeElement.textContent = "Type: Hex" 
        game.slectedPositionElement.textContent = "Position: " + q + "," + r + ",";
        game.selectedHeightElement.textContent = "Height: " + hexmap.tiles[hexKey(q,r)].height;
        game.selectedWaterElement.textContent = "Water: " + hexmap.tiles[hexKey(q,r)].water;
        game.selectedToxicityElement.textContent = "Toxicity: " + hexmap.tiles[hexKey(q,r)].toxicity;
    };

    hexmap.onLineClicked = (q:number, r:number, dir:number) => {
    game.selectedTypeElement.textContent = "Type: Edge" 
    game.slectedPositionElement.textContent = "Position: " + q + "," + r + "," + dir;
    game.selectedHeightElement.textContent = "";
    game.selectedWaterElement.textContent = "";
    game.selectedToxicityElement.textContent = "";
    };

    hexmap.onCornerClicked = (q:number, r:number, dir:number) => {
    game.selectedTypeElement.textContent = "Type: Point" 
    game.slectedPositionElement.textContent = "Position: " + q + "," + r + "," + dir;
    game.selectedHeightElement.textContent = "";
    game.selectedWaterElement.textContent = "";
    game.selectedToxicityElement.textContent = "";
    };
}