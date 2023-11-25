/// <reference path="./hex.ts" />
/// <reference path="./utils.ts" />

/* 
TODO:
    action choosing flow
        pick element
        pick activity (build, clear, harvest)
            separate button for each build type
        pick citizen
        confirm if not idle

    citizen activities
        clear toxicity
        build
        harvest



    spawn small number of toxic and water tiles
    add UI for tooltips
    add building logic
        choose citizen to build

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

enum LineBuilding {
    Empty,
    Waterway
};

enum CornerBuilding {
    Empty,
    PowerPoint //Hehe
};

enum TileBuilding {
    Empty,
    Greenhouse
};

enum CitizenAction {
    Idle,
    ClearToxicity,
    Build,
    Harvest,
    Count
};

function getToxicityLevel( toxicity: number) : number {
    for (let i = 0; i < toxicityThresholds.length; i++) {
        if (toxicity < toxicityThresholds[i]) {
            return i;
        }
    }
    return toxicityThresholds.length;
}

// UI state

enum Lens {
    None,
    Height,
    Humidity,
    Energy,
    Toxicity
}

let lens = Lens.None;

function setLens( button: HTMLInputElement)
{
    Object.keys(Lens).forEach( key => { if (button.value == key) { lens = Lens[key]; } });
    hexmap.refreshGfx();
    hexmap.addTextToAllElements( button.value, button.value.toLowerCase());
}

function removeLens()
{
    lens = Lens.None;
    hexmap.refreshGfx();
    hexmap.removeTextFromAllElements();
}

let debugHexes = false;

class ChangeActionFlow
{
    constructor( action: CitizenAction)
    {
        this.action = action;
    }

    public dude? : Citizen = null;
    public target? : Hex | Line | Corner = null;
    public action : CitizenAction = CitizenAction.Idle;
    public targetIsOK: ( target: Hex | Line | Corner) => boolean = null; // return true if it's a valid target
    public onStart : () => void = null;
    public onConfirm : (target: Hex | Line | Corner) => void = null;
    public onCancel : () => void = null;

    public static justHexes( target: Hex | Line | Corner) : boolean {
        return target instanceof Hex;
    }
}

let currentAction : ChangeActionFlow = null;

let selectedTile:number[] = [0,0]; // Need to remember selected tile


let tempElements : Element[] = [];

function clearTempElements() {
    tempElements.forEach( e => e.remove());
    tempElements = [];
}

function setTileGfx( element : Element, tile : TileData)
{
    switch (lens) {
        case Lens.Humidity:
            element.removeAttribute("class");
            if (tile.water == true) {
                element.setAttribute("fill", rgbToHexa(tile.humidity * 0, 250 - tile.humidity * 50, 250 - tile.humidity * 25));
                element.setAttribute("stroke", rgbToHexa(250, 250, 250));
                element.setAttribute("stroke-width", "1");
            }
            element.setAttribute("fill", rgbToHexa(tile.humidity * 0, 250 - tile.humidity * 50, 250 - tile.humidity * 25));
            break;
        case Lens.Height:
            element.removeAttribute("class");
            element.removeAttribute("stroke");
            element.removeAttribute("stroke-width");
            element.setAttribute("fill", rgbToHexa(tile.height * 50, tile.height * 50, tile.height * 50));
            break;
        case Lens.Energy:
            element.removeAttribute("class");
            element.removeAttribute("stroke");
            element.removeAttribute("stroke-width");
            element.setAttribute("fill", rgbToHexa(0, 0, 0));
            break;
        case Lens.Toxicity:
            element.removeAttribute("class");
            element.removeAttribute("stroke");
            element.removeAttribute("stroke-width");
            element.setAttribute("fill", rgbToHexa(tile.toxicity * 3 , tile.toxicity * 3 , tile.toxicity * 3));
            break;
        case Lens.None:
            element.removeAttribute("fill");
            element.removeAttribute("stroke");
            element.removeAttribute("stroke-width");
            element.removeAttribute("class");
            // type-specific style - we need to work a bit on this
            if (tile.toxicity > toxicityThresholds[0]) {
                let toxicityLevel = getToxicityLevel(tile.toxicity);
                element.classList.add("toxic" + clamp(toxicityLevel, 1, 4));
            } else if (tile.humidity> 0) {
                element.classList.add("humidity" + clamp(tile.humidity, 1, 5));
            } else {
                element.classList.add("land"+ randInt(1, 3));
            }

            break;
    }
}

function setLineGfx( element : Element, line : LineData)
{
    switch (line.built) {
        case LineBuilding.Empty:
            element.setAttribute("class", "line-empty");
            break;
        case LineBuilding.Waterway:
            element.setAttribute("class", "line-waterway");
            break;
    }
}

function setCornerGfx( element : Element, corner : CornerData)
{
    switch (corner.built) {
        case CornerBuilding.Empty:
            element.setAttribute("class", "corner-empty");
            break;
        case CornerBuilding.PowerPoint:
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

function onHexUnhovered(hex: Hex) {
    hexmap.tileElements[hexKey(hex.q, hex.r)].classList.remove("hover");
}

function onLineHovered(line: Line) {
    clearTempElements();

    if (debugHexes) {
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

    //BUG: Getting error hovering over edge lines
    hexmap.lineElements[lineKey(line.q, line.r, line.dir)].classList.add("line-hover");
}

function onCornerHovered(corner: Corner) {
    clearTempElements();

    if (debugHexes) {
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

    hexmap.cornerElements[lineKey(corner.q, corner.r, corner.dir)].classList.add("corner-hover");
}

function onHexClicked(hex: Hex) { 
    selectedTile = [ hex.q ,hex.r];
    hexmap.selectHex(hex.q,hex.r);

    game.selectedTypeElement.textContent = "Type: Hex" 
    game.slectedPositionElement.textContent = "Position: " + hex.q + "," + hex.r + ",";
    game.selectedHeightElement.textContent = "Height: "     + hexmap.tiles[hexKey(hex.q,hex.r)].height;
    game.selectedWaterElement.textContent = "Is Water source: "       + hexmap.tiles[hexKey(hex.q,hex.r)].water;
    game.selectedHumidityElement.textContent = "Humidity: "       + hexmap.tiles[hexKey(hex.q,hex.r)].humidity;
    let tox = hexmap.tiles[hexKey(hex.q,hex.r)].toxicity;
    game.selectedToxicityElement.textContent = "Toxicity: " + getToxicityLevel(tox) + " (" + tox + ")";
}

function onLineClicked( line : Line) {
    game.selectedTypeElement.textContent = "Type: Edge" 
    game.slectedPositionElement.textContent = "Position: " + line.q + "," + line.r + "," + line.dir;
    game.selectedHeightElement.textContent = "";
    game.selectedWaterElement.textContent = "";
    game.selectedHumidityElement.textContent = ""
    game.selectedToxicityElement.textContent = "";
};

function onCornerClicked( corner :Corner) {
    game.selectedTypeElement.textContent = "Type: Point" 
    game.slectedPositionElement.textContent = "Position: " + corner.q + "," + corner.r + "," + corner.dir;
    game.selectedHeightElement.textContent = "";
    game.selectedWaterElement.textContent = "";
    game.selectedHumidityElement.textContent = ""
    game.selectedToxicityElement.textContent = "";
};

function toggleDebug() {
    debugHexes = !debugHexes;
    if (debugHexes) 
        document.getElementById("toggledebug").setAttribute("style", "background-color: #00c46b")
    else
        document.getElementById("toggledebug").setAttribute("style", "background-color: #c44600")
    hexmap.refreshGfx();
}


class TileData
{
    public coords       : Hex = null;
    public height       : number = 0;
    public water        : boolean = false;      // If it is a water source or not
    public humidity     : number = 0;           // The humidity level of the tile 0 - 5
    public toxicity     : number = 0;
    public energy       : number = 0;

    static toxicTile() : TileData
    {
        let tile = new TileData();
        tile.toxicity = toxicityThresholds[randInt(0,3)];
        return tile;
    }

    static waterTile() : TileData
    {
        let tile = new TileData();
        tile.water = true;
        tile.humidity = 5;
        return tile;
    }

    static landTile() : TileData
    {
        let tile = new TileData();
        tile.humidity = randInt(0,5);
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
    built : LineBuilding = LineBuilding.Empty;
}

class CornerData
{
    coords: Line = null;
    built : CornerBuilding = CornerBuilding.Empty;
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

    addTextToElement(element: Element, text: string) // Adds text in the middle of an element
    {
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

    addTextToAllElements(text: string, property: string) // Adds selected property value to all elements in the middle
    {
        for (let key in this.tileElements) {
            let element = this.tileElements[key];
            let textToAdd = this.tiles[key][property];
            if (typeof this.tiles[key][property] == "number") {
                textToAdd = Math.round(this.tiles[key][property]);
            }
            this.addTextToElement(element, textToAdd.toString());
        }
    }

    removeTextFromElement( element: Element) // Removes text from element
    {
        element.querySelectorAll("text").forEach( e => e.remove());
    }

    removeTextFromAllElements() // Removes text from all elements
    {
        for (let key in this.tileElements) {
            let element = this.tileElements[key];
            this.removeTextFromElement(element);
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
                polygon.onclick = () => { onHexClicked(hex); };
                polygon.onmouseenter = () => { onHexHovered(hex); };
                polygon.onmouseleave = () => { onHexUnhovered(hex); };
                
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
                lineElement.onclick = () => { onLineClicked(line); };
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
                pointElement.onclick = () => { onCornerClicked( corner); };
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
    assignedTile: Hex = null;
    chosenAction: CitizenAction = CitizenAction.Idle;
    actionStuff: any = null; // this will hold info about the status of build actions
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

    doCitizensTurn() {
        for (let i = 0; i < this.citizens.length; i++) {
            let citizen = this.citizens[i];
            switch ( citizen.chosenAction) {
                case CitizenAction.Idle:
                    break;
                case CitizenAction.ClearToxicity:
                    if (citizen.assignedTile) {
                        let tile = hexmap.tiles[hexKey(citizen.assignedTile.q, citizen.assignedTile.r)];
                        if (tile.toxicity > 0) {
                            tile.toxicity = Math.max( tile.toxicity - toxicityPerTurn * 10 , 0);
                        }
                    }
                    break;
                case CitizenAction.Build:
                    //TODO: Add work to building
                    break;
                case CitizenAction.Harvest:
                    //TODO: Generate stuff based on assigned tile
                    break;
            }
        }
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
            cell2.innerHTML = citizen.assignedTile ? citizen.assignedTile[0] + "," + citizen.assignedTile[1] : "Idle";
            cell3.innerHTML = "Alive"; // status used to go here

            // action stuff
            let actionCell = row.insertCell(3);

            let container = document.createElement("div");
            container.classList.add("btn-group");
            actionCell.appendChild(container);

            let actionButton = document.createElement("button");
            actionButton.type = "button";
            actionButton.classList.add("btn", "btn-primary", "btn-sm");
            actionButton.textContent = CitizenAction[citizen.chosenAction].toString();
            container.appendChild(actionButton);

            let dropdownButton = document.createElement("button");
            dropdownButton.type = "button";
            dropdownButton.classList.add("btn", "btn-primary", "btn-sm", "dropdown-toggle", "dropdown-toggle-split");
            dropdownButton.dataset.toggle = "dropdown";
            dropdownButton.setAttribute("aria-haspopup", "true");
            dropdownButton.setAttribute("aria-expanded", "false");
            container.appendChild(dropdownButton);

            let dropdownSpan = document.createElement("span");
            dropdownSpan.classList.add("sr-only");
            dropdownSpan.textContent = "Toggle Dropdown";
            dropdownButton.appendChild(dropdownSpan);

            let dropdownMenu = document.createElement("div");
            dropdownMenu.classList.add("dropdown-menu");
            container.appendChild(dropdownMenu);

            for (let j = 0; j < CitizenAction.Count; j++) {
                if (j == citizen.chosenAction)
                    continue;
                addDropdownChild(dropdownMenu, CitizenAction[j], () => { 
                    citizen.chosenAction = j;
                    //TODO: Set action choose target state

                    this.refreshGfx(); 
                });
            }

            //let dropdownDivider = document.createElement("div");
            //dropdownDivider.classList.add("dropdown-divider");
        }
    }
}

class Resources
{
    polymers: number = 0;
    metals: number = 0;
    minerals: number = 0;
    waste: number = 0;

    addAmount(resource: string, amount: number) {
        this[resource] += amount;
    }

    moveAmount(other: Resources, resource: string, amount: number) {
        if (this[resource] >= amount) {
            this[resource] -= amount;
            other[resource] += amount;
        }
    }

    moveAll(other: Resources) {
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

class Game
{

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

    selectedTypeElement : Element;
    slectedPositionElement : Element;
    selectedHeightElement : Element;
    selectedWaterElement : Element;
    selectedHumidityElement : Element;
    selectedToxicityElement : Element;

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

        document.getElementById("restart").onclick = () => { this.resetState(); };
        document.getElementById("savegame").onclick = () => { this.saveState(); };
        document.getElementById("loadgame").onclick = () => { this.loadState(); };
        document.getElementById("toggledebug").onclick = () => { toggleDebug(); };

        document.getElementById("nextturn").onclick = () => { this.nextTurn(); };

        this.loadState();
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
let resources = new Resources;

window.onload = function () {
    console.log("Loaded");

    game.init();
    
    resources.addAmount("polymers", 100);
    resources.addAmount("metals", 125);
    resources.refreshGfx();
}