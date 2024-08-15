var canvas = document.querySelector("#cnv");
var gl = canvas.getContext("webgl");
if(!gl){
    throw new Error("WebGL not supported!");
}

//=========creating, uploading and compiling the shaders===========

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
   
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

//==========calling the above functions==========

var vertexShaderSrc = document.querySelector("#vertex-shader-2d").textContent;
var fragShaderSrc = document.querySelector("#fragment-shader-2d").textContent;

var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
var fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);

//============linking===============

function createProgram(gl, vertexShader, fragShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

var program = createProgram(gl, vertexShader, fragShader);

var posAttribLocation = gl.getAttribLocation(program, "a_position");
var colorUniformLocation = gl.getUniformLocation(program, "u_color");
var translationLocation = gl.getUniformLocation(program, "u_translation");
var resUniformLocation = gl.getUniformLocation(program, "u_resolution");
var matrixLocation = gl.getUniformLocation(program, "u_matrix");
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


// ==FUNCTIONS TO SEND VERTEX DATA TO VSHADER FOR DIFFERENT GEOMETRIES==

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2]), gl.STATIC_DRAW);
}

function setTriangle(gl, x, y, base) {
 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x + base, y + base,
     x, y + base,
     x + (base/2), y + (base/2) * (2 - Math.sqrt(3))]), gl.STATIC_DRAW);
}

// helper function to convert degrees to radians
function DegToRad(angle){ 
  return angle * (Math.PI / 180);
}

function setPac(gl, x, y, width, height) {
  var x1 = x + width / 2;
  var y1 = y + height / 2;
  var angles = [45, 60, 90, 120, 150, 180, 210, 240, 270, 300, 315];
  angles.forEach(function(element, index, array) {
    array[index] = DegToRad(element);
  });
 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x1 + (width/3) * Math.cos(angles[0]), y1 + (height/3) * Math.sin(angles[0]),
     x1 + (width/3) * Math.cos(angles[1]), y1 + (height/3) * Math.sin(angles[1]),
     x1, y1,
     x1 + (width/3) * Math.cos(angles[1]), y1 + (height/3) * Math.sin(angles[1]),
     x1 + (width/3) * Math.cos(angles[2]), y1 + (height/3) * Math.sin(angles[2]),
     x1, y1,
     x1 + (width/3) * Math.cos(angles[2]), y1 + (height/3) * Math.sin(angles[2]),
     x1 + (width/3) * Math.cos(angles[3]), y1 + (height/3) * Math.sin(angles[3]),
     x1, y1,
     x1 + (width/3) * Math.cos(angles[3]), y1 + (height/3) * Math.sin(angles[3]),
     x1 + (width/3) * Math.cos(angles[4]), y1 + (height/3) * Math.sin(angles[4]),
     x1, y1,
     x1 + (width/3) * Math.cos(angles[4]), y1 + (height/3) * Math.sin(angles[4]),
     x1 + (width/3) * Math.cos(angles[5]), y1 + (height/3) * Math.sin(angles[5]),
     x1, y1,
     x1 + (width/3) * Math.cos(angles[5]), y1 + (height/3) * Math.sin(angles[5]),
     x1 + (width/3) * Math.cos(angles[6]), y1 + (height/3) * Math.sin(angles[6]),
     x1, y1,
     x1 + (width/3) * Math.cos(angles[6]), y1 + (height/3) * Math.sin(angles[6]),
     x1 + (width/3) * Math.cos(angles[7]), y1 + (height/3) * Math.sin(angles[7]),
     x1, y1,
     x1 + (width/3) * Math.cos(angles[7]), y1 + (height/3) * Math.sin(angles[7]),
     x1 + (width/3) * Math.cos(angles[8]), y1 + (height/3) * Math.sin(angles[8]),
     x1, y1,
     x1 + (width/3) * Math.cos(angles[8]), y1 + (height/3) * Math.sin(angles[8]),
     x1 + (width/3) * Math.cos(angles[9]), y1 + (height/3) * Math.sin(angles[9]),
     x1, y1,
     x1 + (width/3) * Math.cos(angles[9]), y1 + (height/3) * Math.sin(angles[9]),
     x1 + (width/3) * Math.cos(angles[10]), y1 + (height/3) * Math.sin(angles[10])]), gl.STATIC_DRAW);
}


// ================MATRIX FUNCTIONS DEFINED BELOW====================

var m3 = {
  projection: function(width, height) {
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
  },

  identity: function() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
  },

  translation: function(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },
 
  rotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c,-s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },
 
  scaling: function(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
};


