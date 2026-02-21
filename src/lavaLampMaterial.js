import * as THREE from "three";

export function createLavaLampMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      uniform float iTime;
      uniform vec3 iResolution;
      uniform vec3 uColor0;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform float uSpeed;

      const float PI = 3.14159265;

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
        float time = iTime * 0.2 * uSpeed * 10.0;

        float color1;
        float color2;
        float color;

        color1 = (sin(dot(fragCoord.xy, vec2(sin(time*3.0), cos(time*3.0))) * 0.02 + time*3.0) + 1.0) / 2.0;

        vec2 center = vec2(iResolution.x/2.0, iResolution.y/2.0) +
          vec2(iResolution.x/2.0 * sin(-time*3.0), iResolution.y/2.0 * cos(-time*3.0));

        color2 = (cos(length(fragCoord.xy - center) * 0.03) + 1.0) / 2.0;

        color = (color1 + color2) / 2.0;

        vec3 c0 = uColor0;
        vec3 c1 = uColor1;
        vec3 c2 = uColor2;
        vec3 c3 = uColor3;

        vec3 mixA = mix(c0, c1, color);
        vec3 mixB = mix(c2, c3, color);
        vec3 finalCol = mix(mixA, mixB, color);

        fragColor = vec4(finalCol, 1.0);
      }

      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `,
  });
}
