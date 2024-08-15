import * as THREE from "three"
import { RenderHandler } from "./rendering"
const BROWN = new THREE.Vector4(81/255,7/255,7/255, 1)
const RED = new THREE.Vector4(255/255,0/255,0/255,1)
const WHITE = new THREE.Vector4(255/255,255/255,255/255,1)
const vertexShaderSrc = `

uniform vec3 u_dir_light_negdir;
varying vec3 v_normal;
varying vec3 dir_light_negdir;
void main() {
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  v_normal = mat3(viewMatrix) * normal;
  dir_light_negdir = mat3(viewMatrix)* u_dir_light_negdir;
}
`

const fragmentShaderSrc = `

varying vec3 v_normal;
uniform vec4 ambient_color;
uniform vec4 diffuse_color;
uniform vec4 specular_color;
uniform float ambient;
uniform float diffuse;
uniform float specular;
uniform float reflectance;
varying vec3 dir_light_negdir;


void main()
{
    vec3 n_dir_light_negdir = normalize(dir_light_negdir);
    vec3 n_v_normal = normalize(v_normal);
    vec3 n_v_position = normalize(gl_FragCoord.xyz);
    vec3 n_halfway = normalize(n_dir_light_negdir + vec3(0.,0.,1.));

    gl_FragColor.rgb = (ambient_color.rgb)*ambient + 
      (diffuse_color.rgb)*max(0.0,dot(n_v_normal,n_dir_light_negdir))*diffuse +
     (specular_color.rgb)*pow(max(0.0,dot(n_v_normal,n_halfway)),reflectance)*specular;

    gl_FragColor.w = 1.0;
}
`
function main()
{

    let rh = new RenderHandler()
    let sphere = new THREE.SphereGeometry(0.6)
    sphere.computeVertexNormals()
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
    //  Custom uniforms must be defined in BOTH the uniforms property of your ShaderMaterial, & in ShaderSrc
    // whereas any custom attributes must be defined via BufferAttribute instances. 
    // Note that varyings only need to be declared within the shader code (not within the material).


    let material = new THREE.ShaderMaterial()
    
    material.vertexShader = vertexShaderSrc
    material.fragmentShader = fragmentShaderSrc
    material.uniforms["u_color"]={value:new THREE.Vector4(0.5,0.5,1,1)}
    material.uniforms["light_color"]={value:new THREE.Vector4(1,1,1,1)}
    material.uniforms["u_dir_light_negdir"]={value:new THREE.Vector3(1,1,1)}
    material.uniforms["ambient"]={value:0.5}
    material.uniforms["diffuse"]={value:0.5}
    material.uniforms["specular"]={value:0.5}
    material.uniforms["reflectance"]={value:200}
    material.uniforms["ambient_color"]={value:BROWN}
    material.uniforms["diffuse_color"]={value:RED}
    material.uniforms["specular_color"]={value:WHITE}
    
   
    let mesh = new THREE.Mesh(sphere,material)
    rh.SCENE.add(mesh)
    // debugger
}

main()

/*

Phong lighting: Ambient (adirectional) + diffuse (directional, shadow-based) + specular

*/