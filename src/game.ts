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

const citizenNames: string[] = ["Cerbu", "Ioan", "Iulia", "Edi", "Silvia", "Sick", "Adi", "Andu", "Mihai", "Dan", "Vlad"];

const toxicityThresholds = [10, 20, 35, 55, 80];
const toxicityPerTurn = 0.2; // how much toxicity is spread by toxic tiles. multiplied by their toxicity level

enum LineBuildings {
    Empty,
    Waterway
};

enum CornerBuildings {
    Empty,
    PowerPoint //Hehe
};

function getToxicityLevel( toxicity: number) : number {
    for (let i = 0; i < toxicityThresholds.length; i++) {
        if (toxicity < toxicityThresholds[i]) {
            return i;
        }
    }
    return toxicityThresholds.length;
}

// Hex, Line & Point helpers

function Pt(x : number, y : number) : Point { return new Point(x, y); };

// Starts in bottom right and goes anti-clockwise
// ! Careful, it has 7 points, the first and last are the same so we don't have to modulo when adding lines
const hexPoints = [ Pt(50,87), Pt(100,0), Pt(50,-87), Pt(-50,-87), Pt(-100,-0), Pt(-50,87), Pt(50,87)];
const fullHexString = "50,87 100,0 50,-87 -50,-87 -100,-0 -50,87";
// const smallHexString = "40,69.6 80,-0 40,-69.6 -40,-69.6 -80,-0 -40,69.6"; // 80% of the full size
//const smallHexString = "42.5,73.95 85,0 42.5,-73.95 -42.5,-73.95 -85,-0 -42.5,73.95"; // 85% of the full size
const smallHexString = "45,78.3 90,-0 45,-78.3 -45,-78.3 -90,-0 -45,78.3"; // 90% of the full size

class Line {
    constructor( public q:number, public r:number, public dir:number) { }
}

class Corner {
    constructor( public q:number, public r:number, public dir:number) { }
}

function getHexNeighbours( hex: Hex) : Hex[] {
    return [new Hex( hex.q + Hex.directions[0].q, hex.r + Hex.directions[0].r),
            new Hex( hex.q + Hex.directions[1].q, hex.r + Hex.directions[1].r),
            new Hex( hex.q + Hex.directions[2].q, hex.r + Hex.directions[2].r),
            new Hex( hex.q + Hex.directions[3].q, hex.r + Hex.directions[3].r),
            new Hex( hex.q + Hex.directions[4].q, hex.r + Hex.directions[4].r),
            new Hex( hex.q + Hex.directions[5].q, hex.r + Hex.directions[5].r)];
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

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

// returns a random integer in the range [min, max]
function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
            element.removeAttribute("class");
            // type-specific style
            if (tile.toxicity > toxicityThresholds[0]) {
                let toxicityLevel = getToxicityLevel(tile.toxicity);
                element.classList.add("toxic" + clamp(toxicityLevel, 1, 4));
            } else if (tile.water > 0) {
                element.classList.add("water" + clamp(tile.water, 1, 3));
            } else {
                element.classList.add("land"+ randInt(1, 3));
            }

            break;
    }
}

function setLineGfx( element : Element, line : LineData)
{
    switch (line.built) {
        case LineBuildings.Empty:
            element.setAttribute("class", "line-empty");
            break;
        case LineBuildings.Waterway:
            element.setAttribute("class", "line-waterway");
            break;
    }
}

function setCornerGfx( element : Element, corner : CornerData)
{
    switch (corner.built) {
        case CornerBuildings.Empty:
            element.setAttribute("class", "corner-empty");
            break;
        case CornerBuildings.PowerPoint:
            element.setAttribute("class", "corner-power");
            break;
    }
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
        let neighbour = Hex.neighbor(hex, dir);
        let neighbourText = `${dir}`;
        let neighbourP = hexmap.layout.getPixel(neighbour.q, neighbour.r);
        let neighbourTextElement = createTextElement(neighbourP.x, neighbourP.y, neighbourText);
        neighbourTextElement.setAttribute("class", "debugText");
        hexmap.mapHtml.appendChild(neighbourTextElement);
        tempElements.push(neighbourTextElement);
    }

    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.add("hover");
}

