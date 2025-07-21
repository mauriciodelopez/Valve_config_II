// script.js

// Three.js global variables
let scene, camera, renderer, controls, currentModel;

/**
 * Initializes the Three.js scene, camera, renderer, and orbit controls.
 * This function is called once when the page loads.
 */
function init3D() {
    console.log("init3D called: Initializing 3D scene.");
    const container = document.getElementById('container3D');
    if (!container) {
        console.error("Error: #container3D not found in the DOM.");
        return;
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = ''; // Clear any initial text
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;

    window.addEventListener('resize', onWindowResize, false);
    console.log("3D scene initialized successfully.");
}

/**
 * Handles window resizing to keep the 3D viewer responsive.
 */
function onWindowResize() {
    const container = document.getElementById('container3D');
    if (container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

/**
 * Animation loop for Three.js.
 * Continuously renders the scene and updates controls.
 */
function animate3D() {
    requestAnimationFrame(animate3D);
    controls.update();
    renderer.render(scene, camera);
}

/**
 * Defines material colors based on common valve materials.
 * @param {string} materialType - The selected body and bonnet material.
 * @returns {number} Hexadecimal color code.
 */
function getMaterialColor(materialType) {
    switch (materialType) {
        case 'cast_iron': return 0x808080; // Gray
        case 'ductile_iron': return 0x696969; // Darker Gray
        case 'carbon_steel': return 0x404040; // Even Darker Gray
        case 'stainless_steel':
        case 'stainless_steel_310': return 0xc0c0c0; // Silver/Light Gray
        case 'brass': return 0xb5a642; // Brass color
        case 'bronze': return 0xcd7f32; // Bronze color
        case 'plastic': return 0x90ee90; // Light Green
        case 'duplex_super_duplex': return 0x87ceeb; // Light Blue
        default: return 0xaaaaaa; // Default gray
    }
}

/**
 * Creates a 3D model based on valve type, material, and actuation.
 * This uses procedural geometry to represent different valve forms and actuators.
 * @param {string} valveFunction - The selected main function of the valve.
 * @param {string} bodyMaterial - The selected body and bonnet material.
 * @param {string} actuationType - The selected actuation type (manual, electric, pneumatic).
 */
function update3DModel(valveFunction, bodyMaterial, actuationType) {
    console.log(`update3DModel called with: Function=${valveFunction}, Material=${bodyMaterial}, Actuation=${actuationType}`);

    // Remove previous model if it exists
    if (currentModel) {
        scene.remove(currentModel);
        currentModel.traverse((object) => {
            if (object.isMesh) {
                object.geometry.dispose();
                object.material.dispose();
            }
        });
        console.log("Previous model removed.");
    }

    const valveGroup = new THREE.Group();
    const materialColor = getMaterialColor(bodyMaterial);
    const valveMaterial = new THREE.MeshPhongMaterial({ color: materialColor });

    let bodyGeometry, mainPart;

    // Create a new model based on the valve type
    switch (valveFunction) {
        case 'on_off':
            bodyGeometry = new THREE.BoxGeometry(1.8, 1.2, 1.2);
            mainPart = new THREE.Mesh(bodyGeometry, valveMaterial);
            valveGroup.add(mainPart);

            const flangeGeometry = new THREE.CylinderGeometry(1.0, 1.0, 0.2, 32);
            const flange1 = new THREE.Mesh(flangeGeometry, valveMaterial);
            flange1.rotation.z = Math.PI / 2;
            flange1.position.x = 1.0;
            valveGroup.add(flange1);

            const flange2 = new THREE.Mesh(flangeGeometry, valveMaterial);
            flange2.rotation.z = Math.PI / 2;
            flange2.position.x = -1.0;
            valveGroup.add(flange2);

            const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 16);
            const stemMesh = new THREE.Mesh(stemGeometry, valveMaterial);
            stemMesh.position.y = 0.8;
            valveGroup.add(stemMesh);

            // Actuator based on type
            if (actuationType === 'manual') {
                const handwheelGeometry = new THREE.TorusGeometry(0.4, 0.05, 16, 32);
                const handwheelMesh = new THREE.Mesh(handwheelGeometry, new THREE.MeshPhongMaterial({ color: 0x666666 }));
                handwheelMesh.position.y = 1.5;
                handwheelMesh.rotation.x = Math.PI / 2;
                valveGroup.add(handwheelMesh);
            } else if (actuationType === 'electric') {
                const electricBaseGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
                const electricBase = new THREE.Mesh(electricBaseGeometry, new THREE.MeshPhongMaterial({ color: 0x8b0000 })); // Dark Red
                electricBase.position.y = 1.2;
                valveGroup.add(electricBase);

                const electricTopGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
                const electricTop = new THREE.Mesh(electricTopGeometry, new THREE.MeshPhongMaterial({ color: 0x4b0000 })); // Even darker red
                electricTop.position.y = 1.6;
                valveGroup.add(electricTop);
            } else if (actuationType === 'pneumatic') {
                const pneumaticCylinderGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.8, 32);
                const pneumaticCylinder = new THREE.Mesh(pneumaticCylinderGeometry, new THREE.MeshPhongMaterial({ color: 0x008000 })); // Dark Green
                pneumaticCylinder.position.y = 1.3;
                valveGroup.add(pneumaticCylinder);

                const pneumaticCapGeometry = new THREE.CylinderGeometry(0.65, 0.65, 0.1, 32);
                const pneumaticCap = new THREE.Mesh(pneumaticCapGeometry, new THREE.MeshPhongMaterial({ color: 0x006400 })); // Even darker green
                pneumaticCap.position.y = 1.75;
                valveGroup.add(pneumaticCap);
            }
            break;

        case 'regulation':
            bodyGeometry = new THREE.SphereGeometry(1.0, 32, 32);
            mainPart = new THREE.Mesh(bodyGeometry, valveMaterial);
            valveGroup.add(mainPart);

            const pipeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 32);
            const pipe1 = new THREE.Mesh(pipeGeometry, valveMaterial);
            pipe1.rotation.z = Math.PI / 2;
            pipe1.position.x = 1.2;
            valveGroup.add(pipe1);

            const pipe2 = new THREE.Mesh(pipeGeometry, valveMaterial);
            pipe2.rotation.z = Math.PI / 2;
            pipe2.position.x = -1.2;
            valveGroup.add(pipe2);

            const stemGeometryReg = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 16);
            const stemMeshReg = new THREE.Mesh(stemGeometryReg, valveMaterial);
            stemMeshReg.position.y = 0.8;
            valveGroup.add(stemMeshReg);

            // Actuator based on type
            if (actuationType === 'manual') {
                const handwheelGeometry = new THREE.TorusGeometry(0.4, 0.05, 16, 32);
                const handwheelMeshReg = new THREE.Mesh(handwheelGeometry, new THREE.MeshPhongMaterial({ color: 0x666666 }));
                handwheelMeshReg.position.y = 1.5;
                handwheelMeshReg.rotation.x = Math.PI / 2;
                valveGroup.add(handwheelMeshReg);
            } else if (actuationType === 'electric') {
                const electricBaseGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
                const electricBase = new THREE.Mesh(electricBaseGeometry, new THREE.MeshPhongMaterial({ color: 0x8b0000 }));
                electricBase.position.y = 1.2;
                valveGroup.add(electricBase);

                const electricTopGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
                const electricTop = new THREE.Mesh(electricTopGeometry, new THREE.MeshPhongMaterial({ color: 0x4b0000 }));
                electricTop.position.y = 1.6;
                valveGroup.add(electricTop);
            } else if (actuationType === 'pneumatic') {
                const pneumaticCylinderGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.8, 32);
                const pneumaticCylinder = new THREE.Mesh(pneumaticCylinderGeometry, new THREE.MeshPhongMaterial({ color: 0x008000 }));
                pneumaticCylinder.position.y = 1.3;
                valveGroup.add(pneumaticCylinder);

                const pneumaticCapGeometry = new THREE.CylinderGeometry(0.65, 0.65, 0.1, 32);
                const pneumaticCap = new THREE.Mesh(pneumaticCapGeometry, new THREE.MeshPhongMaterial({ color: 0x006400 }));
                pneumaticCap.position.y = 1.75;
                valveGroup.add(pneumaticCap);
            }
            break;

        case 'on_off_regulation':
            bodyGeometry = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 32);
            mainPart = new THREE.Mesh(bodyGeometry, valveMaterial);
            mainPart.rotation.z = Math.PI / 2;
            valveGroup.add(mainPart);

            const discGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 32);
            const discMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
            const discMesh = new THREE.Mesh(discGeometry, discMaterial);
            discMesh.rotation.z = Math.PI / 2;
            valveGroup.add(discMesh);

            // Actuator (positioned differently for butterfly)
            if (actuationType === 'manual') {
                const leverGeometry = new THREE.BoxGeometry(0.2, 1.0, 0.2);
                const leverMesh = new THREE.Mesh(leverGeometry, new THREE.MeshPhongMaterial({ color: 0x666666 }));
                leverMesh.position.y = 0.8;
                leverMesh.position.x = 0.2;
                valveGroup.add(leverMesh);
            } else if (actuationType === 'electric') {
                const electricBaseGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
                const electricBase = new THREE.Mesh(electricBaseGeometry, new THREE.MeshPhongMaterial({ color: 0x8b0000 }));
                electricBase.position.y = 0.8;
                valveGroup.add(electricBase);

                const electricTopGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
                const electricTop = new THREE.Mesh(electricTopGeometry, new THREE.MeshPhongMaterial({ color: 0x4b0000 }));
                electricTop.position.y = 1.2;
                valveGroup.add(electricTop);
            } else if (actuationType === 'pneumatic') {
                const pneumaticCylinderGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.8, 32);
                const pneumaticCylinder = new THREE.Mesh(pneumaticCylinderGeometry, new THREE.MeshPhongMaterial({ color: 0x008000 }));
                pneumaticCylinder.position.y = 0.8;
                valveGroup.add(pneumaticCylinder);

                const pneumaticCapGeometry = new THREE.CylinderGeometry(0.65, 0.65, 0.1, 32);
                const pneumaticCap = new THREE.Mesh(pneumaticCapGeometry, new THREE.MeshPhongMaterial({ color: 0x006400 }));
                pneumaticCap.position.y = 1.25;
                valveGroup.add(pneumaticCap);
            }
            break;

        default:
            console.log("No specific valve function selected for 3D model. Clearing 3D view.");
            if (currentModel) {
                scene.remove(currentModel);
                currentModel.traverse((object) => {
                    if (object.isMesh) {
                        object.geometry.dispose();
                        object.material.dispose();
                    }
                });
                currentModel = null;
            }
            return;
    }

    if (valveGroup.children.length > 0) {
        currentModel = valveGroup;
        scene.add(currentModel);
        camera.position.set(0, 0, 5);
        controls.update();
        console.log("New 3D model added to scene.");
    } else {
        console.log("No 3D model generated (valveGroup is empty).");
    }
}

