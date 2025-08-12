# 🗳️ PoliPulse

**Real-Time AI-Powered Debate Platform with Sentiment Analysis**

A revolutionary platform that transforms political discourse through structured debates, AI-powered argument analysis, and real-time sentiment tracking.

## 🌟 Features

### 🎯 Core Functionality
- **Live Debate Rooms**: Real-time collaborative debates with WebSocket communication
- **Admin Panel**: Create custom or AI-generated debate statements with full session control
- **Multi-Role Support**: Admin, Pro, Con, and Audience participation modes
- **Voice Integration**: Speech-to-text input for seamless argument submission

### 🤖 AI-Powered Analysis
- **Argument Scoring**: Advanced NLP analysis evaluating strength, evidence, and tone
- **Real-Time Feedback**: Instant suggestions for improving argument quality
- **Evidence Detection**: Identifies statistics, studies, and supporting data
- **Tone Analysis**: Measures civility and respectful discourse

### 📊 Real-Time Analytics
- **Sentiment Tracking**: Live audience reaction monitoring and visualization
- **Emoji Reactions**: Interactive audience engagement system
- **Live Scoring**: Dynamic argument evaluation with 0-100 scoring system
- **Debate Analytics**: Comprehensive session summaries and winner determination

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser (Chrome recommended for voice features)

### Installation

1. **Clone the repository**
 git clone https://github.com/thekarannagpal/polipulse.git
   cd polipulse

2. **Install Backend Dependencies**
  cd backend
  npm install


3. **Install Frontend Dependencies**
    cd ../frontend
    npm install


4. **Start the Application**

**Terminal 1 - Backend:**
   cd backend
   node server.js


**Terminal 2 - Frontend:**
   cd frontend
   npm start


5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🏗️ Project Structure


5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001


5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001


author :- Karan Nagpal
## 🎯 How to Use

### 👨‍💼 For Admins
1. **Join as Admin**: Select "Admin" role when joining a room
2. **Create Debate Statement**: Write custom statements or use AI generation
3. **Start Debate**: Launch the debate when participants are ready
4. **Monitor Session**: Track real-time analytics and manage the debate
5. **End Debate**: Conclude with automatic winner determination

### 🗣️ For Debaters (Pro/Con)
1. **Choose Your Side**: Join as either "Pro" (support) or "Con" (oppose)
2. **Wait for Start**: Admin will begin the debate with the statement
3. **Submit Arguments**: Use text or voice input to present your case
4. **View AI Feedback**: Receive real-time scoring and improvement suggestions
5. **Engage Respectfully**: Maintain civil discourse for better scores

### 👥 For Audience
1. **Join as Audience**: Participate without taking sides
2. **React to Arguments**: Use emoji reactions to express sentiment
3. **View Analytics**: Watch live sentiment graphs and argument scores
4. **Influence Outcome**: Your reactions contribute to the debate atmosphere

## 🤖 AI Analysis Features

### Argument Evaluation Criteria
- **Strength (30%)**: Logical structure and coherence
- **Evidence (25%)**: Supporting data, statistics, and sources
- **Tone (20%)**: Civility and respectful language
- **Clarity (15%)**: Clear communication and structure
- **Relevance (10%)**: Connection to debate statement

### Real-Time Feedback
- **Improvement Suggestions**: Actionable tips for better arguments
- **Score Breakdown**: Detailed analysis of each evaluation criterion
- **Evidence Detection**: Identification of supporting data and sources
- **Tone Monitoring**: Civility tracking and respectful discourse promotion

## 🛠️ Technology Stack

### Backend Technologies
- **Node.js & Express.js**: Server framework and API development
- **Socket.IO**: Real-time bidirectional communication
- **Natural.js**: Natural language processing and analysis
- **Sentiment.js**: Sentiment analysis and tone evaluation

### Frontend Technologies
- **React.js**: Modern UI framework with hooks
- **Socket.IO Client**: Real-time communication with backend
- **Web Speech API**: Voice recognition and speech-to-text
- **Canvas API**: Custom data visualization
- **Modern CSS**: Responsive design with animations

### AI & NLP Features
- **Argument Analysis**: Custom NLP engine for debate evaluation
- **Evidence Detection**: Pattern matching for supporting data
- **Tone Analysis**: Sentiment tracking for civil discourse
- **Real-Time Processing**: Live analysis without delays

## 📱 Browser Compatibility

- ✅ **Chrome** (Recommended - full voice support)
- ✅ **Firefox** (Limited voice features)
- ✅ **Safari** (Limited voice features)
- ✅ **Edge** (Good compatibility)

*Note: Voice input requires HTTPS in production and microphone permissions*

## 🚀 Deployment

### Backend Deployment (Heroku)
