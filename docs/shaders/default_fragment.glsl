precision mediump float;

varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform sampler2D sampler;

void main(){
    vec3 ambientLightIntensity = vec3(0.7, 0.7, 0.7);
    vec3 sunlightIntensity = vec3(0.5, 0.5, 0.5);
    vec3 sunlightDirection = normalize(vec3(0.0, 4.0, 5.0));

    vec4 texture = texture2D(sampler, fragTexCoord);

    vec3 lightIntensity = ambientLightIntensity + (sunlightIntensity) * max(dot(fragNormal, sunlightDirection), 0.0);

    gl_FragColor = vec4(texture.rgb * lightIntensity, texture.a);
}  