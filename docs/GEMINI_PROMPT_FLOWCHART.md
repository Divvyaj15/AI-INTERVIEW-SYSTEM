# Prompt for Gemini AI - Update Flowchart for AI Interview System

## Task
Update the provided flowchart image to accurately reflect the current implementation of the AI-Interview-System. The flowchart should show the actual architecture and components that are currently built and working, not future plans.

## Current System Architecture

### Stage 1: Frontend & User Interface (Streamlit-Based)
**Description**: 
- Streamlit web application with chat-based interface
- Resume upload (PDF format) with file processing
- Job description input field
- Audio recording interface (real-time audio input)
- Chat interface showing conversation flow (AI questions on left, user responses on right)
- Text-to-speech for AI interviewer questions
- Progress tracking and interview session management
- Real-time feedback display

### Stage 2: Resume Processing & Question Generation
**Description**: 
- PDF resume parsing and text extraction
- LLM-based resume analysis (Mistral AI) to extract:
  - Candidate name
  - Technical skills, technologies, tools
  - Work experience highlights
  - Education details
  - Projects and achievements
- AI-powered question generation using Mistral LLM:
  - Technical questions from all resume sections (skills, work experience, education, certifications, projects)
  - Two-way conversational flow with acknowledgments
  - Adaptive questioning based on previous responses
  - Job description integration for role-specific questions

### Stage 3: Audio Processing & Transcription
**Description**: 
- Real-time audio recording (WAV format, 16kHz)
- Audio file storage per interview session (organized by candidate name)
- Speech-to-text transcription using Speechmatics API (WebSocket streaming)
- Audio validation and quality checks
- Session-based audio file management (separate analysis per interview)

### Stage 4: Multi-Layer Analysis System
**Description**: 
- **Content Analysis (LLM-based)**: 
  - Response evaluation using Mistral AI LLM
  - Relevance, completeness, structure, specificity scoring
  - Technical competency assessment
  - Feedback generation
  
- **Speaking Skills Analysis (ML Model)**:
  - Random Forest model (speaking_skills_model.pkl)
  - Analyzes: speech rate, pitch, volume, clarity, fluency, articulation
  - 12 audio features extracted using librosa
  - Overall speaking score (0-10)
  
- **Sentiment & Emotional Analysis (ML Model)**:
  - Random Forest model (sentiment_model.pkl)
  - Detects 8 emotional states: Confident, Anxious, Enthusiastic, Calm, Stressed, Excited, Nervous, Professional
  - Confidence level assessment (High/Medium/Low)
  - Stress level detection
  - Emotional Intelligence scoring (0-10)
  - 16 sentiment features extracted

### Stage 5: Scoring & Feedback System
**Description**: 
- Unified scoring system combining:
  - Content score (from LLM analysis)
  - Speaking skills score (from ML model)
  - Sentiment/emotional intelligence score
- Per-question feedback with:
  - Strengths identified
  - Areas for improvement
  - Specific recommendations
  - Score breakdown (relevance, completeness, structure, etc.)
- Overall interview evaluation:
  - Final interview score (0-10)
  - Market positioning analysis
  - Competency assessment
  - Complete interview transcript
  - Detailed scoring breakdown

## Visual Requirements

1. **Color Scheme**: Keep the orange background with white text for descriptions and dark blue for titles
2. **Flow**: Show sequential flow from Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5
3. **Connections**: Use arrows to show data flow between stages
4. **Stage Titles**: Use clear, descriptive titles for each stage
5. **Descriptions**: Keep descriptions concise but informative (2-3 lines per stage)

## Key Points to Emphasize

- The system is **currently implemented** (not future plans)
- Uses **Streamlit** for frontend (not a separate frontend framework)
- **Two ML models** are actively used (speaking skills + sentiment analysis)
- **Two external APIs** are integrated (Mistral LLM + Speechmatics)
- **Session-based** analysis (each interview analyzed separately)
- **Multi-layer analysis** combining LLM and ML models
- **Real-time processing** of audio and responses

## Output Format

Create an updated flowchart image with:
- Title: "AI INTERVIEW SYSTEM - CURRENT ARCHITECTURE" (or similar)
- 5 stages as described above
- Clear visual flow with arrows
- Professional, clean design matching the original style
- All text clearly readable

## Additional Notes

- The system does NOT have a separate backend API framework (it's Streamlit-based)
- The system does NOT have a database (uses file-based storage)
- The system does NOT have facial expression analysis (only audio analysis)
- Focus on what IS implemented, not what could be added





