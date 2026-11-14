"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { convergence, lensGeometry } from "@/lib/lenses";

const fragment = `precision mediump float;
uniform sampler2D frame;
uniform vec2 resolution;
uniform vec2 source;
uniform vec3 circles[5];
varying vec2 uv;
void main(){
 vec2 p=vec2(uv.x,1.0-uv.y)*resolution;
 float count=0.0;float edge=0.0;
 for(int i=0;i<5;i++){float d=distance(p,circles[i].xy);count+=1.0-smoothstep(circles[i].z-0.7,circles[i].z+0.7,d);edge=max(edge,1.0-smoothstep(.55,1.4,abs(d-circles[i].z)));}
 float blur=(5.0-count)/5.0*6.0;
 vec2 ratio=resolution/source;
 vec2 crop=ratio/max(ratio.x,ratio.y);
 vec2 st=(uv-.5)*crop+.5;
 st.x+=.06;
 st.y+=.18; // Keep the summit near the center of the logo, with sky above it.
 vec4 color=vec4(0.0);float total=0.0;
 for(int x=-3;x<=3;x++){for(int y=-3;y<=3;y++){
 float w=exp(-float(x*x+y*y)/4.5);
 color+=texture2D(frame,clamp(st+vec2(float(x),float(y))*blur*.4/resolution*crop,vec2(.001),vec2(.999)))*w;total+=w;
 }}
 gl_FragColor=mix(color/total,vec4(.9,1.,.98,1.),edge*.8);
}`;
const subscribeMotion = (callback: () => void) => {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
export function Mountain() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const region = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const pauseRef = useRef(false);
  useEffect(() => {
    pauseRef.current = paused;
  }, [paused]);
  useEffect(() => {
    const el = canvas.current!,
      host = region.current!;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const gl = el.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    const shader = (type: number, text: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, text);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };
    const vs = shader(
      gl.VERTEX_SHADER,
      "attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}",
    );
    // A power-of-two texture permits a synchronized blur pyramid from one video frame.
    // Explicit LOD avoids dozens of widely spaced samples and their ghosting artifacts.
    const mipmaps = !!gl.getExtension("EXT_shader_texture_lod");
    const fragmentSource = mipmaps
      ? "#extension GL_EXT_shader_texture_lod : enable\n" +
        fragment.replace(
          / vec4 color=[\s\S]*? gl_FragColor=/,
          " vec4 color=texture2DLodEXT(frame,clamp(st,vec2(.001),vec2(.999)),log2(1.0+(5.0-count)/5.0*8.0));float total=1.0;\n gl_FragColor=",
        )
      : fragment;
    const fs = shader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vs || !fs) return;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const attribute = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      mipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const uniforms = Object.fromEntries(
      ["resolution", "source", "circles[0]"].map((n) => [
        n,
        gl.getUniformLocation(program, n),
      ]),
    );
    const staging = document.createElement("canvas");
    const stage = staging.getContext("2d", { alpha: false });
    staging.width = 1024;
    staging.height = 512;
    const poster = new Image();
    poster.src = "/media/mountain-poster.webp";
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    let visible = true,
      id = 0,
      last = 0,
      disposed = false;
    const motion = () => {
      if (media.matches) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } else {
        video.src = "/media/mountain-teal.mp4";
        video.play().catch(() => {});
      }
    };
    motion();
    media.addEventListener("change", motion);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) video.pause();
      else if (!media.matches && !pauseRef.current)
        video.play().catch(() => {});
    });
    observer.observe(host);
    let previousRender = "";
    const visibility = () => {
      if (document.hidden) video.pause();
    };
    document.addEventListener("visibilitychange", visibility);
    const contextLost = () => {
      el.style.opacity = "0";
      host.dataset.ready = "false";
    };
    el.addEventListener("webglcontextlost", contextLost);
    const draw = (now: number) => {
      if (disposed) return;
      id = requestAnimationFrame(draw);
      if (!visible || document.hidden || gl.isContextLost() || now - last < 33)
        return;
      last = now;
      if (pauseRef.current || media.matches) video.pause();
      else if (video.paused && video.src) video.play().catch(() => {});
      const image = video.readyState >= 2 && !media.matches ? video : poster;
      if (image instanceof HTMLImageElement && !image.complete) return;
      const rect = host.getBoundingClientRect();
      const w = Math.min(960, Math.round(rect.width));
      const h = Math.round((w * rect.height) / rect.width);
      if (!w || !h) return;
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
        gl.viewport(0, 0, w, h);
      }
      const hero = host.closest("section")!.getBoundingClientRect();
      const progress = media.matches ? 1 : convergence(hero.top, hero.height);
      const renderKey = `${w},${h},${progress},${video.currentTime},${media.matches || pauseRef.current ? 0 : Math.floor(now / 33)}`;
      if (renderKey === previousRender) return;
      previousRender = renderKey;
      const circles = lensGeometry(
        w,
        h,
        progress,
        media.matches || pauseRef.current ? 0 : now / 1000,
      );
      gl.uniform2f(uniforms.resolution, w, h);
      gl.uniform2f(
        uniforms.source,
        image instanceof HTMLVideoElement
          ? image.videoWidth
          : image.naturalWidth,
        image instanceof HTMLVideoElement
          ? image.videoHeight
          : image.naturalHeight,
      );
      gl.uniform3fv(uniforms["circles[0]"], new Float32Array(circles.flat()));
      try {
        if (mipmaps && stage) {
          stage.drawImage(image, 0, 0, staging.width, staging.height);
        }
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGB,
          gl.RGB,
          gl.UNSIGNED_BYTE,
          mipmaps && stage ? staging : image,
        );
        if (mipmaps) gl.generateMipmap(gl.TEXTURE_2D);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        el.style.opacity = "1";
        host.dataset.ready = "true";
        host.dataset.progress = progress.toFixed(3);
      } catch {
        /* The CSS poster remains visible if a frame cannot be uploaded. */
      }
    };
    id = requestAnimationFrame(draw);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", visibility);
      el.removeEventListener("webglcontextlost", contextLost);
      cancelAnimationFrame(id);
      observer.disconnect();
      media.removeEventListener("change", motion);
      video.pause();
      video.removeAttribute("src");
      video.load();
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);
  return (
    <div
      className="mountain"
      ref={region}
      role="group"
      aria-label="A turquoise mountain coming into focus through five overlapping lenses"
    >
      <canvas ref={canvas} aria-hidden="true" />
      {!reduced && (
        <button
          className="motion-control"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Play motion" : "Pause motion"}
        </button>
      )}
      <span className="image-label">
        A different lens. A clearer perspective.
      </span>
    </div>
  );
}