// ===============INITIALISATION OF GAME VARIABLES===================

const map1 = [
  ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
  ['0', 'g', '1', '1', '1', '1', '1', '1', '1', '0'],
  ['0', '1', '0', '0', '0', '1', '0', '0', '2', '0'],
  ['0', '1', '1', 'g', '1', '1', '0', '0', '1', '0'],
  ['0', '1', '0', '1', '0', '1', '1', 'g', '1', '0'],
  ['0', '1', '0', '1', '0', '1', '0', '0', '1', '0'],
  ['0', '1', '0', '2', '1', '1', '1', '1', '1', '0'],
  ['0', '1', '0', '1', '0', '0', '0', '0', '1', '0'],
  ['0', '1', '1', '1', 'p', '1', '1', 'g', '1', '0'],
  ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
]

const map2 = [
  ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
  ['0', 'g', '1', '1', 'p', '1', '1', '1', 'g', '0'],
  ['0', '1', '0', '0', '1', '0', '2', '0', '1', '0'],
  ['0', '1', '0', '0', '1', '1', '1', '1', '1', '0'],
  ['0', '1', '1', '1', '1', '1', '0', '0', 'g', '0'],
  ['0', '2', '0', '1', '0', '1', '1', '1', '1', '0'],
  ['0', '1', '1', '1', '1', '1', '0', '0', '1', '0'],
  ['0', '1', '0', '0', '0', '1', '0', '0', '1', '0'],
  ['0', 'g', '1', '1', '1', '1', '1', '1', '1', '0'],
  ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
]

const map3 = [
  ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
  ['0', '1', '1', '1', 'g', '0', '1', '1', 'g', '0'],
  ['0', '1', '0', '1', '1', '2', '1', '0', '1', '0'],
  ['0', 'p', '0', 'g', '0', '1', '1', '1', '1', '0'],
  ['0', '1', '0', '1', '0', '1', '0', '0', '1', '0'],
  ['0', '1', '0', '1', '0', '1', '0', '0', '1', '0'],
  ['0', '1', '0', '1', '0', '1', '1', '1', '1', '0'],
  ['0', '1', '0', '1', '1', '1', '1', '0', '2', '0'],
  ['0', '1', '1', '1', 'g', '0', '1', '1', '1', '0'],
  ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
]

// collection of all game maps:
const maps = [map1, map2, map3];
var map_id = 0;

var map = Array(maps[map_id].length);
for(var i=0; i < map.length; i++){
  map[i] = maps[map_id][i].slice();
}

var visitMap = Array(map.length);
for(var i=0; i < map.length; i++){
  visitMap[i] = Array(map[i].length).fill(false);
}

var translation = [0, 0];
var angleInRadians = 0;
var scale = [1, 1];
var width = 400;
var height = 30;
var color = [0.246, 0.4, 0.188, 1];
var move_direction = 0;
// move_direction values:
// 0 --> no direction
// 1 --> up
// 2 --> right
// 3 --> down
// 4 --> left
var pacman_translation = [0, 0];
var pacman_direction = 0; // 0 = right, 1 = down, 2 = left, 3 = up
var position = [0, 0];
var gridWidth = canvas.clientWidth / map[0].length;
var gridHeight = canvas.clientHeight / map.length;
var pelletSize = 6; // size of pellets in pixels
var powered = false; // if pacman has powered up
var onPowerPellet = false; // if pacman is on a power pellet
var ghostColors = [
  [1, 0.6, 0.9, 1],
  [1, 1, 0.1, 1],         // ghost colors
  [1, 0.2, 0.2, 1],
  [0, 1, 1, 1]
]
var ghostColor = 0;
var mode = "normal"; // mode of the game
var clicked = false; // if pacman was clicked on, in modify mode


// =================RENDERING FUNCTIONS=======================

function initCanvas(){
  resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.08, 0.09, 0.09, 3);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(posAttribLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var size = 2;
  var type = gl.FLOAT;
  var normalize = false;
  var stride = 0;
  var offset = 0;
  gl.vertexAttribPointer(posAttribLocation, size, type, normalize, stride, offset);
  
  gl.uniform2f(resUniformLocation, gl.canvas.width, gl.canvas.height);
}

function resetMatrix(){ // the standard matrix to render everything other than pacman
  var t_matrix = m3.translation(translation[0], translation[1]);
  var r_matrix = m3.rotation(angleInRadians);
  var s_matrix = m3.scaling(scale[0], scale[1]);
  var projMatrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);

  var matrix = m3.identity();
  matrix = m3.multiply(projMatrix, t_matrix);
  matrix = m3.multiply(matrix, r_matrix);
  matrix = m3.multiply(matrix, s_matrix);
  gl.uniform4fv(colorUniformLocation, color);
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
}

