import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { getStandardMatteMaterial } from "./mesh_loading"
import {Solid} from "./solid"

export class Manager {
	static defaultCameraPosition = [1, 1, 1]
	static defaultCameraTarget = [0, 0, 0]
	static mgr

	constructor() {

		this.RENDERER = new THREE.WebGLRenderer()
		this.RENDERER.setSize(window.innerWidth-20, window.innerHeight-20)
		document.body.appendChild(this.RENDERER.domElement)
		this.SCENE = new THREE.Scene()

		this.CAMERA = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.CAMERA.up.set(0, 0, 1)
		this.CAMERA.position.set(...Manager.defaultCameraPosition)
		this.CAMERA.lookAt(new THREE.Vector3(...Manager.defaultCameraTarget))

		this.CONTROLS = new OrbitControls(this.CAMERA, this.RENDERER.domElement)

		// this.floorGeom = new THREE.PlaneGeometry(1000, 1000)
		// this.floorMaterial = getStandardMatteMaterial(0x0a0a0a)
		// this.floor = new THREE.Mesh(this.floorGeom, this.floorMaterial)
		// this.SCENE.add(this.floor)

		this.axesHelper = new THREE.AxesHelper(5)
		this.SCENE.add(this.axesHelper)

		this.lights = []
		for (let i = 0; i < 4; ++i) {
			this.lights.push(new THREE.DirectionalLight(0xffffff, 1))
		}
		this.lights[0].position.set(30, 0, 10)
		this.lights[1].position.set(-30, 0, 10)
		this.lights[2].position.set(0, 30, 10)
		this.lights[3].position.set(0, -30, 10)
		this.lights.map(light => this.SCENE.add(light))
		Manager.mgr = this 
		this.sceneSolids = {}
		this.apms = {}
		requestAnimationFrame(this.animate)
	}
	registerAnimation(apm)
	{
		this.apms[apm.name] = apm
		document.addEventListener(apm.endEvent.type, () => this.deregisterAnimation(apm.name))
	}
	deregisterAnimation(name) {
		if (this.apms[name] != undefined) {
			delete this.apms[name]
		}
	}
	animate(time) {
		const am = Manager.mgr
		if (am != null) {
			const solids = Object.values(am.sceneSolids)
			const n_solids = solids.length
			for(let i = 0; i < n_solids; ++i)
			{
				for(let j = i+1; j < n_solids; ++j)
				{
					if(Solid.isColliding(solids[i],solids[j]))
					{
						document.dispatchEvent(new CustomEvent(solids[i].name+" "+solids[j].name+" colliding"))
						document.dispatchEvent(new CustomEvent(solids[j].name+" "+solids[i].name+" colliding"))
					}
				}
			}
			Object.values(am.apms).map((obj) => obj.update(time))
			am.RENDERER.render(am.SCENE, am.CAMERA)
		}
		requestAnimationFrame(am.animate)
	}
	addSolid(solid)
	{
		this.sceneSolids[solid.name] = solid 
		this.SCENE.add(solid.mesh)
	}
}
