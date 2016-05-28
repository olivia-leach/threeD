'use strict';

let container;
let camera, controls, scene, renderer;
let objects = [];
let plane = new THREE.Plane();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    intersection = new THREE.Vector3(),
    INTERSECTED, SELECTED;

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.x = -20;
  camera.position.y = 100;
  camera.position.z = 30;
  // camera.position.z = 1000;

  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  scene = new THREE.Scene();

  scene.add( new THREE.AmbientLight( 0x505050 ) );

  let light = new THREE.HemisphereLight( 0xffffff, 1.5 );
  // light.position.set( 0, 500, 2000 );

  scene.add( light );

  // build cubes
  let nullColor = 0x585858;
  let colours = [0xC41E3A, 0x009E60, 0xFF5800, 0xFFD500, nullColor];

  let cubeSize = 20,
      floorHeight = 15,
      spacing = 0,
      vertSpacing = 0;

  let increment = cubeSize + spacing,
      vertIncrement = floorHeight + vertSpacing,
      allCubes = [];

  let dimensions = 4;
  let floors = 5;
  let positionOffset = (dimensions - 1) / 2;
  let floorOffset = (floorHeight - 1) / 2;

  function newCube(x, y, z) {
    let cubeColor = colours[randomInt(0,colours.length-1)];
    let cubeMaterial = new THREE.MeshLambertMaterial({color: cubeColor, transparent: true, opacity: 0.7});
    let cubeGeometry = new THREE.CubeGeometry(cubeSize, floorHeight, cubeSize);
    let object = new THREE.Mesh(cubeGeometry, cubeMaterial);
    object.castShadow = true;
    object.receiveShadow = true;

    object.position.x = x;
    object.position.y = y + 100;
    object.position.z = z;

    scene.add(object);
    objects.push(object);
  }

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

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.sortObjects = false;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  container.appendChild( renderer.domElement );

  renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );

  if ( SELECTED ) {

    if ( raycaster.ray.intersectPlane( plane, intersection ) ) {

      SELECTED.position.copy( intersection.sub( offset ) );

    }

    return;

  }

  let intersects = raycaster.intersectObjects( objects );

  if ( intersects.length > 0 ) {
    let nullColor = 0x585858;
    if ( INTERSECTED != intersects[ 0 ].object && intersects[0].object.material.color.getHex() != nullColor) {

        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
				INTERSECTED.material.color.setHex( 0x21ffde );

    }

    container.style.cursor = 'pointer';

  } else {

      if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
		  INTERSECTED = null;

      container.style.cursor = 'auto';

  }

}

function onDocumentMouseDown( event ) {

  console.log(INTERSECTED);
  // for moving cubes
  // event.preventDefault();
  //
  // raycaster.setFromCamera( mouse, camera );
  //
  // let intersects = raycaster.intersectObjects( objects );
  //
  // if ( intersects.length > 0 ) {
  //
  //   controls.enabled = false;
  //
  //   SELECTED = intersects[ 0 ].object;
  //
  //   if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
  //
  //     offset.copy( intersection ).sub( SELECTED.position );
  //
  //   }
  //
  //   container.style.cursor = 'move';
  //
  // }

}

function onDocumentMouseUp( event ) {

  event.preventDefault();

  controls.enabled = true;

  if ( INTERSECTED ) {

    SELECTED = null;

  }

  container.style.cursor = 'auto';

}

//

function animate() {

  requestAnimationFrame( animate );

  render();

}

function render() {

  let timer = new Date().getTime() * 0.0003;

  camera.position.x = (Math.cos( timer ) * 200);
  camera.position.z = (Math.sin( timer ) * 200);

	camera.lookAt( scene.position );
	camera.updateMatrixWorld();

  controls.update();

  renderer.render( scene, camera );

}

/*** Util ***/
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
