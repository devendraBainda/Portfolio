# Portfolio Website with AI Chatbot

A modern, responsive portfolio website for Devendra Bainda, featuring an AI-powered chatbot that answers questions about the portfolio owner using Google's Gemini API.

## Features

- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Interactive UI Elements**: Smooth scrolling, animated skill bars, and project cards
- **AI Chatbot**: Integration with Google Gemini AI to answer visitor questions
- **Contact Form**: Form for visitors to send messages
- **Modern Design**: Clean layout with professional styling

## Project Structure

```
portfolio-website/
├── index.html          # Main HTML file
├── styles.css          # CSS styling 
├── script.js           # Main JavaScript for website functionality
├── chatbot.js          # JavaScript for chatbot functionality
├── app.py              # Flask backend for AI chatbot integration
├── .env                # Environment variables (not included - you need to create this)
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Font Awesome (for icons)

### Backend
- Python
- Flask
- Google Generative AI (Gemini API)

## Installation and Setup

1. **Clone the repository**
   ```
   git clone https://github.com/devendraBainda/Portfolio.git
   cd Portfolio
   ```

2. **Install Python dependencies**
   ```
   pip install -r requirements.txt
   ```

3. **Create a .env file**
   Create a `.env` file in the root directory with the following:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   You'll need to obtain a Gemini API key from [Google AI Studio](https://ai.google.dev/).

4. **Run the Flask application**
   ```
   python app.py
   ```

5. **Access the website**
   Open your browser and go to:
   ```
   http://127.0.0.1:5000
   ```

## AI Chatbot

The AI chatbot is powered by Google's Gemini 2.0 Pro API and provides information about my skills, projects, education, and experience. The chatbot is accessible through a floating button in the bottom right corner of the page.

### How it works:
1. The Flask backend processes user questions and sends them to Google Gemini API
2. The API generates contextually relevant responses based on portfolio information
3. The frontend displays these responses in a chat interface

## Customization

To customize this portfolio for your own use:

1. Update personal information in `index.html`
2. Modify the resume information in the `generate_prompt` function in `app.py`
3. Replace `image.jpg` with your own profile photo
4. Update projects, skills, and other sections as needed

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

For any questions or suggestions, please contact:
- Email: devendrabainda192@gmail.com
- GitHub: [devendraBainda](https://github.com/devendraBainda)
- LinkedIn: [Devendra Bainda](https://www.linkedin.com/in/devendra-bainda-57b3a1358/)
