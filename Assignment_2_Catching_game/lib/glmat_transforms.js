import * as GLMAT from "./extern-include/glm/dist/esm/index.js"
export * as GLMAT from "./extern-include/glm/dist/esm/index.js"  
export class Transform
{
    /*
    *   The constructor accepts Float32Array, Transform, and null. 
    */
    constructor(arg){
        
        if(arg?.constructor.name =='Float32Array') {
            this.transformMatrix = new Float32Array(arg)
        }
        else if(arg?.constructor.name == 'Transform')
        {
            this.transformMatrix = new Float32Array(arg.transformMatrix)
        }
        else if (arg == null){
            this.transformMatrix = GLMAT.mat4.create()
        }
        else
        {
            throw TypeError('arg to constructor of Transform can only be null, Transform or Float32Array')
        }
    }
    /*
    *   All static functions ignore the current stored transform (hence, static). 
    *   Given two vectors, find the quaternion that takes you from the origin vector to the new vector.
    *   Both of these vectors should be in the frame of reference of the transform you wish to apply newQuat to.
    *   e.g. if you wish to use this to make the camera look at newVec, when it was previously at origVec,
    *   you need to pass both with respect to the camera frame.
    */
    static quatFromDeltaVec(origVec, newVec)
    {
        origVec = GLMAT.vec3.clone(origVec)
        
        origVec = GLMAT.vec3.normalize(origVec, origVec)
        
        newVec = GLMAT.vec3.clone(newVec)
        
        newVec = GLMAT.vec3.normalize(newVec, newVec)
        var axis = GLMAT.vec3.cross(GLMAT.vec3.create(),origVec,newVec)
        axis = GLMAT.vec3.normalize(axis,axis)
        var wvec = GLMAT.vec3.create()
        wvec = GLMAT.vec3.add(wvec,origVec,newVec)
        wvec = GLMAT.vec3.scale(wvec, wvec, 0.5)
        var w = Math.sqrt(GLMAT.vec3.dot(wvec,wvec))
        axis = GLMAT.vec3.scale(axis,axis,Math.sqrt(1-w*w))
        var newQuat= GLMAT.quat.fromValues(axis[0],axis[1],axis[2],w)
        
        return newQuat
    }
    /*
    *   A console.log() friendly representation of the matrix, for debugging purposes. This is transposed so that this matches
    *   the pen-and-paper calculations using mat4s, instead of the OpenGL format.
    */

    stringRepr(){
        var tosee = GLMAT.mat4.transpose(GLMAT.mat4.create(),this.transformMatrix)
        tosee = tosee.map(x=>(Math.round(1000*x)/1000))
        tosee = [0,1,2,3].map((x)=>tosee.slice(4*x,4*(x+1)))
        tosee=tosee.map((x)=>x.join('\t'))
        tosee = tosee.join('\n')
        tosee = '\n'+tosee
        return tosee
    }
    /*
    *   All static functions ignore the current stored transform (hence, static). 
    *   radian to degree
    */
    static radToDeg(r) {
        return r * 180 / Math.PI;
    }
    /*
    *   All static functions ignore the current stored transform (hence, static). 
    *   degree to radian
    */    
    static degToRad(d) {
        return d * Math.PI / 180;
    }
    /*
    *   Returns the translation vec3 of the current Transform
    */
    getTranslationVec(){
        return GLMAT.mat4.getTranslation(GLMAT.vec3.create(), this.transformMatrix)
    }

    /*
    *   Returns the inverse Transform of the current Transform
    */
    getInverseTransform(){
        return new Transform(GLMAT.mat4.invert(GLMAT.mat4.create(),this.transformMatrix))
    }


    /*
    *   Returns a new translation Transform from tx, ty, tz
    */
    static makeTranslationTransform(tx, ty, tz) {
        return new Transform(GLMAT.mat4.fromTranslation(GLMAT.mat4.create(),new Float32Array([tx, ty, tz])))
    }

    /*
    *   All static functions ignore the current stored transform (hence, static). 
    *   Returns a new rotation Transform, rotated about the X-axis.
    */
    static makeXRotationTransform(angleInDeg) {
        return new Transform(GLMAT.mat4.fromRotation(GLMAT.mat4.create(), Transform.degToRad(angleInDeg),new Float32Array([1,0,0])))
    }

