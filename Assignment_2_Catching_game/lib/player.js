import { Mesh } from "./mesh.js";
import { Transform, GLMAT } from "./glmat_transforms.js";
export class Player extends Mesh
{
    constructor(id, data, primitiveType, color, name, label, diffuseColor,additionalArgs){
        super(data, primitiveType, color, name, label, diffuseColor,);
        this.id = id;
        this.transform.applyScaling(1, 1, -1, false);
        this.initial = new Float32Array([0,0,0]);
        this.final = structuredClone(this.initial);
        this.delta = new Float32Array([0,0,0]);
        this.scaleFactor = 1;
        this.additionalArgs = additionalArgs;
    }

    set(position){
        const orig = this.transform.getTranslationVec();
        const toPosition = GLMAT.vec3.subtract(GLMAT.vec3.create(),new Float32Array(position),orig);
        
        this.transform.applyTranslate(...toPosition,false);
        this.transform.applyScaling(this.scaleFactor, this.scaleFactor, this.scaleFactor, false);
        this.initial = position;
        this.initialTransform = new Transform(this.transform);
        this.final = structuredClone(this.initial);
        this.delta = new Float32Array([0,0,0]);
    }

    setFinal(position){
        this.final = position;
        // debugger
        this.delta = GLMAT.vec3.subtract(this.delta,this.final,this.initial);
        // debugger
        this.realignToDelta()
        // debugger
        this.delta = GLMAT.vec3.scale(this.delta,new Float32Array([1,0,0]),GLMAT.vec3.distance(new Float32Array([0,0,0]),this.delta))
        // debugger
        
    }
    realignToDelta(){
        const currXAxis = this.transform.transformMatrix.slice(0,3) 
        const newXAxis = this.delta 
        const newQuat = Transform.quatFromDeltaVec(currXAxis,newXAxis)
        this.transform.applyQuat(newQuat,false)
        this.initialTransform.applyQuat(newQuat,false)
    }
    move(step){
        var currDelta=GLMAT.vec3.scale(new GLMAT.vec3.create(),this.delta,step/10)
        this.transform = Transform.multiply(this.initialTransform, Transform.makeTranslationTransform(...currDelta));
        // this.realignToDelta()
    }

    snap(){
        let currentPosition = this.transform.getTranslationVec();
        
        //move the player from currentPosition to the nearest point on the line between initial and final
        let step = ((currentPosition[0]-this.initial[0])*(this.final[0]-this.initial[0]) + (currentPosition[1]-this.initial[1])*(this.final[1]-this.initial[1]) + (currentPosition[2]-this.initial[2])*(this.final[2]-this.initial[2]))/
        ((this.final[0]-this.initial[0])*(this.final[0]-this.initial[0]) + (this.final[1]-this.initial[1])*(this.final[1]-this.initial[1]) + (this.final[2]-this.initial[2])*(this.final[2]-this.initial[2]));
        step = Math.round(step*10);
        if(step < 0) step = 0;
        if(step > 10) step = 10;
        return step;
    }

    // staticScale(scale){
    //     // this.transform.applyScaling(scale, scale, scale, false);
    //     scaleFactor = scale;
    //     this.transform.applyScaling(scaleFactor, scaleFactor, scaleFactor, false);
    //     return;
    // }
}