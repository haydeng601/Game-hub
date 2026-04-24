class Card {
    constructor(suit, rank, faceUp = false) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = faceUp;
        this.id = `${suit}-${rank}`;
    }

    get color() {
        return (this.suit === 'hearts' || this.suit === 'diamonds') ? 'red' : 'black';
    }

    get value() {
        const rankValues = {
            'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, 
            '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 
            'J': 11, 'Q': 12, 'K': 13
        };
        return rankValues[this.rank];
    }

    canPlaceOn(otherCard) {
        if (!otherCard) return this.rank === 'K';
        return (this.color !== otherCard.color && this.value === otherCard.value - 1);
    }

    canPlaceOnFoundation(otherCard) {
        if (!otherCard) return this.rank === 'A';
        return (this.suit === otherCard.suit && this.value === otherCard.value + 1);
    }
}

class SolitaireGame {
    constructor() {
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.deck = new CustomArray();
        this.stock = new Queue();
        this.waste = new CustomArray();
        this.foundations = new CustomArray();
        this.tableau = new CustomArray();
        
        this.history = new HistoryLinkedList();
        this.score = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.elapsedTime = 0;
        this.stockCycle = 0;
        
        this.initializeGame();
    }

    initializeGame() {
        this.deck = new CustomArray();
        this.stock = new Queue();
        this.waste = new CustomArray();
        this.foundations = new CustomArray();
        this.tableau = new CustomArray();
        this.history.clear();
        this.score = 0;
        this.stockCycle = 0;
        
        for (let i = 0; i < 4; i++) {
            this.foundations.push(new Stack());
        }
        
        for (let i = 0; i < 7; i++) {
            this.tableau.push(new CustomArray());
        }
        
        this.createDeck();
        this.shuffleDeck();
        this.dealCards();
        this.addToStock();
        
        // Save initial state
        this.saveGameState('initial');
        
        this.updateUI();
    }

    createDeck() {
        for (let i = 0; i < this.suits.length; i++) {
            for (let j = 0; j < this.ranks.length; j++) {
                this.deck.push(new Card(this.suits[i], this.ranks[j]));
            }
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.deck.get(i);
            this.deck.set(i, this.deck.get(j));
            this.deck.set(j, temp);
        }
    }

