precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform bool flipTexX;
uniform bool flipTexY;

varying vec2 fragTexCoord;
varying vec3 fragNormal;

void main(){
    fragTexCoord = aTexCoord;
    if(flipTexX){
        fragTexCoord.x = 1.0 - fragTexCoord.x;
    }
    if(flipTexY){
        fragTexCoord.y = 1.0 - fragTexCoord.y;
    }
    fragNormal = (mWorld * vec4(aNormal, 0.0)).xyz;
    gl_Position = mProj * mView * mWorld * vec4(aPosition, 1.0);
}