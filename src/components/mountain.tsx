"use client";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useId,
} from "react";
import { convergence, lensGeometry, lensApertures } from "@/lib/lenses";

import { lensArtwork } from "@/lib/lens-artwork";

const gaussianSampling = `
 vec4 color=vec4(0.0);float total=0.0;
 float blur=(5.0-count)/5.0*3.5;
 for(int x=-3;x<=3;x++){for(int y=-3;y<=3;y++){
 float w=exp(-float(x*x+y*y)/4.5);
 color+=texture2D(frame,clamp(st+vec2(float(x),float(y))*blur*.4/resolution*crop,vec2(.001),vec2(.999)))*w;total+=w;
 }}`;
const pyramidSampling = `
 // Blur radius decreases linearly with the number of overlapping lenses.
 float level=log2(1.0+(5.0-count)/5.0*3.5*crop.x/(texel.x*resolution.x));
 vec2 delta=(exp2(level)-1.0)*texel*.7;
 vec4 color=vec4(0.0);float total=0.0;
 for(int x=-1;x<=1;x++){for(int y=-1;y<=1;y++){
 float w=(x==0?2.0:1.0)*(y==0?2.0:1.0);
 color+=texture2DLodEXT(frame,clamp(st+vec2(float(x),float(y))*delta,vec2(.001),vec2(.999)),level)*w;total+=w;
 }}`;
function fragmentShader(mipmaps: boolean) {
  return `${mipmaps ? "#extension GL_EXT_shader_texture_lod : enable\n" : ""}
precision mediump float;
uniform sampler2D frame;
uniform vec2 resolution;
uniform vec2 source;
uniform vec2 texel;
uniform vec3 circles[5];
varying vec2 uv;
void main(){
 vec2 p=vec2(uv.x,1.0-uv.y)*resolution;
 float count=0.0;
 for(int i=0;i<5;i++){float d=distance(p,circles[i].xy);count+=1.0-smoothstep(circles[i].z-0.7,circles[i].z+0.7,d);}
 vec2 ratio=resolution/source;
 vec2 crop=ratio/max(ratio.x,ratio.y);
 vec2 st=(uv-.5)*crop+.5;
 // Compose the uploaded clip's stable summit at the final logo center.
 st.x-=.045;
 st.y+=.14;
 ${mipmaps ? pyramidSampling : gaussianSampling}
 // Extend the sky smoothly where the composition needs extra headroom.
 // Averaging the top edge avoids stretching clouds into vertical streaks.
 vec4 picture=color/total;
 if(st.y>.94){vec4 sky=(texture2D(frame,vec2(.2,.995))+texture2D(frame,vec2(.5,.995))+texture2D(frame,vec2(.8,.995)))/3.0;picture=mix(picture,sky,smoothstep(.94,1.04,st.y));}
 gl_FragColor=picture;
}`;
}
const subscribeMotion = (callback: () => void) => {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
export function Mountain() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const outlineSvg = useRef<SVGSVGElement>(null);
  const outlinePaths = useRef<(SVGPathElement | null)[]>([]);
  const gradientId = `trickfilm-lens-${useId().replaceAll(":", "")}`;
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
    const mobile = matchMedia("(max-width: 1000px)").matches;
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
    // One decoded video frame supplies the sharp texture and the entire blur pyramid.
    const staging = document.createElement("canvas");
    staging.width = mobile ? 1024 : 2048;
    staging.height = staging.width / 2;
    const stage = staging.getContext("2d", { alpha: false });
    const mipmaps = !!stage && !!gl.getExtension("EXT_shader_texture_lod");
    const fs = shader(gl.FRAGMENT_SHADER, fragmentShader(mipmaps));
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
      ["resolution", "source", "texel", "circles[0]"].map((n) => [
        n,
        gl.getUniformLocation(program, n),
      ]),
    );
    const poster = new Image();
    poster.src = "/media/summit-poster.webp";
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
        video.src = mobile
          ? "/media/summit-mobile.mp4"
          : "/media/summit-desktop.mp4";
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
      const w = Math.min(
        mobile ? 640 : 1280,
        Math.round(rect.width * Math.min(devicePixelRatio || 1, 1.5)),
      );
      const h = Math.round((w * rect.height) / rect.width);
      if (!w || !h) return;
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
        gl.viewport(0, 0, w, h);
        outlineSvg.current?.setAttribute("viewBox", `0 0 ${w} ${h}`);
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
      const apertures = lensApertures(circles);
      circles.forEach(([x, y, radius], i) => {
        const art = lensArtwork[i];
        const scale = radius / (art.width / 2);
        outlinePaths.current[i]?.setAttribute(
          "transform",
          `translate(${x - (art.width / 2) * scale} ${y - (art.height / 2) * scale}) scale(${scale})`,
        );
      });
      gl.uniform2f(uniforms.resolution, w, h);
      gl.uniform2f(uniforms.texel, 1 / staging.width, 1 / staging.height);
      gl.uniform2f(
        uniforms.source,
        image instanceof HTMLVideoElement
          ? image.videoWidth
          : image.naturalWidth,
        image instanceof HTMLVideoElement
          ? image.videoHeight
          : image.naturalHeight,
      );
      gl.uniform3fv(uniforms["circles[0]"], new Float32Array(apertures.flat()));
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
      <svg
        ref={outlineSvg}
        className="lens-outlines"
        viewBox="0 0 445 435"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {lensArtwork.map((art, i) => (
            <radialGradient
              key={art.name}
              id={`${gradientId}-${i}`}
              gradientUnits="userSpaceOnUse"
              cx={art.width / 2}
              cy={art.height / 2}
              r={art.width / 2}
              fx={art.aperture.x}
              fy={art.aperture.y}
              fr={art.aperture.radius}
            >
              <stop offset="0" stopColor="white" stopOpacity="0.05" />
              <stop offset="1" stopColor="white" stopOpacity="0.20" />
            </radialGradient>
          ))}
        </defs>
        {lensArtwork.map((art, i) => (
          <path
            key={art.name}
            data-lens={art.name}
            ref={(node) => {
              outlinePaths.current[i] = node;
            }}
            d={art.path}
            fill={`url(#${gradientId}-${i})`}
          />
        ))}
      </svg>
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
