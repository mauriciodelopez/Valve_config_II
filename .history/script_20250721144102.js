// script.js

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
    const bodyBonnetMaterial = form.bodyBonnetMaterial.value;
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
