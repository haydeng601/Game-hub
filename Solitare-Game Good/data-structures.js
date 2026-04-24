class CustomArray {
    constructor() {
        this.elements = [];
    }

    push(element) {
        this.elements.push(element);
    }

    pop() {
        return this.elements.pop();
    }

    get(index) {
        return this.elements[index];
    }

    set(index, value) {
        this.elements[index] = value;
    }

    slice(start, end) {
        const newArray = new CustomArray();
        const sliced = this.elements.slice(start, end);
        sliced.forEach(element => newArray.push(element));
        return newArray;
    }

    get length() {
        return this.elements.length;
    }

    forEach(callback) {
        this.elements.forEach(callback);
    }

    toArray() {
        return [...this.elements];
    }
}

// Stack Implementation
class Stack {
    constructor() {
        this.items = [];
    }

    push(element) {
        this.items.push(element);
    }

    pop() {
        if (this.isEmpty()) return null;
        return this.items.pop();
    }

    peek() {
        if (this.isEmpty()) return null;
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    toArray() {
        return [...this.items];
    }
}

// Queue Implementation
class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(element) {
        this.items.push(element);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift();
    }

    front() {
        if (this.isEmpty()) return null;
        return this.items[0];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    toArray() {
        return [...this.items];
    }
}

// Linked List Node for History
class HistoryNode {
    constructor(state, prev = null, next = null) {
        this.state = state;
        this.prev = prev;
        this.next = next;
    }
}

// Linked List for History Management
class HistoryLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.size = 0;
    }

    // Add new state to history
    push(state) {
        const newNode = new HistoryNode(state);
        
        // If list is empty
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
            this.current = newNode;
        } else {
            // If we're in the middle of history, remove future states
            if (this.current && this.current.next) {
                let nodeToRemove = this.current.next;
                while (nodeToRemove) {
                    const nextNode = nodeToRemove.next;
                    nodeToRemove.prev = null;
                    nodeToRemove.next = null;
                    nodeToRemove = nextNode;
                }
                this.current.next = null;
                this.tail = this.current;
            }
            
            // Add new node after current
            newNode.prev = this.current;
            if (this.current) {
                this.current.next = newNode;
            }
            this.tail = newNode;
            this.current = newNode;
        }
        
        this.size++;
        
        // Limit history size to prevent memory issues
        if (this.size > 100) {
            this.removeOldest();
        }
    }

    // Move backward (undo)
    undo() {
        if (!this.canUndo()) {
            return null;
        }
        const state = this.current.state;
        this.current = this.current.prev;
        return state;
    }

    // Move forward (redo)
    redo() {
        if (!this.canRedo()) {
            return null;
        }
        this.current = this.current.next;
        return this.current.state;
    }

    // Check if undo is available
    canUndo() {
        return this.current && this.current.prev !== null;
    }

    // Check if redo is available
    canRedo() {
        return this.current && this.current.next !== null;
    }

    // Remove oldest state
    removeOldest() {
        if (!this.head) return;
        
        this.head = this.head.next;
        if (this.head) {
            this.head.prev = null;
        } else {
            this.tail = null;
            this.current = null;
        }
        this.size--;
    }

    // Clear history
    clear() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.size = 0;
    }
}
