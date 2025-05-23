from flask import Flask, request, jsonify, send_from_directory
import google.generativeai as genai
import os
import smtplib
from email.mime.text import MIMEText
from flask_cors import CORS  
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__, static_folder=".")
CORS(app)  

# Load Gemini API Key securely from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY. Set it as an environment variable.")

genai.configure(api_key=GEMINI_API_KEY)

# Load the model 
model = genai.GenerativeModel("gemini-2.0-pro-exp")

def generate_prompt(user_question):
    resume_info = """
    Name: Devendra Bainda
    Email: devendrabainda192@gmail.com
    Location: Roorkee, Uttarakhand, India
    Education: B-Tech in Electrical Engineering, IIT Roorkee
    Projects: 
      1. Hinglish Cold Calling AI Agent - Automated voice assistant for business calls.
      2. Object Motion Tracking System - Used YOLOv11n & Kalman filter.
      3. Stock Price Predictions - Forecasted Tesla stock using ML.
      4. Lung Cancer Classification - ResNet-50 model for CT scans.
    Skills: Python, C++, ML, Neural Networks, LLMs, Computer Vision
    """

    prompt = f"""
    Based on the following resume information:
    {resume_info}
    
    Answer the user's question: "{user_question}"
    
    Keep your response concise and professional. If you don't know the answer based on the provided information, politely say so.
    (STRICT) If user question is not based on provided information answer with your intelligence
    """
    
    return prompt

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route("/<path:filename>")
def serve_files(filename):
    return send_from_directory(".", filename)  # Serve CSS & JS from the same folder

@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.json
    
    # Check for both possible key names to be more flexible
    user_question = data.get("question") or data.get("message")
    
    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    prompt = generate_prompt(user_question)

    try:
        response = model.generate_content(prompt)
        return jsonify({"response": response.text})
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return jsonify({"error": str(e), "response": "Sorry, I'm having trouble connecting right now. Please try again later."}), 500

@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify({"message": "Missing fields"}), 400

    try:
        sender_email = os.getenv("SENDER_EMAIL")
        sender_password = os.getenv("SENDER_PASSWORD")
        receiver_email = os.getenv("RECEIVER_EMAIL", sender_email)

        if not sender_email or not sender_password:
            return jsonify({"message": "Email credentials not set in environment"}), 500

        email_content = f"New message from {name} ({email}):\n\n{message}"

        msg = MIMEText(email_content)
        msg["Subject"] = f"New message from {name}"
        msg["From"] = sender_email
        msg["To"] = receiver_email

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)

        return jsonify({"message": "Message sent successfully!"}), 200

    except Exception as e:
        print(f"Email sending error: {e}")
        return jsonify({"message": "Failed to send message."}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
