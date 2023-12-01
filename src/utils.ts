
// Helper functions


function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new Error(msg);
    }
}

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

function getRandomElement<Type>(dictionary: { [key: number]: Type; } ) : Type
{
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

function createArrowHead() {
    // <path d="M 0 0 l 20 20 l 0 -10 l 110.88457268119896 0 l -3 -10 l 3 -10 l -110.88457268119896 0 l 0 -10 Z" ></path>
    var element = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    //arrowElement.setAttribute("d", "M 0 0 l 20 20 l 0 -10 l 110.88457268119896 0 l -3 -10 l 3 -10 l -110.88457268119896 0 l 0 -10 Z");
    element.setAttribute("points", "-20,-10 20,0 -20,10");
    return element;
}

function createRectangle() {
    var element = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    element.setAttribute("points", "-20,-6 20,-6 20,6 -20,6");
    return element;
}

function addDropdownChild( parent: Element, label: string, callback: () => void) {
    let dropdownItem1 = document.createElement("a");
    dropdownItem1.classList.add("dropdown-item");
    dropdownItem1.href = "#";
    dropdownItem1.textContent = label;
    dropdownItem1.onclick = callback;
    parent.appendChild(dropdownItem1);
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
    corners.push( new Corner( Hex.directions[2].q + hex.q, Hex.directions[2].r + hex.r, 0));
    corners.push( new Corner( Hex.directions[3].q + hex.q, Hex.directions[3].r + hex.r, 1));
    corners.push( new Corner( Hex.directions[3].q + hex.q, Hex.directions[3].r + hex.r, 0));
    corners.push( new Corner( Hex.directions[4].q + hex.q, Hex.directions[4].r + hex.r, 1));
    return corners;
}

function getCornerHexes( corner : Corner) : Hex[] {
    return [new Hex( corner.q, corner.r), 
            new Hex( corner.q + Hex.directions[(corner.dir + 5) % 6].q, corner.r + Hex.directions[(corner.dir + 5) % 6].r),
            new Hex( corner.q + Hex.directions[corner.dir].q, corner.r + Hex.directions[corner.dir].r),
        ];
}

function getCornerLines( corner : Corner) : Line[] {
    if (corner.dir == 0)
        return [new Line( corner.q, corner.r, 0),
                new Line( corner.q, corner.r -1, 1),
                new Line( corner.q, corner.r -1, 2)];
    else if (corner.dir == 1)
        return [new Line( corner.q, corner.r, 0),
                new Line( corner.q, corner.r, 1),
                new Line( corner.q+1,corner.r, 2)];
    else
        assert(false, "Invalid corner direction");
}

function getCornerNeighbours( corner : Corner) : Corner[] {
    if (corner.dir == 0)
        return [new Corner( corner.q, corner.r, 1),
            new Corner( corner.q + Hex.directions[4].q, corner.r + Hex.directions[4].r, 1),
            new Corner( corner.q + Hex.directions[5].q, corner.r + Hex.directions[5].r, 1),];
    else if (corner.dir == 1)
        return [new Corner( corner.q, corner.r, 0),
            new Corner( corner.q + Hex.directions[1].q, corner.r + Hex.directions[1].r, 0),
            new Corner( corner.q + Hex.directions[2].q, corner.r + Hex.directions[2].r, 0),];
    else
        assert(false, "Invalid corner direction");
}

function getLineBetweenCorners( c1 : Corner, c2 : Corner) : Line {
    if (c2.dir == 0) {
        let c = c1;
        c1 = c2;
        c2 = c;        
    }
    return new Line( c1.q, c2.r, c1.q - c2.q + c2.r - c1.r);
}

function getLineCorners(l :Line): Corner[]
{
    if (l.dir == 0)
        return [ new Corner( l.q, l.r, 0), new Corner( l.q, l.r, 1)];
    if (l.dir == 1)
        return [ new Corner( l.q, l.r - 1, 0), new Corner( l.q, l.r, 1)];
    if (l.dir == 2)
        return [ new Corner( l.q, l.r - 1, 0), new Corner( l.q - 1, l.r, 1)];
    assert(false, "Invalid line direction");
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