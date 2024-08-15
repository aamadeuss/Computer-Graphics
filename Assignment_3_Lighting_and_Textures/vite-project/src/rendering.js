import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export class RenderHandler{
	constructor(){
        
		this.RENDERER = new THREE.WebGLRenderer()
		this.RENDERER.setSize( window.innerWidth, window.innerHeight)
		document.body.appendChild(this.RENDERER.domElement)
		this.SCENE = new THREE.Scene()
		
		this.CAMERA = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
		this.CAMERA.up.set(0,0,1)
		this.CAMERA.position.set(0,0,1)
        
		this.axesHelper = new THREE.AxesHelper( 5 )
        
		this.light = new THREE.DirectionalLight(0xffffff, 1)
		this.light.position.set(3,0,1)
		this.SCENE.add(this.light)
		
		this.SCENE.add(this.axesHelper)
		this.CONTROLS  = new OrbitControls( this.CAMERA, this.RENDERER.domElement)
        RenderHandler.animateOuter(this)
	}
	static animateOuter(obj)
	{
		function animateInner(time)
		{
			if(obj.RENDERER != null){obj.RENDERER.render(obj.SCENE,obj.CAMERA)}
            
			requestAnimationFrame(animateInner)
		}
		animateInner(null)
	}
}