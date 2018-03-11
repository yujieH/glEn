// *** s102.js ***
// Mar 08 2018 yujieH

import * as THREE from 'three'
import { EffectComposer, GlitchPass, BloomPass, RenderPass } from 'postprocessing'
import * as dat from 'dat-gui'

import SimplexNoise from 'simplex-noise'
import * as Noise from 'noisejs'

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

let currentLocation = new THREE.Vector2( Math.random()*width,Math.random()*height)

const init = function (){
  const size = width * height
  data = new Uint8Array(3 * size)
  for (var i = 0; i < size; i++) {
    let k = i*3
    let posY = i%width
    let posX = Math.floor(i/width)
    if (posX == currentLocation.x && posY == currentLocation.y||
      posX == currentLocation.x + 1 && posY == currentLocation.y ||
      posX == currentLocation.x - 1 && posY == currentLocation.y ||
      posX == currentLocation.x && posY == currentLocation.y+1 ||
      posX == currentLocation.x && posY == currentLocation.y-1){
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
  const loopTime = 30000
  for (var i = 0; i < loopTime; i++) {
    drawCurl()
  }
  texture.needsUpdate = true
  material.needsUpdate = true
  renderer.render(scene, camera)


}
const drawCurl = function(){
  const size = width * height
  let eps = 1.0
  let n1, n2, a, b
  n1 = simplex.noise3D(currentLocation.x, currentLocation.y + eps, t)
  n2 = simplex.noise3D(currentLocation.x, currentLocation.y - eps, t)
  // n1 = Math.abs(n1)
  // n2 = Math.abs(n2)
  a = (n1 - n2)/(2 * eps) * 5
  n1 = simplex.noise3D(currentLocation.x+ eps, currentLocation.y, t)
  n2 = simplex.noise3D(currentLocation.x- eps, currentLocation.y, t)
  b = (n1 - n2)/(2 * eps) * 5
  // n1 = Math.abs(n1)
  // n2 = Math.abs(n2)
  let curl = new THREE.Vector2(a,-b)

  currentLocation.add(curl)
  //console.log( curl.x+ ','+ curl.y + ' : ' +currentLocation.x + ',' + currentLocation.y)
  if (currentLocation.x <  0) {
    currentLocation.x += width
  }else if(currentLocation.x > width){
    currentLocation.x -= width
  }
  if (currentLocation.y <  0) {
    currentLocation.y += height
  }else if(currentLocation.y > height){
    currentLocation.y -= height
  }

  // let gray = (simplex.noise2D(t*0.00000001,t*0.0000001) + 1)* 128
  let gray = Math.floor(t*0.00001)%192
  let index = ( Math.round(currentLocation.x) + Math.round(currentLocation.y)*width)
  data[index*3] = gray
  data[index*3+1] = gray
  data[index*3+2] = gray
  //
  // let index_x1 = index +1
  // data[index_x1*3] = gray
  // data[index_x1*3+1] = gray
  // data[index_x1*3+2] = gray
  //
  // let index_x2 = index -1
  // data[index_x2*3] = gray
  // data[index_x2*3+1] = gray
  // data[index_x2*3+2] = gray
  //
  // let index_y1 = index + width
  // data[index_y1*3] = gray
  // data[index_y1*3+1] = gray
  // data[index_y1*3+2] = gray
  //
  // let index_y2 = index - width
  // data[index_y2*3] = gray
  // data[index_y2*3+1] = gray
  // data[index_y2*3+2] = gray
  t += 0.9
}

const onWindowResize = function(){

}


init()
animate()
