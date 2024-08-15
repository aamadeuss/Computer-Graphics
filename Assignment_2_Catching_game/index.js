import { WebGLRenderer } from "./lib/renderer.js";
import { Scene } from "./lib/scene.js";
import { Shader } from "./lib/shader.js";
import { Mesh } from "./lib/mesh.js";

import {Transform,GLMAT} from "./lib/glmat_transforms.js";
// import * as OBJLOAD from'./lib2/objload.js';
import { loadText } from "./lib/fileReader.js";
import { Loader } from "./lib/loader.js";
import { Polygon } from "./lib/polygon.js";
import { Game } from "./lib/game.js";
import {Camera } from "./lib/glmat_camera.js";
import {Player} from "./lib/player.js";
const MESH_FOLDER = "../lib/models"
const vertexShaderSrc = `
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;

varying vec4 v_color;
void main(){
    // Multiply the position by the matrix
    gl_Position = u_matrix * a_position;

    // Pass the color to the fragment shader
    v_color = a_color;
}
`

const fragmentShaderSrc = `
precision mediump float;

// uniform vec4 u_color;
// Passed in from the vertex shader
varying vec4 v_color;

void main(){
    gl_FragColor = v_color;
}
`
const WINDOW_SIZE=[520,520]
const CAMERA_ARGS = {
    type:'perspective',
    near:1,
    far:2000,
    fovy:50,
    aspect:WINDOW_SIZE[0]/WINDOW_SIZE[1],
    "cameraTransform":(Transform.makeTranslationTransform(0,0,1000))
}

    
var p=null, c=null;
const btn = document.getElementById('start');
const viewText = document.querySelector('.viewMode');
const placeholder_canvas = document.querySelector('.placeholder_canvas');
const input_getters = document.querySelector('.inputs');
const refresh_prompt = document.querySelector('.refresh');

btn.onclick = (e)=>{
    if(p !== null && c !== null){
        alert('Refresh to start a new game.')
        return;
    }
    const players = document.getElementById('players').value;
    const corners = document.getElementById('corners').value;
    p = parseInt(players);
    c = parseInt(corners);
    if(p < 2){
        alert('Minimum 2 players required');
        return;
    }
    if(p > 7){
        alert('Maximum 7 players');
        return;
    }
    if(c < 4){
        alert('MInimum 4 corners');
        return;
    }
    if(c > 10){
        alert('Maximum 10 corners');
        return;
    }
    if(p >= c){
        alert('players cannot be greater than corners!');
        return;
    }
    main();
}

