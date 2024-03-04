export class Object{
    constructor(gl, shader, texture, parsedObj){
        this.gl = gl;
        this.shader = shader;
        this.texture = texture;
        this.setBuffers(parsedObj);
        this.rotation = {
            x: 0,
            y: 0,
            z: 0
        };
        this.position = {
            x: 0,
            y: 0,
            z: 0
        };
        this.flipTexX = false;
        this.flipTexY = false;
    }

    setBuffers(model){
        //index array buffer
        var indexBufferObject = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), this.gl.STATIC_DRAW);

        //vertex buffer
        var vertBufferObject = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertBufferObject);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(model.vertices), this.gl.STATIC_DRAW);

        //texture coordinates buffer
        var texCoordsBufferObject = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordsBufferObject);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(model.texCoords), this.gl.STATIC_DRAW);

        //normals buffer
        var normalBufferObject = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBufferObject);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(model.normals), this.gl.STATIC_DRAW);

        //set class properties
        this.indexBufferId = indexBufferObject;
        this.vertexBufferId = vertBufferObject;
        this.texCoordsBufferId = texCoordsBufferObject;
        this.normalBufferId = normalBufferObject;
        this.numIndices = model.indices.length;
    }

    setTexture(texture){
        //delete texture buffer just in case
        this.gl.deleteTexture(this.texture.id);
        //reassign texture
        this.texture = texture;
    }

    setModel(model){
        //delete array buffers
        this.gl.deleteBuffer(this.indexBufferId);
        this.gl.deleteBuffer(this.vertexBufferId);
        this.gl.deleteBuffer(this.texCoordsBufferId);
        this.gl.deleteBuffer(this.normalBufferId);

        //create/set new buffers
        this.setBuffers(model);
    }

    setShader(shader){
        this.shader = shader;
    }

    rotate(axis, degrees){
        if(axis == 'x'){
            this.rotation.x += degrees;
            if(this.rotation.x >= 360) this.rotation.x = 0;
        }
        if(axis == 'y'){
            this.rotation.y += degrees;
            if(this.rotation.y >= 360) this.rotation.y = 0;
        }
        if(axis == 'z'){
            this.rotation.z += degrees;
            if(this.rotation.z >= 360) this.rotation.z = 0;
        }
    }
}