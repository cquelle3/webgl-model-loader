import { glMatrix, mat4, vec3 } from "gl-matrix";
import { Shader } from "./shader";
import { Texture } from "./texture";

export class WebGLDemo{
    constructor(){
        this.canvas = document.querySelector('#webgl-canvas');
        this.gl = this.canvas.getContext('webgl');
        this.state = {
            ui: {
                dragging: false,
                mouse: {
                    lastX: -1,
                    lastY: -1
                }
            }
        };
        
        if(this.gl === null){
            alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }

        this.init();
    }

    init(){
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.frontFace(this.gl.CCW);
        this.gl.cullFace(this.gl.BACK);
        this.clearGL();
    }

    clearGL(){
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    async createShader(vertShaderPath, fragShaderPath){
        const vertShaderRes = await fetch(vertShaderPath);
        const vertShaderText = await vertShaderRes.text();

        const fragShaderRes = await fetch(fragShaderPath);
        const fragShaderText = await fragShaderRes.text();

        return new Shader(this.gl, vertShaderText, fragShaderText);
    }

    async createTexture(imagePath){
        let image = await this.loadImagePath(imagePath);
        return new Texture(this.gl, image);
    }

    async createTextureFromUpload(imageFile){
        let image = await this.loadImageFile(imageFile);
        return new Texture(this.gl, image);
    }

    loadImagePath(url){
        return new Promise(resolve => {
            const image = new Image();
            image.onload = function(){
                resolve(image);
            };
            image.src = url;
        });
    }

    loadImageFile(file){
        return new Promise(resolve => {
            const image = new Image();
            var fr = new FileReader();
            fr.onload = function(){
                image.src = fr.result;
                resolve(image);
            };
            fr.readAsDataURL(file);
        });
    }

    drawObject(object){
        //set buffers to the buffers created for the object
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.indexBufferId);
        this.gl.bindTexture(this.gl.TEXTURE_2D, object.texture.id);

        //use the shader program assigned to the object
        this.gl.useProgram(object.shader.program);

        //vertices
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.vertexBufferId);
        var positionAttributeLocation = this.gl.getAttribLocation(object.shader.program, 'aPosition');
        this.gl.vertexAttribPointer(
            positionAttributeLocation,
            3,
            this.gl.FLOAT,
            this.gl.FALSE,
            3 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.gl.enableVertexAttribArray(positionAttributeLocation);

        //texture coordinates
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.texCoordsBufferId);
        var texAttributeLocation = this.gl.getAttribLocation(object.shader.program, 'aTexCoord');
        this.gl.vertexAttribPointer(
            texAttributeLocation,
            2,
            this.gl.FLOAT,
            this.gl.FALSE,
            2 * Float32Array.BYTES_PER_ELEMENT,
            0 * Float32Array.BYTES_PER_ELEMENT
        );
        this.gl.enableVertexAttribArray(texAttributeLocation);

