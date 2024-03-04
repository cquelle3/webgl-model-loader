export class Shader{
    constructor(gl, vertShaderText, fragShaderText){
        this.gl = gl;

        //create shaders
        var vertShader = this.gl.createShader(gl.VERTEX_SHADER);
        var fragShader = this.gl.createShader(gl.FRAGMENT_SHADER);

        //attach shader source code to shaders
        this.gl.shaderSource(vertShader, vertShaderText);
        this.gl.shaderSource(fragShader, fragShaderText);

        //compile shaders
        this.gl.compileShader(vertShader);
        if(!this.gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)){
            console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertShader));
            return;
        }

        this.gl.compileShader(fragShader);
        if(!this.gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)){
          console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragShader));
          return;
        }

        //create shader program
        this.program = this.gl.createProgram();

        //attach shaders to shader program
        this.gl.attachShader(this.program, vertShader);
        this.gl.attachShader(this.program, fragShader);

        //link program to opengl
        this.gl.linkProgram(this.program);
        if(!this.gl.getProgramParameter(this.program, gl.LINK_STATUS)){
            console.log('ERROR linking program!', gl.getProgramInfoLog(this.program));
            return;
        }
    }
}