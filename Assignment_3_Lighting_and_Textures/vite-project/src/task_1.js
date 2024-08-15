import * as THREE from "three"
// import { RenderHandler } from "./rendering"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

const BROWN = new THREE.Vector4(52/255,25/255,0/255, 1)
const ORANGE = new THREE.Vector4(204/255,102/255,0/255,1)
const WHITE = new THREE.Vector4(255/255,255/255,255/255,1)

const spheres = [
    {x:0,y:0,ambient:1,diffuse:0,specular:0,reflectance:20,ambient_color:BROWN,diffuse_color:ORANGE,specular_color:WHITE},
    {x:0,y:1,ambient:1,diffuse:0.5,specular:0,reflectance:20,ambient_color:BROWN,diffuse_color:ORANGE,specular_color:WHITE},
    {x:0,y:2,ambient:1,diffuse:1,specular:0,reflectance:20,ambient_color:BROWN,diffuse_color:ORANGE,specular_color:WHITE},
    {x:1,y:0,ambient:1,diffuse:0,specular:1,reflectance:35,ambient_color:BROWN,diffuse_color:ORANGE,specular_color:WHITE},
    {x:1,y:1,ambient:1,diffuse:0.5,specular:1,reflectance:35,ambient_color:BROWN,diffuse_color:ORANGE,specular_color:WHITE},
    {x:1,y:2,ambient:1,diffuse:1,specular:1,reflectance:35,ambient_color:BROWN,diffuse_color:ORANGE,specular_color:WHITE},
    {x:2,y:0,ambient:1,diffuse:0,specular:2,reflectance:35,ambient_color:BROWN,diffuse_color:ORANGE,specular_color:WHITE},
    {x:2,y:1,ambient:1,diffuse:0.5,specular:2,reflectance:35,ambient_color:BROWN,diffuse_color:ORANGE,specular_color:WHITE},
    {x:2,y:2,ambient:1,diffuse:1,specular:2,reflectance:35,ambient_color:BROWN,diffuse_color:ORANGE,specular_color:WHITE}
]

var shadingModel = 'gourard';
var scene_option = 'sphere';

const vertexShaderGourard = `
precision mediump float;

// For reflections
uniform float Ka;   // Ambient reflection coefficient
uniform float Kd;   // Diffuse reflection coefficient
uniform float Ks;   // Specular reflection coefficient
uniform float shininessVal; // Shininess

// For Materials
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform vec3 lightPos; // Position of Light

varying vec3 normalInterp;
varying vec3 vertPos;

varying vec4 v_color;

uniform int model;


void main() {

    if(model == 0){ // Gourard
        vec4 vertPos4 = modelViewMatrix * vec4( position, 1.0 );
        vertPos = vec3(vertPos4) / vertPos4.w;

        gl_Position = projectionMatrix * vertPos4;

        normalInterp = vec3(normalMatrix * normal);

        vec3 N = normalize(normalInterp);
        vec3 L = normalize(lightPos - vertPos);

        // Lambert's cosine Law
        float lambertian = max(dot(N, L), 0.0) ;
        float specular = 0.0;

        if(lambertian > 0.0){
            vec3 R = reflect(-L, N);    // Refleced light vector
            vec3 V = normalize(-vertPos); // Vector to viewer

            // Compute specular term
            float specAngle = max(dot(R, V), 0.0);
            specular = pow(specAngle, shininessVal);
        }

        v_color = vec4(   Ka * ambientColor + 
                        Kd * lambertian * diffuseColor + 
                        Ks * specular * specularColor, 1.0 );
    } 
    else { // Phong
        vec4 vertPos4 = modelViewMatrix * vec4( position, 1.0 );
        vertPos = vec3(vertPos4) / vertPos4.w;

        gl_Position = projectionMatrix * vertPos4;

        normalInterp = vec3(normalMatrix * normal);
    }

    
}
`

const fragmentShaderGourard = `
precision mediump float;

varying vec4 v_color;

varying vec3 vertPos;
varying vec3 normalInterp;

// For reflections
uniform float Ka;   // Ambient reflection coefficient
uniform float Kd;   // Diffuse reflection coefficient
uniform float Ks;   // Specular reflection coefficient
uniform float shininessVal; // Shininess

// For Materials
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform vec3 lightPos; // Position of Light

uniform int model;

void main(){
    if(model == 0){ // Gourard
        gl_FragColor = v_color;
    }
    else { // Phong
        vec3 N = normalize(normalInterp);
        vec3 L = normalize(lightPos - vertPos);

        // Lambert's cosine Law
        float lambertian = max(dot(N, L), 0.0) ;
        float specular = 0.0;

        if(lambertian > 0.0){
            vec3 R = reflect(-L, N);    // Refleced light vector
            vec3 V = normalize(-vertPos); // Vector to viewer

            // Compute specular term
            float specAngle = max(dot(R, V), 0.0);
            specular = pow(specAngle, shininessVal);
        }

        gl_FragColor = vec4( Ka * ambientColor + 
                             Kd * lambertian * diffuseColor + 
                             Ks * specular * specularColor, 1.0 );
    }
}
`

