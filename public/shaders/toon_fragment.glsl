precision mediump float;

varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform sampler2D sampler;

void main(){
    vec3 ambientLight = vec3(0.05, 0.05, 0.05);
    vec3 lightDir = normalize(vec3(0.0, 4.0, 5.0));
    vec4 texture = texture2D(sampler, fragTexCoord);
    float intensity;

    float dotProd = dot(lightDir, fragNormal);
    if (dotProd >= 0.5){
        intensity = 1.0;
    }
    else{
        intensity = 0.7;
    }

    vec3 color = texture.rgb * intensity + ambientLight;
    gl_FragColor = vec4(color, 1.0);
}