// *** s101.js ***
// fbm simplex noise
// basic material
// Mar 06 2018 yujieH


import * as THREE from 'three'
import './water.js'
import './mirror.js'
import { EffectComposer, GlitchPass, BloomPass, RenderPass } from 'postprocessing'
import * as dat from 'dat-gui'
import triangulate from 'delaunay-triangulate'
import SimplexNoise from 'simplex-noise'
import * as Noise from 'noisejs'

const length = 800
const segment = 200
const x_factor = 0.08
const speed = 0.0025
const range = 4
const x_shift_delta = 0.012
let x_shift = 0

let simplex = new SimplexNoise(Math.random)
let t = 0

let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(50, window.innerWidth/ window.innerHeight, 0.1, 1000)
camera.position.set(0, 10, 0)
camera.lookAt(new THREE.Vector3(0, 0, -200))

let renderer = new THREE.WebGLRenderer( { antialias: true})
renderer.setSize( window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

//*** post effect ****
const composer = new EffectComposer(renderer)
composer.addPass ( new RenderPass(scene, camera))
const glitch = new GlitchPass()
const bloom = new BloomPass()
glitch.renderToScreen = true
bloom.renderToScreen = true
composer.addPass(bloom)
const clock = new THREE.Clock()



let noisePlaneBufferGeometry, noisePlaneBufferMaterial, noisePlane, water, mirror
let noisePlaneNormalHelper
let sphere

let triangleGeometry
let triangle, triangleWire
let triangleMaterial

let init = function () {

    //******* triangle ********
    triangleGeometry = new THREE.BufferGeometry()
    const vertices = new Float32Array([
      -35.0, 0, 0,
      0, 35.0*Math.sqrt(3), 0,
      35.0, 0, 0
    ])
    const normal = new Float32Array([
      0, 0, 1.0,
      0, 0, 1.0,
      0, 0, 1.0,
    ])
    const uvs = new Float32Array([
      0, 1.0,
      0, 1.0,
      0, 1.0,
      0, 1.0,
      0, 1.0,
      0, 1.0,
    ])
    triangleGeometry.setIndex([0,1,2])
    triangleGeometry.addAttribute('position', new THREE.BufferAttribute( vertices, 3))
    triangleGeometry.addAttribute('normal', new THREE.BufferAttribute( normal, 3))
    triangleGeometry.normalizeNormals ('uv' , new THREE.BufferAttribute( uvs, 2))

    triangleMaterial = new THREE.MeshBasicMaterial( {
      color: 0x000000,
      transparent: true,
      opacity: 1.0
    })
    const triangleWireMat = new THREE.MeshBasicMaterial({
      wireframe : true,
      transparent : true
    })

    triangle = new THREE.Mesh( triangleGeometry, triangleMaterial )
    triangleWire = new THREE.Mesh( triangleGeometry, triangleWireMat )
    triangle.position.set(0, 0.1 ,-180)
    triangle.rotation.y = 180 * Math.PI/180
    triangleWire.position.set(0, 0.1 ,-180)
    scene.add( triangle )
    scene.add( triangleWire )


    //******* Skybox **********
    const cylinderGeometry = new THREE.CylinderGeometry( 1000, 1000, 1000, 500 )
    const spriteMaterial = new THREE.ShaderMaterial({
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader-stripe1').textContent,
      side: THREE.DoubleSide
    })
    const cylinder = new THREE.Mesh (cylinderGeometry, spriteMaterial)
    scene.add(cylinder)

    //******* Ocean Surface **********
    noisePlaneBufferGeometry = new THREE.PlaneBufferGeometry( length, length, segment, segment)
    noisePlaneBufferGeometry.dynamic = true
    mirror = new THREE.Reflector( noisePlaneBufferGeometry, {
					clipBias: 0.001,
					textureWidth: window.innerWidth * window.devicePixelRatio,
					textureHeight: window.innerHeight * window.devicePixelRatio,
					color: 0xf0f0f0,
					recursion: 1
				} );
    mirror.position.y = 0.5;
    mirror.rotateX( - Math.PI / 2 );
    scene.add( mirror );

    noisePlaneBufferMaterial = new THREE.ShaderMaterial( {
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader-dot').textContent,
      // fragmentShader: document.getElementById('fragmentShader-stripe2').textContent,
      transparent: true
    } )
    // noisePlaneBufferMaterial = new THREE.MeshBasicMaterial( {color: 0x333333, transparent : true} )
    // noisePlaneBufferMaterial.wireframe = true
    noisePlane = new THREE.Mesh( noisePlaneBufferGeometry, noisePlaneBufferMaterial )
    noisePlane.position.y = 0.6;
    noisePlane.rotation.x = 270 * Math.PI/180
    scene.add( noisePlane )

}

let animate = function () {

  requestAnimationFrame(animate)
  updatePlane()
  noisePlane.geometry.attributes.position.needsUpdate = true
  // noisePlane.rotation.z += 1 * Math.PI/180
  // noisePlaneNormalHelper.update()
  renderer.render( scene, camera)
  composer.render(clock.getDelta())

}

let updatePlane = function () {

  // let position = mirror.geometry.attributes.position.array
  let position = noisePlane.geometry.attributes.position.array
  for (var i = 2; i < position.length; i+=3) {
    const index = (i-2)/3
    const row = Math.floor( index/(segment+1) )
    const col = index%(segment+1)

    position[i] = 0
    // position[i] += simplex.noise3D( row * x_factor , col * x_factor , t)
    for (var k = -5; k < 1; k++) {
        const p = Math.pow(2,k)
        const q = 1/p
        position[i] -= p * Math.abs ( simplex.noise3D( row * x_factor * q + x_shift , col * x_factor * q, t))
    }
    position[i] *= range
    // position[i] = Math.sin(position[i] + row*x_factor ) * 1.5

  }

  t+= speed
  x_shift += x_shift_delta
  // sphere.rotation.y += 0.2 * Math.PI/180
}

init()
animate()