// Initialize 3D scene when the window loads
window.onload = function() {
    init3D();
    animate3D();
};


document.getElementById('valveConfiguratorForm').addEventListener('submit', async function(event) { // Added 'async' keyword
    event.preventDefault();
    console.log("Form submitted.");

    const form = event.target;

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        console.log("Form validation failed.");
        return;
    }

    const mainFunction = form.mainFunction.value;
    const bodyBonnetMaterial = form.bodyBonnetMaterial.value;
    const actuationType = form.actuationType.value;
    const temperature = parseFloat(form.temperature.value);
    const pressure = parseFloat(form.pressure.value);
    const sealSurfaceMaterial = form.sealSurfaceMaterial.value;
    const connectionType = form.connectionType.value;
    const nominalDiameter = form.nominalDiameter.value.toLowerCase();
    const fluidType = form.fluidType.value.toLowerCase();
    const aiPrompt = form.aiPrompt.value; // Get the value from the new textarea

    console.log("Form Values:", {
        mainFunction, bodyBonnetMaterial, actuationType, temperature, pressure,
        sealSurfaceMaterial, connectionType, nominalDiameter, fluidType, aiPrompt // Include aiPrompt
    });

    const valveList = document.getElementById('valveList');
    const resultsDiv = document.getElementById('results');
    const noResultsMessage = document.getElementById('noResultsMessage');

    valveList.innerHTML = '';
    noResultsMessage.classList.add('d-none');
    resultsDiv.classList.remove('d-none');
    resultsDiv.classList.remove('alert-warning'); // Reset warning class if previously set
    resultsDiv.classList.add('alert-info'); // Ensure it's info by default

    let recommendations = new Set();
    let suitable = true;

    // Update the 3D model based on the main function, material, and actuation type
    update3DModel(mainFunction, bodyBonnetMaterial, actuationType);

    // Prepare data for the backend (Gemini API)
    const formData = {
        mainFunction, bodyBonnetMaterial, actuationType, temperature, pressure,
        sealSurfaceMaterial, connectionType, nominalDiameter, fluidType, aiPrompt // Pass aiPrompt to backend
    };

    try {
        // Fetch recommendations from your backend
        const response = await fetch('http://127.0.0.1:5000/recommend', { // Ensure this matches your Flask server address
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Backend response:", data);

        if (data.recommendations && data.recommendations.length > 0) {
            data.recommendations.forEach(rec => recommendations.add(rec));
            suitable = data.suitable !== false; // Backend can set suitable to false
        } else {
            suitable = false;
            recommendations.add('No specific recommendations from AI. Please adjust your selections.');
        }

    } catch (error) {
        console.error('Error fetching recommendations from backend:', error);
        suitable = false;
        recommendations.add('Error contacting the recommendation service. Please ensure the Python backend is running and reachable.');
    }


    // Display results based on backend response and existing logic
    if (suitable && recommendations.size > 0) {
        valveList.innerHTML = ''; // Clear previous items
        recommendations.forEach(valve => {
            const li = document.createElement('li');
            li.textContent = valve;
            valveList.appendChild(li);
        });
        noResultsMessage.classList.add('d-none');
        console.log("Recommendations displayed:", Array.from(recommendations));
    } else {
        valveList.innerHTML = ''; // Clear any partial results
        noResultsMessage.classList.remove('d-none');
        resultsDiv.classList.remove('alert-info');
        resultsDiv.classList.add('alert-warning'); // Indicate a warning/no results
        console.log("No suitable recommendations found or an error occurred.");
    }
});

// Bootstrap form validation boilerplate
(function () {
  'use strict'
  var forms = document.querySelectorAll('.needs-validation')
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
        form.classList.add('was-validated')
      }, false)
    })
})()
