class View {
  constructor(el, game) {
    this.el = el;
    this.game = game;
    this.drawBoard(game.board)
    this.bindEvents();
    this.drawReset()
  }

  showTurn() {
    let div = document.querySelector("#showTurn") || document.createElement("div");
    div.id = "showTurn"
    div.innerHTML = "";
    let p = document.createElement("p");
    
    let circle = document.createElement("div");
    circle.classList.add(this.game.currentPlayer.sym)
    circle.classList.add("turnColor")
    
    if(this.game.isGameOver()) {
      p.innerText = "WINS!"
    } else {
      p.innerText = "its your turn"

    }
    
    div.appendChild(circle)
    div.appendChild(p)
    this.el.prepend(div);
  }

  drawReset(){
    let button = document.createElement("button");
    button.innerText = "Play Again?"
    button.addEventListener("click", () => {
    this.game.newGame();
    this.drawBoard();
    this.bindEvents();``
    })
    this.el.appendChild(button);
  }

  drawBoard(board = this.game.board) {
      this.showTurn();

    let html = "";
    html += "<div class='leg'><div class='foot'></div></div>"
    html += "<div>"
    for(let row = 0; row < 6; row++) {
      html += "<ul>"
      for(let col = 0; col < 7; col++) {
        html += `<li value='${col}'  class='col-${col}' data-row='${row}'></li>`
      }
      html += '</ul>'
    }
    html += "</div>"
    html += "<div class='leg'></div>"
    let div = document.querySelector("#gameBoard")
    if(!div) {
      div = document.createElement("div");
      div.id = "gameBoard";
      this.el.appendChild(div)
    }
    div.innerHTML = html
  }

  playGame = (e) => {
    if(e.target.tagName !== "LI") return
    let col = e.target.value
    let sym = this.game.turn(col)
    if(this.game.isGameOver()) {
      this.el.removeEventListener('click', this.playGame)
    }
      this.dropDisc(sym);
    }
    
    dropDisc = (sym) => {
      let [row, column] = this.game.lastPlacement();
      let columns = document.querySelectorAll(`.col-${column}`)
      columns = [...columns]
      columns = columns.filter(el => {
        return el.dataset.row <= row
      })

      let disc = columns.pop();
      setTimeout(() => {
        disc.classList.add(sym)
        this.swapHighlights();
      }, columns.length * 1)
      
      this.showTurn();
  }

  showCol = (e) => {
    if(e.target.tagName === "DIV") {
      this.removeHighlights()
    }
    if(e.target.tagName !== "LI") return
    this.removeHighlights()
    let col = ".col-" + e.target.value;
    let collection = document.querySelectorAll(col);
    collection.forEach(el => {
      if(this.game.currentPlayer.sym === "r") {
        el.classList.add("showPink");
      } else {
        el.classList.add("showGray");
      }
    })

  }

  removeHighlights() {
    document.querySelectorAll(".showPink").forEach(el => {
      el.classList.remove("showPink");
    })
    document.querySelectorAll(".showGray").forEach(el => {
      el.classList.remove("showGray");
    })
  }

  swapHighlights() {
    let pinks = document.querySelectorAll(".showPink")
    if(pinks.length > 0) {
      pinks.forEach(el => {
        el.classList.remove("showPink");
        el.classList.add("showGray")
      })
    } else {
      document.querySelectorAll(".showGray").forEach(el => {
        el.classList.remove("showGray");
        el.classList.add("showPink")
      })
    }
  }

  bindEvents() {
    this.el.addEventListener('click', this.playGame)
    this.el.addEventListener('mouseover', this.showCol)

  }

}
