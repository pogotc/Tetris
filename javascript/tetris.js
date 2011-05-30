var columns = 10;
var rows = 20;
var spacing = 30;
var canvas = document.getElementById("tetris-canvas");
var score = 12345;
var numLines = 5;
var context = canvas.getContext("2d");
var gameLoopInterval;
var gridBlocks = {};
var columnHeights = {};
var gameState = "IN_PLAY";      //IN_PLAY | ENDED
var newBlock;

//Key States
var leftKeyPressed = false;
var rightKeyPressed = false;
var downKeyPressed = false;
var rotateKeyPressed = false;

function handleKeyDown(evt){
switch(evt.keyCode){
    case 40:
        downKeyPressed = true;
        break;
    case 37:
        leftKeyPressed = true;

        break;
    case 39:
        rightKeyPressed = true;
        break;
    case 13: //Enter
    case 32: //Space
    case 38: //Up
        if(gameState == "ENDED"){
            resetGame();
        }else{
            rotateKeyPressed = true;
        }
        break;
}
}
window.addEventListener('keydown', handleKeyDown, true);

function handleKeyUp(evt){
switch(evt.keyCode){
    case 40:
        downKeyPressed = false;
        break;
    case 37:
        leftKeyPressed = false;
        break;
    case 39:
        rightKeyPressed = false;
        break;
    case 13: //Enter
    case 32: //Space
    case 38: //Up
        rotateKeyPressed = false;
        break;
}
}
//window.addEventListener('keyup', handleKeyUp, true);

function drawGrid()
{
var width = columns * spacing;
var height = rows * spacing;
context.beginPath();
context.clearRect(0, 0, width + 0.5, height + 0.5);

for(var x = 0.5; x <= width + 0.5; x+= spacing)
{
    context.moveTo(x, 0);
    context.lineTo(x, height);
}
for(var y = 0.5; y <= height + 0.5; y+= spacing)
{
    context.moveTo(0, y);
    context.lineTo(width, y);
}

context.strokeStyle = "#eee";
context.stroke();


context.beginPath();
context.strokeStyle = "#333";
for(var idx in gridBlocks){
    var pos = gridBlocks[idx];
    drawBlockAt(pos['x'], pos['y'], pos['colour'], false);
}
context.stroke();
}

function convertGridPos(gridPos)
{
return 0.5 + (gridPos * spacing);
}

function isValidGridPosition(x, y, checkGridBlocks)
{
var inGrid = x < columns && x >= 0 && y < rows && y >= 0;

if(!inGrid){
    return false;
}
if(checkGridBlocks){
    for(var idx in gridBlocks){
        if(gridBlocks[idx]['x'] == x && gridBlocks[idx]['y'] == y){
            return false;
        }
    }
}
return true;
}

function drawBlockAt(x, y, colour, checkGridBlocks)
{
if(isValidGridPosition(x, y, checkGridBlocks)){
    renderBlock(convertGridPos(x), convertGridPos(y), colour);
}
}

function renderBlock(x, y, colour)
{
context.fillStyle = colour;
context.fillRect(x, y, spacing, spacing);
context.lineWidth = 2;
context.strokeRect(x, y, spacing, spacing);
}

function isBlockInValidPosition(block)
{
for(var idx in block.positions[block['position']]){
    var pos = block.positions[block['position']][idx];

    if(!isValidGridPosition(block['x'] + pos['x'], block['y'] + pos['y'], true)){
        return false;
    }
}
return true;
}

function generateLBlock(block)
{
block['colour'] = '#f00';
block['position'] = 0;
block['default_width'] = 3;
block['positions'] = [
    [
        {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 0}
    ],
    [
        {x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}, {x: 1, y: 2}
    ],
    [
        {x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}, {x: 2, y: 0}
    ],
    [
        {x: 1, y: 0}, {x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}
    ]
];

return block;
}

