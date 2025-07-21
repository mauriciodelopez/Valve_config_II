# app.py (Python Flask Backend)
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app) # Enable CORS for cross-origin requests from your HTML

# Configure your Gemini API key
# IMPORTANT: Replace 'YOUR_GEMINI_API_KEY' with your actual API key
# It's best practice to load this from environment variables (e.g., os.environ.get('GEMINI_API_KEY'))
# For local testing, you can put it directly here, but NEVER in production.
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY') # Replace 'YOUR_GEMINI_API_KEY'
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini model
model = genai.GenerativeModel('gemini-2.0-flash')

@app.route('/recommend', methods=['POST'])
def recommend_valve():
    data = request.json
    print(f"Received data from frontend: {data}")

    # Extract relevant parameters for the AI prompt
    main_function = data.get('mainFunction')
    body_bonnet_material = data.get('bodyBonnetMaterial')
    temperature = data.get('temperature')
    pressure = data.get('pressure')
    seal_surface_material = data.get('sealSurfaceMaterial')
    connection_type = data.get('connectionType')
    nominal_diameter = data.get('nominalDiameter')
    fluid_type = data.get('fluidType')
    actuation_type = data.get('actuationType')

    # Construct a detailed prompt for the AI
    prompt = f"""
    You are an expert valve configurator. Based on the following user requirements,
    recommend suitable valve types from a technical guide (like Tecofi's).
    Provide the most relevant recommendations and briefly explain why.
    Also, identify if there are any major incompatibilities or warnings based on the parameters.

    User Requirements:
    - Primary Function: {main_function}
    - Body & Bonnet Material: {body_bonnet_material}
    - Max Temperature: {temperature}°C
    - Max Pressure: {pressure} bar
    - Seal Surface Material (Optional): {seal_surface_material if seal_surface_material else 'Not specified'}
    - Connection Type (Optional): {connection_type if connection_type else 'Not specified'}
    - Nominal Diameter (Optional): {nominal_diameter if nominal_diameter else 'Not specified'}
    - Fluid Type: {fluid_type}
    - Actuation Type: {actuation_type}

    Consider these general guidelines (similar to the Tecofi Guide):
    - **Functions:**
        - On/Off: Gate, Ball, Butterfly, Knife Gate valves.
        - Regulation: Globe, Weir Diaphragm, Needle valves.
        - On/Off & Regulation: Weir Diaphragm, Butterfly, Globe, Knife Gate with V-deflector.
    - **Materials (General Temperature/Pressure/Fluid Suitability):**
        - Cast Iron: Up to 184°C/16 bar (limited for steam >10 bar/180°C).
        - Ductile Iron: Up to 350°C/25 bar.
        - Carbon Steel: -20°C to 425°C / up to 400 bar.
        - Stainless Steel (304-316): -200°C to 420°C / up to 400 bar.
        - Stainless Steel (310): -200°C to 550°C / up to 400 bar.
        - Brass/Bronze: Up to 100°C/64 bar (Brass max DN100, not for corrosive fluids/acids/ammonia).
        - Duplex/Super Duplex: Excellent for corrosive fluids like sea water.
        - Plastic (PVC, PP): Up to 60°C/16 bar.
    - **Seal Materials:**
        - Elastomer: Up to 120°C (low resistance to erosion/corrosion, sensitive to abrasion).
        - PTFE: Up to 200°C (prohibited in nuclear plants).
        - Rubber Seal: Up to 130°C.
        - Copper Alloys: Up to 200°C/16 bar.
        - Stainless Steel Seal: For high temperatures (>=420°C).
        - Stellite: Recommended for severe conditions and abrasive fluids.

    Provide your response as a JSON object with two keys:
    - `recommendations`: An array of strings, each being a recommended valve type or a specific advice/warning.
    - `suitable`: A boolean, true if a viable configuration is found, false if major incompatibilities exist.
    """

    try:
        # Generate content using Gemini
        response = model.generate_content(prompt)
        ai_response_text = response.text
        print(f"AI Raw Response: {ai_response_text}")

        # Attempt to parse the AI's JSON response
        # The AI is instructed to provide JSON, but sometimes it might include
        # conversational text outside the JSON block or malformed JSON.
        # We need to robustly extract the JSON.
        import json
        try:
            # Find the first and last curly brace to extract the JSON string
            json_start = ai_response_text.find('{')
            json_end = ai_response_text.rfind('}') + 1
            if json_start != -1 and json_end != -1 and json_end > json_start:
                json_string = ai_response_text[json_start:json_end]
                ai_data = json.loads(json_string)
            else:
                raise ValueError("Could not find valid JSON in AI response.")

            recommendations = ai_data.get('recommendations', [])
            suitable = ai_data.get('suitable', True) # Default to true if AI doesn't explicitly say false

        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"AI response was not valid JSON: {ai_response_text}")
            recommendations = ["AI response could not be parsed. Please try different inputs.", ai_response_text]
            suitable = False
        except ValueError as e:
            print(f"Value error: {e}")
            print(f"AI response was not valid JSON structure: {ai_response_text}")
            recommendations = ["AI response structure was unexpected. Please try different inputs.", ai_response_text]
            suitable = False


        return jsonify({"recommendations": recommendations, "suitable": suitable})

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({"recommendations": ["An error occurred while getting recommendations from AI. Please check your API key and try again."], "suitable": False}), 500

if __name__ == '__main__':
    # Ensure your API key is set as an environment variable or directly in the code above
    if GEMINI_API_KEY == 'YOUR_GEMINI_API_KEY' or not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY is not set. Please set it in app.py or as an environment variable.")
        print("You can get a free API key from https://aistudio.google.com/app/apikey")

    app.run(debug=True) # debug=True allows for automatic reloading on code changes