function onHexUnhovered(hex: Hex) {
    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.remove("hover");
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
    //BUG: Getting error hovering over edge lines
    hexmap.lineElements[lineKey(line.q, line.r, line.dir)].classList.add("line-hover");
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
    hexmap.cornerElements[lineKey(corner.q, corner.r, corner.dir)].classList.add("corner-hover");
}


class TileData
{
    public coords   : Hex = null;
    public height   : number = 0;
    public water    : number = 0;
    public toxicity : number = 0;

    static toxicTile() : TileData
    {
        let tile = new TileData();
        tile.toxicity = toxicityThresholds[randInt(0,3)];
        return tile;
    }

    static waterTile() : TileData
    {
        let tile = new TileData();
        tile.water = randInt(1,3);
        return tile;
    }

    static landTile() : TileData
    {
        let tile = new TileData();
        return tile;
    }

    public static makeRandomTile() : TileData
    {
        let funcs = [ TileData.toxicTile, TileData.waterTile, TileData.landTile ];
        let tile = funcs[Math.floor(Math.random() * funcs.length)]();
        tile.height = Math.floor(Math.random() * 5);
        return tile;
    }
}

class LineData
{
    coords: Line = null;
    built : LineBuildings = LineBuildings.Empty;
}

class CornerData
{
    coords: Line = null;
    built : CornerBuildings = CornerBuildings.Empty;
}

class HexMap
{
    // Game
    public mapRadius: number = 5;
    
    public tiles : { [key: number]: TileData; } = { };
    public lines : { [key: number]: LineData; } = { };
    public corners : { [key: number]: CornerData; } = { };
    
    // UI
    public layout = new Layout(Layout.flat, Pt(100,100), Pt(0,0));
    public mapHtml: Element;
    public tileElements? : { [key: number]: Element; };
    public lineElements? : { [key: number]: Element; };
    public cornerElements? : { [key: number]: Element; };

    public onHexClicked : ( hex: Hex) => void;
    public onLineClicked : ( line: Line) => void;
    public onCornerClicked : ( corner: Corner) => void;

    init()
    {
        this.mapHtml = document.getElementById("hexmap");
        this.setCamera( 0, 0, 0.5);
    }

    populateWithRandomTiles()
    {
        for (let x = -this.mapRadius; x <= this.mapRadius; x++) {
            for (let y = -this.mapRadius; y <= this.mapRadius; y++) {
                if (Math.abs(x + y) <= this.mapRadius) {
                    this.addNewTile( x, y, TileData.makeRandomTile());
                }
            }
        }
    }

    refreshGfx()
    {
        if ( this.tileElements === undefined)
        {
            this.tileElements = {};
            for (let key in this.tiles) {
                let tile = this.tiles[key];
                let hex = tile.coords;
                // tile hex
                const polygon = createSmallHexElement();
                polygon.onclick = () => { this.onHexClicked( hex); };
                polygon.onmouseenter = () => { onHexHovered( hex); };
                polygon.onmouseleave = () => { onHexUnhovered( hex); };
                
                // move everything toghether
                const tileElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
                tileElement.appendChild(polygon);
                let p = this.layout.getPixel( hex.q, hex.r);
                tileElement.setAttribute("transform", `translate(${p.x},${p.y})`);
                this.tileElements[hexKey( hex.q, hex.r)] = tileElement;
                this.mapHtml.appendChild(tileElement);
            }
        }

        for (let key in this.tiles) {
            let tile = this.tiles[key];
            let element = this.tileElements[key];
            setTileGfx( element, tile);
        }

        if ( this.lineElements === undefined)
        {
            this.lineElements = {};
            for (let key in this.lines) {
                let lineData = this.lines[key];
                let line = lineData.coords;

                let hexCenter = this.layout.getPixel( line.q, line.r);
                let lineElement = createLineElement( 
                    hexCenter.x + hexPoints[line.dir].x     , hexCenter.y + hexPoints[line.dir].y, 
                    hexCenter.x + hexPoints[line.dir + 1].x , hexCenter.y + hexPoints[line.dir + 1].y);
                lineElement.onclick = () => { this.onLineClicked(line); };
                lineElement.onmouseenter = () => { onLineHovered(line); };
                lineElement.onmouseleave = () => { lineElement.classList.remove("line-hover") };

                this.lineElements[key] = lineElement;
                this.mapHtml.appendChild(lineElement);
            }
        }

        for (let key in this.lines) {
            let line = this.lines[key];
            let element = this.lineElements[key];
            setLineGfx( element, line);
        }

        if (this.cornerElements === undefined)
        {
            this.cornerElements = {};
            for (let key in this.corners) {
                let cornerData = this.corners[key];
                let corner = cornerData.coords;

                let hexCenter = this.layout.getPixel( corner.q, corner.r);
                let pointElement = createCircleElement( hexCenter.x + hexPoints[corner.dir].x, hexCenter.y + hexPoints[corner.dir].y, 10);
                pointElement.onclick = () => { this.onCornerClicked( corner); };
                pointElement.onmouseenter = () => { onCornerHovered( corner); };
                pointElement.onmouseleave = () => { pointElement.classList.remove("corner-hover") };

                this.cornerElements[key] = pointElement;
                this.mapHtml.appendChild(pointElement);
            }
        }

        for (let key in this.corners) {
            let corner = this.corners[key];
            let element = this.cornerElements[key];
            setCornerGfx( element, corner);
        }
    }

