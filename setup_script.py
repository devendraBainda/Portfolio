#!/usr/bin/env python3
"""
Setup script for RAG system
"""
import os
import sys
import subprocess
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def check_and_install_dependencies():
    """Install required packages"""
    logger.info("🔧 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        logger.info("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Failed to install dependencies: {e}")
        return False

def check_environment():
    """Check environment setup"""
    logger.info("🔍 Checking environment setup...")
    
    env_file = ".env"
    if not os.path.exists(env_file):
        logger.warning(f"⚠️ {env_file} not found. Creating template...")
        with open(env_file, 'w') as f:
            f.write("# Environment Variables for Portfolio\n")
            f.write("GEMINI_API_KEY=your_gemini_api_key_here\n")
            f.write("SENDER_EMAIL=your_email@gmail.com\n")
            f.write("SENDER_PASSWORD=your_app_password\n")
            f.write("RECEIVER_EMAIL=your_email@gmail.com\n")
        
        logger.info(f"📝 Please update {env_file} with your actual API keys")
        return False
    
    logger.info("✅ Environment file exists")
    return True

def initialize_rag_system():
    """Initialize RAG system"""
    logger.info("🧠 Initializing RAG system...")
    
    try:
        from rag_system import RAGSystem
        
        rag = RAGSystem()
        logger.info("📚 Creating embeddings...")
        rag.create_embeddings(force_recreate=True)
        
        # Test with sample queries
        test_queries = [
            "What programming languages does Devendra know?",
            "Tell me about his projects",
            "What is his education background?"
        ]
        
        logger.info("🧪 Testing RAG system...")
        for i, query in enumerate(test_queries, 1):
            results = rag.retrieve_relevant_chunks(query, top_k=2)
            if results:
                logger.info(f"✅ Test {i}: Found {len(results)} relevant chunks")
            else:
                logger.warning(f"⚠️ Test {i}: No results found")
        
        logger.info("✅ RAG system initialized successfully!")
        return True
        
    except ImportError as e:
        logger.error(f"❌ Could not import rag_system: {e}")
        logger.info("Make sure you have the rag_system.py file in your project")
        return False
    except Exception as e:
        logger.error(f"❌ Failed to initialize RAG system: {e}")
        return False

def main():
    """Main setup function"""
    logger.info("🚀 Setting up RAG system for your portfolio...")
    
    success = True
    
    # Step 1: Install dependencies
    if not check_and_install_dependencies():
        success = False
    
    # Step 2: Check environment
    if not check_environment():
        success = False
    
    # Step 3: Initialize RAG (only if previous steps succeeded)
    if success:
        if not initialize_rag_system():
            success = False
    
    if success:
        logger.info("\n🎉 Setup completed successfully!")
        logger.info("\n📋 Next steps:")
        logger.info("   1. Update your .env file with real API keys")
        logger.info("   2. Run: python app.py")
        logger.info("   3. Open http://localhost:5000")
        logger.info("   4. Test the chatbot!")
    else:
        logger.error("\n❌ Setup failed. Please fix the issues above.")
        logger.info("\n🔧 Common solutions:")
        logger.info("   • Make sure you have Python 3.8+")
        logger.info("   • Try: pip install --upgrade pip")
        logger.info("   • Check your internet connection")

if __name__ == "__main__":
    main()
