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
let nFactor = 128

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

const width = Math.floor( window.innerWidth * 0.3)
const height = Math.floor( window.innerHeight * 0.3 )
console.log(width)
console.log(height)

const init = function (){
  const size = width * height
  data = new Uint8Array(3 * size)

  for (var i = 0; i < size; i++) {
    let k = i*3
    let val = simplex.noise3D( (i%width) / nFactor, Math.floor(i/width)/nFactor, t)
    val = (val+1)*0.5*256
    // let t = Math.random()*256;
    data[k] = val
    data[k+1] = val
    data[k+2] = val
    // console.log(t)
  }
  texture = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBFormat
  )
  // texture.magFilter = THREE.NearestFilter; // also check out THREE.LinearFilter just to see the results
  texture.needsUpdate = true;

  geometry = new THREE.PlaneBufferGeometry(width ,height , 50, 50)
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
    // wireframe: true
  })
  planeMesh = new THREE.Mesh(geometry, material)
  planeMesh.position.set(0, 0, -800)
  scene.add(planeMesh)
  renderer.render(scene, camera)
}

const animate = function(){
  requestAnimationFrame(animate)

  const size = width * height

  let t_data = Array(0)

  for (var i = 0; i < size; i++) {
    let k = i*3
    let val = 0
    let p = 2

    //.#1
    // val += 1/p * Math.abs( simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t) )
    // p*=2
    // val += 1/p * Math.abs( simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t) )
    // val = Math.sin(val + (i%width) / nFactor * p / 512.0)*256

    //.#2
    // val += 1/p * simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t)
    // p*=2
    // val += 1/p * simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t)
    // val = Math.min((val+1)*128, 255)
    // val = Math.max(val, 0)

    //.#3
    val += simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t)
    p*=2
    val += simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t)
    p*=2
    val += simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t)
    p*=2
    val += 1/1.1*simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t)
    p*=2
    val += 1/1.2*simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t)
    p*=2
    val += 1/2*simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t)
    p*=2
    val += 1/4*simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t)
    p*=2
    val += 1/16*simplex.noise3D( (i%width) / nFactor * p, Math.floor(i/width)/nFactor * p , t)
    val = Math.min((val+1)*128, 255)
    val = Math.max(val, 0)

    t_data[k] = val
    t_data[k+1] = val
    t_data[k+2] = val
    // console.log(t)
  }
  data.set(t_data)
  texture.needsUpdate = true
  material.needsUpdate = true
  t+= 0.08
  renderer.render(scene, camera)
  // console.log('looping:' + t)
}


const onWindowResize = function(){

}


init()
animate()
