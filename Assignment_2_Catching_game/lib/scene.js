/*
*	A holder for various objects in the scene.
*	The constructor doeswn't do much; add the primitive Mesh (or descendant) objects using <sceneobj>.add(<Mesh>)
*	Also add the camera using <sceneobj>.addCameraObj(<Camera>)
*/
export class Scene
{
    constructor(){
        this.primitives = []
    }
	addCameraObj(cameraObj)
	{
		this.cameraObj = cameraObj
	}

	/*
	*	Call this just before the gl.drawArrays() calls.
	*/
	getToRender(primitive)
	{
		primitive.applyDynamicScaling()
		return this.cameraObj.getProjected(primitive.renderTransform)
	}

    add(primitive)
	{
		if( this.primitives && primitive )
		{
			this.primitives.push(primitive)
            
		}
	}

    remove(primitive) 
	{
		if (this.primitives && primitive) {
			let index = this.primitives.indexOf(primitive);
			if (index > -1) {
				this.primitives.splice(index, 1);
			}
		}
	}

    getPrimitives() 
	{
		return this.primitives;
	}


	getPrimitive(index) 
	{
		return this.primitives[index];
	}


	getPrimitiveIndex(primitive) 
	{
		return this.primitives.indexOf(primitive);
	}
}