    getTileNeighbourTiles( tile: TileData) : TileData[]
    {
        let neighbours : TileData[] = [];
        for (let neighbourHex of getHexNeighbours(tile.coords)) {
            let neighbour = this.tiles[hexKey(neighbourHex.q, neighbourHex.r)];
            if (neighbour) {
                neighbours.push(neighbour);
            }
        }
        return neighbours;
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

    ///> Adds the tile to the map and creates the lines and corners
    addNewTile( q:number, r:number, tile:TileData)
    {
        const hex = new Hex(q,r);

        // hex data
        tile.coords = hex;
        this.tiles[hexKey(q,r)] = tile;
        
        // hex lines
        let hexLines = getHexLines(hex);
        for (let lineNum = 0; lineNum < 6; lineNum++)
        {
            let line = hexLines[lineNum];
            if ( lineNum < 3 || !this.isHexInMap( line.q, line.r) )
            {
                let lineData = new LineData();
                lineData.coords = line;
                this.lines[lineKey(line.q, line.r, line.dir)] = lineData;
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

            // game logic data
            let cornerData = new CornerData();
            cornerData.coords = corner;
            this.corners[cornerKey( corner.q, corner.r, corner.dir )] = cornerData;
        }
    }
}

class Citizen
{
    name: string = "ph_name";
    assignedTile: number[] = null;
    status: boolean = true;
}

class CitizensList
{
    constructor() {
        this.citizens = [];
        //CRB: This doesn't work because it's called in the constructor, but the html hasn't finished loading. Need to wait for onload
        //this.table = document.getElementById("citizens_table") as HTMLTableElement;
    }
   
    // Game
    citizens: Citizen[];

    // UI
    table: HTMLTableElement;
    rows: HTMLCollectionOf<HTMLTableRowElement>;

    initUI() {
        this.table = document.getElementById("citizens_table") as HTMLTableElement;
        this.rows = this.table.rows;
    }

    loadCitizens( citizens: Citizen[]) {
        this.citizens = citizens;
    }

    populateWithRandomCitizens() {
        this.citizens = [];
        for (let i = 0; i < 10; i++) {
            let citizen = new Citizen;
            citizen.name = citizenNames[Math.floor(Math.random() * citizenNames.length)];
            this.citizens.push(citizen);
        }
    }

    refreshGfx() {
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
            cell2.innerHTML = citizen.assignedTile ? citizen.assignedTile[0] + "," + citizen.assignedTile[1] : "Idle";
            cell3.innerHTML = citizen.status ? "Alive" : "Dead";
        }
    }
}

class Game
{
    constructor() {
        this.clicks = 0;
    }

    resetState() {
        localStorage.clear();
        this.loadState();
    }

