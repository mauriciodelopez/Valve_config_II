// script.js

// Three.js global variables
let scene, camera, renderer, controls, currentModel;

/**
 * Initializes the Three.js scene, camera, renderer, and orbit controls.
 * This function is called once when the page loads.
 */
function init3D() {
    // Get the container for the 3D viewer
    const container = document.getElementById('container3D');

    // 1. Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0); // Light gray background

    // 2. Create the camera
    // PerspectiveCamera(fov, aspect, near, far)
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5); // Initial camera position

    // 3. Create the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement); // Add the renderer's canvas to the container

    // 4. Add lights to the scene
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Brighter light from one direction
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // 5. Add OrbitControls for interactive camera movement
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable smooth camera movement
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 2; // Minimum zoom distance
    controls.maxDistance = 10; // Maximum zoom distance

    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);

    // Initial render of an empty scene or a default message
    // The message is now handled by the HTML div itself, no need to add it via JS
}

/**
 * Handles window resizing to keep the 3D viewer responsive.
 */
function onWindowResize() {
    const container = document.getElementById('container3D');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

/**
 * Animation loop for Three.js.
 * Continuously renders the scene and updates controls.
 */
function animate3D() {
    requestAnimationFrame(animate3D); // Loop this function
    controls.update(); // Only required if controls.enableDamping is set to true
    renderer.render(scene, camera); // Render the scene
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
 * Creates a 3D model based on valve type and material.
 * This uses procedural geometry to represent different valve forms.
 * @param {string} valveFunction - The selected main function of the valve.
 * @param {string} bodyMaterial - The selected body and bonnet material.
 */
function update3DModel(valveFunction, bodyMaterial) {
    // Remove previous model if it exists
    if (currentModel) {
        scene.remove(currentModel);
        // Dispose of geometries and materials to free up memory
        currentModel.traverse((object) => {
            if (object.isMesh) {
                object.geometry.dispose();
                object.material.dispose();
            }
        });
    }

    const valveGroup = new THREE.Group(); // Use a group to combine multiple parts
    const materialColor = getMaterialColor(bodyMaterial);
    const valveMaterial = new THREE.MeshPhongMaterial({ color: materialColor });

    let bodyGeometry, mainPart, stem, handwheel;

    switch (valveFunction) {
        case 'on_off': // Represents Gate, Ball, or Knife Gate Valves
            // For simplicity, let's make a generic "on/off" valve shape that hints at these
            // Main body (like a gate valve body)
            bodyGeometry = new THREE.BoxGeometry(1.8, 1.2, 1.2);
            mainPart = new THREE.Mesh(bodyGeometry, valveMaterial);
            valveGroup.add(mainPart);

            // Flanges
            const flangeGeometry = new THREE.CylinderGeometry(1.0, 1.0, 0.2, 32);
            const flange1 = new THREE.Mesh(flangeGeometry, valveMaterial);
            flange1.rotation.z = Math.PI / 2;
            flange1.position.x = 1.0;
            valveGroup.add(flange1);

            const flange2 = new THREE.Mesh(flangeGeometry, valveMaterial);
            flange2.rotation.z = Math.PI / 2;
            flange2.position.x = -1.0;
            valveGroup.add(flange2);

            // Stem (simplified)
            stem = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16);
            const stemMesh = new THREE.Mesh(stem, valveMaterial);
            stemMesh.position.y = 1.0;
            valveGroup.add(stemMesh);

            // Handwheel (simplified)
            handwheel = new THREE.TorusGeometry(0.4, 0.05, 16, 32);
            const handwheelMesh = new THREE.Mesh(handwheel, valveMaterial);
            handwheelMesh.position.y = 1.8;
            handwheelMesh.rotation.x = Math.PI / 2;
            valveGroup.add(handwheelMesh);

            break;

        case 'regulation': // Represents Globe, Weir Diaphragm, or Needle Valves
            // For simplicity, let's make a generic "regulation" valve shape that hints at these
            // Main body (like a globe valve body - more spherical)
            bodyGeometry = new THREE.SphereGeometry(1.0, 32, 32);
            mainPart = new THREE.Mesh(bodyGeometry, valveMaterial);
            valveGroup.add(mainPart);

            // Inlet/Outlet pipes
            const pipeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 32);
            const pipe1 = new THREE.Mesh(pipeGeometry, valveMaterial);
            pipe1.rotation.z = Math.PI / 2;
            pipe1.position.x = 1.2;
            valveGroup.add(pipe1);

            const pipe2 = new THREE.Mesh(pipeGeometry, valveMaterial);
            pipe2.rotation.z = Math.PI / 2;
            pipe2.position.x = -1.2;
            valveGroup.add(pipe2);

            // Stem and handwheel
            stem = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16);
            const stemMeshReg = new THREE.Mesh(stem, valveMaterial);
            stemMeshReg.position.y = 1.0;
            valveGroup.add(stemMeshReg);

            handwheel = new THREE.TorusGeometry(0.4, 0.05, 16, 32);
            const handwheelMeshReg = new THREE.Mesh(handwheel, valveMaterial);
            handwheelMeshReg.position.y = 1.8;
            handwheelMeshReg.rotation.x = Math.PI / 2;
            valveGroup.add(handwheelMeshReg);

            break;

        case 'on_off_regulation': // Represents Butterfly or Weir Diaphragm Valves (flexible)
            // Let's make a butterfly valve shape as an example
            bodyGeometry = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 32);
            mainPart = new THREE.Mesh(bodyGeometry, valveMaterial);
            mainPart.rotation.z = Math.PI / 2; // Orient horizontally
            valveGroup.add(mainPart);

            // Butterfly disc
            const discGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 32);
            const discMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 }); // Darker for disc
            const discMesh = new THREE.Mesh(discGeometry, discMaterial);
            discMesh.rotation.z = Math.PI / 2; // Align with body
            valveGroup.add(discMesh);

            // Actuator (simplified box)
            const actuatorGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.5);
            const actuatorMesh = new THREE.Mesh(actuatorGeometry, valveMaterial);
            actuatorMesh.position.y = 1.0;
            valveGroup.add(actuatorMesh);

            break;

        default:
            // No specific model for default, clear the view
            currentModel = null;
            break;
    }

    if (valveGroup.children.length > 0) {
        currentModel = valveGroup;
        scene.add(currentModel);
        // Reset camera position to view the new model
        camera.position.set(0, 0, 5);
        controls.update();
    }
}

