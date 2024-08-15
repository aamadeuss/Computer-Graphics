import * as THREE from "three"

const BROWN = new THREE.Vector4(81/255,7/255,7/255, 1)
const RED = new THREE.Vector4(255/255,0/255,0/255,1)
const WHITE = new THREE.Vector4(255/255,255/255,255/255,1)
let scene_option = 'sphere';

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

const spheres = [
  {x:0,y:0,ambient:1,diffuse:0,specular:0,reflectance:20,ambient_color:BROWN,diffuse_color:RED,specular_color:WHITE},
  {x:0,y:1,ambient:1,diffuse:0.5,specular:0,reflectance:20,ambient_color:BROWN,diffuse_color:RED,specular_color:WHITE},
  {x:0,y:2,ambient:1,diffuse:1,specular:0,reflectance:20,ambient_color:BROWN,diffuse_color:RED,specular_color:WHITE},
  {x:1,y:0,ambient:1,diffuse:0,specular:1,reflectance:35,ambient_color:BROWN,diffuse_color:RED,specular_color:WHITE},
  {x:1,y:1,ambient:1,diffuse:0.5,specular:1,reflectance:35,ambient_color:BROWN,diffuse_color:RED,specular_color:WHITE},
  {x:1,y:2,ambient:1,diffuse:1,specular:1,reflectance:35,ambient_color:BROWN,diffuse_color:RED,specular_color:WHITE},
  {x:2,y:0,ambient:1,diffuse:0,specular:2,reflectance:35,ambient_color:BROWN,diffuse_color:RED,specular_color:WHITE},
  {x:2,y:1,ambient:1,diffuse:0.5,specular:2,reflectance:35,ambient_color:BROWN,diffuse_color:RED,specular_color:WHITE},
  {x:2,y:2,ambient:1,diffuse:1,specular:2,reflectance:35,ambient_color:BROWN,diffuse_color:RED,specular_color:WHITE}
]

const lights = [
  {
    position_worldframe:[-60,60,60],
    direction_worldframe:[1,-1,-1],
    ill_angle:180,
    decay_angle:15,
    FLAG_PARALLEL:1,
    intensity:1},
  {
    position_worldframe:[0,0,-10],
    direction_worldframe:[0,0,1],
    ill_angle:15,
    decay_angle:15,
    FLAG_PARALLEL:0,
    intensity:1}
]
const lightsData = transpose(lights) 

const vertexShaderSrc = `
#ifndef N_LIGHTS
#define N_LIGHTS ${lights.length}
#endif
varying vec3  surf_normal;
varying vec4  this_position;
varying mat4  _viewMatrix;
varying mat3 _normalMatrix;
varying mat4 _projectionMatrix;
varying mat4 _modelViewMatrix;
void main() {
  this_position = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix *this_position;
  surf_normal = normal;
  _viewMatrix = viewMatrix;
  _normalMatrix=normalMatrix;
  _projectionMatrix = projectionMatrix;
  _modelViewMatrix = modelViewMatrix;
}
`

const fragmentShaderSrc = `
#ifndef N_LIGHTS
#define N_LIGHTS ${lights.length}
#endif

uniform vec3  light_position_worldframes[N_LIGHTS]; 
uniform vec3  light_direction_worldframes[N_LIGHTS]; 


varying vec4  this_position;
varying vec3 surf_normal; 
varying mat4  _viewMatrix;
varying mat3 _normalMatrix;
varying mat4 _projectionMatrix;
uniform float light_ill_angles[N_LIGHTS];
uniform float light_intensitys[N_LIGHTS];
uniform float FLAG_LIGHT_PARALLELs[N_LIGHTS];
uniform float light_decay_angles[N_LIGHTS];

uniform vec4 ambient_color;
uniform vec4 diffuse_color;
uniform vec4 specular_color;
uniform float ambient;
uniform float diffuse;
uniform float specular;
uniform float reflectance;


void main()
{
    vec4  light_positions[N_LIGHTS]; 
    vec3  light_directions[N_LIGHTS];
    vec3 light_direction;
    vec4 light_position;
    float light_ill_angle;
    float FLAG_LIGHT_PARALLEL;
    float light_intensity;

    vec3 n_light_direction;
    vec3 n_light_relative_position;
    float angle_from_light_dir;
    float angle_criterion;
    vec3 n_light_ray_out;
    vec3 n_v_normal;
    vec3 n_v_position;
    vec3 n_halfway;
    float light_decay_angle;
    int i;
    vec4 final;
    for(i = 0; i < N_LIGHTS; ++i)
    {
      light_decay_angle = light_decay_angles[i];
      light_positions[i] = _viewMatrix * vec4(light_position_worldframes[i],1.0);
      light_directions[i]= mat3(_viewMatrix)*light_direction_worldframes[i];
      light_direction = light_directions[i];
      light_position = light_positions[i];
      light_ill_angle = light_ill_angles[i]; 
      FLAG_LIGHT_PARALLEL = FLAG_LIGHT_PARALLELs[i];
      light_intensity = light_intensitys[i];

      n_light_direction = -1.*normalize(light_direction);
      n_light_relative_position = normalize((light_position.xyz - this_position.xyz));
      angle_from_light_dir = acos(dot(n_light_relative_position,n_light_direction));
      angle_criterion = max(
        FLAG_LIGHT_PARALLEL,cos(0.5*3.14*min(
          light_decay_angle,max(
            angle_from_light_dir-light_ill_angle,0.
            )
          )/(light_decay_angle))
        );
      n_light_ray_out = FLAG_LIGHT_PARALLEL*n_light_direction + (1.0-FLAG_LIGHT_PARALLEL)*n_light_relative_position;  
      n_v_normal = normalize(mat3(_viewMatrix)*surf_normal);
      
      n_halfway = normalize(n_light_ray_out+normalize(cameraPosition));
      final.rgb =final.rgb+ (diffuse_color.rgb)*max(0.0,dot(n_v_normal,n_light_ray_out))*diffuse*angle_criterion*light_intensity +
    (specular_color.rgb)*max(0.,pow(max(0.0,dot(n_v_normal,n_halfway)),reflectance)*specular*angle_criterion*light_intensity);
    }
    final.w = 1.;
    final.rgb = final.rgb + ambient*ambient_color.rgb;
    final.rgb = min(final.rgb,1.);
    gl_FragColor=final;
       
}
`

