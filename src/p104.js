// *** p104.js ***
// - Three js Buffer Geometry
// - fbm simplex noise test
// - There is no normal information in this buffer geometry
//Dec 20, 2017 yujieH

import * as THREE from 'three'
import SimplexNoise from 'simplex-noise'
import * as dat from 'dat-gui'
import triangulate from 'delaunay-triangulate'

import * as Noise from 'noisejs'



var lenght = 10
var density = 180

class Args {
  constructor(){
    this.length = 10
    this.density = 150
    this.noiseRange = 0.22
    this.finFactor = 1
    this.x_factor = 0.8
    this.tDelta = 0.008
    this.xDelta = 0.0072
  }
}

var controller = new Args()

var renderer, scene, camera
var geometry, vertices = [], triVertices = []
var points, wireframe, line

var simplex = new SimplexNoise(Math.random)
var noise = new Noise.Noise(Math.random())

var t = 0
var xShift = 0

init()
animate()

function initGUI(){
  var gui = new dat.GUI()
  gui.add(controller, 'length')
  gui.add(controller, 'density')
  gui.add(controller, 'noiseRange',-9,9)
  gui.add(controller, 'finFactor',-3,3)
  gui.add(controller, 'x_factor',0,2)
  gui.add(controller, 'tDelta', 0.001, 0.1)
  gui.add(controller, 'xDelta', 0.001, 0.1)
}

function init(){
  initGUI()
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth,  window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 500);
  camera.position.set(0, 3, 10);
  camera.lookAt(new THREE.Vector3(0,0,0));

  let step = lenght / density
  for (var i = 0; i < density * density ; i++) {
    let row = Math.floor(i/density)
    let col = i%density

    vertices[i*3] = step * col - lenght/2
    vertices[i*3 + 1] = 0
    vertices[i*3 + 2] = step * row - lenght/2
  }
  setTriVertices()

  geometry = new THREE.BufferGeometry()
  geometry.dynamic = true
  geometry.addAttribute('position', new THREE.Float32BufferAttribute(triVertices, 3).setDynamic(true))

  // var pointMat = new THREE.PointsMaterial({size: 0.1})
  // var points = new THREE.Points(geometry, pointMat)
  // scene.add( points );

  wireframe = new THREE.WireframeGeometry( geometry );
  line = new THREE.LineSegments( wireframe );
  line.material.depthTest = false;
  line.material.opacity = 1;
  line.material.transparent = true;
  scene.add( line );
  renderer.render(scene, camera)
}




function setTriVertices(){
  triVertices = []
  for (var i = 0; i < vertices.length; i++) {
    let row = Math.floor(i/density)
    let col = i%density

    if (row == density - 1) break;
    if (col == 0 ){
      triVertices.push (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2])
      triVertices.push (vertices[(i+1)*3], vertices[(i+1)*3 + 1], vertices[(i+1)*3 + 2])
      triVertices.push (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2])
    }else if(col == density -1) {
      triVertices.push (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2])
      triVertices.push (vertices[(i-1+density)*3], vertices[(i-1+density)*3 + 1], vertices[(i-1+density)*3 + 2])
      triVertices.push (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2])
    }else{
      triVertices.push (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2])
      triVertices.push (vertices[(i+1)*3], vertices[(i+1)*3 + 1], vertices[(i+1)*3 + 2])
      triVertices.push (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2])

      triVertices.push (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2])
      triVertices.push (vertices[(i-1+density)*3], vertices[(i-1+density)*3 + 1], vertices[(i-1+density)*3 + 2])
      triVertices.push (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2])
    }
  }
}


function animate(){
  requestAnimationFrame( animate )

  let step = lenght / density
  for (var i = 0; i < density * density ; i++) {
    let row = Math.floor(i/density)
    let col = i%density

    //vertices[i*3 + 1] = simplex.noise3D((step* row) * controller.x_factor * 0.125 + xShift , (step * col) * controller.x_factor*0.125  , t*0.25) * controller.noiseRange * 16 ;
    vertices[i*3 + 1] = 2 * controller.noiseRange * Math.abs( simplex.noise3D((step* row) * controller.x_factor * 0.5 + xShift , (step * col) * controller.x_factor * 0.5  , t) )
    vertices[i*3 + 1] += 1 * controller.noiseRange * Math.abs( simplex.noise3D((step* row) * controller.x_factor + xShift , (step * col) * controller.x_factor  , t) )
    vertices[i*3 + 1] += 1/2 * controller.noiseRange * Math.abs( simplex.noise3D((step* row) * controller.x_factor * 2 + xShift , (step * col) * controller.x_factor * 2 , t) )
    vertices[i*3 + 1] += 1/4 * controller.noiseRange * Math.abs( simplex.noise3D((step* row) * controller.x_factor * 4 + xShift , (step * col) * controller.x_factor * 4 , t) )
    vertices[i*3 + 1] += 1/8 * controller.noiseRange * Math.abs( simplex.noise3D((step* row) * controller.x_factor * 8 + xShift , (step * col) * controller.x_factor * 8 , t) )
    vertices[i*3 + 1] += 1/16 * controller.noiseRange * Math.abs( simplex.noise3D((step* row) * controller.x_factor * 16 + xShift , (step * col) * controller.x_factor * 16 , t) )
    vertices[i*3 + 1] += 1/32 * controller.noiseRange * Math.abs( simplex.noise3D((step* row) * controller.x_factor * 32 + xShift , (step * col) * controller.x_factor * 32 , t) )
    vertices[i*3 + 1] = vertices[i*3 + 1] * controller.finFactor

  }
  setTriVertices()


  t = t + controller.tDelta
  xShift = xShift + controller.xDelta


  geometry.attributes.position.needsUpdate = true


  for (let i = scene.children.length - 1; i >= 0; i--) {
      const object = scene.children[i];
      object.geometry.dispose();
      object.material.dispose();
      scene.remove(object);
  }

  geometry = new THREE.BufferGeometry()
  geometry.addAttribute('position', new THREE.Float32BufferAttribute(triVertices, 3).setDynamic(true))
  wireframe = new THREE.WireframeGeometry( geometry );
  line = new THREE.LineSegments( wireframe );
  line.material.color = new THREE.Color( 0xe3e2ee );
  scene.add( line );
  render()
}

function render(){
  renderer.render(scene, camera)
  // console.log(t)
}
