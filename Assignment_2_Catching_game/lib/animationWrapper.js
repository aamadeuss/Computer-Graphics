import { Transform, GLMAT } from "./glmat_transforms.js"
/*
*   The basic workflow for the animations is that you create an <AnimationWrapper-child>, then you call prepareAnim with the 
*   appropriate args (depending on the animation type). 
*   
*   Then, whenever there is a change in the parameter to the animation, call applyAnim which should return a Transform. Apply
*   that transform to whatever object you wish to animate. Typically this should be called in <AnimMeshObj>.applyAnim() or
*   <CameraObj>.applyAnim(args).
*   When you're done, you should call finishAnim(). Or check that the AnimationWrapper subclass is calling finishAnim()
*/

// DO NOT INSTANTIATE DIRECTLY
export class AnimationWrapper{
    constructor(animationName)
    {
        this.animationName=animationName // Keep track of this
        this.firstTime=true // flag
        this.lastGenerated=new Transform() // the last generated transform. At the begi
    }
    prepareAnim(args)
    {
        if(this.firstTime)
        { 
            this.prepareTransformGenerator(args)
        }       
    }
    applyAnim(args)
    {
    this.lastGenerated = this.generateTransform(args)
    return this.lastGenerated
    }
    finishAnim()
    {
        this.ev = new Event(this.animationName+'Done')
        dispatchEvent(this.ev)
        
    }
    generateTransform(args)
    {
        throw Error('subclass this!')
    }
    prepareTransformGenerator(args)
    {
        throw Error('subclass this!')
    }
}

// DO NOT INSTANTIATE DIRECTLY 
// It'll work, I guess; but it doesn't have an end. You'll have to manually create an end (or have an event from outside do it).
export class ParametricP2PWrapper extends AnimationWrapper{
    prepareTransformGenerator(args)//{baseTransform:<Transform>,targetTransform:<Transform>}
    {
        this.baseTransform = args.baseTransform // The starting transform before the animation starts
        this.targetTransform = args.targetTransform // The end transform desired, in the same coordinate frame (same parent) as the base transform
        const baseInvTransform = this.baseTransform.getInverseTransform() 
        const endTransform = this.targetTransform
        const deltaTransform = Transform.multiply(baseInvTransform, endTransform)
        const deltaQuat = GLMAT.mat4.getRotation(new GLMAT.quat.create(),deltaTransform.transformMatrix) 
        this.deltaAxis = GLMAT.vec3.create()
        this.deltaTheta = GLMAT.quat.getAxisAngle(this.deltaAxis,deltaQuat)
        this.deltaPos = GLMAT.mat4.getTranslation(GLMAT.vec3.create(),deltaTransform.transformMatrix)
        
    }
    generateTransform(args)//{param:number}
    {
        const param = args.param
        const newQuat = GLMAT.quat.setAxisAngle(new GLMAT.quat.create(),this.deltaAxis,param*this.deltaTheta)
        const newPos = GLMAT.vec3.scale(new GLMAT.vec3.create(),this.deltaPos,param)
        const newMatrix = GLMAT.mat4.fromRotationTranslation(GLMAT.mat4.create(),newQuat,newPos)
        
        return new Transform(newMatrix)
    }
}

// THIS WORKS
// Constant velocity point-to-point i.e. having a beginning and an end
export class ConstVelP2PWrapper extends ParametricP2PWrapper
{   //
    prepareTransformGenerator(args)// {baseTransform:<Transform>,targetTransform:<Transform>,animTimeInterval:number}
    {
        super.prepareTransformGenerator(args)
        this.animTimeInterval = args.animTimeInterval // How long will this object move, at constant V?
        this.ends=true
    }
    generateTransform(args)// {time:number}
    {
        const time = args.time
        if(this.firstTime)
        {
            this.firstTime=false
            this.baseTime = time 
            this.endTime = time + this.animTimeInterval
        } 
        if(time >= this.endTime)
        {
            console.log('TIME IS UP NOW!')
            this.finishAnim()
        }
        return super.generateTransform({param:(time-this.baseTime)/(this.animTimeInterval)})
    }
}

// Work in progress. Needs a limit angle as well.
export class ParametricWithEndP2PWrapper extends ParametricP2PWrapper
{
    prepareTransformGenerator(args)//{baseTransform:<Transform>,targetTransform:<Transform>, limit_distance:<number>}
    {
        super.prepareTransformGenerator(args)
        this.limit_distance = args.limit_distance
        this.ends=true
    }
    generateTransform(args)//{param:number}
    {
        const toReturn = super.generateTransform(args)
        this.deltaPos 
        const endPos = GLMAT.mat4.getTranslation(GLMAT.vec3.create(), toReturn.transformMatrix) 
        const remainingVec = GLMAT.vec3.subtract(GLMAT.vec3.create(),this.deltaPos,this.endPos)
        const remainingDistance = Math.sqrt(GLMAT.vec3.dot(remainingVec,remainingVec))
        if(remainingDistance < this.limit_distance)
        {
            this.finishAnim()
        }
        return toReturn
    }
}

