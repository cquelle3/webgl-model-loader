precision mediump float;

varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform sampler2D sampler;

void main(){        
    vec3 ambientLightIntensity = vec3(0.7, 0.7, 0.7);
    vec3 sunlightIntensity = vec3(0.5, 0.5, 0.5);
    vec3 sunlightDirection = normalize(vec3(0.0, 4.0, 5.0));

    vec3 lightIntensity = ambientLightIntensity + (sunlightIntensity) * max(dot(fragNormal, sunlightDirection), 0.0);

    gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * lightIntensity, 1.0);
}