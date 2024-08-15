import { Transform } from "./glmat_transforms.js";
import {Mesh} from "./mesh.js"
/*
*   Adds animation functionality to the Mesh.
*/
export class AnimMesh extends Mesh
{
    /*
    *   associate an AnimationWrapper with this Mesh. 
    *   be sure to give the correct animationName!!! This must match
    *   <AnimationWrapper>.animationName for the events to work properly!
    */
    addAnimationWrapper(preparedAnimationWrapper,animationName)
    {
        this.animationWrapper = preparedAnimationWrapper
        this.baseTransform = new Transform(this.transform) // During the animation, this is unchanged
        if(this.animationWrapper.ends) // If the animation has a logical end, update the baseTransform once the end event is raised.
        {
            document.addEventListener(animationName+'Done',this.updateBaseTransform)
        }
    }
    updateBaseTransform()// Called once the animation ends.
    {
        console.log('animation_done.')
        this.transform = this?.animationWrapper.lastGenerated
    }
    applyAnim(args)// Call this whenever there is a change in the args
    {
        this.transform=Transform.multiply(this.baseTransform,this.animationWrapper.applyAnim(args))
    }
}