function generateTBlock(block)
{
block['colour'] = '#aaa';
block['position'] = 0;
block['default_width'] = 3;
block['positions'] = [
    [
        {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 1, y: 1}
    ],
    [
        {x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}, {x: 1, y: 1}
    ],
    [
        {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 1, y: 1}
    ],
    [
        {x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}, {x: 1, y: 1}
    ]
];

return block;
}

function generateSBlock(block)
{
block['colour'] = '#0f0';
block['position'] = 0;
block['default_width'] = 3;
block['positions'] = [
    [
        {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0}, {x: 2, y: 0}
    ],
    [
        {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}
    ],
    [
        {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}
    ],
    [
        {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}, {x: 0, y: 2}
    ]
];

return block;
}

function generateSQBlock(block)
{
block['colour'] = '#05F';
block['default_width'] = 2;
block['position'] = 0;
block['positions'] = [
    [
        {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}
    ]
];

return block;
}

function generateLbarBlock(block)
{
block['colour'] = '#F0F';
block['default_width'] = 4;
block['position'] = 0;
block['positions'] = [
    [
        {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}
    ],
    [
        {x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}
    ]
];

return block;
}

var nextBlockType = -1;
var nextBlock;

function generateNewBlock()
{
var key;

if(nextBlockType > -1){
   key = nextBlockType;
}else{
    key = Math.round(Math.random() * 5);
}
nextBlockType = Math.floor(Math.random() * 5);

nextBlock = createBlockObject(nextBlockType);
return createBlockObject(key);
}

function createBlockObject(blockType){
var block = {
    x: 3,
    y: 0
}

switch(blockType){
    case 0:
        block = generateLbarBlock(block);
        break;
    case 1:
        block = generateLBlock(block);
        break;
    case 2:
        block = generateTBlock(block);
        break;
    case 3:
        block = generateSBlock(block);
        break;
    case 4:
        block = generateSQBlock(block);
        break;
}

return block;
}

var nextBlockRegionX = (columns * spacing) + 20;
var nextBlockRegionWidth = spacing * 5;
var nextBlockRegionHeight = spacing * 5;

var scoreBlockRegionX = nextBlockRegionX;
var scoreBlockRegionY = 0;
var scoreBlockRegionWidth = nextBlockRegionWidth;
var scoreBlockRegionHeight = spacing * 3;

function drawScorePanel()
{
context.beginPath();
context.clearRect(scoreBlockRegionX - 1, scoreBlockRegionY - 1, scoreBlockRegionWidth, scoreBlockRegionHeight);
context.font = "bold 16px Georgia";
context.fillStyle = "#FFFCCC";
context.strokeStyle = "#333";
context.strokeRect(scoreBlockRegionX, scoreBlockRegionY + 1, scoreBlockRegionWidth, scoreBlockRegionHeight);
context.fillRect(scoreBlockRegionX, scoreBlockRegionY + 1, scoreBlockRegionWidth, scoreBlockRegionHeight);

context.fillStyle = "#333";
context.textBaseline = "top";
context.fillText("Score", scoreBlockRegionX + 20, scoreBlockRegionY + 10);

context.font = "bold 32px Georgia";
context.textBaseline = "top";
context.fillText(score, scoreBlockRegionX + 20, scoreBlockRegionY + 30);
}

var numLinesBlockRegionX = nextBlockRegionX;
var numLinesBlockRegionY = scoreBlockRegionY + scoreBlockRegionHeight + 25;
var numLinesBlockRegionWidth = scoreBlockRegionWidth;
var numLinesBlockRegionHeight = scoreBlockRegionHeight;

function drawNumLinesPanel()
{
context.beginPath();
context.clearRect(numLinesBlockRegionX - 1, numLinesBlockRegionY - 1, numLinesBlockRegionWidth, numLinesBlockRegionHeight);
context.font = "bold 16px Georgia";
context.fillStyle = "#FFFCCC";
context.strokeStyle = "#333";
context.strokeRect(numLinesBlockRegionX, numLinesBlockRegionY + 1, numLinesBlockRegionWidth, numLinesBlockRegionHeight);
context.fillRect(numLinesBlockRegionX, numLinesBlockRegionY + 1, numLinesBlockRegionWidth, numLinesBlockRegionHeight);

context.fillStyle = "#333";
context.textBaseline = "top";
context.fillText("Lines", numLinesBlockRegionX + 20, numLinesBlockRegionY + 10);

context.font = "bold 32px Georgia";
context.textBaseline = "top";
context.fillText(numLines, numLinesBlockRegionX + 20, numLinesBlockRegionY + 30);
}


