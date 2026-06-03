const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

const rows = 25;
const cols = 25;
const cellSize = 25;

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let grid = [];

class Node{
    constructor(row,col){
        this.row = row;
        this.col = col;

        this.g = Infinity;
        this.h = 0;
        this.f = Infinity;

        this.wall = false;
        this.parent = null;
    }
}

function initializeGrid(){

    grid = [];

    for(let r=0;r<rows;r++){

        let currentRow = [];

        for(let c=0;c<cols;c++){

            let node = new Node(r,c);

            if(Math.random() < 0.3){
                node.wall = true;
            }

            currentRow.push(node);
        }

        grid.push(currentRow);
    }

    grid[0][0].wall = false;
    grid[rows-1][cols-1].wall = false;

    drawGrid();
}

function drawGrid(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(let r=0;r<rows;r++){

        for(let c=0;c<cols;c++){

            const node = grid[r][c];

            if(node.wall){
                ctx.fillStyle = "#ff4d4d";
            }else{
                ctx.fillStyle = "#21262d";
            }

            ctx.fillRect(
                c*cellSize,
                r*cellSize,
                cellSize,
                cellSize
            );

            ctx.strokeStyle = "#30363d";
            ctx.strokeRect(
                c*cellSize,
                r*cellSize,
                cellSize,
                cellSize
            );
        }
    }

    drawStartGoal();
}

function drawStartGoal(){

    ctx.fillStyle = "#00ff88";

    ctx.fillRect(
        0,
        0,
        cellSize,
        cellSize
    );

    ctx.fillStyle = "#ffd700";

    ctx.fillRect(
        (cols-1)*cellSize,
        (rows-1)*cellSize,
        cellSize,
        cellSize
    );
}

function heuristic(a,b){

    return Math.abs(a.row-b.row)
         + Math.abs(a.col-b.col);
}

function getNeighbors(node){

    const neighbors = [];

    const dirs = [
        [-1,0],
        [1,0],
        [0,-1],
        [0,1]
    ];

    for(const [dr,dc] of dirs){

        const nr = node.row + dr;
        const nc = node.col + dc;

        if(
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols
        ){
            neighbors.push(grid[nr][nc]);
        }
    }

    return neighbors;
}

async function solveAStar(){

    let start = grid[0][0];
    let goal = grid[rows-1][cols-1];

    let openSet = [];

    start.g = 0;
    start.h = heuristic(start,goal);
    start.f = start.h;

    openSet.push(start);

    while(openSet.length > 0){

        let current = openSet[0];

        for(const node of openSet){
            if(node.f < current.f){
                current = node;
            }
        }

        if(current === goal){

            let temp = goal;

            while(temp.parent){

                ctx.fillStyle = "#00ffff";

                ctx.fillRect(
                    temp.col*cellSize,
                    temp.row*cellSize,
                    cellSize,
                    cellSize
                );

                temp = temp.parent;

                await sleep(20);
            }

            drawStartGoal();
            return;
        }

        openSet = openSet.filter(n => n !== current);

        ctx.fillStyle = "#8b5cf6";

        ctx.fillRect(
            current.col*cellSize,
            current.row*cellSize,
            cellSize,
            cellSize
        );

        const neighbors = getNeighbors(current);

        for(const neighbor of neighbors){

            if(neighbor.wall){
                continue;
            }

            let tentativeG = current.g + 1;

            if(tentativeG < neighbor.g){

                neighbor.parent = current;
                neighbor.g = tentativeG;
                neighbor.h = heuristic(neighbor,goal);
                neighbor.f = neighbor.g + neighbor.h;

                if(!openSet.includes(neighbor)){
                    openSet.push(neighbor);

                    ctx.fillStyle = "#3fb950";

                    ctx.fillRect(
                        neighbor.col*cellSize,
                        neighbor.row*cellSize,
                        cellSize,
                        cellSize
                    );
                }
            }
        }

        drawStartGoal();

        await sleep(15);
    }

    alert("No Path Found!");
}

function sleep(ms){
    return new Promise(resolve =>
        setTimeout(resolve,ms)
    );
}

document
.getElementById("generateMaze")
.addEventListener("click",initializeGrid);

document
.getElementById("solveMaze")
.addEventListener("click",solveAStar);

document
.getElementById("clearMaze")
.addEventListener("click",initializeGrid);

initializeGrid();