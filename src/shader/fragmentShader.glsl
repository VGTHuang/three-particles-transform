varying float existence; // whether particle exist or not

void main() {
   if(existence <= 0.0) {
      discard;
   }
   gl_FragColor = vec4(1.0, 1.0, 1.0, existence*0.5);
}