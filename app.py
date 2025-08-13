# app.py - Updated with RAG integration
from flask import Flask, request, jsonify, send_from_directory, render_template
import google.generativeai as genai
import os
import smtplib
from email.mime.text import MIMEText
from flask_cors import CORS  
from dotenv import load_dotenv
from rag_system import RAGSystem
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env
load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)  

# Load Gemini API Key securely from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY. Set it as an environment variable.")

genai.configure(api_key=GEMINI_API_KEY)

# Load the model 
model = genai.GenerativeModel("gemini-1.5-flash")

# Initialize RAG system
rag_system = RAGSystem()

def initialize_rag():
    """Initialize RAG system on startup"""
    try:
        # Create embeddings if they don't exist
        rag_system.create_embeddings()
        logger.info("RAG system initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize RAG system: {e}")
        return False

def generate_rag_prompt(user_question: str, max_chunks: int = 3) -> str:
    """
    Generate prompt using RAG - retrieve relevant chunks and create focused prompt
    
    Args:
        user_question: User's question
        max_chunks: Maximum number of relevant chunks to retrieve
        
    Returns:
        Optimized prompt with only relevant context
    """
    try:
        # Retrieve relevant context using RAG
        relevant_context = rag_system.generate_context(user_question, top_k=max_chunks)
        
        prompt = f"""
Based on the following relevant information about Devendra Bainda:

{relevant_context}

User Question: "{user_question}"

Instructions:
1. Answer the user's question using ONLY the provided relevant information above
2. Be specific and accurate based on the context provided
3. If the question cannot be answered with the given information, politely say so and suggest what kind of information you can provide
4. Keep responses concise but informative
5. If the question is general (not about Devendra), you can answer with your general knowledge but mention it's not specific to Devendra's background

Provide a helpful and professional response:
"""
        
        logger.info(f"Generated RAG prompt for question: '{user_question[:50]}...'")
        return prompt
        
    except Exception as e:
        logger.error(f"Error in RAG prompt generation: {e}")
        # Fallback to basic information
        return f"""
        I'm having trouble accessing specific information right now. However, I can tell you that Devendra Bainda is an Electrical Engineering student at IIT Roorkee with expertise in Machine Learning and AI.
        
        Your question: "{user_question}"
        
        Please ask about his skills, projects, education, or contact information, and I'll do my best to help.
        """

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/<path:filename>")
def serve_files(filename):
    return send_from_directory(".", filename)   

@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.json
    
    # Check for both possible key names to be more flexible
    user_question = data.get("question") or data.get("message")
    
    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    try:
        # Use RAG to generate focused prompt
        prompt = generate_rag_prompt(user_question)
        
        # Generate response using Gemini
        response = model.generate_content(prompt)
        
        # Log successful interaction
        logger.info(f"Successfully processed question: '{user_question[:30]}...'")
        
        return jsonify({"response": response.text})
        
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        return jsonify({
            "error": str(e), 
            "response": "Sorry, I'm having trouble connecting right now. Please try again later."
        }), 500

@app.route("/chatbot/debug", methods=["POST"])
def chatbot_debug():
    """Debug endpoint to see RAG retrieval results"""
    data = request.json
    user_question = data.get("question") or data.get("message")
    
    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    try:
        # Get relevant chunks for debugging
        relevant_chunks = rag_system.retrieve_relevant_chunks(user_question, top_k=3)
        
        debug_info = {
            "query": user_question,
            "retrieved_chunks": [
                {
                    "content": chunk[:200] + "..." if len(chunk) > 200 else chunk,
                    "similarity_score": score,
                    "metadata": metadata
                }
                for chunk, score, metadata in relevant_chunks
            ],
            "context": rag_system.generate_context(user_question, top_k=3)
        }
        
        return jsonify(debug_info)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/rag/status")
def rag_status():
    """Check RAG system status"""
    try:
        status = {
            "rag_initialized": rag_system.index is not None,
            "total_chunks": len(rag_system.chunks),
            "index_file_exists": os.path.exists(rag_system.index_file),
            "chunks_file_exists": os.path.exists(rag_system.chunks_file)
        }
        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/rag/reinitialize", methods=["POST"])
def reinitialize_rag():
    """Reinitialize RAG system (useful for updates)"""
    try:
        rag_system.create_embeddings(force_recreate=True)
        return jsonify({"message": "RAG system reinitialized successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        logger.error(f"Email sending error: {e}")
        return jsonify({"message": "Failed to send message."}), 500

if __name__ == "__main__":
    # Local run only
    app.run(host="0.0.0.0", port=5000)
    