uniform vec3 u_dir_light_negdir;
varying vec3 v_normal;
varying vec3 dir_light_negdir;
void main() {
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  v_normal = mat3(viewMatrix) * normal;
  dir_light_negdir = mat3(viewMatrix)* u_dir_light_negdir;
}
