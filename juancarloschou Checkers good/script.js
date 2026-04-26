document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-btn');
    const canvas = document.getElementById('gameCanvas');
    const context = canvas.getContext('2d');
    const turnMessage = document.getElementById('turn-message');
	const piecesPlayer1 = document.getElementById('pieces-player1');
	const piecesPlayer2 = document.getElementById('pieces-player2');

    const imagePath = 'img/image.png';
    const pieceSize = 180;
    const squareSize = 75; // Size of each square in the checkerboard
    let redQueen, redPiece, blackPiece, blackQueen;
	let startSnd, moveSnd, eatSnd, queenSnd, gameOverSnd;
	
	// Load sounds
	startSnd = document.getElementById("start");
	moveSnd = document.getElementById("move");
	eatSnd = document.getElementById("eat");
	queenSnd = document.getElementById("queen");
	gameOverSnd = document.getElementById("gameOver");
	
    let currentTurn = 1; // 1 for player 1 (blue), 2 for player 2 (green)
	let gameRunning = false;
	let movement = false;
	let movementDoubleEat = false;
	let posibleMovements = [];
	let originMovement;

    let board = [
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0]
    ];
	
	let boardQueen = [];
	// Initialize boardQueen
	for (let i = 0; i < board.length; i++) {
		boardQueen[i] = [];
		for (let j = 0; j < board[i].length; j++) {
			boardQueen[i][j] = null; // Set initial value to null
		}
	}

	// Update boardQueen based on the pieces in board
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[i].length; j++) {
			if (board[i][j] !== 0) {
				boardQueen[i][j] = false; // no piece is queen
			}
		}
	}

    startButton.addEventListener('click', gameStart);
	canvas.addEventListener('click', clickPiece);
	
	drawGrid();

    function gameStart() {
		playSoundEffectStart();
		if(!gameRunning) {
			// start first time
			gameRunning = true;
			console.log('Game Started!');
			startButton.disabled = true; // Disable the start button
			loadPieces();
			updateMessagesMenu();
		}
		else {
			// restart after game over
			currentTurn = 1; // 1 for player 1 (red), 2 for player 2 (black)
			gameRunning = true;
			movement = false;
			movementDoubleEat = false;
			posibleMovements = [];
			originMovement;

			board = [
				[0, 1, 0, 1, 0, 1, 0, 1],
				[1, 0, 1, 0, 1, 0, 1, 0],
				[0, 1, 0, 1, 0, 1, 0, 1],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[2, 0, 2, 0, 2, 0, 2, 0],
				[0, 2, 0, 2, 0, 2, 0, 2],
				[2, 0, 2, 0, 2, 0, 2, 0]
			];
			
			boardQueen = [];
			// Initialize boardQueen
			for (let i = 0; i < board.length; i++) {
				boardQueen[i] = [];
				for (let j = 0; j < board[i].length; j++) {
					boardQueen[i][j] = null; // Set initial value to null
				}
			}

			// Update boardQueen based on the pieces in board
			for (let i = 0; i < board.length; i++) {
				for (let j = 0; j < board[i].length; j++) {
					if (board[i][j] !== 0) {
						boardQueen[i][j] = false; // no piece is queen
					}
				}
			}
			
			console.log('Game Started!');
			startButton.disabled = true; // Disable the start button
			drawBoard();
			updateMessagesMenu();
		}
    }

    function updateMessagesMenu() {
		if(currentTurn === 1)
		{
			turnMessage.textContent = "Player 1 (Blue), it's your turn";
		}
		else
		{
			turnMessage.textContent = "Player 2 (Green), it's your turn";
		}
		piecesPlayer1.textContent = countPiecesPlayer(1);
		piecesPlayer2.textContent = countPiecesPlayer(2);
    }

    function loadPieces() {
        const image = new Image();
        image.src = imagePath;

        image.onload = () => {
            redQueen = createPieceCanvas(image, 0, 0);
            redPiece = createPieceCanvas(image, pieceSize, 0);
            blackPiece = createPieceCanvas(image, 0, pieceSize);
            blackQueen = createPieceCanvas(image, pieceSize, pieceSize);

            drawBoard();
        };
    }

    function createPieceCanvas(image, sx, sy) {
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = pieceSize;
        pieceCanvas.height = pieceSize;
        const pieceContext = pieceCanvas.getContext('2d');
        pieceContext.drawImage(image, sx, sy, pieceSize, pieceSize, 0, 0, pieceSize, pieceSize);
        return pieceCanvas;
    }

    function drawGrid() {
        const colors = ['darkslategray', 'white']; // Dark slate gray and white

		// Set the style for the border
		context.strokeStyle = 'black'; // Color of the border
		context.lineWidth = 1; // Width of the border
		
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const colorIndex = (row + col) % 2;
                context.fillStyle = colors[colorIndex];
                context.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
                context.strokeRect(col * squareSize, row * squareSize, squareSize, squareSize); // Optional: To draw borders around squares
            }
        }
    }

    function drawBoard() {
        drawGrid();

		// draw pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === 1) {
					if(boardQueen[row][col])
						context.drawImage(redQueen, col * squareSize, row * squareSize, squareSize, squareSize);
					else
						context.drawImage(redPiece, col * squareSize, row * squareSize, squareSize, squareSize);
                } else if (board[row][col] === 2) {
					if(boardQueen[row][col])
						context.drawImage(blackQueen, col * squareSize, row * squareSize, squareSize, squareSize);
					else
						context.drawImage(blackPiece, col * squareSize, row * squareSize, squareSize, squareSize);
                }
            }
        }
    }
	
	function clickPiece(event) {
		// on click on the canvas
		if (gameRunning) {
			const rect = canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			const col = Math.floor(x / squareSize);
			const row = Math.floor(y / squareSize);

			console.log(`Clicked on row: ${row}, column: ${col}`);
				
			if(!movement) {
				// manage if user will move
				if(board[row][col] === currentTurn) {
					managePreviousMovement(row, col); // move or eat
					
				}
				else {
					console.log("no move avaliable");
				}
			}
			else {
				// manage after movement (select where to move)
				
				// the user can change piece to move (not in double eat
				if(!movementDoubleEat && board[row][col] === currentTurn) {
					drawBoard(); //delete blue squares
					managePreviousMovement(row, col); // move or eat
				}
				else {
					// chose possible movement (blue square or green)
					posibleMovements.forEach(element => {
						if(row == element.row && col == element.col)
						{
							if(element.kill)
							{
								// move and eat piece
								movePieceFromTo(originMovement.row, originMovement.col, row, col);
								removePiece(element.killRow, element.killCol);
								console.log("movePieceFromTo and eat");
								playSoundEffectEat();
							}
							else
							{
								// move to destination
								movePieceFromTo(originMovement.row, originMovement.col, row, col);
								console.log("movePieceFromTo");
								playSoundEffectMove();
							}
							
							checkBecomeQueen(row, col); //check and become queen
							
							movement = false;
							movementDoubleEat = false;
							drawBoard();
							
							if(element.kill) {
								// check if I can eat again, if not change turn
								if(checkIfCanMoveOrEat(row, col, true) === "Eat") {
									// show eat movement (green square)
									console.log("possible double kill");
									managePreviousMovement(row, col, true); // only can eat
									movementDoubleEat = true;
								} else {
									changeTurn(); // change the turn, update menu, and check winner/draw
								}
							}
							else {
								changeTurn(); // change the turn, update menu, and check winner/draw
							}
						}
					});
				}
			}
		}
    }
	
	function changeTurn()
	{
		if(currentTurn == 1)
			currentTurn = 2;
		else
			currentTurn = 1;
		updateMessagesMenu(); // if eat, update count pieces, show turn player
		
		checkWinnerDraw();
	}
	
	function checkWinnerDraw()
	{
		// if I cant move or eat any of my pieces (currentTurn player), game over
		canMoveOrEat = false;
		for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
				if(board[row][col] === currentTurn) {
					if(checkIfCanMoveOrEat(row, col) !== "No")
						canMoveOrEat = true;
				}
			}
		}
		
		if(!canMoveOrEat) {
			// in game over, the winner will be the player with more pieces, or draw if are tied
			numberPiecesPlayer1 = countPiecesPlayer(1);
			numberPiecesPlayer2 = countPiecesPlayer(2);
			if(numberPiecesPlayer1 === numberPiecesPlayer2) {
				window.alert("Game Over. It's a draw!");
			} else if(numberPiecesPlayer1 > numberPiecesPlayer2) {
				window.alert("Game Over. Congratulations player 1 (Blue) you won!");
			} else {
				window.alert("Game Over. Congratulations player 2 (Green) you won!");
			}
			startButton.disabled = false; // Enable the start button
			playSoundEffectGameOver();
		}
	}
	
	function checkBecomeQueen(row, col)
	{
		let queen = false;
		if(currentTurn == 1) {
			if(row == 7)
				queen = true;
		}
		else {
			if(row == 0)
				queen = true;
		}
		if(queen && !boardQueen[row][col]) {
			boardQueen[row][col] = true;
			playSoundEffectQueen();
		}
	}
	
	function removePiece(row, col)
	{
		board[row][col] = 0;
	}
	
	function checkIfCanMoveOrEat(row, col, onlyCanEat = false)
	{
		// check if can move or eat
		let canMoveOrEat = "No";
		let possibleRow;
		let result;
		if(boardQueen[row][col]) {
			//queen
			
			// calculate possible movement forward left
			result = checkCalculatePossibleMovementMoveOrEat(row, col, row+1, col-1);
			if(onlyCanEat) {
				if(result === "Eat")
					canMoveOrEat = result;
			} else if(result !== "No")
				canMoveOrEat = result;
			
			// calculate possible movement forward right
			result = checkCalculatePossibleMovementMoveOrEat(row, col, row+1, col+1);
			if(onlyCanEat) {
				if(result === "Eat")
					canMoveOrEat = result;
			} else if(result !== "No")
				canMoveOrEat = result;

			// calculate possible movement back left
			result = checkCalculatePossibleMovementMoveOrEat(row, col, row-1, col-1);
			if(onlyCanEat) {
				if(result === "Eat")
					canMoveOrEat = result;
			} else if(result !== "No")
				canMoveOrEat = result;
			
			// calculate possible movement back right
			result = checkCalculatePossibleMovementMoveOrEat(row, col, row-1, col+1);
			if(onlyCanEat) {
				if(result === "Eat")
					canMoveOrEat = result;
			} else if(result !== "No")
				canMoveOrEat = result;
		}
		else
		{
			// normal piece
			if(currentTurn == 1)
				possibleRow = row+1;
			else
				possibleRow = row-1;
			
			// calculate possible movement forward left
			result = checkCalculatePossibleMovementMoveOrEat(row, col, possibleRow, col-1);
			if(onlyCanEat) {
				if(result === "Eat")
					canMoveOrEat = result;
			} else if(result !== "No")
				canMoveOrEat = result;
			
			// calculate possible movement forward right
			result = checkCalculatePossibleMovementMoveOrEat(row, col, possibleRow, col+1);
			if(onlyCanEat) {
				if(result === "Eat")
					canMoveOrEat = result;
			} else if(result !== "No")
				canMoveOrEat = result;
		}
		return canMoveOrEat;
	}
	
	function checkCalculatePossibleMovementMoveOrEat(row, col, possibleRow, possibleCol)
	{
		if(validMovement(possibleRow, possibleCol)) {
			// check if move
			return "Move";
		}
		else {
			// check if eat
			nextRow = row > possibleRow ? possibleRow-1 : possibleRow+1;
			nextCol = col > possibleCol ? possibleCol-1 : possibleCol+1;
			if(canEat(possibleRow, possibleCol, nextRow, nextCol))
			{
				return "Eat";
			}
		}
		return "No";
	}
	
	function managePreviousMovement(row, col, onlyCanEat = false)
	{
		console.log("the user can move"); 
		movement = false;
		posibleMovements = [];
		let possibleRow;
		if(boardQueen[row][col]) {
			//queen
			
			// calculate possible movement forward left
			calculatePossibleMovement(row, col, row+1, col-1, onlyCanEat);
			
			// calculate possible movement forward right
			calculatePossibleMovement(row, col, row+1, col+1, onlyCanEat);

			// calculate possible movement back left
			calculatePossibleMovement(row, col, row-1, col-1, onlyCanEat);
			
			// calculate possible movement back right
			calculatePossibleMovement(row, col, row-1, col+1, onlyCanEat);
		}
		else
		{
			// normal piece
			if(currentTurn == 1)
				possibleRow = row+1;
			else
				possibleRow = row-1;
			// calculate possible movement forward left
			calculatePossibleMovement(row, col, possibleRow, col-1, onlyCanEat);
			
			// calculate possible movement forward right
			calculatePossibleMovement(row, col, possibleRow, col+1, onlyCanEat);
		}
	}
	
	function calculatePossibleMovement(row, col, possibleRow, possibleCol, onlyCanEat = false)
	{
		// the param onlyCanEat if true, the only possible movement is eat, if false, you can move or eat
		if(!onlyCanEat)
		{
			// check if move
			if(validMovement(possibleRow, possibleCol)) {
				drawPossibleMovement(possibleRow, possibleCol, false);
				movement = true;
				killing = false;
				posibleMovements.push({row:possibleRow, col:possibleCol, kill:false});
				originMovement = {row:row, col:col};
			}
		}
		
		// check if eat
		nextRow = row > possibleRow ? possibleRow-1 : possibleRow+1;
		nextCol = col > possibleCol ? possibleCol-1 : possibleCol+1;
		if(canEat(possibleRow, possibleCol, nextRow, nextCol))
		{
			console.log("can eat");
			drawPossibleMovement(nextRow, nextCol, true);
			movement = true;
			killing = true;
			posibleMovements.push({row:nextRow, col:nextCol, kill:true, killRow: possibleRow, killCol: possibleCol});
			originMovement = {row:row, col:col};
		}
	}
	
	function canEat(row, col, nextRow, nextCol)
	{
		// the first param is possibleMovement, the second the next position if eating
		let result = false;
		if(currentTurn == 1)
			opponent = 2;
		else
			opponent = 1;
		if(checkLimits(row, col)) 
			if(board[row][col] === opponent)
				if(checkLimits(nextRow, nextCol)) 
					if(board[nextRow][nextCol] === 0)
						result = true;
		return result;
	}
	
	function drawPossibleMovement(row, col, kill) {
		const borderWidth = 5; // Width of the border

		// Calculate the coordinates of the square
		const x = col * squareSize;
		const y = row * squareSize;

		// Calculate the size of the rectangle including the border
		const rectWidth = squareSize - borderWidth * 2;
		const rectHeight = squareSize - borderWidth * 2;

		// Set the style for the border
		if (kill)
			context.strokeStyle = 'green'; // Color of the border
		else
			context.strokeStyle = 'blue'; // Color of the border
		context.lineWidth = borderWidth; // Width of the border

		// Draw the border rectangle
		context.strokeRect(x + borderWidth, y + borderWidth, rectWidth, rectHeight);
	}
	
	function validMovement(row, col) {
		let result = false;
		if(checkLimits(row, col))
			if(board[row][col] === 0)
				result = true;
		return result;
	}
	
	function checkLimits(row, col) {
		let result = true;
		if(row >= 8)
			result = false;
		else if(row < 0)
			result = false;
		else if(col >= 8)
			result = false;
		else if(col < 0)
			result = false;
		return result;
	}
	
	function movePieceFromTo(originRow, originCol, destinationRow, destinationCol) {
		//remove piece from origin
		board[originRow][originCol] = 0;
		//put piece to destination
		board[destinationRow][destinationCol] = currentTurn;
		
		// keep queen status
		boardQueen[destinationRow][destinationCol] = boardQueen[originRow][originCol];
		boardQueen[originRow][originCol] = false;
	}
	
	function countPiecesPlayer(player) {
		let count = 0;
		for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
				if(board[row][col] === player)
					count++;
			}
		}
		return count;
	}

	function playSoundEffectStart() {
		// Reset the currentTime to start from the beginning
		startSnd.currentTime = 0;
		
		// Play the sound effect
		startSnd.play();
		
		// Pause the sound effect after 1.5 second
		setTimeout(function() {
			startSnd.pause();
		}, 5500);
	}
	
	function playSoundEffectMove() {
		// Reset the currentTime to start from the beginning
		moveSnd.currentTime = 0;
		
		// Stop the previous timeout if any
		if (moveSnd.timeoutId) {
			clearTimeout(moveSnd.timeoutId);
		}
		
		// Play the sound effect
		moveSnd.play().then(() => {
			// Pause the sound effect after 1 seconds
			moveSnd.timeoutId = setTimeout(function() {
				moveSnd.pause();
			}, 1000);  
		}).catch(error => {
			console.error('Error playing sound:', error);
		});
	}

	
	function playSoundEffectEat() {
		// Reset the currentTime to start from the beginning
		eatSnd.currentTime = 0;
		
		// Stop the previous timeout if any
		if (eatSnd.timeoutId) {
			clearTimeout(eatSnd.timeoutId);
		}
		
		// Play the sound effect
		eatSnd.play().then(() => {
			// Pause the sound effect after 1 seconds
			eatSnd.timeoutId = setTimeout(function() {
				eatSnd.pause();
			}, 1000);  
		}).catch(error => {
			console.error('Error playing sound:', error);
		});
	}

	function playSoundEffectQueen() {
		// Reset the currentTime to start from the beginning
		queenSnd.currentTime = 0;
		
		// Play the sound effect
		queenSnd.play();
		
		// Pause the sound effect after 1.5 second
		setTimeout(function() {
			queenSnd.pause();
		}, 1000);
	}

	function playSoundEffectGameOver() {
		// Reset the currentTime to start from the beginning
		gameOverSnd.currentTime = 0;
		
		// Play the sound effect
		gameOverSnd.play();
		
		// Pause the sound effect after 1.5 second
		setTimeout(function() {
			gameOverSnd.pause();
		}, 3500);
	}

	
});
