/*
*   Given a string repr. of the .OBJ, load the OBJ as a vertex set.
*/
export class Loader{
    /*
    *   data=The string from the contents of the .OBJ
    */
    constructor(data){
        this.vertices = []
        this.triangles = []
        this.normals = []
        this.faces = []

        
        let objText = data.trim() + "\n";
        const objLineArray = objText.split("\n");
    
        const VERTEX_RE = /^v\s/;
        const NORMAL_RE = /^vn\s/;
        const FACE_RE = /^f\s/;
        const WHITESPACE_RE = /\s+/;
        for(let indexOfLine = 0; indexOfLine < objLineArray.length; indexOfLine++){
            let line = objLineArray[indexOfLine];
            line = line.trim();
            if (!line || line.startsWith("#")) {
                continue;
            }
            const elements = line.split(WHITESPACE_RE);
            elements.shift();
            if(VERTEX_RE.test(line)){
                this.vertices.push(elements);
            }
            else if(NORMAL_RE.test(line)){
                this.normals.push(...elements);
            }
            else if(FACE_RE.test(line)){
                this.faces.push(...elements);
            }
        }
    }

    getVertices(){
        return this.vertices;
    }

    getTriangles(){
        this.makeTriangles();
        return this.triangles;
    }

    makeTriangles(){
        
        for(let i = 0; i < this.faces.length; i = i+3){
            let indices = [this.extractVertexFromFace(this.faces[i])-1, this.extractVertexFromFace(this.faces[i+1])-1, this.extractVertexFromFace(this.faces[i+2])-1];
            let triangle = [];
            triangle.push(this.vertices[indices[0]]);
            triangle.push(this.vertices[indices[1]]);
            triangle.push(this.vertices[indices[2]]);
        
            this.triangles.push(triangle);
        }
        this.triangles = this.triangles.flat(2);
        
        var temp = [];
        this.triangles.forEach(e => {
            temp.push(parseFloat(e)*100);
        });
        
        this.triangles = temp;
    }

    extractVertexFromFace(faceData){
        let faceDataSplit = faceData.split("/");
        let vertIndex = faceDataSplit[0];
        return vertIndex;
    }

    setColor(){
        // var colors = [];
        // for(let i = 0; i < this.triangles.length; i = i + 3){
        //     colors.push(Math.random()*255);
        //     colors.push(Math.random()*255);
        //     colors.push(Math.random()*255);
        // }
        // return colors;
        var color = [];
        const repeat = (arr, n) => Array.from({ length: arr.length * n }, (_, i) => arr[i % arr.length]);
        color = repeat(this.colors[0], this.triangles.length/3);
        // var test = repeat(this.colors[1], 4);
        console.log(color);
        return color;
    }
}

export default Loader