    dealCards() {
        let cardIndex = 0;
        
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.deck.get(cardIndex);
                card.faceUp = (row === col);
                this.tableau.get(col).push(card);
                cardIndex++;
            }
        }
        
        this.deck = this.deck.slice(cardIndex);
    }

    addToStock() {
        for (let i = 0; i < this.deck.length; i++) {
            this.stock.enqueue(this.deck.get(i));
        }
        this.deck = new CustomArray();
    }

    drawCards() {
        if (this.stock.isEmpty()) {
            if (this.waste.length > 0) {
                return this.resetStockFromWaste();
            } else {
                this.showMessage("No more cards to draw!");
                return false;
            }
        }
        
        this.saveGameState('draw_cards');
        
        const drawCount = Math.min(3, this.stock.size());
        
        for (let i = 0; i < drawCount; i++) {
            const card = this.stock.dequeue();
            card.faceUp = true;
            this.waste.push(card);
        }
        
        this.updateScore('draw');
        this.updateUI();
        return true;
    }

    resetStockFromWaste() {
        if (this.waste.length === 0) return false;
        
        this.saveGameState('reset_stock');
        
        const allWasteCards = this.waste.slice();
        this.waste = new CustomArray();
        
        for (let i = 0; i < allWasteCards.length; i++) {
            const card = allWasteCards.get(i);
            card.faceUp = false;
            this.stock.enqueue(card);
        }
        
        this.stockCycle++;
        this.updateUI();
        return true;
    }

    saveGameState(action) {
        const state = {
            action: action,
            score: this.score,
            waste: this.serializeArray(this.waste),
            stock: this.serializeQueue(this.stock),
            foundations: this.serializeFoundations(),
            tableau: this.serializeTableau(),
            stockCycle: this.stockCycle,
            timestamp: Date.now()
        };
        
        this.history.push(state);
        this.updateUndoRedoButtons();
    }

    serializeArray(array) {
        const serialized = [];
        for (let i = 0; i < array.length; i++) {
            const card = array.get(i);
            serialized.push({
                suit: card.suit,
                rank: card.rank,
                faceUp: card.faceUp,
                id: card.id
            });
        }
        return serialized;
    }

    serializeQueue(queue) {
        const serialized = [];
        const array = queue.toArray();
        for (let i = 0; i < array.length; i++) {
            const card = array[i];
            serialized.push({
                suit: card.suit,
                rank: card.rank,
                faceUp: card.faceUp,
                id: card.id
            });
        }
        return serialized;
    }

    serializeFoundations() {
        const serialized = [];
        for (let i = 0; i < this.foundations.length; i++) {
            const foundation = this.foundations.get(i);
            const foundationArray = foundation.toArray();
            const serializedFoundation = [];
            for (let j = 0; j < foundationArray.length; j++) {
                const card = foundationArray[j];
                serializedFoundation.push({
                    suit: card.suit,
                    rank: card.rank,
                    faceUp: card.faceUp,
                    id: card.id
                });
            }
            serialized.push(serializedFoundation);
        }
        return serialized;
    }

    serializeTableau() {
        const serialized = [];
        for (let i = 0; i < this.tableau.length; i++) {
            const tableauPile = this.tableau.get(i);
            const serializedPile = [];
            for (let j = 0; j < tableauPile.length; j++) {
                const card = tableauPile.get(j);
                serializedPile.push({
                    suit: card.suit,
                    rank: card.rank,
                    faceUp: card.faceUp,
                    id: card.id
                });
            }
            serialized.push(serializedPile);
        }
        return serialized;
    }

    deserializeArray(serialized) {
        const array = new CustomArray();
        for (let i = 0; i < serialized.length; i++) {
            const cardData = serialized[i];
            const card = new Card(cardData.suit, cardData.rank, cardData.faceUp);
            array.push(card);
        }
        return array;
    }

    deserializeQueue(serialized) {
        const queue = new Queue();
        for (let i = 0; i < serialized.length; i++) {
            const cardData = serialized[i];
            const card = new Card(cardData.suit, cardData.rank, cardData.faceUp);
            queue.enqueue(card);
        }
        return queue;
    }

    deserializeFoundations(serialized) {
        const foundations = new CustomArray();
        for (let i = 0; i < serialized.length; i++) {
            const serializedFoundation = serialized[i];
            const foundation = new Stack();
            for (let j = 0; j < serializedFoundation.length; j++) {
                const cardData = serializedFoundation[j];
                const card = new Card(cardData.suit, cardData.rank, cardData.faceUp);
                foundation.push(card);
            }
            foundations.push(foundation);
        }
        return foundations;
    }

    deserializeTableau(serialized) {
        const tableau = new CustomArray();
        for (let i = 0; i < serialized.length; i++) {
            const serializedPile = serialized[i];
            const pile = new CustomArray();
            for (let j = 0; j < serializedPile.length; j++) {
                const cardData = serializedPile[j];
                const card = new Card(cardData.suit, cardData.rank, cardData.faceUp);
                pile.push(card);
            }
            tableau.push(pile);
        }
        return tableau;
    }

    undo() {
        if (!this.history.canUndo()) {
            this.showMessage("No moves to undo");
            return false;
        }
        
        const previousState = this.history.undo();
        if (previousState) {
            this.restoreState(previousState);
            return true;
        }
        return false;
    }

    redo() {
        if (!this.history.canRedo()) {
            this.showMessage("No moves to redo");
            return false;
        }
        
        const nextState = this.history.redo();
        if (nextState) {
            this.restoreState(nextState);
            return true;
        }
        return false;
    }

    restoreState(state) {
        this.score = state.score;
        this.waste = this.deserializeArray(state.waste);
        this.stock = this.deserializeQueue(state.stock);
        this.foundations = this.deserializeFoundations(state.foundations);
        this.tableau = this.deserializeTableau(state.tableau);
        this.stockCycle = state.stockCycle;
        
        this.updateUndoRedoButtons();
        this.updateUI();
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo');
        const redoBtn = document.getElementById('redo');
        
        if (undoBtn) undoBtn.disabled = !this.history.canUndo();
        if (redoBtn) redoBtn.disabled = !this.history.canRedo();
    }

    canMoveCard(card, targetPile, isFoundation = false) {
        if (!card || !card.faceUp) return false;
        
        if (isFoundation) {
            const topCard = targetPile.isEmpty() ? null : targetPile.peek();
            return card.canPlaceOnFoundation(topCard);
        } else {
            if (targetPile.length === 0) {
                return card.rank === 'K';
            } else {
                const topCard = targetPile.get(targetPile.length - 1);
                return card.canPlaceOn(topCard);
            }
        }
    }

    moveCard(cardId, targetPileId, isFoundation = false) {
        const source = this.findCardSource(cardId);
        if (!source) return false;
        
        const card = source.card;
        const sourcePile = source.pile;
        const sourcePileId = source.pileId;
        
        let targetPile;
        if (isFoundation) {
            const foundationIndex = parseInt(targetPileId.split('-')[1]);
            targetPile = this.foundations.get(foundationIndex);
        } else {
            const tableauIndex = parseInt(targetPileId.split('-')[1]);
            targetPile = this.tableau.get(tableauIndex);
        }
        
        if (!this.canMoveCard(card, targetPile, isFoundation)) {
            return false;
        }
        
        let success = false;
        let cardsMoved = new CustomArray();
        
        if (sourcePileId.startsWith('tableau')) {
            const tableauIndex = parseInt(sourcePileId.split('-')[1]);
            const tableauPile = this.tableau.get(tableauIndex);
            
            let startIndex = -1;
            for (let i = 0; i < tableauPile.length; i++) {
                if (tableauPile.get(i).id === cardId) {
                    startIndex = i;
                    break;
                }
            }
            
            if (startIndex === -1) return false;
            
            for (let i = startIndex; i < tableauPile.length; i++) {
                cardsMoved.push(tableauPile.get(i));
            }
            
            const remainingCards = tableauPile.slice(0, startIndex);
            this.tableau.set(tableauIndex, remainingCards);
            
            for (let i = 0; i < cardsMoved.length; i++) {
                targetPile.push(cardsMoved.get(i));
            }
            
            success = true;
            
            if (remainingCards.length > 0) {
                const topCard = remainingCards.get(remainingCards.length - 1);
                if (!topCard.faceUp) {
                    topCard.faceUp = true;
                    this.updateScore('flip');
                }
            }
            
        } else if (sourcePileId === 'waste') {
            const wasteIndex = this.findCardIndexInWaste(cardId);
            if (wasteIndex !== -1) {
                const newWaste = new CustomArray();
                for (let i = 0; i < this.waste.length; i++) {
                    if (i !== wasteIndex) {
                        newWaste.push(this.waste.get(i));
                    }
                }
                cardsMoved.push(card);
                this.waste = newWaste;
                targetPile.push(card);
                success = true;
            }
        } else if (sourcePileId.startsWith('foundation')) {
            const foundationIndex = parseInt(sourcePileId.split('-')[1]);
            const foundationPile = this.foundations.get(foundationIndex);
            
            if (!foundationPile.isEmpty() && foundationPile.peek().id === cardId) {
                const movedCard = foundationPile.pop();
                cardsMoved.push(movedCard);
                targetPile.push(movedCard);
                success = true;
            }
        }
        
        if (success) {
            this.saveGameState('move_card');
            this.updateScore('move', isFoundation);
            
            if (this.checkWin()) {
                this.showWinCelebration();
            }
            
            this.updateUI();
        }
        
        return success;
    }

    autoMoveToFoundation(cardId) {
        const source = this.findCardSource(cardId);
        if (!source) return false;
        
        const card = source.card;
        for (let i = 0; i < this.foundations.length; i++) {
            const foundation = this.foundations.get(i);
            if (this.canMoveCard(card, foundation, true)) {
                // Save state before auto-moving
                this.saveGameState('auto_move_foundation');
                const success = this.moveCardWithoutSave(cardId, `foundation-${i}`, true);
                if (success) {
                    this.updateScore('move', true);
                    if (this.checkWin()) {
                        this.showWinCelebration();
                    }
                    this.updateUI();
                }
                return success;
            }
        }
        return false;
    }

    moveCardWithoutSave(cardId, targetPileId, isFoundation = false) {
        const source = this.findCardSource(cardId);
        if (!source) return false;
        
        const card = source.card;
        const sourcePile = source.pile;
        const sourcePileId = source.pileId;
        
        let targetPile;
        if (isFoundation) {
            const foundationIndex = parseInt(targetPileId.split('-')[1]);
            targetPile = this.foundations.get(foundationIndex);
        } else {
            const tableauIndex = parseInt(targetPileId.split('-')[1]);
            targetPile = this.tableau.get(tableauIndex);
        }
        
        if (!this.canMoveCard(card, targetPile, isFoundation)) {
            return false;
        }
        
        let success = false;
        
        if (sourcePileId.startsWith('tableau')) {
            const tableauIndex = parseInt(sourcePileId.split('-')[1]);
            const tableauPile = this.tableau.get(tableauIndex);
            
            let startIndex = -1;
            for (let i = 0; i < tableauPile.length; i++) {
                if (tableauPile.get(i).id === cardId) {
                    startIndex = i;
                    break;
                }
            }
            
            if (startIndex === -1) return false;
            
            const cardsToMove = tableauPile.slice(startIndex);
            const remainingCards = tableauPile.slice(0, startIndex);
            this.tableau.set(tableauIndex, remainingCards);
            
            for (let i = 0; i < cardsToMove.length; i++) {
                targetPile.push(cardsToMove.get(i));
            }
            
            success = true;
            
            if (remainingCards.length > 0) {
                const topCard = remainingCards.get(remainingCards.length - 1);
                if (!topCard.faceUp) {
                    topCard.faceUp = true;
                }
            }
            
        } else if (sourcePileId === 'waste') {
            const wasteIndex = this.findCardIndexInWaste(cardId);
            if (wasteIndex !== -1) {
                const newWaste = new CustomArray();
                for (let i = 0; i < this.waste.length; i++) {
                    if (i !== wasteIndex) {
                        newWaste.push(this.waste.get(i));
                    }
                }
                this.waste = newWaste;
                targetPile.push(card);
                success = true;
            }
        } else if (sourcePileId.startsWith('foundation')) {
            const foundationIndex = parseInt(sourcePileId.split('-')[1]);
            const foundationPile = this.foundations.get(foundationIndex);
            
            if (!foundationPile.isEmpty() && foundationPile.peek().id === cardId) {
                const movedCard = foundationPile.pop();
                targetPile.push(movedCard);
                success = true;
            }
        }
        
        return success;
    }

    findCardIndexInWaste(cardId) {
        for (let i = 0; i < this.waste.length; i++) {
            if (this.waste.get(i).id === cardId) return i;
        }
        return -1;
    }

    findCardSource(cardId) {
        // Check waste
        for (let i = 0; i < this.waste.length; i++) {
            const card = this.waste.get(i);
            if (card.id === cardId) {
                return {
                    card: card,
                    pile: this.waste,
                    pileId: 'waste',
                    index: i
                };
            }
        }
        
        // Check foundations
        for (let i = 0; i < this.foundations.length; i++) {
            const foundation = this.foundations.get(i);
            if (!foundation.isEmpty() && foundation.peek().id === cardId) {
                return {
                    card: foundation.peek(),
                    pile: foundation,
                    pileId: `foundation-${i}`,
                    index: 0
                };
            }
        }
        
        // Check tableau
        for (let i = 0; i < this.tableau.length; i++) {
            const tableauPile = this.tableau.get(i);
            for (let j = 0; j < tableauPile.length; j++) {
                const card = tableauPile.get(j);
                if (card.id === cardId && card.faceUp) {
                    return {
                        card: card,
                        pile: tableauPile,
                        pileId: `tableau-${i}`,
                        index: j
                    };
                }
            }
        }
        
        return null;
    }

    updateScore(action, isFoundation = false) {
        switch (action) {
            case 'move':
                this.score += isFoundation ? 15 : 5;
                break;
            case 'draw':
                this.score = Math.max(0, this.score - 2);
                break;
            case 'flip':
                this.score += 5;
                break;
        }
    }

    checkWin() {
        for (let i = 0; i < this.foundations.length; i++) {
            const foundation = this.foundations.get(i);
            if (foundation.isEmpty() || foundation.size() !== 13) {
                return false;
            }
        }
        return true;
    }

    startTimer() {
        this.startTime = Date.now() - this.elapsedTime * 1000;
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateUI();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.elapsedTime = 0;
        this.updateUI();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    showMessage(message) {
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 2000);
        }
    }

    showWinCelebration() {
        this.stopTimer();
        const winEl = document.getElementById('win-screen');
        const finalScore = document.getElementById('final-score');
        const finalTime = document.getElementById('final-time');
        
        if (finalScore) finalScore.textContent = this.score;
        if (finalTime) finalTime.textContent = this.formatTime(this.elapsedTime);
        
        if (winEl) winEl.classList.remove('hidden');
    }

    getHint() {
        // Get only visible waste cards (last 3)
        const visibleWasteCount = Math.min(this.waste.length, 3);
        const visibleWasteStart = Math.max(0, this.waste.length - 3);
        
        // Check visible waste cards first
        for (let i = visibleWasteStart; i < this.waste.length; i++) {
            const card = this.waste.get(i);
            
            // Check if visible waste card can go to foundation
            for (let j = 0; j < this.foundations.length; j++) {
                const foundation = this.foundations.get(j);
                if (this.canMoveCard(card, foundation, true)) {
                    this.showMessage(`Move ${card.rank}${this.getSuitSymbol(card.suit)} from waste to foundation`);
                    return;
                }
            }
            
            // Check if visible waste card can go to tableau
            for (let j = 0; j < this.tableau.length; j++) {
                const targetPile = this.tableau.get(j);
                if (this.canMoveCard(card, targetPile, false)) {
                    this.showMessage(`Move ${card.rank}${this.getSuitSymbol(card.suit)} from waste to tableau ${j + 1}`);
                    return;
                }
            }
        }
        
        // Check tableau cards for foundation moves (only top face-up cards)
        for (let i = 0; i < this.tableau.length; i++) {
            const tableauPile = this.tableau.get(i);
            if (tableauPile.length > 0) {
                // Find the top face-up card in this tableau pile
                let topFaceUpCard = null;
                for (let j = tableauPile.length - 1; j >= 0; j--) {
                    const card = tableauPile.get(j);
                    if (card.faceUp) {
                        topFaceUpCard = card;
                        break;
                    }
                }
                
                if (topFaceUpCard) {
                    // Check if top face-up card can go to foundation
                    for (let j = 0; j < this.foundations.length; j++) {
                        const foundation = this.foundations.get(j);
                        if (this.canMoveCard(topFaceUpCard, foundation, true)) {
                            this.showMessage(`Move ${topFaceUpCard.rank}${this.getSuitSymbol(topFaceUpCard.suit)} from tableau ${i + 1} to foundation`);
                            return;
                        }
                    }
                }
            }
        }
        
        // Check for tableau to tableau moves (only top face-up cards)
        for (let i = 0; i < this.tableau.length; i++) {
            const sourcePile = this.tableau.get(i);
            if (sourcePile.length > 0) {
                // Find the top face-up card in source pile
                let sourceTopCard = null;
                for (let j = sourcePile.length - 1; j >= 0; j--) {
                    const card = sourcePile.get(j);
                    if (card.faceUp) {
                        sourceTopCard = card;
                        break;
                    }
                }
                
                if (sourceTopCard) {
                    for (let j = 0; j < this.tableau.length; j++) {
                        if (i !== j) {
                            const targetPile = this.tableau.get(j);
                            if (this.canMoveCard(sourceTopCard, targetPile, false)) {
                                this.showMessage(`Move ${sourceTopCard.rank}${this.getSuitSymbol(sourceTopCard.suit)} from tableau ${i + 1} to tableau ${j + 1}`);
                                return;
                            }
                        }
                    }
                }
            }
        }
        
        // Suggest drawing cards if possible (but don't analyze stock cards)
        if (!this.stock.isEmpty() || (this.stock.isEmpty() && this.waste.length > 0)) {
            this.showMessage("Try drawing cards from stock");
            return;
        }
        
        this.showMessage("No moves available");
    }

    getSuitSymbol(suit) {
        switch (suit) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return '';
        }
    }

    updateUI() {
        const scoreValue = document.getElementById('score-value');
        const timeValue = document.getElementById('time-value');
        
        if (scoreValue) scoreValue.textContent = this.score;
        if (timeValue) timeValue.textContent = this.formatTime(this.elapsedTime);
        
        this.renderGame();
    }

    renderGame() {
        this.clearPiles();
        this.renderStock();
        this.renderWaste();
        this.renderFoundations();
        this.renderTableau();
    }

    clearPiles() {
        document.querySelectorAll('.pile').forEach(pile => {
            pile.innerHTML = '';
            pile.classList.remove('empty', 'valid-drop');
        });
    }

    renderStock() {
        const stockEl = document.getElementById('stock');
        if (!stockEl) return;
        
        if (this.stock.isEmpty()) {
            stockEl.classList.add('empty');
        } else {
            const cardEl = this.createCardElement(null, true);
            stockEl.appendChild(cardEl);
        }
    }

    renderWaste() {
        const wasteEl = document.getElementById('waste');
        if (!wasteEl) return;
        
        const visibleCards = Math.min(this.waste.length, 3);
        const startIndex = Math.max(0, this.waste.length - 3);
        
        for (let i = startIndex; i < this.waste.length; i++) {
            const card = this.waste.get(i);
            const cardEl = this.createCardElement(card);
            const displayIndex = i - startIndex;
            cardEl.style.left = `${displayIndex * 18}px`;
            cardEl.style.zIndex = displayIndex;
            wasteEl.appendChild(cardEl);
        }
    }

    renderFoundations() {
        for (let i = 0; i < this.foundations.length; i++) {
            const foundationEl = document.getElementById(`foundation-${i}`);
            if (!foundationEl) continue;
            
            const foundation = this.foundations.get(i);
            const foundationArray = foundation.toArray();
            
            if (foundationArray.length === 0) {
                foundationEl.classList.add('empty');
            } else {
                const topCard = foundationArray[foundationArray.length - 1];
                const cardEl = this.createCardElement(topCard);
                foundationEl.appendChild(cardEl);
            }
        }
    }

    renderTableau() {
        for (let i = 0; i < this.tableau.length; i++) {
            const tableauEl = document.getElementById(`tableau-${i}`);
            if (!tableauEl) continue;
            
            const tableauPile = this.tableau.get(i);
            
            if (tableauPile.length === 0) {
                tableauEl.classList.add('empty');
            }
            
            for (let j = 0; j < tableauPile.length; j++) {
                const card = tableauPile.get(j);
                const cardEl = this.createCardElement(card);
                cardEl.classList.add('tableau-card');
                cardEl.style.top = `${j * 16}px`;
                
                if (!card.faceUp) {
                    cardEl.classList.add('face-down');
                    cardEl.setAttribute('draggable', 'false');
                }
                
                tableauEl.appendChild(cardEl);
            }
        }
    }

    createCardElement(card, isBack = false) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        
        if (isBack) {
            cardEl.classList.add('back-card');
            cardEl.setAttribute('data-card-id', 'back');
        } else {
            cardEl.classList.add(card.color);
            cardEl.setAttribute('data-card-id', card.id);
            
            const suitSymbol = this.getSuitSymbol(card.suit);
            cardEl.innerHTML = `
                <div class="top">
                    <div>${card.rank}</div>
                    <div>${suitSymbol}</div>
                </div>
                <div class="center">${suitSymbol}</div>
                <div class="bottom">
                    <div>${card.rank}</div>
                    <div>${suitSymbol}</div>
                </div>
            `;
            
            if (card.faceUp) {
                this.addDragEvents(cardEl);
            }
        }
        
        return cardEl;
    }

    addDragEvents(cardEl) {
        cardEl.setAttribute('draggable', 'true');
        
        cardEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', cardEl.getAttribute('data-card-id'));
            cardEl.classList.add('dragging');
        });
        
        cardEl.addEventListener('dragend', () => {
            cardEl.classList.remove('dragging');
            document.querySelectorAll('.valid-drop').forEach(el => {
                el.classList.remove('valid-drop');
            });
        });
    }

    setupDropZones() {
        const tableauPiles = document.querySelectorAll('.tableau-pile');
        const foundationPiles = document.querySelectorAll('.foundation');
        
        const handleDragOver = (e) => {
            e.preventDefault();
            e.currentTarget.classList.add('valid-drop');
        };
        
        const handleDragLeave = (e) => {
            e.currentTarget.classList.remove('valid-drop');
        };
        
        const handleDrop = (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('valid-drop');
            
            const cardId = e.dataTransfer.getData('text/plain');
            const isFoundation = e.currentTarget.classList.contains('foundation');
            
            if (cardId && cardId !== 'back') {
                this.moveCard(cardId, e.currentTarget.id, isFoundation);
            }
        };
        
        tableauPiles.forEach(pile => {
            pile.addEventListener('dragover', handleDragOver);
            pile.addEventListener('dragleave', handleDragLeave);
            pile.addEventListener('drop', handleDrop);
        });
        
        foundationPiles.forEach(pile => {
            pile.addEventListener('dragover', handleDragOver);
            pile.addEventListener('dragleave', handleDragLeave);
            pile.addEventListener('drop', handleDrop);
        });
    }

    setupEventListeners() {
        const newGameBtn = document.getElementById('new-game');
        const undoBtn = document.getElementById('undo');
        const redoBtn = document.getElementById('redo');
        const hintBtn = document.getElementById('hint');
        const playAgainBtn = document.getElementById('play-again');
        const stockBtn = document.getElementById('stock');
        
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.initializeGame();
                this.resetTimer();
                this.startTimer();
            });
        }
        
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undo();
            });
        }
        
        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                this.redo();
            });
        }
        
        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                this.getHint();
            });
        }
        
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                const winScreen = document.getElementById('win-screen');
                if (winScreen) winScreen.classList.add('hidden');
                this.initializeGame();
                this.resetTimer();
                this.startTimer();
            });
        }
        
        if (stockBtn) {
            stockBtn.addEventListener('click', () => {
                this.drawCards();
            });
        }
        
        document.addEventListener('dblclick', (e) => {
            const cardEl = e.target.closest('.card');
            if (cardEl && !cardEl.classList.contains('back-card') && !cardEl.classList.contains('face-down')) {
                const cardId = cardEl.getAttribute('data-card-id');
                this.autoMoveToFoundation(cardId);
            }
        });
        
        this.setupDropZones();
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const game = new SolitaireGame();
    game.setupEventListeners();
    game.startTimer();
});