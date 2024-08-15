/*
*   Represents one shader program. Various operations which should 
*   be performed before calling gl.drawArrays() are performed here.
*   This includes getting and populating buffers, associating buffers
*   with shader attributes, passing data to uniforms etc.
*/
export class Shader
{
    /*
    *   gl = the WebGLRenderingContext object for this app 
    *   vertexShaderSrc, fragmentShaderSrc are both strings.
    */
    constructor(gl, vertexShaderSrc, fragmentShaderSrc){

        this.gl = gl;

        this.vertexShaderSrc = vertexShaderSrc;
		this.fragmentShaderSrc = fragmentShaderSrc;

        this.vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.vertexShaderSrc);
        this.fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderSrc)
        
        this.program = this.createProgramAndAttachShaders(this.vertexShader, this.fragmentShader);

        this.vertexAttributeBuffer = this.createBuffer();

        this.buffers = {
            'vertex': this.vertexAttributeBuffer
        }
    }

    /*
    *   Create a shader of the appropriate type from the src.
    *   type = gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    *   shaderSrc = string
    */
    createShader(type, shaderSrc){
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, shaderSrc);
        this.gl.compileShader(shader);
        if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error(this.gl.getShaderInfoLog());
        }
        return shader;
    }

    /*
    *   Creates the shader program.
    *   
    *   
    */
    createProgramAndAttachShaders(){
        const program = this.gl.createProgram();
        this.gl.attachShader(program, this.vertexShader);
        this.gl.attachShader(program, this.fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS))
		{   

			throw new Error(this.gl.getProgramInfoLog(program));
		}

		this.gl.deleteShader(this.vertexShader);
		this.gl.deleteShader(this.fragmentShader);

		return program;
    }

    /*
    *   Call this before using the shader. 
    */
    use(){
        this.gl.useProgram(this.program);
    }
    
    /*
    *   Returns the pointer to the attribute
    */
    getAttribLocation(attrib){
        return this.gl.getAttribLocation(this.program, attrib);
    }

    /*
    *   Returns the pointer to the uniform
    */
    getUniformLocation(uniform){
        return this.gl.getUniformLocation(this.program, uniform);
    }

    /*
    *   Populate that uniform(str) vec4 with the data given
    */
    setUniform4fv(uniform, data){
        let uniformLocation = this.getUniformLocation(uniform);
        this.gl.uniform4fv(uniformLocation, data);
    }

    /*
    *     Populate that uniform(str) float1 with the data given
    */
    setUniform1f(uniform, data){
        let uniformLocation = this.getUniformLocation(uniform);
        this.gl.uniform1f(uniformLocation, data);
    }

    /*
    *     Populate that uniform(str) mat4 with the data given
    */
    setUniformMatrix4fv(uniform, matrix){
        let matrixLocation = this.getUniformLocation(uniform);
        this.gl.uniformMatrix4fv(matrixLocation, false, matrix);
    }

    /*
    *     Create a WebGL buffer which can be populated with vertex data and associated with an attribute.
    */
    createBuffer()
	{
		const buffer = this.gl.createBuffer();
		if (!buffer)
		{
			throw new Error("Buffer for vertex attributes could not be allocated");
		}
		return buffer;
	}

    /*
    *     Helper; keep track of the created buffer.
    */
    addBuffer(name)
    {
        let newBuffer = this.createBuffer();
        this.buffers[name] = newBuffer;
    }

    /*
    *     Associate the given data with the given buffer.
    */
    bindArrayBufferWithData(data, buffer){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW)
    }

    /*
    *     Associate the contents of gl.ARRAY_BUFFER with the given attribute
    */
    enableAndFillAttributeData(attributeName, elementPerAttribute, type, normalize, stride, offset)
	{		
        let attribLocation = this.getAttribLocation(attributeName)
		this.gl.enableVertexAttribArray(attribLocation);
		this.gl.vertexAttribPointer(attribLocation, elementPerAttribute, type, normalize, stride, offset);
	}

    /*
    *     Draw the vertex data.
    */
    drawArrays(mode=this.gl.TRIANGLES, offset, numberOfElements) 
	{
		this.gl.drawArrays(
			mode, // primitive type
			offset,    // offset
			numberOfElements // count
		);
	}
}