export default class AStar{
    constructor(graph, diagonal=false) {
        this.graph = graph
        this.diagonal = diagonal
    }
    search(start, end) {
        this.clean()
        const heap = new BinaryHeap(node=>(node.f))
        heap.push(start)
        while(heap.size()>0) {
            const currentNode = heap.pop()
            if(currentNode === end) {
                let curr = currentNode
                const ret = []
                while(curr.parent) {
                    ret.push(curr)
                    curr = curr.parent
                }
                return ret.reverse()
            }
            currentNode.closed = true

            const neighbors = this.neighbors(currentNode)
            for(const e of neighbors) {
                if(e.closed || e.idWall()) continue
                const g = currentNode.g + e.cost
                if(!e.visited || g<e.g) {
                    e.visited = true
                    e.parent = currentNode
                    e.h = this.heuristic(e, end)
                    e.g = g
                    e.f = e.g + e.h

                    if(!e.visited) {
                        heap.push(e)
                    }else {
                        heap.rescoreElement(e)
                    }
                }
            }
        }
        return []
    }
    clean() {
        for(let i=0,l=this.graph.length; i<l; i++) {
            for(let j=0,k=this.graph[i].length; j<k; j++) {
                this.graph[i][j].f = 0
                this.graph[i][j].g = 0
                this.graph[i][j].h = 0
                this.graph[i][j].cost = 1.0
                this.graph[i][j].visited = false
                this.graph[i][j].closed = false
                this.graph[i][j].parent = null
            }
        }

    }
    neighbors(node) {
        const result = []
        const i = node.i, j = node.j
        if(this.map[i-1] && this.map[i-1][j]) result.push(this.map[i-1][j])
        if(this.map[i+1] && this.map[i+1][j]) result.push(this.map[i+1][j])
        if(this.map[i] && this.map[i][j-1]) result.push(this.map[i][j-1])
        if(this.map[i] && this.map[i][j+1]) result.push(this.map[i][j+1])

        if(this.diagonal) {
            if(this.map[i-1] && this.map[i-1][j-1]) result.push(this.map[i-1][j-1])
            if(this.map[i+1] && this.map[i+1][j-1]) result.push(this.map[i+1][j-1])
            if(this.map[i-1] && this.map[i-1][j+1]) result.push(this.map[i-1][j+1])
            if(this.map[i+1] && this.map[i+1][j+1]) result.push(this.map[i+1][j+1])
        }
        return result
    }
    heuristic(p1, p2) {
        const d1 = Math.abs(p1.i - p2.i)
        const d2 = Math.abs(p1.j - p2.j)
        return d1 + d2
    }
}



// javascript-astar
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a binary heap.
class BinaryHeap {
    constructor(scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    }
  
    push(element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    }
  
    pop() {
        // Store the first element so we can return it later.
        const result = this.content[0];
        // Get the element at the end of the array.
        const end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
        this.content[0] = end;
        this.bubbleUp(0);
        }
        return result;
    }
  
    remove(node) {
        const i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        const end = this.content.pop();

        if (i !== this.content.length - 1) {
        this.content[i] = end;

        if (this.scoreFunction(end) < this.scoreFunction(node)) {
            this.sinkDown(i);
        } else {
            this.bubbleUp(i);
        }
        }
    }
  
    size() {
        return this.content.length;
    }

    rescoreElement(node) {
        this.sinkDown(this.content.indexOf(node));
    }
  
    sinkDown(n) {
        // Fetch the element that has to be sunk.
        const element = this.content[n];

        // When at 0, an element can not sink any further.
        while(n > 0) {
            // Compute the parent element's index, and fetch it.
            const parentN = ((n + 1) >> 1) - 1;
            const parent = this.content[parentN];

            if(this.scoreFunction(element) < this.scoreFunction(parent)) {
                // Swap the elements if the parent is greater.
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            } else {
                // Found a parent that is less, no need to sink any further.
                break;
            }
        }
    }
  
    bubbleUp(n) {
        // Look up the target element and its score.
        const length = this.content.length,
        element = this.content[n],
        elemScore = this.scoreFunction(element);

        while(true) {
            // Compute the indices of the child elements.
            const child2N = (n + 1) << 1,
                child1N = child2N - 1;
            // This is used to store the new position of the element,
            // if any.
            let swap = null;
            let child1Score;
            // If the first child exists (is inside the array)...
            if(child1N < length) {
                // Look it up and compute its score.
                const child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if(child2N < length) {
                const child2 = this.content[child2N],
                child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if(swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }

            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
  }