async function main(){

    viewText.classList.remove(('hidden'));
    placeholder_canvas.classList.add('hidden');
    input_getters.classList.add('hidden');
    refresh_prompt.classList.remove('hidden')

    const renderer = new WebGLRenderer(WINDOW_SIZE)

    document.body.prepend(renderer.canvas);

    
    const shader = new Shader(
        renderer.getGLcontext(),
        vertexShaderSrc,
        fragmentShaderSrc
    );

    shader.use();

    shader.addBuffer('color');

    var color = [Math.random(), Math.random(), Math.random(), 1];

    // var shape = new Mesh(
    //     F_3d, // data
    //     renderer.gl.TRIANGLES, // primitive type
    //     F_3d_color // color
    // )
    const scene = new Scene();
    const camera = new Camera(CAMERA_ARGS)
    scene.addCameraObj(camera);
//============================BAD CODE=============================
    var meshpath = MESH_FOLDER + "/p1.obj";

    var mesh = await loadText(meshpath);
    
    var data = new Loader(mesh);
    var truck = data.getTriangles();
//================
    meshpath = MESH_FOLDER + "/p2.obj";
    
    mesh = await loadText(meshpath);

    data = new Loader(mesh);
    var boat = data.getTriangles();
//==================
    meshpath = MESH_FOLDER + "/p3.obj";

    mesh = await loadText(meshpath);

    data = new Loader(mesh);
    var snowman = data.getTriangles();
//======================
    meshpath = MESH_FOLDER + "/arrow.obj";

    mesh = await loadText(meshpath);

    data = new Loader(mesh);
    var arrow = data.getTriangles();
//==================================BAD CODE ENDS=======================

    const poly = new Polygon(c);
    var polyVerts = poly.calcVertices();
    var positions = poly.getPositions();

    const repeat = (arr, n) => Array.from({ length: arr.length * n }, (_, i) => arr[i % arr.length]);
    var colors = [
        [120, 0, 0], //red
        [0, 120, 0], //green 
        [0, 0, 120], //blue
        [0, 200, 120], //teal? turquoise? new color :scream:???!!?
        [120, 45, 45],
        // [0, 0, 0]
    ];

    var catcherColor = [255, 0, 0];

    var models = [
        truck,
        boat,
        snowman
    ];

    var map = new Mesh(
        polyVerts,
        renderer.gl.TRIANGLES,
        repeat([0, 0, 0], polyVerts.length/3),
        'map',
        '0:0:0',
        0
    )

    var shapes = [];

    let pcolorsArray = [];    
    for(let i = 0; i < p; i++){
        let name = 'F_'+i;
        let u_color = colors[i%colors.length]
        let objLabel = colors[i%colors.length][0] + ':' + colors[i%colors.length][1] + ':' + colors[i%colors.length][2];
        while(pcolorsArray.includes(objLabel)){
            u_color = createUniqueColor();
            objLabel = u_color[0] + ':' + u_color[1] + ':' + u_color[2];
        }
        pcolorsArray.push(objLabel);
        let dc = ((i % 30 / 60) + 0.3)*255;
        var player = new Player(
            i+1,
            models[(i)%models.length],
            renderer.gl.TRIANGLES,
            repeat(u_color, models[(i)%models.length].length/3),
            name,
            objLabel,
            [dc, dc, dc],
            {
                'isArrow':false
            }
        );
        shapes.push(player);
        scene.add(player);
        
    }
    function animate(time){
        renderer.render(shader, scene); 
        requestAnimationFrame(animate);  
    }
    animate();
    renderer.render(shader, scene); 
    
    const game = new Game(shapes, c, poly);
    
    // --------------- Add Catcher Arrow --------------- //
    let playerArrow = new Player(
        4869,
        arrow,
        renderer.gl.TRIANGLES,
        repeat([179, 15, 255], arrow.length/3),
        'Arrow',
        'PlayerArrow',
        [179, 15, 255],
        {
            'isArrow':true,
            'show':false
        }
    );

    scene.add(playerArrow)

    game.setArrow(playerArrow)
    
    // --------------- --------------- --------------- //

    var pos = positions[0];
    

    
    scene.add(map);

   
    
    const canvasCoordToCameraFrame = (x,y)=>new Float32Array([x/(renderer.canvas.width/2) - 1, y/(renderer.canvas.height/2) - 1,camera.near])
    var plist = []
    var prev_point
    var is_mouse_down=false
    var caminv;
    // ---------------------- Picker Logic  Start ---------------------- //
    var plist = []
    renderer.canvas.onmousedown = (e)=>{
        let gl = renderer.gl;
        let point = pixelInputToCanvasCoord(e, renderer.canvas);
        var pixels = new Uint8Array(4);

        gl.readPixels(point.x, point.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let key = pixels[0] + ':' + pixels[1] + ':' + pixels[2];
        
        for(let ii = 0, max = scene.primitives.length; ii < max; ii+=1){
            let ob = scene.primitives[ii];
            if(key !== '0:0:0' && ob.pcolor === key){
                let indexOfCatcher = shapes.findIndex(object => {
                    return object.pcolor === key;
                });
                if(game.catcher == null || game.catcher == undefined){
                    game.setResetCatcher(indexOfCatcher)
                }
                if(key === game.catcher.pcolor){
                    plist[0] = ii;
                    plist[1] = ob;
                    scene.primitives[ii].gettingPicked = true;
                }
                
            }

        }
        if(plist.length > 0){
            point = canvasCoordToCameraFrame(point.x,point.y)
            prev_point = structuredClone(point) 
        } else{
            prev_point = structuredClone(point)
            caminv = camera.getProjected(new Transform()).getInverseTransform()
            is_mouse_down=true
        }
       
    }

    renderer.canvas.onmousemove = (e) =>{
        if(plist.length == 0 && !is_mouse_down) {
            return
        }

        if(plist.length == 0 && is_mouse_down && cameraToggle){
            caminv = camera.getProjected(new Transform()).getInverseTransform()

            let point = pixelInputToCanvasCoord(e, renderer.canvas);

            let pointVec = canvasCoordToCameraFrame(point.x,point.y)
            let prevPointVec = canvasCoordToCameraFrame(prev_point.x,prev_point.y)

            prevPointVec =  GLMAT.vec3.transformMat4(GLMAT.vec3.create(), prevPointVec, caminv.transformMatrix)
            pointVec =  GLMAT.vec3.transformMat4(GLMAT.vec3.create(), pointVec, caminv.transformMatrix)

            const toApply = Transform.makeQuatTransform(Transform.quatFromDeltaVec(prevPointVec,pointVec))
            for(let i = 0 ; i <(toApply.transformMatrix.length); ++i)
            {
                if(toApply.transformMatrix[i] == null || Number.isNaN(toApply.transformMatrix[i])) return;
            }

            camera.cameraTransform.applyTransform(toApply,true)

            prev_point = structuredClone(point)
        }

        if(plist.length > 0 && !is_mouse_down)
        {
            let point = pixelInputToCanvasCoord(e, renderer.canvas)
            point = canvasCoordToCameraFrame(point.x,point.y)

            let c_T = camera.getProjected(scene.primitives[plist[0]].transform)

            const delta = GLMAT.vec3.subtract(GLMAT.vec3.create(),point,prev_point)

            prev_point = structuredClone(point)
            c_T.applyTranslate(...delta,true)
            c_T.applyTransform(camera.getProjected(new Transform()).getInverseTransform(),true)
            scene.primitives[plist[0]].transform = c_T
        }
    }
    renderer.canvas.onmouseup = (e) =>{
        is_mouse_down=false
        if(plist.length>0){
             scene.primitives[plist[0]].gettingPicked = false;
             plist = []
         }
         if(game.catcher){
            game.snapCatcher();
         }
     }

    function pixelInputToCanvasCoord (event, canvas) {
        var x = event.offsetX,
            y = event.offsetY,
            rect = event.target.getBoundingClientRect();
        x = x - rect.left;
        y = rect.bottom - y;
        return {x:x,y:y};
    }

    // ----------------------- Picker Logic  End ----------------------- //

    function createUniqueColor(){
        let color = [
            Math.random()*255,
            Math.random()*255,
            Math.random()*255
        ];

        return color;
    }


    var cameraToggle = false;
    document.addEventListener("keydown",(e)=>{
        let ry;
        let rx;
        if(game.catcher != null || game.catcher != undefined){
            }
        

        let f = camera.fovy
        // console.log(f)
        switch(e.key){
            case "c":
                console.log('camera toggle', viewText)
                if(cameraToggle){
                    scene.cameraObj.reset()
                    viewText.textContent = `Top View`;
                }
                else{
                    scene.cameraObj.cameraTransform.applyTranslate(1000,0,-500,false)
                    scene.cameraObj.retargetGlobal(new Float32Array([0,0,0]))
                    viewText.textContent = `3D View`;
                }
                
                cameraToggle =!cameraToggle;
                
                break;  
            case "k":
                camera.setFovDegrees(f+10);
                break;
            case "l":
                camera.setFovDegrees(f-10);
                break;
            case ".":
                if(cameraToggle)
                camera.cameraTransform.applyYrot(10,false);
                
                break;
            case ",":
                if(cameraToggle)
                camera.cameraTransform.applyYrot(-10,false);
                // ry = camera.getRotationArray()[1]
                // ry -= 10;
                // // console.log(ry)
                // camera.setCameraAngleInDegrees(0, ry, 0);
                // // console.log(renderer.fovDegrees);
               
                break;
            case "/":
                if(cameraToggle)
                camera.cameraTransform.applyXrot(10,false);
                // rx = camera.getRotationArray()[0]
                // rx += 10;
                // console.log(ry)
                // camera.setCameraAngleInDegrees(rx, 0, 0);
                // console.log(renderer.fovDegrees);
               
                break;
            case "l":
                if(cameraToggle)
                camera.cameraTransform.applyXrot(-10,false);
                // ry = camera.getRotationArray()[1]
                // ry -= 10;
                // // console.log(ry)
                // camera.setCameraAngleInDegrees(0, ry, 0);
                // console.log(renderer.fovDegrees);
               
                break;
            case "Enter":
                game.startGame();
               
                break;
            case "w":
                // catcher = game.getCatcher();
                game.update();
               
                break;
            case '=':
                
                game.scaleCatcher(0.2);
                break;
            case '-':
                
                game.scaleCatcher(- 0.2);
                break;
            default:
                // console.log(e.key)
                break;
        }
    });
    

}
// c toggle
// main();
