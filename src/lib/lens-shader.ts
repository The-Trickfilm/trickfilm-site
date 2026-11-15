export function fragmentShader(explicitLod: boolean) {
  const sample = explicitLod
    ? "texture2DLodEXT(frame,coordinate,level)"
    : "texture2D(frame,coordinate,level-baseLevel)";
  return `${explicitLod ? "#extension GL_EXT_shader_texture_lod : enable\n" : ""}
precision mediump float;
uniform sampler2D frame;
uniform vec2 resolution;
uniform vec2 source;
uniform vec2 texel;
uniform vec2 summit;
uniform vec2 focus;
uniform vec3 circles[5];
varying vec2 uv;
void main(){
 vec2 p=vec2(uv.x,1.0-uv.y)*resolution;
 float count=0.0;
 for(int i=0;i<5;i++){float d=distance(p,circles[i].xy);count+=1.0-smoothstep(circles[i].z-.7,circles[i].z+.7,d);}
 vec2 ratio=resolution/source;
 vec2 crop=ratio/max(ratio.x,ratio.y);
 vec2 st=(uv-vec2(focus.x,1.0-focus.y))*crop+vec2(summit.x,1.0-summit.y);
 // A shared full-blur frame and its sharp counterpart stay synchronized.
 float level=log2(1.0+32.0*crop.x/(texel.x*resolution.x));
 float baseLevel=log2(max(crop.x/(texel.x*resolution.x),crop.y/(texel.y*resolution.y)));
 vec2 delta=(exp2(level)-1.0)*texel*.7;
 vec4 color=vec4(0.0);float total=0.0;
 for(int x=-1;x<=1;x++){for(int y=-1;y<=1;y++){
 float weight=(x==0?2.0:1.0)*(y==0?2.0:1.0);
 vec2 coordinate=clamp(st+vec2(float(x),float(y))*delta,vec2(.001),vec2(.999));
 color+=${sample}*weight;total+=weight;
 }}
 vec4 sharp=texture2D(frame,clamp(st,vec2(.001),vec2(.999)));
 // A uniform teal treatment; no side fades or opacity masks.
 vec3 dark=vec3(.008,.10,.085),light=vec3(.52,.96,.86);
 float blurredLuma=dot(color.rgb/total,vec3(.2126,.7152,.0722));
 float sharpLuma=dot(sharp.rgb,vec3(.2126,.7152,.0722));
 color.rgb=mix(dark,light,blurredLuma)*.85*total;
 sharp.rgb=mix(dark,light,sharpLuma)*.85;
 // Count every opening independently: 0%, 20%, 40%, 60%, 80%, 100% clarity.
 vec4 picture=mix(color/total,sharp,count/5.0);

 gl_FragColor=picture;
}`;
}
