// *** s102.js ***
// Mar 08 2018 yujieH

import * as THREE from 'three'
import './water.js'
import './mirror.js'
import { EffectComposer, GlitchPass, BloomPass, RenderPass } from 'postprocessing'
import * as dat from 'dat-gui'

import triangulate from 'delaunay-triangulate'
import SimplexNoise from 'simplex-noise'
import * as Noise from 'noisejs'

// let noise = new Noise(Math.random)
let simplex = new SimplexNoise(Math.random)
let nFactor = 512

let t = 0

let camera, renderer, scene
camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 10000 )
camera.position.set(0, 0, 10)
camera.lookAt(new THREE.Vector3(0, 0, 0))
renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
scene = new THREE.Scene()

let geometry, material, planeMesh, texture
let data

const width = Math.floor( window.innerWidth )
const height = Math.floor( window.innerHeight )
console.log(width)
console.log(height)

let currentLocation = new THREE.Vector2( Math.floor( Math.random()*width ), Math.floor( Math.random()*height))

const init = function (){
  const size = width * height
  data = new Uint8Array(3 * size)
  for (var i = 0; i < size; i++) {
    let k = i*3
    let posY = i%width
    let posX = Math.floor(i/width)
    if (posX == currentLocation.x && posY == currentLocation.y) {
      data[k] = 0
      data[k+1] = 0
      data[k+2] = 0
    }else{
      data[k] = 255
      data[k+1] = 255
      data[k+2] = 255
    }

  }
  texture = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBFormat
  )
  // texture.magFilter = THREE.NearestFilter; // also check out THREE.LinearFilter just to see the results
  texture.needsUpdate = true;

  geometry = new THREE.PlaneBufferGeometry(window.innerWidth ,window.innerHeight , 50, 50)
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
    // wireframe: true
  })
  planeMesh = new THREE.Mesh(geometry, material)
  planeMesh.position.set(0, 0, -1000)
  scene.add(planeMesh)
  renderer.render(scene, camera)
}

const animate = function(){
  requestAnimationFrame(animate)

  const size = width * height

  //let t_data = Array(255)
  let eps = 1.0
  let n1, n2, a, b
  n1 = simplex.noise2D(currentLocation.x, currentLocation.y + eps,t)
  n2 = simplex.noise2D(currentLocation.x, currentLocation.y - eps,t)
  a = (n1 - n2)/(2 * eps)
  a = Math.floor(a*100)
  n1 = simplex.noise2D(currentLocation.x+ eps, currentLocation.y ,t )
  n2 = simplex.noise2D(currentLocation.x- eps, currentLocation.y ,t )
  b = (n1 - n2)/(2 * eps)
  b = Math.floor(b*100)
  let curl = new THREE.Vector2(a,-b)
  currentLocation.add(curl)
  let index = (currentLocation.x + currentLocation.y*width) * 3
  data[index] = 0
  data[index+1] = 0
  data[index+2] = 0

  //data.set(t_data)
  texture.needsUpdate = true
  material.needsUpdate = true
  renderer.render(scene, camera)
  console.log( curl.x+ ','+ curl.y + ' : ' +currentLocation.x + ',' + currentLocation.y)
  t+=1
}


const onWindowResize = function(){

}


init()
animate()
