import { pixelGrid } from "./pixel-reveal";
export type FieldFrame = {
  width: number;
  height: number;
  cssWidth: number;
  cssHeight: number;
  time: number;
  intro: number;
  reduced: boolean;
  resolve?: number;
  pointer: readonly number[];
};
const vertex = `
precision highp float;
attribute vec2 position;
uniform vec2 resolution,viewport,source;
uniform sampler2D photo;
uniform float time,intro,reduced;
uniform mediump float resolve;
uniform vec3 pointer;
varying vec3 ink;
varying float visibility,edge;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 uv=position;
 float t=time*(1.-reduced);
 vec2 crop=(viewport/source)/max(viewport.x/source.x,viewport.y/source.y);
 vec2 st=vec2(uv.x,1.-uv.y)*crop+(1.-crop)*vec2(.58,.70);
 vec3 sampleColor=texture2D(photo,st).rgb;
 float luminance=pow(dot(sampleColor,vec3(.2126,.7152,.0722)),1.65);
 // Domain-warped folds: both the geometry and its lighting travel through the lattice.
 float bend=sin(uv.y*4.3-t*.29)*1.5+cos(uv.x*3.1+t*.21)*.75;
 float phase=uv.x*10.5+uv.y*7.5+bend-t*.62;
 float fold=sin(phase);
 float second=sin(uv.x*5.-uv.y*6.2+t*.37);
 float crest=pow(.5+.5*fold,1.7);
 float motion=(1.-reduced)*(1.-resolve);
 vec2 p=uv*viewport;
 p.x+=motion*(sin(uv.y*6.5+t*.48+bend)*20.+second*9.);
 p.y+=motion*(cos(uv.x*5.5-t*.39)*15.+fold*9.);
 float depth=(fold*38.+second*16.)*motion;
 p=(p-viewport*.5)*(1.+depth/950.)+viewport*.5;
 vec2 delta=p-pointer.xy*viewport;
 float influence=exp(-dot(delta,delta)/28000.)*pointer.z*motion;
 p+=delta*influence*.11;
 // Pixel bloom emerges centrally before the field opens into its full surface.
 float radius=length((uv-vec2(.52,.47))/vec2(.52,.53));
 float eased=intro*intro*(3.-2.*intro);
 float front=(eased*1.8-radius)/.19;
 float noise=fract(hash(floor(uv*viewport/10.))*7.13+floor(intro*22.)*.6180339);
 visibility=intro>=.999?1.:step(noise,clamp((front+1.)*.5,0.,1.));
 if(intro<.06)visibility=0.;
 p=mix(viewport*vec2(.52,.47),p,.62+.38*eased);
 float lighting=.24+crest*1.03;
 float brightness=(.035+luminance*.65)*lighting;
 ink=vec3(.36862745,.76470588,.72941176)*brightness;
 edge=crest;
 gl_Position=vec4(p.x/viewport.x*2.-1.,1.-p.y/viewport.y*2.,depth/2000.,1.);
 gl_PointSize=min(10.,(3.0+sqrt(luminance)*6.8)*(.73+crest*.3))*resolution.x/viewport.x;
}`;
const fragment = `
precision mediump float;
uniform float resolve;
varying vec3 ink;
varying float visibility,edge;
void main(){
 if(visibility<.5)discard;
 vec2 q=gl_PointCoord;
 // Four individual square emitters, a fine central cross and a faint outer rim.
 vec2 chip=abs(fract(q*2.)-.5);
 float solid=1.-step(.32,max(chip.x,chip.y));
 float outer=max(abs(q.x-.5),abs(q.y-.5));
 float rim=step(.43,outer)*(1.-step(.48,outer));
 float density=max(solid,rim*.14*edge);
 if(density<.01)discard;
 gl_FragColor=vec4(ink*density,1.-resolve);
}`;
const photoVertex = `attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const photoFragment = `
precision mediump float;
uniform sampler2D photo;
uniform vec2 viewport,source;
uniform float resolve;
varying vec2 uv;
void main(){
 vec2 crop=(viewport/source)/max(viewport.x/source.x,viewport.y/source.y);
 vec2 st=uv*crop+(1.-crop)*vec2(.58,.70);
 vec3 rgb=texture2D(photo,st).rgb;
 float luminance=clamp((dot(rgb,vec3(.2126,.7152,.0722))-.5)*1.2+.5,0.,1.);
 gl_FragColor=vec4(vec3(.1215686,.5333333,.4588235)*luminance*.55*resolve,1.);
}`;
export function createPixelField(
  canvas: HTMLCanvasElement,
  photo: HTMLImageElement,
) {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: true,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type)!;
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      gl!.deleteShader(shader);
      return null;
    }
    return shader;
  }
  const vs = compile(gl.VERTEX_SHADER, vertex),
    fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return null;
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const attribute = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, photo);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const uniforms = Object.fromEntries(
    [
      "resolution",
      "viewport",
      "source",
      "time",
      "intro",
      "reduced",
      "pointer",
      "resolve",
    ].map((name) => [name, gl.getUniformLocation(program, name)]),
  );
  gl.uniform2f(uniforms.source, photo.naturalWidth, photo.naturalHeight);
  const qvs = compile(gl.VERTEX_SHADER, photoVertex),
    qfs = compile(gl.FRAGMENT_SHADER, photoFragment);
  if (!qvs || !qfs) return null;
  const photoProgram = gl.createProgram()!;
  gl.attachShader(photoProgram, qvs);
  gl.attachShader(photoProgram, qfs);
  gl.linkProgram(photoProgram);
  if (!gl.getProgramParameter(photoProgram, gl.LINK_STATUS)) return null;
  const photoBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, photoBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const photoAttribute = gl.getAttribLocation(photoProgram, "position");
  const photoUniforms = Object.fromEntries(
    ["viewport", "source", "resolve"].map((name) => [
      name,
      gl.getUniformLocation(photoProgram, name),
    ]),
  );
  gl.clearColor(0, 0, 0, 1);
  let layout = "",
    count = 0;
  return {
    render(frame: FieldFrame) {
      const {
        width,
        height,
        cssWidth,
        cssHeight,
        time,
        intro,
        reduced,
        pointer,
        resolve = 0,
      } = frame;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl!.viewport(0, 0, width, height);
      }
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
      const key = `${cssWidth},${cssHeight}`;
      if (key !== layout) {
        layout = key;
        const points = pixelGrid(cssWidth, cssHeight);
        count = points.length / 2;
        gl!.bufferData(gl!.ARRAY_BUFFER, points, gl!.STATIC_DRAW);
      }
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.useProgram(photoProgram);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, photoBuffer);
      gl!.enableVertexAttribArray(photoAttribute);
      gl!.vertexAttribPointer(photoAttribute, 2, gl!.FLOAT, false, 0, 0);
      gl!.uniform2f(photoUniforms.viewport, cssWidth, cssHeight);
      gl!.uniform2f(
        photoUniforms.source,
        photo.naturalWidth,
        photo.naturalHeight,
      );
      gl!.uniform1f(photoUniforms.resolve, resolve);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      if (resolve >= 1) return;
      gl!.useProgram(program);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
      gl!.enableVertexAttribArray(attribute);
      gl!.vertexAttribPointer(attribute, 2, gl!.FLOAT, false, 0, 0);
      gl!.uniform1f(uniforms.resolve, resolve);
      gl!.uniform2f(uniforms.resolution, width, height);
      gl!.uniform2f(uniforms.viewport, cssWidth, cssHeight);
      gl!.uniform1f(uniforms.time, time);
      gl!.uniform1f(uniforms.intro, intro);
      gl!.uniform1f(uniforms.reduced, reduced ? 1 : 0);
      gl!.uniform3f(uniforms.pointer, pointer[0], pointer[1], pointer[2]);
      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.drawArrays(gl!.POINTS, 0, count);
      gl!.disable(gl!.BLEND);
    },
    dispose() {
      gl!.deleteProgram(photoProgram);
      gl!.deleteBuffer(photoBuffer);
      gl!.deleteShader(qvs);
      gl!.deleteShader(qfs);
      gl!.deleteTexture(texture);
      gl!.deleteBuffer(buffer);
      gl!.deleteProgram(program);
      gl!.deleteShader(vs);
      gl!.deleteShader(fs);
    },
  };
}