// Initialize 3D scene when the window loads
window.onload = function() {
    init3D();
    animate3D();
};


document.getElementById('valveConfiguratorForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;

    // Bootstrap validation check
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return; // Stop execution if form is invalid
    }

    const mainFunction = form.mainFunction.value;
    const bodyBonnetMaterial = form.bodyBonnetMaterial.value; // Get the selected material
    const temperature = parseFloat(form.temperature.value);
    const pressure = parseFloat(form.pressure.value);
    const sealSurfaceMaterial = form.sealSurfaceMaterial.value;
    const connectionType = form.connectionType.value;
    const nominalDiameter = form.nominalDiameter.value.toLowerCase();
    const fluidType = form.fluidType.value.toLowerCase(); // Ensure fluidType is lowercase for consistent checking

    const valveList = document.getElementById('valveList');
    const resultsDiv = document.getElementById('results');
    const noResultsMessage = document.getElementById('noResultsMessage');

    valveList.innerHTML = ''; // Clear previous results
    noResultsMessage.classList.add('d-none'); // Hide no results message using Bootstrap's d-none
    resultsDiv.classList.remove('d-none'); // Show results section using Bootstrap's d-none

    let recommendations = new Set();
    let suitable = true; // Flag to track if any viable options are found

    // Update the 3D model based on the main function and material selection
    update3DModel(mainFunction, bodyBonnetMaterial);


    // Logic based on Main Function (Page 4 of PDF)
    if (mainFunction === 'on_off') {
        recommendations.add('Gate Valves (Vannes passage direct)');
        recommendations.add('Butterfly Valves (Vannes à papillon)');
        recommendations.add('Ball Valves (Robinets boisseau sphérique)');
        recommendations.add('Knife Gate Valves (Robinets vanne à guillotine)');
    } else if (mainFunction === 'regulation') {
        recommendations.add('Globe Valves (Robinets à soupape)');
        recommendations.add('Weir Type Diaphragm Valves (Robinet à membrane)');
        recommendations.add('Needle Valves (Robinet à pointeau)');
        // Butterfly valves can also be used for regulation, but less common as primary
    } else if (mainFunction === 'on_off_regulation') {
        recommendations.add('Weir Type Diaphragm Valves (Robinet à membrane)');
        recommendations.add('Butterfly Valves (Robinet vanne à papillon)');
        recommendations.add('Globe Valves (Robinet à soupape)');
        recommendations.add('Knife Gate Valves with "V" Deflector (Robinets vanne à guillotine avec "V" de régulation)');
    } else {
        suitable = false; // No main function selected, cannot recommend
    }


    // Logic based on Body & Bonnet Material and Operating Conditions (Pages 5-6 of PDF)
    let materialViable = false;
    switch (bodyBonnetMaterial) {
        case 'cast_iron':
            // Limit of cast iron for steam 10 bar / 180°C (Page 6)
            if (fluidType.includes('steam') && (temperature > 180 || pressure > 10)) {
                materialViable = false;
                recommendations.add('Warning: Cast Iron has limited use for steam above 10 bar / 180°C. Consider other materials for steam applications.');
            } else if (temperature <= 184 && pressure <= 16) { // General chart limits (Page 6)
                materialViable = true;
            }
            break;
        case 'ductile_iron':
            if (temperature <= 350 && pressure <= 25) materialViable = true; // Simplified from chart (Page 6)
            break;
        case 'carbon_steel':
            if (temperature >= -20 && temperature <= 425 && pressure <= 400) materialViable = true; // Based on page 5 and 6
            break;
        case 'stainless_steel': // Covers 304-316
            if (temperature >= -200 && temperature <= 420 && pressure <= 400) materialViable = true; // Simplified from chart (Page 6)
            break;
        case 'stainless_steel_310':
            if (temperature >= -200 && temperature <= 550 && pressure <= 400) materialViable = true; // Simplified from chart (Page 6)
            break;
        case 'brass':
            // Max DN100 for Brass (Page 5)
            if (nominalDiameter.includes('dn100') || (nominalDiameter !== '' && parseFloat(nominalDiameter.replace(/[^\d.]/g, '')) > 100)) {
                materialViable = false;
                recommendations.add('Warning: Brass is generally limited to DN100. Consider other materials for larger diameters.');
            }
            // Not suitable for corrosive products (ammonia excluded on copper alloys) (Page 5)
            if (fluidType.includes('corrosive') || fluidType.includes('acid') || fluidType.includes('ammonia')) {
                materialViable = false;
                recommendations.add('Warning: Brass is not suitable for corrosive fluids, acids, or ammonia.');
            }
            if (temperature <= 100 && pressure <= 64) materialViable = true; // Based on chart (Page 6)
            break;
        case 'bronze':
            // Not suitable for corrosive products (ammonia excluded on copper alloys) (Page 5)
            if (fluidType.includes('corrosive') || fluidType.includes('acid') || fluidType.includes('ammonia')) {
                materialViable = false;
                recommendations.add('Warning: Bronze is not suitable for corrosive fluids, acids, or ammonia.');
            }
            if (temperature <= 100 && pressure <= 64) materialViable = true; // Based on chart (Page 6), PN40 from text
            break;
        case 'duplex_super_duplex':
            if (fluidType.includes('sea water')) {
                materialViable = true; // Specific use case (Page 5)
                recommendations.add('Duplex/Super Duplex is highly recommended for sea water applications.');
            } else {
                 // If not sea water, still generally good for high temps/corrosion (Page 5)
                materialViable = true;
            }
            break;
        case 'plastic':
            if (temperature <= 60 && pressure <= 16) materialViable = true; // Simplified from chart (Page 6)
            break;
        default:
            // If no material is selected, or if a material is selected but no specific checks apply,
            // we assume it's potentially viable for now, but subsequent checks might override.
            materialViable = true;
    }

    if (!materialViable) {
        suitable = false;
        recommendations.add('No valves found matching the selected body/bonnet material and operating conditions. Please review your material, temperature, and pressure selections.');
    }


    // Logic based on Seal Surface Material (Page 7 of PDF)
    if (sealSurfaceMaterial) {
        let sealViable = false;
        switch (sealSurfaceMaterial) {
            case 'elastomer':
                if (temperature <= 120 && !fluidType.includes('abrasive') && !fluidType.includes('corrosive')) sealViable = true;
                if (fluidType.includes('abrasive') || fluidType.includes('corrosive')) {
                    recommendations.add('Warning: Elastomer seals have low resistance to erosion and corrosion, and are sensitive to abrasion.');
                }
                break;
            case 'ptfe':
                if (temperature <= 200 && !fluidType.includes('nuclear')) sealViable = true; // Virgin PTFE
                if (fluidType.includes('nuclear')) {
                    recommendations.add('Warning: PTFE is prohibited in nuclear power plants.');
                }
                break;
            case 'rubber_seal': // Membrane Caoutchouc
                if (temperature <= 130) sealViable = true;
                break;
            case 'copper_alloys': // Laiton-Bronze
                if (temperature <= 200 && pressure <= 16) sealViable = true;
                break;
            case 'stainless_steel_seal': // Acier Inox
                if (temperature >= 420) sealViable = true;
                break;
            case 'stellite':
                // Stellite is for severe conditions, abrasions, high temp/pressure (Page 7)
                sealViable = true;
                recommendations.add('Stellite is recommended for severe conditions and abrasive fluids.');
                break;
        }
        if (!sealViable) {
            suitable = false;
            recommendations.add('No valves found matching the selected seal surface material and operating conditions.');
        }
    }

    // Display results
    if (recommendations.size > 0 && suitable) {
        recommendations.forEach(valve => {
            const li = document.createElement('li');
            li.textContent = valve;
            valveList.appendChild(li);
        });
    } else {
        // If no specific recommendations or if a "no match" message was added
        if (recommendations.size === 1 && (recommendations.has('No valves found matching the selected body/bonnet material and operating conditions. Please review your material, temperature, and pressure selections.') || recommendations.has('No valves found matching the selected seal surface material and operating conditions.'))) {
             const li = document.createElement('li');
             li.textContent = recommendations.values().next().value; // Get the single message
             valveList.appendChild(li);
        } else {
            noResultsMessage.classList.remove('d-none'); // Show no results message
        }
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