function setMatrix(angleInRadians, scale){ // mainly used for pacman's rotations
  var t_matrix = m3.translation(translation[0], translation[1]);
  var r_matrix = m3.rotation(angleInRadians);
  var s_matrix = m3.scaling(scale[0], scale[1]);
  var projMatrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
  var moveOriginMatrix = m3.translation(-1 * (position[1] * gridWidth + gridWidth / 2 ), -1 * (position[0] * gridHeight + gridHeight / 2 ));
  var moveBackMatrix = m3.translation((position[1] * gridWidth + gridWidth / 2 ), (position[0] * gridHeight + gridHeight / 2 ));

  var matrix = m3.identity();
  matrix = m3.multiply(projMatrix, moveBackMatrix);
  matrix = m3.multiply(matrix, t_matrix);
  matrix = m3.multiply(matrix, r_matrix);
  matrix = m3.multiply(matrix, s_matrix);
  matrix = m3.multiply(matrix, moveOriginMatrix);

  gl.uniform4fv(colorUniformLocation, color);
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
}

function drawScene(){
  initCanvas();

  resetMatrix();

  updateMap(gl, map, gridWidth, gridHeight);
}

drawScene(); // <------- main rendering function call

// ================================================================
// ------------------HELPER FUNCTIONS BELOW------------------------
// ================================================================

function updateMap(gl, map, w, h) { // updates map after events like pacman moving,
                                    // consuming pellets, etc.
  map.forEach((row, i) => {
    row.forEach((symbol, j) => {
      switch(symbol){
        case '0':
          gl.uniform4fv(colorUniformLocation, [0, 0, 1, 1]);
          setRectangle(gl, j * w, i * h, w, h);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          break;
        case 'p':
          position = [i, j];
          if(mode === 'normal'){
            visitMap[i][j] = true;
          }
          if(!powered){
            setMatrix(pacman_direction * Math.PI/2, [1, 1]);
          }
          else{
            setMatrix(pacman_direction * Math.PI/2, [1.5, 1.5]);
          }
          gl.uniform4fv(colorUniformLocation, [1, 1, 0, 1]);
          setPac(gl, j * w, i * h, w, h);
          gl.drawArrays(gl.TRIANGLES, 0, 31);
          resetMatrix();
          break;
        case '1':
          if(visitMap[i][j] === false){
            gl.uniform4fv(colorUniformLocation, [1, 0.6, 0.2, 1]);
          }
          else{
            gl.uniform4fv(colorUniformLocation, [0.1, 0.7, 0.2, 1]);
          }
          setRectangle(gl, j * w + (gridWidth - pelletSize)/2, i * h + (gridHeight - pelletSize)/2, pelletSize, pelletSize);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          break;
        case '2':
          if(visitMap[i][j] === false){
            gl.uniform4fv(colorUniformLocation, [1, 0.6, 0.2, 1]);
          }
          else{
            gl.uniform4fv(colorUniformLocation, [0.1, 0.7, 0.2, 1]);
          }
          setRectangle(gl, j * w + (gridWidth - pelletSize * 2.5)/2, i * h + (gridHeight - pelletSize * 2.5)/2, pelletSize * 2.5, pelletSize * 2.5);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          break;
        case 'g':
          if(powered){
            gl.uniform4fv(colorUniformLocation, [0, 1, 1, 1]);
          }
          else{
            gl.uniform4fv(colorUniformLocation, ghostColors[ghostColor]);
            ghostColor = (ghostColor+1) % ghostColors.length;
          }
          setTriangle(gl, j * w, i * h, w);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          break;
      }
    })
  })
}

function resetMap(){ // resets map to its original configuration
  onPowerPellet = false;
  powered = false;
  ghostColor = 0;
  map_id = (map_id+1)%maps.length;
  for(var i = 0; i < visitMap[0].length; i++){
    visitMap[i] = Array(visitMap[i].length).fill(false);
  }
  for(var i=0; i < map.length; i++){
    map[i] = maps[map_id][i].slice();
  }
}

