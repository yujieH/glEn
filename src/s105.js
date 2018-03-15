// *** s104.js ***
// curl 2D particle decrease!!!
// decrease particle
// Mar 10 2018 yujieH

import * as THREE from 'three'
import { EffectComposer, GlitchPass, BloomPass, RenderPass } from 'postprocessing'
import * as dat from 'dat-gui'

import SimplexNoise from 'simplex-noise'
import * as Noise from 'noisejs'

let simplex = new SimplexNoise(Math.random)
let x_factor = 0.002
let t = 0

let camera, renderer, scene
camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 10000 )
camera.position.set(0, 0, 10)
camera.lookAt(new THREE.Vector3(0, 0, 0))
renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
scene = new THREE.Scene()

let geometry, material, planeMesh, texture, data
const width = Math.floor( window.innerWidth )
const height = Math.floor( window.innerHeight )

let particleAmount = 800
let totalParticleSize = particleAmount*particleAmount
let currentLocation = []
let drawedDataArray

const init = function (){
  for (var i = 0; i < particleAmount; i++) {
    let x = i / particleAmount
    let y = 0.5
    currentLocation.push(new THREE.Vector2( x*width, y*height))
  }
  for (var i = 0; i < particleAmount; i++) {
    let x = i / particleAmount
    let y = 0.25
    currentLocation.push(new THREE.Vector2( x*width, y*height))
  }
  for (var i = 0; i < particleAmount; i++) {
    let x = i / particleAmount
    let y = 0.75
    currentLocation.push(new THREE.Vector2( x*width, y*height))
  }
  // for (var i = 0; i < particleAmount; i++) {
  //   let x = 0.5
  //   let y =i / particleAmount
  //   currentLocation.push(new THREE.Vector2( x*width, y*height))
  // }

  const size = width * height
  data = new Uint8Array(3 * size)
  drawedDataArray = Array(size)
  data.set(Array(3 * size).fill(255))
  texture = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBFormat
  )
  texture.needsUpdate = true;
  geometry = new THREE.PlaneBufferGeometry(window.innerWidth ,window.innerHeight , 50, 50)
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
  })
  planeMesh = new THREE.Mesh(geometry, material)
  planeMesh.position.set(0, 0, -1000)
  scene.add(planeMesh)
  renderer.render(scene, camera)
}

const animate = function(){
  requestAnimationFrame(animate)
  const loopTime = 10
  for (var i = 0; i < loopTime; i++) {
    drawCurl()
  }
  for (var i = 0; i < drawedDataArray.length; i++) {
    if (drawedDataArray[i] < t-1500  && data[i*3] < 255) {
      drawedDataArray[i] = t
      data[i*3] = 255
      data[i*3+1] = 255
      data[i*3+2] = 255
    }
  }
  texture.needsUpdate = true
  material.needsUpdate = true
  renderer.render(scene, camera)
}
const drawCurl = function(){
  const size = width * height
  let eps = 1.0
  let n1, n2, a, b
  for (var i = 0; i < currentLocation.length; i++) {
    if (currentLocation[i].x <  0 || currentLocation[i].x > width) {
      currentLocation[i].x = 0.5 * width
      currentLocation[i].y = 0.5 * height
    }
    if (currentLocation[i].y <  0 || currentLocation[i].y > height) {
      currentLocation[i].x = 0.5 * width
      currentLocation[i].y = 0.5 * height
    }
    let p = 1
    n1 = 0
    n2 = 0
    n1 += 1/p * simplex.noise3D( (currentLocation[i].x) * x_factor * p, (currentLocation[i].y + eps) * x_factor * p, t* x_factor)
    n2 += 1/p * simplex.noise3D( (currentLocation[i].x) * x_factor * p, (currentLocation[i].y - eps) * x_factor * p, t* x_factor)
    p *= 2
    n1 += 1/p * simplex.noise3D( (currentLocation[i].x) * x_factor * p, (currentLocation[i].y + eps) * x_factor * p, t* x_factor)
    n2 += 1/p * simplex.noise3D( (currentLocation[i].x) * x_factor * p, (currentLocation[i].y - eps) * x_factor * p, t* x_factor)
    p *= 2
    n1 += 1/p * simplex.noise3D( (currentLocation[i].x) * x_factor * p, (currentLocation[i].y + eps) * x_factor * p, t* x_factor)
    n2 += 1/p * simplex.noise3D( (currentLocation[i].x) * x_factor * p, (currentLocation[i].y - eps) * x_factor * p, t* x_factor)
    // n1 = Math.abs(n1)
    // n2 = Math.abs(n2)
    a = (n1 - n2)/(2 * eps)

    p = 1
    n1 = 0
    n2 = 0
    n1 += 1/p * simplex.noise3D( (currentLocation[i].x+ eps) * x_factor * p, (currentLocation[i].y) * x_factor * p, t* x_factor)
    n2 += 1/p * simplex.noise3D( (currentLocation[i].x- eps) * x_factor * p, (currentLocation[i].y) * x_factor * p ,t* x_factor)
    p *= 2
    n1 += 1/p * simplex.noise3D( (currentLocation[i].x+ eps) * x_factor * p, (currentLocation[i].y) * x_factor * p, t* x_factor)
    n2 += 1/p * simplex.noise3D( (currentLocation[i].x- eps) * x_factor * p, (currentLocation[i].y) * x_factor * p, t* x_factor)
    p *= 2
    n1 += 1/p * simplex.noise3D( (currentLocation[i].x+ eps) * x_factor * p, (currentLocation[i].y) * x_factor * p, t* x_factor)
    n2 += 1/p * simplex.noise3D( (currentLocation[i].x- eps) * x_factor * p, (currentLocation[i].y) * x_factor * p, t* x_factor)
    p *= 2
    n1 += 1/p * simplex.noise3D( (currentLocation[i].x+ eps) * x_factor * p, (currentLocation[i].y) * x_factor * p, t* x_factor)
    n2 += 1/p * simplex.noise3D( (currentLocation[i].x- eps) * x_factor * p, (currentLocation[i].y) * x_factor * p, t* x_factor)
    // n1 = Math.abs(n1)
    // n2 = Math.abs(n2)
    b = (n1 - n2)/(2 * eps)

    let curl = new THREE.Vector2(Math.abs(a),-b)
    currentLocation[i].add(curl)

    // let gray = (simplex.noise2D(t*0.00000001,t*0.0000001) + 1)* 128
    let gray = Math.floor(t*0.1) % 64
    let index = ( Math.round(currentLocation[i].x) + Math.round(currentLocation[i].y)*width)
    data[index*3] = gray
    data[index*3+1] = gray
    data[index*3+2] = gray

    drawedDataArray[index] = t
  }

  t += 1
}

const onWindowResize = function(){

}


init()
animate()
