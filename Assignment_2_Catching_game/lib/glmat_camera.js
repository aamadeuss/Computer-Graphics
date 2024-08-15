import { Transform, GLMAT } from "./glmat_transforms.js";
export { Transform, GLMAT } from "./glmat_transforms.js";
export class Camera
{
    /*
        * 
        If perspective, args = {
            type:"perspective",
            near: <number>,
            far: <number>,
            fovy: <number>,
            aspect: <number>,
            cameraTransform: Transform()}

        If orthographic, args = {
            type:"orthographic",
            near: <number>,
            far: <number>,
            left: <number>,
            right: <number>,
            bottom: <number>,
            top: <number>,
            cameraTransform: Tranform()
        }
    }
        */
    constructor(args)
    {
        this.init_args = args
        this.reset()
    }

    reset()
    {
        this.type = this.init_args["type"]
        this.near = this.init_args["near"]
        this.far = this.init_args["far"]
        
        if(this.type == 'perspective')
        {
            this.fovy = this.init_args['fovy']
            this.aspect = this.init_args['aspect']
            this.constructor_perspective()
            
        }
        else if(this.type == 'orthographic')
        {
            this.left = this.init_args["left"]
            this.right = this.init_args["right"]
            this.bottom = this.init_args["bottom"]
            this.top = this.init_args["top"]
            this.constructor_ortho()
        }
        else
        {
            throw new RangeError('type should be either "perspective" or "orthographic"')
        }
        
        this.cameraTransform = new Transform(this.init_args["cameraTransform"])
        this.retargetGlobal(new Float32Array([0,0,0]))
    }

    constructor_perspective()
    {
        var projectionMatrix = GLMAT.mat4.perspective(new GLMAT.mat4.create(), Transform.degToRad(this.fovy), this.aspect,this.near,this.far)
        this.projectionTransform = new Transform(projectionMatrix)
    }
    constructor_ortho()
    {
        var projectionMatrix = GLMAT.mat4.ortho(new GLMAT.mat4.create(),this.left,this.right,this.bottom,this.top,this.near,this.far)   
        this.projectionTransform = new Transform(projectionMatrix)
    }
    setFovDegrees(deg)
    {
        this.fovy=deg
        this.constructor_perspective()
    }
    /*
    * Given a target vector in the global 3D frame of reference, rotate the camera to "look at" that target.
    */
    retargetGlobal(targetVecGlobal)
    {
        var currentTranslate = GLMAT.mat4.getTranslation(new GLMAT.vec3.create(), this.cameraTransform.transformMatrix)
        
        currentTranslate = GLMAT.vec3.scale(currentTranslate, currentTranslate,-1)
        var toReorientTo = GLMAT.vec3.add(GLMAT.vec3.create(),targetVecGlobal,currentTranslate) 
        const previousOrientation = new Float32Array([
            -this.cameraTransform.transformMatrix[8],
            -this.cameraTransform.transformMatrix[9],
            -this.cameraTransform.transformMatrix[10],
        ])
        const retargetQuat = Transform.quatFromDeltaVec(previousOrientation,toReorientTo)
        
        const retargetMat4 = GLMAT.mat4.fromQuat(new GLMAT.mat4.create(), retargetQuat)
        
        this.cameraTransform.applyTransform(new Transform(retargetMat4),false)
        // console.log(retargetQuat)
        
    }
    /*
    * Given a matrix in the global frame, apply the camera transform to that frame.
    * Call this on a primitive's transform JUST BEFORE the gl.draw() call.
    */
    getProjected(primitive_transform)
    {
        var newt = Transform.multiply(
            this.projectionTransform,this.cameraTransform.getInverseTransform()
            )
        
        newt = Transform.multiply(newt,primitive_transform)
        return newt
    }
    
}