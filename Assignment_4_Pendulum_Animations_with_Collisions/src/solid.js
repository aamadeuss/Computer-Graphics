import * as THREE from "three"
export class Solid{

	constructor(name,mesh,type)
	{
		this.name=name
		this.mesh=mesh
		this.type=type
	}
	static isColliding(solid1, solid2)
	{
		const evalfn = Solid.colliderMap[solid1.type+" "+solid2.type]
		if(evalfn != null)
		{
			return evalfn(solid1,solid2)
		} 
		else return false 
		
	}
	static colliderMap = {
		"sphere sphere":this.isCollidingSphereSphere,
		"sphere cylinder":this.isCollidingSphereCylinder, 
		"sphere cuboid":this.isCollidingSphereCuboid,
		"cylinder sphere":(cylinder,sphere)=>this.isCollidingSphereCylinder(sphere,cylinder),
		"cylinder cylinder":this.isCollidingCylinderCylinder, 
		"cylinder cuboid":this.isCollidingCylinderCuboid,
		"cuboid sphere":(cuboid,sphere)=>this.isCollidingSphereCuboid(sphere,cuboid),
		"cuboid cylinder":(cuboid,cylinder)=>this.isCollidingCylinderCuboid(cylinder,cuboid),
		"cuboid cuboid":this.isCollidingCuboidCuboid,
	}
	static isCollidingSphereSphere(sphere1,sphere2)
	{
		const sphere1_pos = sphere1.mesh.getWorldPosition(new THREE.Vector3())
		const sphere2_pos = sphere2.mesh.getWorldPosition(new THREE.Vector3())
		const diff_length = new THREE.Vector3().subVectors(sphere1_pos,sphere2_pos).length() 
		return (diff_length < sphere1.radius+sphere2.radius)
	}

	static isCollidingSphereCylinder(sphere,cylinder)
	{
		//tbd
	}

	static isCollidingSphereCuboid(sphere,cuboid)
	{

	}

	static isCollidingCylinderCylinder(cylinder1,cylinder2)
	{

	}

	static isCollidingCylinderCuboid(cylinder,cuboid)
	{

	}

	static isCollidingCuboidCuboid(cuboid1,cuboid2)
	{

	}
}

export class SphereSolid extends Solid{
	constructor(name,mesh,type,radius){
		super(name,mesh,type)
		this.radius = radius
	}
}

export class CylinderSolid extends Solid{

}
export class CuboidSolid extends Solid{

}
export class DummySolid extends Solid{

}
/*
	s = ut + 0.5at^2
	v = u + at 
	2as = v^2 - u^2
	-u = u + gt 
	t = 2u/g
	t = 2*10/10 = 2s
*/