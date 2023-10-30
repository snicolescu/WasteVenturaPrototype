

window.onload = function () {
    console.log("Loaded");

    game.init();

    document.getElementById("clickme").onclick = () => { game.clicked(); };
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

    clicked() {
        this.clicks++;

        this.scoreElement.textContent = "Score:" + this.clicks;
    }
}

let game = new Game;