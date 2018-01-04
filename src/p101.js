var THREE = require("three");
var SimplexNoise = require("simplex-noise"),
  simplex = new SimplexNoise(Math.random);


const size = 10;
const density = 60;

// initialization
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 500);
camera.position.set(0,6.5,6);
camera.lookAt(new THREE.Vector3(0,0,0));

var scene = new THREE.Scene();


// set up line
var step = size / density;

var material = new THREE.LineBasicMaterial({color: 0xaaaaaa});
var geometry = [];
var line = [];

for (var i = 0; i < Math.pow(density,2); i++) {
  var col = Math.floor(i/density);
  var row = i % density;

//  var currentTime = new Date().getTime() - startTime;
  var noiseVal = simplex.noise3D((step* row), (step * col), 0);

  geometry[i] = new THREE.Geometry();
  geometry[i].vertices.push(new THREE.Vector3( (step* row) - size/2, 0, step * col - size/2));
  geometry[i].vertices.push(new THREE.Vector3( (step* row) - size/2 , noiseVal, step * col - size/2));
  line[i] = new THREE.Line(geometry[i], material);

  scene.add(line[i]);
  // console.log( (step*row - size/2) + " , " + (step * col - size/2));
}

renderer.render(scene, camera);

//  animation and nosie

animate();
var t = 0;

function animate(){
  requestAnimationFrame(animate);

  for (var i = 0; i < Math.pow(density,2); i++) {
    var col = Math.floor(i/density);
    var row = i % density;

    var noiseVal = simplex.noise3D((step* row), (step * col), t) + 1;

    line[i].geometry.vertices[1].y = noiseVal / 6;
    line[i].geometry.verticesNeedUpdate = true;
    // console.log(t + " : " + noiseVal);
  }

  renderer.render(scene, camera);
  t = t+0.05;

}
