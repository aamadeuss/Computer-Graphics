import * as THREE from "three"
import { RenderHandler } from "./rendering"

const vertexShaderSrc = `
precision mediump float;
void main() {
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

  
  
}
`

const fragmentShaderSrc = `
precision mediump float;

uniform vec4 u_color;

// varying vec4 v_color;

void main(){
    gl_FragColor = u_color;
}
`
function main()
{
    let rh = new RenderHandler()
    let sphere = new THREE.SphereGeometry(0.6)
    // https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram 
    // 
    // built in GLSL variables provided by THREE
    // you do not need to initialize these 
    // VSHADER:
    // 
    // vertex attributes position, normal and uv.
    //
    // uniforms 
    // mat4 projectionMatrix (perspective/ortho), 
    // mat4 modelViewMatrix(camera-as-world-0),
    // mat3 normalMatrix
    // vec3 cameraPosition
    //
    // FSHADER:
    //
    // uniforms mat4 viewMatrix, vec3 cameraPosition
    //
    //  Custom uniforms must be defined in BOTH the uniforms property of your ShaderMaterial, 
    // whereas any custom attributes must be defined via BufferAttribute instances. 
    // Note that varyings only need to be declared within the shader code (not within the material).


    let material = new THREE.ShaderMaterial()
    
    material.vertexShader = vertexShaderSrc
    material.fragmentShader = fragmentShaderSrc
    material.uniforms["u_color"]={value:new THREE.Vector4(0.5,0.5,1,1)}
    // let material = new THREE.MeshStandardMaterial({
    //     color:0x049ef4,
    //     roughness:0.001,
    //     metalness:0.1
    // })
    
    let mesh = new THREE.Mesh(sphere,material)
    rh.SCENE.add(mesh)
    debugger
}

main() 