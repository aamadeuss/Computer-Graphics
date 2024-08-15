import * as THREE from "three"
import { Manager } from "./src/manager"
import { CylinderSolid, DummySolid, Solid,SphereSolid } from "./src/solid"
import { ConstantAccAPM, DampedOscillationAPM } from "./src/animation"
import { getStandardMatteMaterial,getStandardMetallicMaterial } from "./src/mesh_loading"
import { ExpTwoPointAPM } from "./src/animation"

const manager =new Manager()

manager.addSolid(
	new SphereSolid("sphere1",
		new THREE.Mesh(
			new THREE.SphereGeometry(0.3),
			getStandardMetallicMaterial(0xFF0000)
		),
		"sphere",
		0.3
	)
)
manager.addSolid(
	new SphereSolid("sphere2",
		new THREE.Mesh(
			new THREE.SphereGeometry(0.3),
			getStandardMetallicMaterial(0x0000FF)
		),
		"sphere",
		0.3
	)
)

manager.addSolid(
	new CylinderSolid(
		"cylinder",
		new THREE.Mesh(
			new THREE.CylinderGeometry(0.1,0.1,5),
			getStandardMetallicMaterial(0x777777)
		),
		"cylinder"
	)
)

manager.addSolid(
	new DummySolid(
		"dummy1",
		new THREE.Object3D(),
		"dummy"
	)
)
const dummymesh = manager.sceneSolids.dummy1.mesh
const cylmesh = manager.sceneSolids.cylinder.mesh

dummymesh.position.set(5,0,0)
dummymesh.attach(cylmesh)
dummymesh.attach(manager.sceneSolids["sphere2"].mesh)


cylmesh.translateX(5/2)
cylmesh.setRotationFromEuler(new THREE.Euler(0,0,Math.PI/2,"ZYX"))

console.log(manager.sceneSolids.cylinder.mesh.position,manager.sceneSolids.cylinder.mesh.rotation)

manager.sceneSolids["sphere1"].mesh.position.set(0,0,10)

manager.CAMERA.position.set(0,-10,0)

manager.CAMERA.lookAt(new THREE.Vector3(0,0,0))

manager.registerAnimation(new ConstantAccAPM("gravity", manager.sceneSolids["sphere1"],
	(obj,height)=>{const currpos = obj.mesh.position;obj.mesh.position.set(currpos.x,currpos.y,height)},
	0,
	10e-3,
	-10e-6
))

manager.registerAnimation(new ConstantAccAPM("forward", manager.sceneSolids["sphere1"],
	(obj,length)=>{const currpos = obj.mesh.position;obj.mesh.position.set(length,currpos.y,currpos.z)},
	-6,
	3e-3,
	0
))

document.addEventListener("sphere1 sphere2 colliding",()=>{
	document.dispatchEvent(manager.apms["gravity"].endEvent)
	document.dispatchEvent(manager.apms["forward"].endEvent)
	manager.registerAnimation(new DampedOscillationAPM(
		"damped",
		dummymesh,
		(obj,theta)=>{const axis = new THREE.Vector3(0,1,0);axis.normalize();obj.setRotationFromAxisAngle(axis,theta)},
		-Math.PI/2,
		2000,
		-Math.PI,
		Math.PI/2,
		20000,
		0.1,
		0.1,
		200
	))
}	
,
{once : true}
)


document.addEventListener("exppartEnd",()=>{
	
},
{once : true}
	
)