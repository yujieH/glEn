import * as THREE from 'three'
import * as dat from 'dat-gui'

class INSPECTOR {
  constructor(){
    this.amount = 30000
  }
}

var text = new INSPECTOR();
window.onload = function(){
  var gui = new dat.GUI()
  gui.add(text, 'amount')
}

init()
animate()


var renderer, scene, camera
var geometry, positions, material, points

function init(){
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth,  window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 500);
  camera.position.set(0, 0, 200);
  camera.lookAt(new THREE.Vector3(0,0,0));


  geometry = new THREE.BufferGeometry()
  positions = []
  for (var i = 0; i < text.amount; i++) {
    var x = Math.random() * 100 - 50
    var y = Math.random() * 100 - 50
    var z = Math.random() * 100 - 50
    positions.push(x,y,z)
  }
  geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3).setDynamic(true))
  material = new THREE.PointsMaterial( { size: 0.65, VertexColors: THREE.VertexColors})
  points = new THREE.Points(geometry, material)


  // var wireframe = new THREE.WireframeGeometry( geometry );
  // var line = new THREE.LineSegments( wireframe );
  // line.material.depthTest = false;
  // line.material.opacity = 0.8;
  // line.material.transparent = true;
  // scene.add( line );
  scene.add( points )
}


function animate(){
  requestAnimationFrame( animate )
  render()
}

function render(){
  var time = Date.now() * 0.001
  points.rotation.x = time *0.25
  points.rotation.y = time *0.5

  renderer.render(scene, camera)
}
