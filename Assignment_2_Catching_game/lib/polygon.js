//Merged to lib
export class Polygon{
    constructor(sides){
        this.zLower = -0.2;
        this.zUpper = 0;
        this.sides = sides;
        this.oUpper = [0, 0, this.zUpper];
        this.oLower = [0, 0, this.zLower];
        this.vertices = [];
        this.positions = [];
    }

    calcVertices(){
        const angle = (2*Math.PI)/this.sides;
        var vertAngle;
        var p1_x, p1_y, p2_x, p2_y;
        var size = 3;
        for(let i =  0; i < this.sides; i++){
            vertAngle = angle*i;

            p1_x = size*Math.cos(vertAngle);
            p1_y = size*Math.sin(vertAngle);
            p2_x = size*Math.cos(vertAngle+angle);
            p2_y = size*Math.sin(vertAngle+angle);


            //triangles of the upper polygon
            this.vertices.push([p1_x, p1_y, this.zUpper]);
            this.vertices.push(this.oUpper);
            this.vertices.push([p2_x, p2_y, this.zUpper]);

            //triangles of the lower polygon
            this.vertices.push([p1_x, p1_y, this.zLower]);
            this.vertices.push(this.oLower);
            this.vertices.push([p2_x, p2_y, this.zLower]);

            this.vertices.push(this.triangulate([[p1_x, p1_y, this.zUpper], 
                                                 [p2_x, p2_y, this.zUpper], 
                                                 [p2_x, p2_y, this.zLower], 
                                                 [p1_x, p1_y, this.zLower]]));

            this.positions.push([p1_x * 100, p1_y * 100, this.zUpper * 100]);
        }
        this.vertices = this.vertices.flat(2);
        var temp = [];
        this.vertices.forEach(e => {
            temp.push(parseFloat(e)*100);
        });
        this.vertices = temp;
        return this.vertices;
    }

    triangulate(vertices){
        const centre = vertices[0];
        var triangles = [];
        for(let i = 1; i < vertices.length - 1; i++){
            triangles.push(centre);
            triangles.push(vertices[i]);
            triangles.push(vertices[i+1]);
        }
        return triangles;
    }

    getPositions(){
        return this.positions;
    }
}