function transpose(arr){
  let obj = {}
  const keys = Object.keys(arr[0])
  
  for(let i = 0; i < keys.length; ++i)
  {
    let key = keys[i]
    obj[key] = []
    for(let j = 0; j < arr.length;++j)
    {
      obj[key].push(arr[j][key])
    }
  }
  return obj
}

function getMaterial(vertexShaderSrc,fragmentShaderSrc,lightsData,margs)
{
  let material = new THREE.ShaderMaterial()

  material.vertexShader = vertexShaderSrc
  material.fragmentShader = fragmentShaderSrc
  material.uniforms["light_position_worldframes"]={value:lightsData.position_worldframe.map(i=>new THREE.Vector3(...i))}
  material.uniforms["light_direction_worldframes"]={value:lightsData.direction_worldframe.map(i=>new THREE.Vector3(...i))}
  material.uniforms["light_ill_angles"]={value: lightsData.ill_angle.map(i=>THREE.MathUtils.degToRad(i))}
  material.uniforms["light_decay_angles"]={value: lightsData.decay_angle.map(i=>THREE.MathUtils.degToRad(i))}
  material.uniforms["FLAG_LIGHT_PARALLELs"]={value:lightsData.FLAG_PARALLEL}
  material.uniforms["light_intensitys"]={value:lightsData.intensity}
  material.uniforms["ambient"]={value:margs.ambient}
  material.uniforms["diffuse"]={value:margs.diffuse}
  material.uniforms["specular"]={value:margs.specular}
  material.uniforms["reflectance"]={value:margs.reflectance}
  material.uniforms["ambient_color"]={value:margs.ambient_color}
  material.uniforms["diffuse_color"]={value:margs.diffuse_color}
  material.uniforms["specular_color"]={value:margs.specular_color}
  return material
}



function main()
{

  const RENDERER = new THREE.WebGLRenderer()
  RENDERER.setSize( window.innerWidth, window.innerHeight)
  RENDERER.setClearColor( 0x00cccc, 1);
  document.body.appendChild(RENDERER.domElement)
  const SCENE_SPHERE = new THREE.Scene()
  const SCENE_CYLINDER= new THREE.Scene()

  // const CAMERA = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
  const FACTOR = 0.005
  const OFFSET = [1,1]
  const CAMERA = new THREE.OrthographicCamera(OFFSET[0]-FACTOR*window.innerWidth,OFFSET[0]+FACTOR*window.innerWidth,OFFSET[1]+FACTOR*window.innerHeight,OFFSET[1]-FACTOR*window.innerHeight,0.1,2000)
  CAMERA.up.set(0,1,0)
  CAMERA.position.set(1,3,100)
  const CONTROLS  = new OrbitControls(CAMERA, RENDERER.domElement) 
  // SCENE_SPHERE.add(new THREE.AxesHelper(100)) 
    let sphere_mesh, cylinder_mesh
    let sphereGeom, cylinderGeom
    let mat
    let shapeArgs
    for(let i = 0; i < spheres.length;++i )
    {
      shapeArgs = spheres[i]

      cylinderGeom = new THREE.CylinderGeometry( 0.4, 0.4, 0.7, 32 ); 
      sphereGeom = new THREE.SphereGeometry( 0.4 ); 

      mat = getMaterial(vertexShaderSrc,fragmentShaderSrc,lightsData,shapeArgs)

      sphere_mesh = new THREE.Mesh(sphereGeom, mat);
      cylinder_mesh = new THREE.Mesh(cylinderGeom, mat)

      SCENE_SPHERE.add(sphere_mesh)
      SCENE_CYLINDER.add(cylinder_mesh)

      sphere_mesh.translateX(shapeArgs.x)
      sphere_mesh.translateY(shapeArgs.y)
      cylinder_mesh.translateX(shapeArgs.x)
      cylinder_mesh.translateY(shapeArgs.y)
    }

    document.addEventListener("keydown", (e)=>{
      switch(e.key){
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
          case '1':
              window.location.href = 'task_1.html'
              break;
          case '3':
              window.location.href = 'task_3.html'
              break;
          default:
            console.log("default key press: ", e.key);
            break;
      }
  
  })
    requestAnimationFrame(animate)
    function animate(time)
    {
      if(scene_option === 'sphere'){
        RENDERER.render(SCENE_SPHERE,CAMERA)
      } else{
       RENDERER.render(SCENE_CYLINDER,CAMERA)
      }
            
      requestAnimationFrame(animate)
    }

    
}

main()