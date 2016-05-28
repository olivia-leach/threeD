'use strict';

// element: a jQuery object containing the DOM element to use
// dimensions: the number of cubes per row/column (default 3)
// background: the scene background colour
function Rubik(element, dimensions, floors, background) {

  background = background || 0x000000;

  let width = element.innerWidth(),
      height = element.innerHeight();

  let debug = false;

  /*** three.js boilerplate ***/
  let scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000),
      renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setClearColor(background, 1.0);
  renderer.setSize(width, height);
  renderer.shadowMapEnabled = true;
  element.append(renderer.domElement);

  camera.position = new THREE.Vector3(-20, 23, 30);
  camera.lookAt(scene.position);
  THREE.Object3D._threexDomEvent.camera(camera);

  /*** Lights ***/
  scene.add(new THREE.AmbientLight(0xffffff));

  /*** Camera controls ***/
  let orbitControl = new THREE.OrbitControls(camera, renderer.domElement);

  /*** Debug aids ***/
  if(debug) {
    scene.add(new THREE.AxisHelper( 20 ));
  }

  // build cubes

  let colours = [0xC41E3A, 0x009E60, 0xFF5800, 0xFFD500, 0xFFFFFF];

  let cubeSize = 4,
      floorHeight = 3,
      spacing = 0,
      vertSpacing = 0.5;

  let increment = cubeSize + spacing,
      vertIncrement = floorHeight + vertSpacing,
      allCubes = [];

  function newCube(x, y, z) {
    let cubeColor = colours[randomInt(0,colours.length-1)];
    let cubeMaterial = new THREE.MeshBasicMaterial({color: cubeColor, transparent: true, opacity: 0.6});
    let cubeGeometry = new THREE.CubeGeometry(cubeSize, floorHeight, cubeSize);
    let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;

    cube.position = new THREE.Vector3(x, y, z);
    cube.rubikPosition = cube.position.clone();

    scene.add(cube);
    allCubes.push(cube);
  }

  let positionOffset = (dimensions - 1) / 2;
  let floorOffset = (floorHeight - 1) / 2;
  for(let i = 0; i < dimensions; i ++) {
    for(let j = 0; j < floors; j ++) {
      for(let k = 0; k < dimensions; k ++) {

        let x = (i - positionOffset) * increment,
            y = (j - floorOffset) * vertIncrement,
            z = (k - positionOffset) * increment;

        newCube(x, y - floors/2, z);
      }
    }
  }

  function render() {

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  /*** Util ***/
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  //Go!
  render();

}
