import {
  AmbientLight,
  Color,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  Scene,
  SphereBufferGeometry,
  SpotLight,
  Vector3,
} from 'https://unpkg.com/three@0.120.0/build/three.module.js';

import useThree from 'https://codepen.io/soju22/pen/cb31020fed766eb66bc8ad1879bc3325.js';

const { randFloat: rnd, randFloatSpread: rndFS } = MathUtils;

App();

function App() {
  let three, scene;
  let cannon, iMesh;

  const target = new Vector3();
  let sphere, light1, light2;

  init();
  

  function init() {
    three = useThree().init({
      canvas: document.getElementById('canvas'),
      camera_fov: 50,
      camera_pos: new Vector3(0, 0, 25),
      camera_ctrl: {
        enableDamping: true,
        dampingFactor: 0.05,
      },
      mouse_move: true,
      mouse_raycast: true,
    });
    three.renderer.shadowMap.enabled = true;

    cannon = useCannon();

    initScene();
    animate();
  }

  function initScene() {
    scene = new Scene();

    scene.background = new Color(0xffffff);
    scene.add(new AmbientLight(0x808080));

    light1 = new SpotLight(0xffffff, 0.5, 0, Math.PI / 8, 0.1);
    light1.position.set(0, 20, 50);
    light1.castShadow = true;
    light1.shadow.mapSize.width = 2048;
    light1.shadow.mapSize.height = 2048;
    scene.add(light1);
    scene.add(light1.target);

    light2 = new SpotLight(0xff0000, 0.5, 0, Math.PI / 8, 0.1);
    light2.position.set(0, -20, 50);
    light2.castShadow = true;
    light2.shadow.mapSize.width = 2048;
    light2.shadow.mapSize.height = 2048;
    scene.add(light2);
    scene.add(light2.target);

    sphere = new Mesh(
      new SphereBufferGeometry(5, 24, 24),
      new MeshPhongMaterial({ color: 0xffffff })
    );
    sphere.receiveShadow = true;
    scene.add(sphere);
    cannon.addMesh(sphere);

    initInstancedMesh();
  }

  function initInstancedMesh() {
    const geometry = new SphereBufferGeometry(1, 16, 16);
    // const geometry = new BoxBufferGeometry(1, 1, 1);
    const material = new MeshPhongMaterial({ color: 0xffffff, vertexColors: true });
    iMesh = new InstancedMesh(geometry, material, 200);
    iMesh.instanceMatrix.setUsage(DynamicDrawUsage);
    iMesh.mass = 0.1;

    iMesh.castShadow = true;
    iMesh.receiveShadow = true;

    // instance matrix
    const dummy = new Object3D();
    iMesh.scales = new Float32Array(iMesh.count);
    for (let i = 0; i < iMesh.count; i++) {
      dummy.position.set(rndFS(40), rndFS(40), rndFS(40));
      dummy.updateMatrix();
      iMesh.setMatrixAt(i, dummy.matrix);
      iMesh.scales[i] = rnd(0.25, 1);
    }

    // colors
    const cscale = chroma.scale([0xffffff, 0xc5777c, 0x437b7f]);
    iMesh.cscale = cscale;
    const colors = [];
    for (let i = 0; i < iMesh.count; i++) {
      const color = new Color(cscale(rnd(0, 1)).hex());
      colors.push(color.r, color.g, color.b);
    }
    iMesh.geometry.setAttribute('color', new InstancedBufferAttribute(new Float32Array(colors), 3));

    scene.add(iMesh);
    cannon.addMesh(iMesh);

    // custom gravity
    const v = new Vector3();
    iMesh.bodies.forEach(body => {
      body.preStep = () => {
        v.copy(target).sub(body.position).normalize().multiplyScalar(0.5);
        v.clampScalar(-0.5, 0.5);
        body.force.copy(v);
      };
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    target.copy(three.mouseV3);
    cannon.step();
    render();
  }

  function render() {
    const { renderer, camera, cameraCtrl } = three;
    if (cameraCtrl) cameraCtrl.update();
    renderer.render(scene, camera);
  }
}

/**
 * From https://github.com/mrdoob/three.js/blob/master/examples/jsm/physics/CannonPhysics.js
 */
function useCannon() {
  const world = new CANNON.World();
  world.gravity.set(0, 0, 0);
  // world.broadphase = new CANNON.SAPBroadphase(world);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 20;

  const meshes = [];

  const obj = {
    world,
    addMesh,
    step,
  };

  function addMesh(mesh) {
    const shape = getShape(mesh.geometry);
    if (shape) {
      if (mesh.isInstancedMesh) {
        handleInstancedMesh(mesh, shape);
      } else if (mesh.isMesh) {
        handleMesh(mesh, shape);
      }
    }
  }

  function step(mesh) {
    world.step(1 / 60);
    for (let i = 0, l = meshes.length; i < l; i++) {
      const mesh = meshes[i];
      if (mesh.isInstancedMesh) {
        const iMatrix = mesh.instanceMatrix.array;
        const bodies = mesh.bodies;
        for (let j = 0; j < bodies.length; j++) {
          const body = bodies[j];
          compose(body.position, body.quaternion, mesh.scales[j], iMatrix, j * 16);
        }
        mesh.instanceMatrix.needsUpdate = true;
      } else if (mesh.isMesh) {
        mesh.position.copy(mesh.body.position);
        mesh.quaternion.copy(mesh.body.quaternion);
      }
    }
  };

  function getShape(geometry) {
    const parameters = geometry.parameters;
    switch (geometry.type) {
      case 'BoxBufferGeometry':
        const boxParams = new CANNON.Vec3();
        boxParams.x = parameters.width / 2;
        boxParams.y = parameters.height / 2;
        boxParams.z = parameters.depth / 2;
        return new CANNON.Box(boxParams);

      case 'PlaneBufferGeometry':
        return new CANNON.Plane();

      case 'SphereBufferGeometry':
        return new CANNON.Sphere(parameters.radius);

      case 'CylinderBufferGeometry':
        return new CANNON.Cylinder(parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments);
    }
    return null;
  };

  function handleMesh(mesh, shape) {
    const position = new CANNON.Vec3();
    position.copy(mesh.position);

    const quaternion = new CANNON.Quaternion();
    quaternion.copy(mesh.quaternion);

    const body = new CANNON.Body({ position, quaternion, mass: mesh.mass, shape });
    world.addBody(body);

    if (mesh.mass > 0) {
      mesh.body = body;
      meshes.push(mesh);
    }
  };

  function handleInstancedMesh(mesh, shape) {
    const iMatrix = mesh.instanceMatrix.array;
    const bodies = [];
    for (let i = 0; i < mesh.count; i++) {
      const index = i * 16;

      const position = new CANNON.Vec3();
      position.set(iMatrix[index + 12], iMatrix[index + 13], iMatrix[index + 14]);

      // handle instance scale
      const scale = mesh.scales[i];
      const geoParams = mesh.geometry.parameters;
      if (mesh.geometry.type === 'SphereBufferGeometry') {
        shape = new CANNON.Sphere(scale * geoParams.radius);
      } else if (mesh.geometry.type === 'BoxBufferGeometry') {
        shape = new CANNON.Box(new CANNON.Vec3(
          scale * geoParams.width / 2,
          scale * geoParams.height / 2,
          scale * geoParams.depth / 2
        ));
      }
      const mass = scale * mesh.mass;
      const damping = 0.1; // mass * 0.1;
      const body = new CANNON.Body({ position, mass, shape, linearDamping: damping, angularDamping: damping });

      world.addBody(body);
      bodies.push(body);
    }

    if (mesh.mass > 0) {
      mesh.bodies = bodies;
      meshes.push(mesh);
    }
  };

  function compose(position, quaternion, scale, iMatrix, index) {
    const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    iMatrix[index + 0] = (1 - (yy + zz)) * scale;
    iMatrix[index + 1] = (xy + wz) * scale;
    iMatrix[index + 2] = (xz - wy) * scale;
    iMatrix[index + 3] = 0;

    iMatrix[index + 4] = (xy - wz) * scale;
    iMatrix[index + 5] = (1 - (xx + zz)) * scale;
    iMatrix[index + 6] = (yz + wx) * scale;
    iMatrix[index + 7] = 0;

    iMatrix[index + 8] = (xz + wy) * scale;
    iMatrix[index + 9] = (yz - wx) * scale;
    iMatrix[index + 10] = (1 - (xx + yy)) * scale;
    iMatrix[index + 11] = 0;

    iMatrix[index + 12] = position.x;
    iMatrix[index + 13] = position.y;
    iMatrix[index + 14] = position.z;
    iMatrix[index + 15] = 1;
  }

  return obj;
}
