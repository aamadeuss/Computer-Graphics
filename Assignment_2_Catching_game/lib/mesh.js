import { Transform } from "./glmat_transforms.js";
import { repeat } from "./globals.js"

/*
*   A datastore for attributes relating to one vertexSet.
*   Taken from lib.
*/
export class Mesh
{
    constructor(data, primitiveType, color, name, label, diffuseColor){
        this.vertexPositions = new Float32Array(data);
        
        this.type = primitiveType;
		this.color = new Uint8Array(color);
        this.oldColor = new Uint8Array(color);
        this.name = name;
		this.transform = new Transform();
        this.pcolor = label;
        this.oldPcolor = label;
        this.dcolor = diffuseColor;
        this.gettingPicked = false;
        this.resetDynamicScaling()
    }
    resetDynamicScaling()
    {
        this.sx = 1
        this.sy = 1
        this.sz = 1
        this.renderTransform = new Transform(this.transform)
    }
    applyDynamicScaling()
    {   
        this.renderTransform = new Transform(this.transform)
        this.renderTransform.applyScaling(this.sx,this.sy,this.sz)
    }
    setDynamicScaling(sx,sy,sz)
    {
        this.sx = sx 
        this.sy = sy
        this.sz = sz
    }
    incrementDynamicScaling(dx,dy,dz)
    {
        this.sx += dx
        this.sy += dy
        this.sz += dz
    }
    setColor(newColor){
        // const repeat = (arr, n) => Array.from({ length: arr.length * n }, (_, i) => arr[i % arr.length]);
        // this.pcolor = repeat([newColor, newColor, newColor], this.vertexPositions.length/3);
		this.color = new Uint8Array(repeat(newColor, this.vertexPositions.length/3));
        this.pcolor = newColor[0] + ':' + newColor[1] + ':' + newColor[2];
        return;
    }

    resetColor(){
        this.color = this.oldColor;
        this.pcolor = this.oldPcolor;
    }

    getVertices(){
        return this.vertexPositions;
    }
}