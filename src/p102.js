var THREE = require("three");
var SimplexNoise = require("simplex-noise"),
  simplex = new SimplexNoise(Math.random);


const startTime = new Date().getTime();
const size = 12;
const density = 40;
const x_factor = 0.15;

// initialization
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 500);
camera.position.set(0,8,12);
camera.lookAt(new THREE.Vector3(0,0,0));

var scene = new THREE.Scene();


// set up line
var step = size / density;

var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
var geometry = [];
var sphere = [];

for (var i = 0; i < Math.pow(density,2); i++) {
  var col = Math.floor(i/density);
  var row = i % density;

  var currentTime = new Date().getTime() - startTime;
  var noiseVal = simplex.noise3D((step* row), (step * col), 0);

  geometry[i] = new THREE.SphereGeometry(0.012,9,9);  
  sphere[i] = new THREE.Mesh( geometry[i], material );
  
  scene.add(sphere[i]);
  // sphere[i].position.set((step* row) - size/2 , noiseVal, step * col - size/2);

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

    var noiseVal = simplex.noise3D((step* row)*x_factor , (step * col)*x_factor , t) + 1;
    sphere[i].position.set( ((step* row) - size/2), noiseVal*1.0, (step * col - size/2));
    sphere[i].scale.set(noiseVal + 0.32,noiseVal + 0.22,noiseVal + 0.32 );
  }

  renderer.render(scene, camera);
  t = t+0.008;

}