    loadState() {
        let saveName = "save1";
        let saveString = localStorage.getItem( saveName);
        if (saveString === null) {
            console.log("No saved data found. Generating new random one.");

            citizensList.populateWithRandomCitizens();
            hexmap.populateWithRandomTiles();
        }else {
            let saveJson = JSON.parse(saveString);
            console.log("Loaded saved data from " + saveName + ".");

            citizensList.loadCitizens( saveJson.citizens);
            hexmap.tiles = saveJson.tiles;
            hexmap.lines = saveJson.lines;
            hexmap.corners = saveJson.corners;
        }

        citizensList.refreshGfx();
        hexmap.refreshGfx();
    }

    saveState() {
        let saveName = "save1";
        let saveJson = {
            citizens: citizensList.citizens,
            tiles: hexmap.tiles,
            lines: hexmap.lines,
            corners: hexmap.corners
        };
        let saveString = JSON.stringify(saveJson);
        localStorage.setItem( saveName, saveString);
        console.log("Saved data to " + saveName + ".");
    }

    clicks : number;
    selectedTypeElement : Element;
    slectedPositionElement : Element;
    selectedHeightElement : Element;
    selectedWaterElement : Element;
    selectedToxicityElement : Element;

    init() {
        //TODO: merge tile & game classes
        citizensList.initUI();
        hexmap.init();

        this.selectedTypeElement = document.getElementById("selected_type");
        this.slectedPositionElement = document.getElementById("selected_position");
        this.selectedHeightElement = document.getElementById("selected_height");
        this.selectedWaterElement = document.getElementById("selected_water");
        this.selectedToxicityElement = document.getElementById("selected_toxicity");

        document.getElementById("restart").onclick = () => { this.resetState(); };
        document.getElementById("savegame").onclick = () => { this.saveState(); };
        document.getElementById("loadgame").onclick = () => { this.loadState(); };

        document.getElementById("nextturn").onclick = () => { this.nextTurn(); };

        this.loadState();
    }

    clicked( q:number, r:number) {
        this.clicks++;

        this.selectedTypeElement.textContent = "Score:" + this.clicks;

        console.log("Clicked ", q, r);
    }

    nextTurn() {
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

        citizensList.refreshGfx();
        hexmap.refreshGfx();
    }
}

let game = new Game;
let hexmap = new HexMap;
let citizensList = new CitizensList;

var selectedTile:number[] = [0,0]; // Need to remember selected tile


window.onload = function () {
    console.log("Loaded");

    game.init();

    hexmap.onHexClicked = (hex: Hex) => { 
        selectedTile = [ hex.q ,hex.r];
        hexmap.selectHex(hex.q,hex.r);

        game.selectedTypeElement.textContent = "Type: Hex" 
        game.slectedPositionElement.textContent = "Position: " + hex.q + "," + hex.r + ",";
        game.selectedHeightElement.textContent = "Height: "     + hexmap.tiles[hexKey(hex.q,hex.r)].height;
        game.selectedWaterElement.textContent = "Water: "       + hexmap.tiles[hexKey(hex.q,hex.r)].water;
        let tox = hexmap.tiles[hexKey(hex.q,hex.r)].toxicity;
        game.selectedToxicityElement.textContent = "Toxicity: " + getToxicityLevel(tox) + " (" + tox + ")";
    };

    hexmap.onLineClicked = ( line : Line) => {
    game.selectedTypeElement.textContent = "Type: Edge" 
    game.slectedPositionElement.textContent = "Position: " + line.q + "," + line.r + "," + line.dir;
    game.selectedHeightElement.textContent = "";
    game.selectedWaterElement.textContent = "";
    game.selectedToxicityElement.textContent = "";
    };

    hexmap.onCornerClicked = ( corner :Corner) => {
    game.selectedTypeElement.textContent = "Type: Point" 
    game.slectedPositionElement.textContent = "Position: " + corner.q + "," + corner.r + "," + corner.dir;
    game.selectedHeightElement.textContent = "";
    game.selectedWaterElement.textContent = "";
    game.selectedToxicityElement.textContent = "";
    };
}