import { WebGLDemo } from "./webgl-classes/webglDemo";
import { Object } from "./webgl-classes/object";

var demo = new WebGLDemo();

var defaultShader = await demo.createShader("./shaders/default_vertex.glsl", "./shaders/default_fragment.glsl");
var whiteShader = await demo.createShader("./shaders/white_vertex.glsl", "./shaders/white_fragment.glsl");
var normalsShader = await demo.createShader("./shaders/normals_vertex.glsl", "./shaders/normals_fragment.glsl");
var toonShader = await demo.createShader("./shaders/toon_vertex.glsl", "./shaders/toon_fragment.glsl");


var cubeParsed = await demo.parseObjFileFromPath("./models/cube.obj");
var cubeTexture = await demo.createTexture("./textures/white.png");
var object = new Object(demo.gl, defaultShader, cubeTexture, cubeParsed);

var modelInput = document.querySelector('#model-input');
modelInput.onchange = async (e) => {
    var model = await demo.parseObjFileFromUpload(e.target.files[0]);
    object.setModel(model);
};

var textureInput = document.querySelector('#texture-input');
textureInput.onchange = async (e) => {
    var texture = await demo.createTextureFromUpload(e.target.files[0]);
    object.setTexture(texture);
};

let checkboxes = document.querySelectorAll('.texture-checkbox');
checkboxes.forEach(function(elem){
    elem.addEventListener("change", function(e){
        if(e.target.id === 'reverse-tex-x'){
            object.flipTexX = e.target.checked;
        }
        else if(e.target.id === 'reverse-tex-y'){
            object.flipTexY = e.target.checked;
        }
    });
});

let shaderButtons = document.querySelectorAll('.shader-button');
shaderButtons.forEach(function(elem){
    elem.addEventListener("click", function(e){
        var shader = defaultShader;
        if(e.target.id === 'default-shader') shader = defaultShader;
        else if(e.target.id === 'white-shader') shader = whiteShader;
        else if(e.target.id === 'normals-shader') shader = normalsShader;
        else if(e.target.id === 'toon-shader') shader = toonShader;
        object.setShader(shader);
    });
});

let sliders = document.querySelectorAll('.position-slider');
sliders.forEach(function(elem){
    elem.addEventListener("input", function(e){
        if(e.target.id === 'x-slider'){
            object.position.x = e.target.value;
            document.getElementById('x-output').innerHTML = e.target.value;
        }
        else if(e.target.id === 'y-slider'){
            object.position.y = e.target.value;
            document.getElementById('y-output').innerHTML = e.target.value;
        }
        else if(e.target.id === 'z-slider'){
            object.position.z = e.target.value;
            document.getElementById('z-output').innerHTML = e.target.value;
        }
    });
});

demo.canvas.addEventListener('mousedown', function(event){
    var x = event.clientX;
    var y = event.clientY;
    var rect = event.target.getBoundingClientRect();
    //check if we are in our canvas rectangle
    if(rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom){
        demo.state.ui.mouse.lastX = x;
        demo.state.ui.mouse.lastY = y;
        demo.state.ui.dragging = true;
    }
});

window.addEventListener('mouseup', function(event){
    demo.state.ui.dragging = false;
});

demo.canvas.addEventListener('mousemove', function(event){
    var x = event.clientX;
    var y = event.clientY;
    if(demo.state.ui.dragging){
        //rotation speed
        var factor = 300/demo.canvas.height;
        var dx = factor * (x - demo.state.ui.mouse.lastX);
        var dy = factor * (y - demo.state.ui.mouse.lastY);
        
        object.rotate('x', dy);
        object.rotate('y', dx);
    }
    demo.state.ui.mouse.lastX = x;
    demo.state.ui.mouse.lastY = y;
});

//resizing webgl canvas
function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;

    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }

    return needResize;
}

let loop = function(){
    resizeCanvasToDisplaySize(demo.gl.canvas);
    demo.gl.viewport(0, 0, demo.gl.canvas.width, demo.gl.canvas.height);
    demo.clearGL();
    demo.drawObject(object);
    requestAnimationFrame(loop);
}
loop();