function getMaterial(vertexShaderSrc,fragmentShaderSrc,args)
{
//   let material = new THREE.ShaderMaterial()

//   material.vertexShader = vertexShaderSrc
//   material.fragmentShader = fragmentShaderSrc
//   material.uniforms["ambient"]={value:args.ambient}
//   material.uniforms["diffuse"]={value:args.diffuse}
//   material.uniforms["specular"]={value:args.specular}
//   material.uniforms["reflectance"]={value:args.reflectance}
//   material.uniforms["ambient_color"]={value:args.ambient_color}
//   material.uniforms["diffuse_color"]={value:args.diffuse_color}
//   material.uniforms["specular_color"]={value:args.specular_color}


    let material = new THREE.ShaderMaterial();

    material.vertexShader = vertexShaderGourard
    material.fragmentShader = fragmentShaderGourard
    material.uniforms["Ka"] = {value: args.ambient}
    material.uniforms["Kd"] = {value: args.diffuse}
    material.uniforms["Ks"] = {value: args.specular}
    material.uniforms["shininessVal"] = {value: 80}

    material.uniforms["ambientColor"] = {value: args.ambient_color}
    material.uniforms["diffuseColor"] = {value: args.diffuse_color}
    material.uniforms["specularColor"] = {value: args.specular_color}
    material.uniforms["lightPos"] = {value: new THREE.Vector3(1,1,1)}
    material.uniforms["model"] = {value: 0}
    return material
}

function main()
{
    // let rh = new RenderHandler()
    let renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let sphere_scene = new THREE.Scene();
    let cylinder_scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.up.set(0,0,1);
    camera.position.set(0,0,5);

    let axesHelper_sphere = new THREE.AxesHelper( 5 );
    let axesHelper_cylinder = new THREE.AxesHelper( 5 );

    sphere_scene.add(axesHelper_sphere);
    cylinder_scene.add(axesHelper_cylinder);

    let controls = new OrbitControls(camera, renderer.domElement);

    update();

    let matArray = []

    // for(let i = 0; i < spheres.length;++i )
    // {
    //     let sphereargs = spheres[i]
    //     let sphere = new THREE.SphereGeometry(0.4)

    //     // sphereGeom = new THREE.CylinderGeometry( 0.4, 0.4, 0.7, 32 ); 
    //     let mat = getMaterial(vertexShaderGourard, fragmentShaderGourard, sphereargs)
    //     matArray.push(mat)
    //     let mesh = new THREE.Mesh(sphere,mat)
    //     sphere_scene.add(mesh)
    //     mesh.translateX(sphereargs.x)
    //     mesh.translateY(sphereargs.y)
    // }

    for(let i = 0; i < spheres.length;++i )
    {
        let shapeargs = spheres[i]
        
        let sphere = new THREE.SphereGeometry(0.4)
        let cylinder = new THREE.CylinderGeometry( 0.4, 0.4, 0.7, 32 ); 

        let mat = getMaterial(vertexShaderGourard, fragmentShaderGourard, shapeargs)

        matArray.push(mat)
        let sphere_mesh = new THREE.Mesh(sphere,mat)
        let cylinder_mesh = new THREE.Mesh(cylinder,mat)

        sphere_scene.add(sphere_mesh)
        cylinder_scene.add(cylinder_mesh)

        sphere_mesh.translateX(shapeargs.x)
        sphere_mesh.translateY(shapeargs.y)
        cylinder_mesh.translateX(shapeargs.x)
        cylinder_mesh.translateY(shapeargs.y)
    }
    
    // let mesh = new THREE.Mesh(sphere,material)
    // sphere_scene.add(mesh)

    document.addEventListener("keydown", (e)=>{
        switch(e.key){
            case 'x' || 'X':
                if(shadingModel == 'gourard'){
                    shadingModel = 'phong';
                    for(let i = 0; i < matArray.length; i++){
                        matArray[i].uniforms['model'] = {value: 1};
                        // material.needsUpdate(true);
                        // matArray[i].uniformsNeedUpdate = true;
                    }
                    break;
                }
                if(shadingModel == 'phong'){
                    shadingModel = 'gourard';
                    for(let i = 0; i < matArray.length; i++){
                        matArray[i].uniforms['model'] = {value: 0};
                        // material.needsUpdate(true);
                        // matArray[i].uniformsNeedUpdate = true;
                    }
                    break;
                }
            case 'v' || 'V':
                if(scene_option == 'sphere'){
                    scene_option = 'cylinder';
                    break;
                }
                if(scene_option == 'cylinder'){
                    scene_option = 'sphere';
                    break;
                }
                break;
            case '2':
                window.location.href = 'task_2.html'
                break;
            case '3':
                window.location.href = 'task_3.html'
                break;
            default:
                console.log("default key press: ", e.key);
                break;
        }
    
    })

    function update(){

        if(scene_option === 'sphere'){
            renderer.render(sphere_scene, camera);
        } else{
            renderer.render(cylinder_scene, camera);
        }
        requestAnimationFrame(update);
    }
    // debugger
}

main()