function move(direction){ // prepares to move pacman in the given direction
  var nextCell = [position[0]+direction[1], position[1]+direction[0]];
  var symbol = map[nextCell[0]][nextCell[1]];
  switch(symbol){
    case '1':
      if(powered){
        powered = false;
      }
      if(onPowerPellet){
        map[nextCell[0]][nextCell[1]] = 'p';
        map[position[0]][position[1]] = '2';
        onPowerPellet = false;
        break;
      }
      map[nextCell[0]][nextCell[1]] = 'p';
      map[position[0]][position[1]] = '1';
      break;
    case '2':
      onPowerPellet = true;
      if(visitMap[nextCell[0]][nextCell[1]] === false){
        powered = true;
      }
      map[nextCell[0]][nextCell[1]] = 'p';
      map[position[0]][position[1]] = '1';
      break;
    case '0':
      break;
  }
}

function rotateMap(map, direction){ // direction: 0 for clockwise, 1 for anticlockwise
  if(direction === 1){
    var temp = Array(map.length);
    for(var i = 0; i < temp.length; i++){
      temp[i] = Array(map[i].length);
    }
    for(var i = 0; i < temp.length; i++){
      for(var j = 0; j < temp[i].length; j++){
        temp[i][j] = map[j][map[i].length - 1 - i];
      }
    }
    return temp;
  }
  else if(direction === 0){
    var temp = Array(map.length);
    for(var i = 0; i < temp.length; i++){
      temp[i] = Array(map[i].length);
    }
    for(var i = 0; i < temp.length; i++){
      for(var j = 0; j < temp[i].length; j++){
        temp[i][j] = map[map[i].length - 1 - j][i];
      }
    }
    return temp;
  }
}


// ===================EVENT LISTENERS======================


document.addEventListener("keydown", e => {
  if(e.key === "ArrowDown" && mode === "normal"){
    move([0, 1]);
    pacman_direction = 3;
    drawScene();
  }
  else if(e.key === "ArrowLeft" && mode === "normal"){
    move([-1, 0]);
    pacman_direction = 2;
    drawScene();
  }
  else if(e.key === "ArrowUp" && mode === "normal"){
    move([0, -1]);
    pacman_direction = 1;
    drawScene();
  }
  else if(e.key === "ArrowRight" && mode === "normal"){
    move([1, 0]);
    pacman_direction = 0;
    drawScene();
  }
  else if(e.key === "]" && mode === "normal"){
    pacman_direction = (pacman_direction + 3) % 4;
    map = rotateMap(map, 0);
    visitMap = rotateMap(visitMap, 0);
    drawScene();
  }
  else if(e.key === "[" && mode === "normal"){
    pacman_direction = (pacman_direction + 1) % 4;
    map = rotateMap(map, 1);
    visitMap = rotateMap(visitMap, 1);
    drawScene();
  }
  else if(e.key === "c" && mode === "normal"){
    pacman_direction = 0;
    resetMap();
    drawScene();
  }
  else if(e.key === '9' && mode === "normal"){
    pacman_direction -= 0.5;
    drawScene();
  }
  else if(e.key === '0' && mode === "normal"){
    pacman_direction += 0.5;
    drawScene();
  }
  else if(e.key === 'm'){
    if(mode === "normal"){
      mode = "modify";
    }
    else{
      mode = "normal";
    }
    drawScene();
  }
})

document.addEventListener("mousedown", e => {
  var x = e.offsetX;
  var y = e.offsetY;
  if(mode === 'modify'){
    if(x >= position[1] * gridWidth && x < (position[1] + 1) * gridWidth && y >= position[0] * gridHeight  && y < (position[0] + 1) * gridHeight && !clicked){
      clicked = !clicked;
      console.log(clicked);
    }
  }
})

document.addEventListener("mouseup", e => {
  var x = e.offsetX;
  var y = e.offsetY;
  if(mode === 'modify'){
    if(clicked){
      var dropX = Math.floor(x / gridWidth);
      var dropY = Math.floor(y / gridHeight);
      var dropPos = [dropY, dropX];
      if(dropPos != position){
        var symbol = map[dropPos[0]][dropPos[1]];
        switch(symbol){
          case '1':
            if(powered){
              powered = false;
            }
            if(onPowerPellet){
              map[dropPos[0]][dropPos[1]] = 'p';
              map[position[0]][position[1]] = '2';
              onPowerPellet = false;
              break;
            }
            map[dropPos[0]][dropPos[1]] = 'p';
            map[position[0]][position[1]] = '1';
            break;
          case '2':
            onPowerPellet = true;
            map[dropPos[0]][dropPos[1]] = 'p';
            map[position[0]][position[1]] = '1';
            break;
          case '0':
            break;
        }
        clicked = !clicked;
        drawScene();
      }
    }
  }
})