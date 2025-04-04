document.addEventListener('DOMContentLoaded', function() {
    // Chat elements
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotBox = document.getElementById('chatbot-box');
    const chatbotBody = document.getElementById('chatbot-body');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // Function to add message to chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(isUser ? 'user' : 'bot');
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.textContent = message;
        
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

    // Process user input
    async function processInput() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, true);
        userInput.value = '';
        
        // Show typing indicator
        const indicator = showTypingIndicator();
        
        try {
            // Call Flask API to get Gemini response
            const response = await fetch('/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message }), // Changed from 'message' to 'question'
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            if (indicator && indicator.parentNode) {
                chatbotBody.removeChild(indicator);
            }
            
            // Add AI response
            if (data.response) {
                addMessage(data.response);
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

    // Add suggestion buttons for quick questions
    function addSuggestionButtons() {
        const suggestions = [
            "What skills does Devendra have?",
            "Tell me about his projects",
            "How can I contact Devendra?"
        ];
        
        setTimeout(() => {
            addMessage("Here are some things you can ask me about:");
            
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

    // Initialize chatbot
    function initChatbot() {
        // Show initial message
        setTimeout(() => {
            // Show suggestions after initial greeting
            addSuggestionButtons();
        }, 500);
    }

    // Initialize chatbot
    initChatbot();
});