    /*
    *   All static functions ignore the current stored transform (hence, static). 
    *   Returns a new rotation Transform, rotated about the Y-axis.
    */
    static makeYRotationTransform(angleInDeg) { 
        return new Transform(GLMAT.mat4.fromRotation(GLMAT.mat4.create(), Transform.degToRad(angleInDeg),new Float32Array([0,1,0])))
    }
    
    /*
    *   All static functions ignore the current stored transform (hence, static). 
    *   Returns a new rotation Transform, rotated about the Z-axis.
    */
    static makeZRotationTransform(angleInDeg) {// Keep as static
        return new Transform(GLMAT.mat4.fromRotation(GLMAT.mat4.create(), Transform.degToRad(angleInDeg),new Float32Array([0,0,1])))
    }
    
    /*
    *   Returns a new rotation Transform using the given Quaternion vec4
    */
    static makeQuatTransform(quat){
        return new Transform(GLMAT.mat4.fromQuat(new GLMAT.mat4.create(),quat))
    }

    /*
    *   All static functions ignore the current stored transform (hence, static). 
    *   Returns a new rotation Transform, using Euler angles theta1, theta2, theta3
    */
    static makeEulerTransform(theta1,theta2,theta3)
    {
        const quat = GLMAT.quat.fromEuler(new GLMAT.quat.create(), theta1,theta2,theta3)
        return Transform.makeQuatTransform(quat)
    }

    /*
    *   All static functions ignore the current stored transform (hence, static). 
    *   Returns a new scaling Transform, using scaling coefficients sx, sy ,sz
    */
    static makeScalingTransform(sx, sy, sz) {
        return new Transform(GLMAT.mat4.fromScaling(GLMAT.mat4.create(),new Float32Array([sx,sy,sz])))
    }
    
    /*
    *   All static functions ignore the current stored transform (hence, static). 
    *   Returns the product of two Transforms aas a new Transform
    */
    static multiply(a, b) {        
        return new Transform(GLMAT.mat4.multiply(GLMAT.mat4.create(),a.transformMatrix, b.transformMatrix))
    }

    /*
    *   Applies "a" (the arg) to the current Transform. wrtParent defines the order of multiplication
    */
    applyTransform(a, wrtParent=true)
    {
        if(wrtParent)
        {
            this.transformMatrix = Transform.multiply(a, this).transformMatrix
        }
        else
        {
            this.transformMatrix = Transform.multiply(this, a).transformMatrix
        }
    }

    /*
    *   applies the specified translation to the current Transform
    */
    applyTranslate(x,y,z,wrtParent=true)
    {
        this.applyTransform(Transform.makeTranslationTransform(x,y,z),wrtParent)
    }

    /*
    *   applies the specified Euler rotation to the current Transform
    */
    applyEuler(theta1,theta2,theta3,wrtParent=true)
    {
        this.applyTransform(Transform.makeEulerTransform(theta1,theta2,theta3),wrtParent)
    }

    /*
    *   applies the specified X rotation to the current Transform
    */
    applyXrot(theta,wrtParent)
    {
        this.applyTransform(Transform.makeXRotationTransform(theta),wrtParent)
    }

    /*
    *   applies the specified Y rotation to the current Transform
    */
    applyYrot(theta,wrtParent)
    {
        this.applyTransform(Transform.makeYRotationTransform(theta),wrtParent)
    }

    /*
    *   applies the specified Z rotation to the current Transform
    */
    applyZrot(theta,wrtParent)
    {
        this.applyTransform(Transform.makeZRotationTransform(theta),wrtParent)
    }

    /*
    *   applies the specified Euler rotation (in degrees) to the current Transform
    */
    applyXYZDeg2Rad(rx, ry, rz, wrtParent){
        this.applyXrot(Transform.degToRad(rx),wrtParent);
        this.applyYrot(Transform.degToRad(ry),wrtParent);
        this.applyZrot(Transform.degToRad(rz),wrtParent);
    }

    /*
    *   applies the specified Quat rotation to the current Transform
    */
    applyQuat(quat,wrtParent)
    {
        this.applyTransform(Transform.makeQuatTransform(quat),wrtParent)
    }

    /*
    *   applies the specified scale operation to the current Transform
    */
    applyScaling(x,y,z,wrtParent)
    {
        this.applyTransform(Transform.makeScalingTransform(x,y,z),wrtParent)
    }
}

export default Transform