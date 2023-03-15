
import { 
    Scene, 
    DirectionalLight, 
    PerspectiveCamera, 
    WebGLRenderer,
    PlaneGeometry, 
    MeshPhongMaterial, 
    DoubleSide, 
    Mesh,
    Raycaster,
    BufferAttribute } from 'three';


import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import * as dat from 'dat.gui';
import gsap from 'gsap';

const gui = new dat.GUI()

const world = {
    plane: { 
        width: 400,
        height: 400,
        widthSegments: 50,
        heightSegments: 50,
    },

}

gui.add(world.plane, 'width', 1, 450, 0.1).onChange(resizePlane)
gui.add(world.plane, 'height', 1, 450, 0.1).onChange(resizePlane)
gui.add(world.plane, 'widthSegments', 1, 60, 0.1).onChange(resizePlane)
gui.add(world.plane, 'widthSegments', 1, 60, 0.1).onChange(resizePlane)

function resizePlane() {
    planeMesh.geometry.dispose();
    planeMesh.geometry = new PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments);


    // vertice position randomization
    const { array } = planeMesh.geometry.attributes.position;
    const randomValues = [];

    for ( let i = 0; i < array.length; i++) {

        if (i % 3 === 0 ) {
            const x = array[i];
            const y = array[i + 1];
            const z = array[i + 2];

            array[i] = x + (Math.random() - 0.5) * 3;
            array[i + 1] = y + (Math.random() - 0.5) * 3;
            array[i + 2] = z + (Math.random() - 0.5) * 3;
        }

        randomValues.push(Math.random() * Math.PI * 2);
    }

    planeMesh.geometry.attributes.position.randomValues = randomValues;
    planeMesh.geometry.attributes.position.originalPosition = array;

    const colors = [];
    for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
        colors.push(0, .19, .4);
    }

    planeMesh.geometry.setAttribute('color', 
        new BufferAttribute(new Float32Array(colors), 3)
    )

}

const raycaster = new Raycaster();
const scene = new Scene();

// aspect ratio, width/height, near, far
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

const renderer = new WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

// width, length, widthSegments, lengthSegments
const planeGeometry = new PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments);
 
// doesn't react to light
// const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });

// use phong material to react to light
const planeMaterial = new MeshPhongMaterial({ 
    side: DoubleSide, 
    flatShading: true,
    vertexColors: true,
});

const planeMesh = new Mesh(planeGeometry, planeMaterial);


const light = new DirectionalLight(0xffffff, 1);
light.position.set(0, -1, 1);
const backLight = new DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1)
scene.add(planeMesh)
scene.add(light)
scene.add(backLight)

resizePlane()

new OrbitControls(camera, renderer.domElement);

// moving the camera back so we can see the cube
camera.position.z = 50;

const mouse = {
    x: undefined,
    y: undefined
}
let frame = 0; 
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    raycaster.setFromCamera(mouse, camera);
    frame += 0.01;

    const { array, originalPosition, randomValues } = planeMesh.geometry.attributes.position;

    for (let i = 0; i < array.length; i += 3) {
        array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.003;
        
        array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.003;
        
        // array[i + 2] = originalPosition[i] + Math.cos(frame + randomValues[i + 2]) * 0.003;
    }
    
    planeMesh.geometry.attributes.position.needsUpdate = true;

    const intersects = raycaster.intersectObject(planeMesh, true);
    
    if (intersects.length > 0) {
        
        const { color } = intersects[0].object.geometry.attributes;
        
        // 1 vertix
        color.setX(intersects[0].face.a, 0.1);
        color.setY(intersects[0].face.a, 0.5);
        color.setZ(intersects[0].face.a, 1);

        // 2 vertix
        color.setX(intersects[0].face.b, 0.1);
        color.setY(intersects[0].face.b, 0.5);
        color.setZ(intersects[0].face.b, 1);

        // 3 vertix
        color.setX(intersects[0].face.c, 0.1);
        color.setY(intersects[0].face.c, 0.5);
        color.setZ(intersects[0].face.c, 1);

        color.needsUpdate = true;

        const initialColor = {
            r: 0,
            g: .19,
            b: .4
        }

        const hoverColor = {
            r: 0.1,
            g: .5,
            b: 1
        }

        gsap.to(hoverColor , {
            r: initialColor.r,
            g: initialColor.g,
            b: initialColor.b,
            onUpdate: () => {
                // 1 vertix
                color.setX(intersects[0].face.a, hoverColor.r);
                color.setY(intersects[0].face.a, hoverColor.g);
                color.setZ(intersects[0].face.a, hoverColor.b);
        
                // 2 vertix
                color.setX(intersects[0].face.b, hoverColor.r);
                color.setY(intersects[0].face.b, hoverColor.g);
                color.setZ(intersects[0].face.b, hoverColor.b);
        
                // 3 vertix
                color.setX(intersects[0].face.c, hoverColor.r);
                color.setY(intersects[0].face.c, hoverColor.g);
                color.setZ(intersects[0].face.c, hoverColor.b);
            }
        })
    }
}
animate()

addEventListener('mousemove', (event) => {
    // not normalized, this wont work
    // mouse.x = event.clientX
    // mouse.y = event.clientY

    // normalized
    mouse.x = ( event.clientX / innerWidth ) * 2 - 1;
    mouse.y = -( event.clientY / innerHeight ) * 2 + 1;
    

});

document.body.appendChild(renderer.domElement);
