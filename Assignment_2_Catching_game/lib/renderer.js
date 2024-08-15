
/*
*   Responsible for holding the WebGLRenderingContext and performing 
*   associated actions. Also handles canvas-related actions.
*/
export class WebGLRenderer
{
    /*
    *   canvasSize is a 2-array of positive ints. 
    *   clearColor is a 4-array of floats between 0 and 1 (has a default)
    */
    constructor(canvasSize, clearColor=[0.9,0.9,0.9,1]){
        this.canvas = document.createElement("canvas");
        this.canvas.width = canvasSize[0];
        this.canvas.height = canvasSize[1];
        document.body.appendChild(this.canvas);
        this.gl = this.canvas.getContext("webgl", {preserveDrawingBuffer: true}) || this.canvas.getContext("experimental-webgl");

        if (!this.gl) throw new Error("WebGL is not supported");

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.clearR= clearColor[0]
        this.clearG=clearColor[1]
        this.clearB=clearColor[2]
        this.clearA=clearColor[3]

        this.clearCanvas();
    }

    getGLcontext(){
        return this.gl;
    }

    clearCanvas(r=this.clearR, g=this.clearG, b=this.clearB, a=this.clearA, depth = true) 
	{
		this.gl.clearColor(r, g, b, a);
        if (depth) this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		else this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	}

    /*
     *  Draws every primitive.
     *  Pass a <Shader> and a <Scene>.
     */
    render(shader, scene){

        this.clearCanvas();
        this.gl.enable(this.gl.DEPTH_TEST)
        scene.primitives.forEach((primitive)=>{

            // if we have a arrow and it says not to show it then skip the element
            if(primitive.additionalArgs?.isArrow && !primitive.additionalArgs?.show){
                return;
            }
        
            
            shader.bindArrayBufferWithData(
				primitive.vertexPositions,//data
                shader.buffers['vertex']//buffer
			);

            shader.enableAndFillAttributeData(
                "a_position", // attribute name
				3, // element per attribute
                this.gl.FLOAT, // type,
                false, // normalize
				0, // stride
				0 // offset
            );

            shader.bindArrayBufferWithData(
				primitive.color, //data
                shader.buffers['color']//buffer
			);

            shader.enableAndFillAttributeData(
                "a_color", // attribute name
				3, // element per attribute
                this.gl.UNSIGNED_BYTE, // type
                true, // normalize
				0, // stride
				// 3 * primitive.color.BYTES_PER_ELEMENT, // stride
				0 // offset
            );
// PRIMARY DIFFERENCE BETWEEN PREVIOUS VERSIONS
                // debugger
            var finaltrans = scene.getToRender(primitive)
            shader.setUniformMatrix4fv("u_matrix",finaltrans.transformMatrix);
            shader.drawArrays(
                primitive.type,//gl.TRIANGLES etc 
                0, //offset
                primitive.vertexPositions.length/3 //numInArray
            );
        });
    }
}