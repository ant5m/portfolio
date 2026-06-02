import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('./public/assets/3D-Models/MatchaShop.glb', (gltf) => {
  const objects = [];
  gltf.scene.traverse((child) => {
    if (child.isMesh || child.isObject3D) {
      objects.push({
        name: child.name,
        type: child.constructor.name,
      });
    }
  });
  console.log(JSON.stringify(objects, null, 2));
  process.exit(0);
});
