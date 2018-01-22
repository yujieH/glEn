// *** p105.js ***
// fbm simplex noise
// basic material
// Jan 18 2018 yujieH

import * as THREE from 'three'
import SimplexNoise from 'simplex-noise'
import * as dat from 'dat-gui'
import triangulate from 'delaunay-triangulate'

import * as Noise from 'noisejs'



var lenght = 3
var density = 100

class Args {
  constructor(){
    this.length = 10
    this.density = 150
    this.noiseRange = -0.5
    this.finFactor = 1
    this.x_factor = 0.22
    this.tDelta = 0.008
    this.xDelta = 0.0072
  }
}

var controller = new Args()

var renderer, scene, camera
var geometry, vertices = [], triVertices = []
var triNormal = []
var material, mesh

var plane

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
  camera.position.set(0, 1, 3);
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
  geometry.addAttribute('normal', new THREE.Float32BufferAttribute(triNormal, 3).setDynamic(true))
  material = new THREE.MeshNormalMaterial( {color: 0xffff00, side:THREE.DoubleSide} );
  // material.wireframe = true
  mesh = new THREE.Mesh(geometry, material)
  scene.add( mesh );

  // var geometry = new THREE.PlaneGeometry( 1, 1, 25 );
  // var material = new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  // plane = new THREE.Mesh( geometry, material );
  // plane.position.set(0,0,0)
  // scene.add( plane );

  var geometryX = new THREE.SphereGeometry( 0.6, 32, 32 );
  var materialX = new THREE.MeshNormalMaterial( );
  var sphereX = new THREE.Mesh( geometryX, materialX );
  sphereX.position.set(0,1,-10)
  scene.add( sphereX );

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  var helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  scene.add( helper );

  // var light = new THREE.PointLight( 0xff0000, 1, 100 );
  // light.position.set( 5, 5, 5 );
  // scene.add( light );

  var light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );

  renderer.render(scene, camera)
}



function setTriVertices(){
  triVertices = []
  triNormal = []
  for (var i = 0; i < vertices.length; i++) {
    let row = Math.floor(i/density)
    let col = i%density

    if (row == density - 1) break;
    if (col == 0 ){
      triVertices.push (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2]) //t3 => x, y, z
      triVertices.push (vertices[(i+1)*3], vertices[(i+1)*3 + 1], vertices[(i+1)*3 + 2]) //t2 => x, y, z
      triVertices.push (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2]) //t1 => x, y, z

      var pA = new THREE.Vector3 (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2])
      var pB = new THREE.Vector3 (vertices[(i+1)*3], vertices[(i+1)*3 + 1], vertices[(i+1)*3 + 2])
      var pC = new THREE.Vector3 (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2]) //t3 => x, y, z
      var cb = new THREE.Vector3()
      var ab = new THREE.Vector3()
      cb.subVectors(pA, pB)
      ab.subVectors(pC, pB)
      ab.cross(cb)
      ab.normalize()
      var nx = ab.x
      var ny = ab.y
      var nz = ab.z
      triNormal.push(nx, ny, nz)
      triNormal.push(nx, ny, nz)
      triNormal.push(nx, ny, nz)

    }else if(col == density -1) {
      triVertices.push (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2])
      triVertices.push (vertices[(i-1+density)*3], vertices[(i-1+density)*3 + 1], vertices[(i-1+density)*3 + 2])
      triVertices.push (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2])

      var pA = new THREE.Vector3 (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2])
      var pB = new THREE.Vector3 (vertices[(i-1+density)*3], vertices[(i-1+density)*3 + 1], vertices[(i-1+density)*3 + 2])
      var pC = new THREE.Vector3 (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2])
      var cb = new THREE.Vector3()
      var ab = new THREE.Vector3()
      cb.subVectors(pA, pB)
      ab.subVectors(pC, pB)
      cb.cross(ab)
      cb.normalize()
      var nx = cb.x
      var ny = cb.y
      var nz = cb.z
      triNormal.push(nx, ny, nz)
      triNormal.push(nx, ny, nz)
      triNormal.push(nx, ny, nz)

    }else{
      triVertices.push (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2])
      triVertices.push (vertices[(i+1)*3], vertices[(i+1)*3 + 1], vertices[(i+1)*3 + 2])
      triVertices.push (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2])

      var pA = new THREE.Vector3 (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2])
      var pB = new THREE.Vector3 (vertices[(i+1)*3], vertices[(i+1)*3 + 1], vertices[(i+1)*3 + 2])
      var pC = new THREE.Vector3 (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2]) //t3 => x, y, z
      var cb = new THREE.Vector3()
      var ab = new THREE.Vector3()
      cb.subVectors(pA, pB)
      ab.subVectors(pC, pB)
      ab.cross(cb)
      ab.normalize()
      var nx = ab.x
      var ny = ab.y
      var nz = ab.z
      triNormal.push(nx, ny, nz)
      triNormal.push(nx, ny, nz)
      triNormal.push(nx, ny, nz)

      triVertices.push (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2])
      triVertices.push (vertices[(i-1+density)*3], vertices[(i-1+density)*3 + 1], vertices[(i-1+density)*3 + 2])
      triVertices.push (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2])

      pA = new THREE.Vector3 (vertices[i*3], vertices[i*3 + 1], vertices[i*3 + 2])
      pB = new THREE.Vector3 (vertices[(i-1+density)*3], vertices[(i-1+density)*3 + 1], vertices[(i-1+density)*3 + 2])
      pC = new THREE.Vector3 (vertices[(i+density)*3], vertices[(i+density)*3 + 1], vertices[(i+density)*3 + 2])
      var cb = new THREE.Vector3()
      var ab = new THREE.Vector3()
      cb.subVectors(pA, pB)
      ab.subVectors(pC, pB)
      cb.cross(ab)
      cb.normalize()
      nx = cb.x
      ny = cb.y
      nz = cb.z
      triNormal.push(nx, ny, nz)
      triNormal.push(nx, ny, nz)
      triNormal.push(nx, ny, nz)
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
  geometry.addAttribute('position', new THREE.Float32BufferAttribute(triVertices, 3).setDynamic(true))
  geometry.addAttribute('normal', new THREE.Float32BufferAttribute(triNormal, 3).setDynamic(true))
  mesh.geometry.setDrawRange(0,triVertices.length)
  mesh.geometry.attributes.position.needsUpdate = true
  render()
}

function render(){
  renderer.render(scene, camera)
  // mesh.rotation.x += 0.01
  // plane.rotation.x += 0.01
  // plane.rotation.y += 0.01

  t = t + controller.tDelta
  xShift = xShift + controller.xDelta
}
