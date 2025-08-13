# rag_system.py
import os
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple
import pickle
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGSystem:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", index_file: str = "faiss_index.bin", chunks_file: str = "chunks.pkl"):
        """
        Initialize RAG system with sentence transformer model and FAISS index
        
        Args:
            model_name: Sentence transformer model name
            index_file: Path to save/load FAISS index
            chunks_file: Path to save/load text chunks
        """
        self.model = SentenceTransformer(model_name)
        self.index_file = index_file
        self.chunks_file = chunks_file
        self.index = None
        self.chunks = []
        self.chunk_metadata = []
        
        # Try to load existing index and chunks
        self.load_index()
    
    def chunk_resume_data(self) -> List[Dict]:
        """
        Create meaningful chunks from resume data
        
        Returns:
            List of dictionaries containing chunked resume information
        """
        resume_chunks = [
            {
                "content": "Devendra Bainda is an Electrical Engineering student at IIT Roorkee with expertise in Machine Learning and Artificial Intelligence. He specializes in developing innovative AI solutions including voice-enabled assistants, computer vision systems, and predictive models.",
                "category": "introduction",
                "metadata": {"section": "about", "importance": "high"}
            },
            {
                "content": "Educational background: B-Tech in Electrical Engineering from Indian Institute of Technology Roorkee (2022-2026). Previously studied at Matrix High School Sikar with 95.6 GPA in Science (2020-2021).",
                "category": "education",
                "metadata": {"section": "education", "importance": "high"}
            },
            {
                "content": "Programming Languages: Python, C++, JavaScript, HTML, CSS. Proficient in Python for machine learning applications and C++ for system-level programming.",
                "category": "programming_skills",
                "metadata": {"section": "skills", "importance": "high"}
            },
            {
                "content": "Machine Learning expertise includes Supervised Learning, Unsupervised Learning, Neural Networks, Large Language Models (LLMs), Computer Vision, and Retrieval-Augmented Generation (RAG) systems.",
                "category": "ml_skills",
                "metadata": {"section": "skills", "importance": "high"}
            },
            {
                "content": "Tools and Technologies: TensorFlow, PyTorch, Matplotlib, Scikit-learn, NumPy, Pandas, FAISS for vector databases, Sentence Transformers for embeddings.",
                "category": "tools",
                "metadata": {"section": "skills", "importance": "medium"}
            },
            {
                "content": "Hinglish Cold Calling AI Agent (Feb-Mar 2025): Developed voice-enabled assistant for automated business calls in Hinglish. Supports ERP demos, candidate interviews, and payment follow-ups. Uses speech recognition, AI language models, and speech synthesis.",
                "category": "project",
                "metadata": {"section": "projects", "importance": "high", "project_name": "Hinglish Cold Calling AI Agent"}
            },
            {
                "content": "Object Motion Tracking System (Dec 2024): Advanced computer vision system using YOLOv11n detection and Kalman filtering for accurate object motion prediction and tracking, even during visual obstructions.",
                "category": "project",
                "metadata": {"section": "projects", "importance": "high", "project_name": "Object Motion Tracking System"}
            },
            {
                "content": "Stock Price Predictions Using Supervised Learning (Dec 2024): Tesla stock price prediction system using supervised learning algorithms on historical market data from Kaggle. Identifies Tesla-specific market patterns and volatility factors.",
                "category": "project",
                "metadata": {"section": "projects", "importance": "medium", "project_name": "Stock Price Predictions"}
            },
            {
                "content": "Lung Cancer Classification Using CNN (April 2025): Deep learning system with fine-tuned ResNet50 model achieving 98% accuracy in classifying histopathological images. Built Flask web application with drag-and-drop interface for medical professionals.",
                "category": "project",
                "metadata": {"section": "projects", "importance": "high", "project_name": "Lung Cancer Classification"}
            },
            {
                "content": "Contact Information: Email - devendrabainda192@gmail.com, LinkedIn - https://www.linkedin.com/in/devendra-bainda-57b3a1358/, GitHub - https://github.com/devendraBainda, Location - Roorkee, Uttarakhand, India",
                "category": "contact",
                "metadata": {"section": "contact", "importance": "medium"}
            },
            {
                "content": "Technical specializations include Computer Vision with YOLO models, Natural Language Processing, Speech Recognition and Synthesis, Deep Learning with CNNs and ResNet architectures, Predictive Modeling, and Web Development with Flask.",
                "category": "specializations",
                "metadata": {"section": "skills", "importance": "high"}
            },
            {
                "content": "Research interests and experience in AI agents, voice technologies, medical AI applications, financial modeling, and computer vision systems. Experienced in end-to-end ML pipeline development from data preprocessing to model deployment.",
                "category": "research_interests",
                "metadata": {"section": "about", "importance": "medium"}
            }
        ]
        
        return resume_chunks
    
    def create_embeddings(self, force_recreate: bool = False):
        """
        Create embeddings for resume chunks and build FAISS index
        
        Args:
            force_recreate: Whether to recreate embeddings even if they exist
        """
        if os.path.exists(self.index_file) and os.path.exists(self.chunks_file) and not force_recreate:
            logger.info("Embeddings already exist. Use force_recreate=True to rebuild.")
            return
        
        logger.info("Creating embeddings for resume chunks...")
        
        # Get chunked data
        resume_chunks = self.chunk_resume_data()
        
        # Extract text content for embedding
        texts = [chunk["content"] for chunk in resume_chunks]
        self.chunks = texts
        self.chunk_metadata = [chunk["metadata"] for chunk in resume_chunks]
        
        # Create embeddings
        embeddings = self.model.encode(texts, convert_to_tensor=False)
        embeddings = np.array(embeddings).astype('float32')
        
        # Create FAISS index
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dimension)  # Inner Product for cosine similarity
        
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(embeddings)
        
        # Add embeddings to index
        self.index.add(embeddings)
        
        # Save index and chunks
        self.save_index()
        
        logger.info(f"Created embeddings for {len(texts)} chunks with dimension {dimension}")
    
    def save_index(self):
        """Save FAISS index and chunks to disk"""
        if self.index is not None:
            faiss.write_index(self.index, self.index_file)
            
            with open(self.chunks_file, 'wb') as f:
                pickle.dump({
                    'chunks': self.chunks,
                    'metadata': self.chunk_metadata
                }, f)
            
            logger.info(f"Saved index to {self.index_file} and chunks to {self.chunks_file}")
    
    def load_index(self):
        """Load FAISS index and chunks from disk"""
        try:
            if os.path.exists(self.index_file) and os.path.exists(self.chunks_file):
                self.index = faiss.read_index(self.index_file)
                
                with open(self.chunks_file, 'rb') as f:
                    data = pickle.load(f)
                    self.chunks = data['chunks']
                    self.chunk_metadata = data['metadata']
                
                logger.info(f"Loaded index and {len(self.chunks)} chunks from disk")
        except Exception as e:
            logger.warning(f"Could not load existing index: {e}")
            self.index = None
            self.chunks = []
            self.chunk_metadata = []
    
    def retrieve_relevant_chunks(self, query: str, top_k: int = 3) -> List[Tuple[str, float, Dict]]:
        """
        Retrieve most relevant chunks for a given query
        
        Args:
            query: User question/query
            top_k: Number of top chunks to retrieve
            
        Returns:
            List of tuples (chunk_text, similarity_score, metadata)
        """
        if self.index is None or len(self.chunks) == 0:
            logger.warning("Index not found. Creating embeddings...")
            self.create_embeddings()
        
        # Encode query
        query_embedding = self.model.encode([query], convert_to_tensor=False)
        query_embedding = np.array(query_embedding).astype('float32')
        faiss.normalize_L2(query_embedding)
        
        # Search for similar chunks
        similarities, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for i, (similarity, idx) in enumerate(zip(similarities[0], indices[0])):
            if idx < len(self.chunks):  # Ensure valid index
                results.append((
                    self.chunks[idx],
                    float(similarity),
                    self.chunk_metadata[idx]
                ))
        
        logger.info(f"Retrieved {len(results)} relevant chunks for query: '{query[:50]}...'")
        return results
    
    def generate_context(self, query: str, top_k: int = 3) -> str:
        """
        Generate context string from retrieved chunks
        
        Args:
            query: User question/query
            top_k: Number of chunks to retrieve
            
        Returns:
            Formatted context string
        """
        relevant_chunks = self.retrieve_relevant_chunks(query, top_k)
        
        if not relevant_chunks:
            return "No relevant information found in resume."
        
        context_parts = []
        for i, (chunk, score, metadata) in enumerate(relevant_chunks):
            context_parts.append(f"[Context {i+1}] {chunk}")
        
        return "\n\n".join(context_parts)

# Example usage and testing
if __name__ == "__main__":
    # Initialize RAG system
    rag = RAGSystem()
    
    # Create embeddings (run this once)
    rag.create_embeddings(force_recreate=True)
    
    # Test queries
    test_queries = [
        "What programming languages does Devendra know?",
        "Tell me about his machine learning projects",
        "What is his educational background?",
        "How can I contact him?",
        "What experience does he have with computer vision?"
    ]
    
    print("=" * 60)
    print("RAG SYSTEM TEST")
    print("=" * 60)
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        print("-" * 40)
        
        relevant_chunks = rag.retrieve_relevant_chunks(query, top_k=2)
        
        for i, (chunk, score, metadata) in enumerate(relevant_chunks):
            print(f"Chunk {i+1} (Score: {score:.3f}):")
            print(f"Content: {chunk[:100]}...")
            print(f"Metadata: {metadata}")
            print()
