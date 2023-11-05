/// <reference path="./hex.ts" />


enum Lens {
    None,
    Height
}

let lens = Lens.None;

function createLineElement(x1: number, y1: number, x2: number, y2: number) {
    var lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineElement.setAttribute("x1", x1.toString());
    lineElement.setAttribute("y1", y1.toString());
    lineElement.setAttribute("x2", x2.toString());
    lineElement.setAttribute("y2", y2.toString());
    lineElement.setAttribute("stroke", "black");
    lineElement.setAttribute("stroke-width", "5");
    return lineElement;
}


function rgbToHex(r: number, g: number, b: number) {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function setTileGfx( element : Element, tile : TileData)
{
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
            } else if (tile.water > 0) {
                element.setAttribute("class", "water");
            } else {
                element.setAttribute("class", "land");
            }

            break;
    }
}

function setLens( button: HTMLInputElement)
{
    Object.keys(Lens).forEach( key => { if (button.value == key) { lens = Lens[key]; } });

    hexmap.refreshGfx();
}

function idx( q : number, r: number) : number
{
    return q + r * 1000;
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

class HexMap
{
    public layout : Layout;
    public mapHtml: Element;
    public tiles : { [key: number]: TileData; } = { };
    public tileElements : { [key: number]: Element; } = { };
    public onHexClicked : (q:number, r:number) => void;

    constructor()
    {
        this.layout = new Layout( Layout.flat, Pt(100, 100), Pt(0,0));
    }
    
    init()
    {
        this.mapHtml = document.getElementById("hexmap");

        const radius = 5;
        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                if (Math.abs(x + y) <= radius) {
                    this.addHexElement( x, y);
                }
            }
        }

        this.setCamera( 0, 0, 0.5);
    }

    setCamera( q:number, y:number, scale:number)
    {
        this.mapHtml.setAttribute("transform", `rotate(30) translate(${q},${y}) scale(${scale})`);
    }

    getRandomIndex() : number
    {
        let keys = Object.keys(this.tiles);
        let index = Math.floor(Math.random() * keys.length);
        return parseInt(keys[index]);
    }

    addHexElement( q:number, r:number) : Element
    {
        let p = this.layout.getPixel( q, r);

        const newElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        // polygon.setAttribute("points", "100,0 50,-87 -50,-87 -100,-0 -50,87 50,87");
        polygon.setAttribute("points", "90,0 45,-78.3 -45,-78.3 -90,-0 -45,78.3 45,78.3");
        //polygon.setAttribute("points", "95,0 47.5,-82.65 -47.5,-82.65 -95,-0 -47.5,82.65 47.5,82.65");
        
        const lineElement1 = createLineElement(100,0,50,-87);
        const lineElement2 = createLineElement(-50,-87,-100,-0);
        const lineElement3 = createLineElement(-50,87,50,87);
        newElement.appendChild(lineElement1);
        newElement.appendChild(lineElement2);
        newElement.appendChild(lineElement3);

        newElement.setAttribute("transform", `translate(${p.x},${p.y})`);
        newElement.appendChild(polygon);
        newElement.onclick = () => { this.onHexClicked(q,r); };
        newElement.onmouseenter = () => { newElement.classList.add("hover") };
        newElement.onmouseleave = () => { newElement.classList.remove("hover") };
        this.mapHtml.appendChild(newElement);

        let tile = TileData.getRandomTile();
        this.tiles[idx(q,r)] = tile;
        setTileGfx( newElement, tile);
        this.tileElements[idx(q,r)] = newElement;

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
    scoreElement : Element;
    
    init() {
        this.scoreElement = document.getElementById("score");

        this.scoreElement.textContent = "Score:" + this.clicks;
    }

    clicked( q:number, r:number) {
        this.clicks++;

        this.scoreElement.textContent = "Score:" + this.clicks;

        console.log("Clicked ", q, r);
    }
}

let game = new Game;
let hexmap = new HexMap;

window.onload = function () {
    console.log("Loaded");

    hexmap.init();
    game.init();
    hexmap.onHexClicked = (q:number, r:number) => { 

        game.clicked(q,r);

        game.scoreElement.textContent = "Height:" + hexmap.tiles[idx(q,r)].height;
    };

    //document.getElementById("clickme").onclick = () => { game.clicked(); };
}