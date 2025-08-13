// chatbot.js - Updated with RAG features
document.addEventListener('DOMContentLoaded', function() {
    // Chat elements
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotBox = document.getElementById('chatbot-box');
    const chatbotBody = document.getElementById('chatbot-body');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // RAG debug mode (set to true to see RAG retrieval info)
    const RAG_DEBUG_MODE = false;

    // Function to add message to chat
    function addMessage(message, isUser = false, isDebug = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        
        if (isDebug) {
            messageDiv.classList.add('debug');
        } else {
            messageDiv.classList.add(isUser ? 'user' : 'bot');
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        if (isDebug) {
            contentDiv.innerHTML = message; // Allow HTML for debug info
        } else {
            contentDiv.textContent = message;
        }
        
        messageDiv.appendChild(contentDiv);
        chatbotBody.appendChild(messageDiv);
        
        // Scroll to bottom
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
    }

    // Function to show typing indicator
    function showTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.classList.add('chat-message', 'bot', 'typing-indicator-container');
        indicatorDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        indicatorDiv.id = 'typing-indicator';
        chatbotBody.appendChild(indicatorDiv);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
        return indicatorDiv;
    }

    // Function to show RAG debug information
    function showRAGDebugInfo(debugData) {
        if (!RAG_DEBUG_MODE) return;
        
        let debugHtml = `
            <div class="rag-debug-info">
                <h4>🔍 RAG Debug Info</h4>
                <p><strong>Query:</strong> ${debugData.query}</p>
                <div class="retrieved-chunks">
                    <strong>Retrieved Chunks:</strong>
                    ${debugData.retrieved_chunks.map((chunk, index) => `
                        <div class="chunk-info">
                            <div class="chunk-header">Chunk ${index + 1} (Score: ${chunk.similarity_score.toFixed(3)})</div>
                            <div class="chunk-content">${chunk.content}</div>
                            <div class="chunk-metadata">Category: ${chunk.metadata.section || 'N/A'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        addMessage(debugHtml, false, true);
    }

    // Function to check RAG system status
    async function checkRAGStatus() {
        try {
            const response = await fetch('/rag/status');
            const status = await response.json();
            
            if (status.rag_initialized && status.total_chunks > 0) {
                console.log('✅ RAG system is running with', status.total_chunks, 'chunks');
                return true;
            } else {
                console.warn('⚠️ RAG system not properly initialized');
                return false;
            }
        } catch (error) {
            console.error('❌ Could not check RAG status:', error);
            return false;
        }
    }

    // Enhanced process input function with RAG support
    async function processInput() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, true);
        userInput.value = '';
        
        // Show typing indicator
        const indicator = showTypingIndicator();
        
        try {
            // If debug mode is enabled, first get RAG debug info
            if (RAG_DEBUG_MODE) {
                try {
                    const debugResponse = await fetch('/chatbot/debug', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ question: message }),
                    });
                    
                    const debugData = await debugResponse.json();
                    showRAGDebugInfo(debugData);
                } catch (debugError) {
                    console.warn('Could not get debug info:', debugError);
                }
            }
            
            // Call Flask API to get Gemini response
            const response = await fetch('/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message }),
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            if (indicator && indicator.parentNode) {
                chatbotBody.removeChild(indicator);
            }
            
            // Add AI response
            if (data.response) {
                addMessage(data.response);
                
                // Show performance info in console
                console.log('📊 Response generated successfully');
            } else if (data.error) {
                addMessage("I'm having trouble connecting right now. Please try again later.");
                console.error('Error:', data.error);
            }
            
        } catch (error) {
            console.error('Error:', error);
            // Remove typing indicator if it still exists
            if (indicator && indicator.parentNode) {
                chatbotBody.removeChild(indicator);
            }
            addMessage("I'm having trouble connecting right now. Please try again later.");
        }
    }

    // Event listeners
    chatbotToggle.addEventListener('click', function() {
        chatbotBox.classList.toggle('active');
        
        // Check RAG status when chatbot is opened
        if (chatbotBox.classList.contains('active')) {
            checkRAGStatus();
        }
    });

    chatbotClose.addEventListener('click', function() {
        chatbotBox.classList.remove('active');
    });

    sendBtn.addEventListener('click', processInput);

    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            processInput();
        }
    });

    // Enhanced suggestion buttons with RAG-optimized queries
    function addSuggestionButtons() {
        const suggestions = [ 
            "Tell me about his machine learning projects",
            "How can I contact Devendra?",
            "What are his key skills and technologies?",
            "What is his experience in AI and ML?"
        ];
        
        setTimeout(() => {
            addMessage("Here are some things you can ask me about (powered by intelligent retrieval):");
            
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('suggestion-buttons');
            
            suggestions.forEach(suggestion => {
                const button = document.createElement('button');
                button.classList.add('suggestion-btn');
                button.textContent = suggestion;
                
                button.addEventListener('click', function() {
                    userInput.value = suggestion;
                    processInput();
                });
                
                buttonContainer.appendChild(button);
            });
            
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message', 'bot');
            messageDiv.appendChild(buttonContainer);
            
            chatbotBody.appendChild(messageDiv);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
        }, 1500);
    }

    // Add RAG system info button
    function addRAGInfoButton() {
        if (RAG_DEBUG_MODE) {
            const ragButton = document.createElement('button');
            ragButton.classList.add('suggestion-btn', 'rag-info-btn');
            ragButton.textContent = '🔍 Check RAG Status';
            ragButton.style.backgroundColor = '#e3f2fd';
            ragButton.style.border = '1px solid #2196f3';
            
            ragButton.addEventListener('click', async function() {
                const status = await checkRAGStatus();
                const statusMessage = status 
                    ? "✅ RAG system is running optimally!" 
                    : "⚠️ RAG system needs attention";
                addMessage(statusMessage);
            });
            
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('suggestion-buttons');
            buttonContainer.appendChild(ragButton);
            
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message', 'bot');
            messageDiv.appendChild(buttonContainer);
            
            chatbotBody.appendChild(messageDiv);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
        }
    }

    // Initialize chatbot with RAG awareness
    function initChatbot() {
        // Check RAG system status on load
        checkRAGStatus().then(isWorking => {
            const statusEmoji = isWorking ? "🚀" : "⚠️";
            const initialMessage = `Hi! I'm Devendra's AI assistant ${statusEmoji} powered by advanced retrieval technology. I can provide specific information about his skills, projects, and experience. How can I help you today?`;
            
            // Update the initial bot message
            const existingBotMessage = document.querySelector('.chat-message.bot .message-content');
            if (existingBotMessage) {
                existingBotMessage.textContent = initialMessage;
            }
        });
        
        // Show suggestions after initial greeting
        setTimeout(() => {
            addSuggestionButtons();
            addRAGInfoButton();
        }, 500);
    }

    // Performance monitoring
    let queryCount = 0;
    const originalProcessInput = processInput;
    
    window.processInput = async function() {
        queryCount++;
        const startTime = performance.now();
        
        await originalProcessInput();
        
        const endTime = performance.now();
        console.log(`📊 Query ${queryCount} completed in ${(endTime - startTime).toFixed(2)}ms`);
    };

    // Initialize chatbot
    initChatbot();

    // Expose functions for debugging
    window.chatbotDebug = {
        checkRAGStatus,
        toggleDebugMode: () => {
            window.RAG_DEBUG_MODE = !RAG_DEBUG_MODE;
            console.log('RAG Debug Mode:', RAG_DEBUG_MODE ? 'ON' : 'OFF');
        },
        getQueryCount: () => queryCount
    };
});