        //normals
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.normalBufferId);
        var normAttributeLocation = this.gl.getAttribLocation(object.shader.program, 'aNormal');
        this.gl.vertexAttribPointer(
            normAttributeLocation,
            3,
            this.gl.FLOAT,
            this.gl.TRUE, //values are normalized, so this is true
            3 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.gl.enableVertexAttribArray(normAttributeLocation);

        ////////////////////
        //WORLD MATRIX STUFF
        ////////////////////
        
        //new world matrix to apply new position/rotation of objects
        var worldMatrix = new Float32Array(16);

        //identity matrix is position (0, 0, 0) in world space
        var identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);

        //translation
        var translationVector = vec3.create();
        vec3.set(translationVector, object.position.x, object.position.y, object.position.z);
        mat4.translate(worldMatrix, identityMatrix, translationVector);

        //rotation
        mat4.rotateX(worldMatrix, worldMatrix, glMatrix.toRadian(object.rotation.x));
        mat4.rotateY(worldMatrix, worldMatrix, glMatrix.toRadian(object.rotation.y));
        mat4.rotateZ(worldMatrix, worldMatrix, glMatrix.toRadian(object.rotation.z))

        //apply objects world matrix changes
        var matWorldUniformLocation = this.gl.getUniformLocation(object.shader.program, 'mWorld');
        this.gl.uniformMatrix4fv(matWorldUniformLocation, this.gl.FALSE, worldMatrix);

        ////////////////////
        ////////////////////
        ////////////////////

        ////////////////////
        //VIEW MATRIX STUFF
        ////////////////////

        var viewMatrix = new Float32Array(16);
        mat4.lookAt(viewMatrix, [0, 1, 20], [0, 0, 0], [0, 1, 0]);

        var matViewUniformLocation = this.gl.getUniformLocation(object.shader.program, 'mView');
        this.gl.uniformMatrix4fv(matViewUniformLocation, this.gl.FALSE, viewMatrix);

        ////////////////////
        ////////////////////
        ////////////////////

        ////////////////////
        //PROJECTION MATRIX STUFF
        ////////////////////

        var projMatrix = new Float32Array(16);
        mat4.perspective(projMatrix, glMatrix.toRadian(45), this.canvas.width / this.canvas.clientHeight, 0.1, 100);

        var matProjUniformLocation = this.gl.getUniformLocation(object.shader.program, 'mProj');
        this.gl.uniformMatrix4fv(matProjUniformLocation, this.gl.FALSE, projMatrix);

        ////////////////////
        ////////////////////
        ////////////////////

        //flipping texture coords in an objects shader
        var flipTexXUniformLocation = this.gl.getUniformLocation(object.shader.program, 'flipTexX');
        this.gl.uniform1i(flipTexXUniformLocation, object.flipTexX);

        var flipTexYUniformLocation = this.gl.getUniformLocation(object.shader.program, 'flipTexY');
        this.gl.uniform1i(flipTexYUniformLocation, object.flipTexY);

        //draws vertices based off of indices in index buffer
        this.gl.drawElements(
            this.gl.TRIANGLES,
            object.numIndices,
            this.gl.UNSIGNED_SHORT,
            0
        );
    }

    async parseObjFileFromUpload(objFile){
        return this.parseObj(objFile);
    }

    async parseObjFileFromPath(objFilePath){
        var objFile = await fetch(objFilePath);
        return this.parseObj(objFile);
    }

    async parseObj(objFile){
        var finalVertices = [];
        var finalTexCoords = [];
        var finalNormals = [];
        var finalIndices = [];

        var tempVertices = [];
        var tempTexCoords = [];
        var tempNormals = [];
        
        //var objFile = await fetch(objFilePath);
        var objText = await objFile.text();
        objText = objText.split('\n');

        var currVertCount = 0;
        for(let line of objText){
            if(line.startsWith('v ')){
                var lineSplit = line.split(" ");
                lineSplit.splice(0, 1);
                tempVertices.push(lineSplit.map((num) => parseFloat(num)));
            }
            else if(line.startsWith('vt ')){
                var lineSplit = line.split(" ");
                lineSplit.splice(0, 1);
                tempTexCoords.push(lineSplit.map((num) => parseFloat(num)));
            }
            else if(line.startsWith('vn ')){
                var lineSplit = line.split(" ");
                lineSplit.splice(0, 1);
                tempNormals.push(lineSplit.map((num) => parseFloat(num)));
            }
            else if(line.startsWith('f ')){
                var lineSplit = line.split(" ");
                lineSplit.splice(0, 1);

                const v_vt_regex = new RegExp("^((\\d+\/){1}\\d+)$", "g");
                const v_vt_vn_regex = new RegExp("^((\\d+\/){2}\\d+)$", "g");

                //for .obj faces in format v/vt
                if(v_vt_regex.test(lineSplit[0])){
                    for(let vert of lineSplit){
                        let vertSplit = vert.split("/");
                        finalVertices = finalVertices.concat(tempVertices[vertSplit[0] - 1]);
                        finalTexCoords = finalTexCoords.concat(tempTexCoords[vertSplit[1] - 1]);
                    }
                    for(let i=1; i <= lineSplit.length-2; i++){
                        finalIndices.push(...[0 + currVertCount, i + currVertCount, i+1 + currVertCount]);
                    
                        //***attempt to calculate surface normals for each vertex*******
                        let aArray = finalVertices.slice(0+currVertCount, 0+currVertCount+3);
                        let A = vec3.create();
                        vec3.set(A, aArray[0], aArray[1], aArray[2]);
                        
                        let bArray = finalVertices.slice(i+currVertCount, i+currVertCount+3);
                        let B = vec3.create();
                        vec3.set(B, bArray[0], bArray[1], bArray[2]);

                        let cArray = finalVertices.slice(i+1+currVertCount, i+1+currVertCount+3);
                        let C = vec3.create();
                        vec3.set(C, cArray[0], cArray[1], cArray[2]);
                        
                        let BminusA = vec3.create();
                        vec3.subtract(BminusA, B, A);

                        let CminusA = vec3.create();
                        vec3.subtract(CminusA, C, A);

                        let Cross = vec3.create();
                        vec3.cross(Cross, BminusA, CminusA);

                        let Normal = vec3.create();
                        vec3.normalize(Normal, Cross);
                        //****************************************************

                        finalNormals.push(...[Normal[0], Normal[1], Normal[2]]);
                        finalNormals.push(...[Normal[0], Normal[1], Normal[2]]);
                        finalNormals.push(...[Normal[0], Normal[1], Normal[2]]);
                    }
                }
                //for .obj faces in format v/vt/vn
                else if(v_vt_vn_regex.test(lineSplit[0])){
                    for(let vert of lineSplit){
                        let vertSplit = vert.split("/");
                        finalVertices = finalVertices.concat(tempVertices[vertSplit[0] - 1]);
                        finalTexCoords = finalTexCoords.concat(tempTexCoords[vertSplit[1] - 1]);
                        finalNormals = finalNormals.concat(tempNormals[vertSplit[2] - 1]);
                    }
                    for(let i=1; i <= lineSplit.length-2; i++){
                        finalIndices.push(...[0 + currVertCount, i + currVertCount, i+1 + currVertCount]);
                    }
                }

                currVertCount += lineSplit.length;
            }
        }

        return {
            vertices: finalVertices,
            texCoords: finalTexCoords,
            normals: finalNormals,
            indices: finalIndices
        };
    }
}