var nextBlockRegionY = numLinesBlockRegionY + numLinesBlockRegionHeight + 25;


function drawNextBlockPanel()
{
var nextBlockXPos = nextBlockRegionX + (nextBlockRegionWidth / 2 - ((nextBlock.default_width * spacing) / 2));
var nextBlockYPos = nextBlockRegionY + 60;
context.beginPath();
context.clearRect(nextBlockRegionX - 1, nextBlockRegionY - 1, nextBlockRegionWidth, nextBlockRegionHeight);
context.font = "bold 16px Georgia";
context.fillStyle = "#FFFCCC";
context.strokeStyle = "#333";
context.strokeRect(nextBlockRegionX - 1, nextBlockRegionY - 1, nextBlockRegionWidth, nextBlockRegionHeight);
context.fillRect(nextBlockRegionX - 1, nextBlockRegionY - 1, nextBlockRegionWidth, nextBlockRegionHeight);

context.fillStyle = "#333";
context.textBaseline = "top";
context.fillText("Next Block", nextBlockRegionX + 20, nextBlockRegionY + 10);
for(var idx in nextBlock.positions[0]){
    var pos = nextBlock.positions[0][idx];
    pos['x'] *= spacing;
    pos['y'] *= spacing;
    renderBlock(pos['x'] + nextBlockXPos, pos['y'] + nextBlockYPos, nextBlock.colour);

}
}

function drawPanels(){
drawNextBlockPanel();
drawScorePanel();
drawNumLinesPanel()
}

function drawBlock(block)
{
for(var idx in block.positions[block['position']]){
    var pos = block.positions[block['position']][idx];
    drawBlockAt(block['x'] + pos['x'], block['y'] + pos['y'], block['colour'], true);
}
}

function generateGridBlockKey()
{
var key;
do{
    key = Math.ceil(Math.random() * 1000);
}while(gridBlocks[key]);

return key;
}

function transferBlockToGrid(block)
{
for(var idx in block.positions[block['position']]){
    var pos = block.positions[block['position']][idx];
    var xPos = block['x'] + pos['x'];
    var yPos = block['y'] + pos['y'];
    //gridBlocks.push({x: block['x'] + pos['x'], y: block['y'] + pos['y']});
    gridBlocks[generateGridBlockKey()] = {x: xPos, y: yPos, colour: block['colour']};

    var currentColHeight = getColumnBlockHeight(xPos);
    if(yPos < currentColHeight){
        setColumnBlockHeight(xPos, yPos);
    }
}
}

//Has this user controlled block hit something that should put it in place?
function blockHasHitLine(block)
{

for(var idx in block.positions[block['position']]){
    var pos = block.positions[block['position']][idx];
    if(block['y'] + pos['y'] + 1 == getColumnBlockHeight(block['x'] + pos['x'])){
        return true;
    }
}
return false;
}

function getColumnBlockHeight(col)
{
if(columnHeights[col]){
    return columnHeights[col];
}else{
    return rows;
}
}

function setColumnBlockHeight(col, height){
columnHeights[col] = height;
}

function incrementColumnHeights()
{
for(var idx in columnHeights){
   columnHeights[idx]++;
}
}

function updateScore(linesCleared)
{
score += linesCleared * 40;
}

function resetGame()
{
columnHeights = {};
gridBlocks = {};
numLines = 0;
score = 0;
gameState = "IN_PLAY";
downKeyPressed = false;
leftKeyPressed = false;
rightKeyPressed = false;
rotateKeyPressed = false;
gameLoopInterval = setInterval(gameLoop, 50);

context.clearRect(0, 0, canvas.width, canvas.height);

newBlock = generateNewBlock();
drawGrid();
drawBlock(newBlock);
drawPanels();
}

