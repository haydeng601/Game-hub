class Board {
  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.grid = this.makeBoard(height, width)
    this.lastPlacement = [];
  }

  get(pos) {
    let [row, col] = pos;
    return this.grid[row][col];
  }

  isValidColumn(col) {
    return !this.grid[0][col];
  }

  placeMarker(col, sym) {
    if (this.isValidColumn(col)) {
      for(let row = this.height - 1; row >= 0; row--) {
        if (this.grid[row][col] === null) {
          this.grid[row][col] = sym
          this.lastPlacement = [row, col]
          return true
        }
      }
    }
    return false
  }

  makeBoard(height, width) {
    let output = new Array(height).fill(null)
    return output.map(el => new Array(width).fill(null))
  }

  checkWinner(pos = this.lastPlacement) {
    if(pos.length === 0) return;
    return this.lefttoRightDiagnolCheck(pos) || this.rightToLeftDiagnolCheck(pos) ||
      this.horizontalCheck(pos) || this.verticalCheck(pos)
  }

  lefttoRightDiagnolCheck(pos) {
    let [row, col] = pos;
    let piece = this.grid[row][col]
    let results = [piece];
    let j = col - 1;
    for(let i = row  - 1; i >= 0; i--) {
      if(this.grid[i][j] === piece) {
        results.push(piece);
        j--;
      } else {
        break;
      }
    }
    j = col + 1;
    for(let i = row  + 1; i < this.height; i++) {
      if(this.grid[i][j] === piece) {
        results.push(piece);
        j++;
      } else {
        break;
      }
    }
    return results.length >= 4;
  }

  rightToLeftDiagnolCheck(pos) {
    let [row, col] = pos;
    let piece = this.grid[row][col]
    let results = [piece];
    let j = col + 1;
    for(let i = row  - 1; i >= 0; i--) {
      if(this.grid[i][j] === piece) {
        results.push(piece);
        j++;
      } else {
        break;
      }
    }
    j = col - 1;
    for(let i = row  + 1; i < this.height; i++) {
      if(this.grid[i][j] === piece) {
        results.push(piece);
        j--;
      } else {
        break;
      }
    }
    return results.length >= 4;
  }

  horizontalCheck(pos) {
    let [row, col] = pos;
    let fullRow = this.grid[row];
    for(let i = 0; i < fullRow.length; i++) {
      if(i + 4 > fullRow.length) return false;
      let slice = fullRow.slice(i, i + 4);
      if(slice.every(el => !!el && el === slice[0])) return true;
    }
    return false;
  }

  verticalCheck(pos) {
    let [row, col] = pos;
    if(row + 3 >= this.height) return false;
    for(let i = row; i < row + 4; i++) {
      if(this.grid[i][col] !== this.grid[row][col]) {
        return false;
      }
    }
    return true;
  }
}
