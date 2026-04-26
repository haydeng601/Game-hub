class Game {
  constructor() {
    this.board = new Board(6, 7)
    this.player1 = new HumanPlayer("Noe", "r")
    this.player2 = new HumanPlayer("Corey", "b")
    this.currentPlayer = this.player1
  }

  newGame() {
    this.board = new Board(6, 7);
  }

  turn(col) {
    if (this.board.placeMarker(col, this.currentPlayer.sym)) {
      if(!this.isGameOver()) {
        const prevSym = this.currentPlayer.sym
        this.switchPlayer();
        return prevSym
      }
    } else {
      console.log("error in turn func")
    }
    return this.currentPlayer.sym
  }

  lastPlacement() {
    return this.board.lastPlacement;
  }

  isGameOver() {
    return this.board.checkWinner()
  }

  switchPlayer() {
    return this.currentPlayer = this.currentPlayer === this.player1 ?
      this.player2 : this.player1;
  }
}