function checkForCompleteLines()
{
var rowCount = {};

for(var idx in gridBlocks)
{
    var pos = gridBlocks[idx];
    if(!rowCount[pos['y']]){
        rowCount[pos['y']] = 0;
    }
    rowCount[pos['y']]++;
    if(rowCount[pos['y']] == columns){
        removeLine(pos['y']);
        incrementColumnHeights();
        return 1 + checkForCompleteLines();
    }
}
return 0;
}

function checkIfGameOver(){
for(var i in columnHeights){
    if(columnHeights[i] <= 0){
        return true;
    }
}
return false;
}

function endGame()
{
var panelWidth = 450;
var panelHeight = 150;
var panelTop =  canvas.height / 2 - panelHeight / 2;

clearInterval(gameLoopInterval);
gameState = "ENDED";
context.beginPath();
context.fillStyle = "#f3f3f3";
context.strokeStyle = "#333";
context.lineWidth = "2";
context.strokeRect(canvas.width / 2 - panelWidth / 2, panelTop, panelWidth, panelHeight);
context.fillRect(canvas.width / 2 - panelWidth / 2, panelTop, panelWidth, panelHeight);


context.font = "bold 70px Arial";
context.fillStyle = "#333";
context.lineWidth = "1";
context.strokeStyle = "#666";
context.textBaseline = "top";
var textWidth = context.measureText("Game Over");
context.strokeText("Game Over", canvas.width / 2 - textWidth.width / 2, panelTop + 10);
context.fillText("Game Over", canvas.width / 2 - textWidth.width / 2, panelTop + 10);

var continueMessage = "Press enter to play again";
context.font = "26px Georgia";
textWidth= context.measureText(continueMessage);
context.fillText(continueMessage, canvas.width / 2 - textWidth.width / 2, 320);
}

function removeLine(line)
{

for(var idx in gridBlocks)
{
    var pos = gridBlocks[idx];
    if(pos['y'] == line){
        delete gridBlocks[idx];
    }else if(pos['y'] <= line){
        gridBlocks[idx]['y']++;
    }
}
}


function gameLoop(){
var nowDate = new Date();
var now = nowDate.getTime();
var diff = now - dateTime;
dateTime = now;

if(downKeyPressed || autoDropCounter > 1000)
{
    newBlock.y++;
    refreshScreen = true;

    if(!downKeyPressed){
        autoDropCounter-= 1000;
    }
    downKeyPressed = false;
}else if(rightKeyPressed)
{
    newBlock.x++;
    if(isBlockInValidPosition(newBlock)){
        refreshScreen = true;
    }else{
        newBlock.x--;
    }
    rightKeyPressed = false;
}else if(leftKeyPressed)
{
    newBlock.x--;
    if(isBlockInValidPosition(newBlock)){
        refreshScreen = true;
    }else{
        newBlock.x++;
    }
    leftKeyPressed = false;
}else if(rotateKeyPressed)
{
    newBlock['position'] = (newBlock['position'] + 1) % newBlock['positions'].length;
    if(isBlockInValidPosition(newBlock)){
        refreshScreen = true;
    }else{
        newBlock['position']--;
        if(newBlock['position'] < 0){
            newBlock['position'] = newBlock['positions'].length - 1;
        }
    }
    refreshScreen = true;
    rotateKeyPressed = false;
}

if(refreshScreen)
{
    drawGrid();
    drawBlock(newBlock);

    refreshScreen = false;

    if(checkIfGameOver()){
        endGame();
    }else if(blockHasHitLine(newBlock)){
        transferBlockToGrid(newBlock);
        newBlock = generateNewBlock();
        refreshScreen = true;
        var linesCleared = checkForCompleteLines();
        numLines+= linesCleared;
        updateScore(linesCleared);
        drawPanels();
    }
}

autoDropCounter+= diff;
}


resetGame();

var refreshScreen = false;
var date = new Date();
var dateTime = date.getTime();
var autoDropCounter = 0;