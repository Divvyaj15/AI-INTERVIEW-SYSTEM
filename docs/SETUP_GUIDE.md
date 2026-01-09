# 🚀 AI Interview System - Setup Guide

## Quick Fix Summary

The error you encountered was caused by:
1. **Missing API keys** - The LLM couldn't authenticate, returning `None` responses
2. **Poor error handling** - The app crashed when trying to parse `None` responses
3. **asyncio conflicts** - `asyncio.run()` doesn't work well with Streamlit

I've fixed all these issues! Here's how to get it running:

## 🔧 Step-by-Step Setup

### 1. Environment Setup
```bash
cd "AI-Interview-System"

# Use the .venv directory (not venv/)
source .venv/Scripts/activate  # Git Bash
# OR
.\.venv\Scripts\Activate.ps1   # PowerShell
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Create Environment File
Rename `env_example.txt` to `.env` and fill in your API keys:

```bash
# Windows
copy env_example.txt .env

# Then edit .env with your actual API keys:
LLM_MODEL=mistral/mistral-large-latest
MISTRAL_API_KEY=your_actual_mistral_key_here
SPEECHMATICS_API_KEY=your_actual_speechmatics_key_here
```

### 4. Test Your Setup
```bash
python test_setup.py
```

This will verify everything is working before you run the main app.

### 5. Run the Application
```bash
streamlit run app.py
```

Open http://localhost:8501 in Chrome (required for microphone access).

## 🔑 Required API Keys

### LLM Provider (Choose ONE)
- **Mistral AI** (Recommended - Free tier available)
  - Get key: https://mistral.ai/
  - Model: `mistral/mistral-large-latest`
  
- **OpenAI** (Paid)
  - Get key: https://platform.openai.com/
  - Model: `openai/gpt-4o-mini`

### Speech-to-Text
- **Speechmatics** (Free tier available)
  - Get key: https://www.speechmatics.com/

## 🐛 What I Fixed

1. **Better Error Handling**: Added fallback responses when LLM fails
2. **asyncio Safety**: Replaced `asyncio.run()` with Streamlit-compatible alternatives
3. **API Validation**: Better error messages for missing/invalid API keys
4. **Graceful Degradation**: App continues working even if some features fail

## 🧪 Testing

Run the test script to verify everything works:
```bash
python test_setup.py
```

Expected output:
```
🚀 AI Interview System - Setup Test
==================================================
🔍 Testing Environment Setup...
✅ .env file found and loaded
✅ LLM_MODEL: mistral/mistral-large-latest...
✅ MISTRAL_API_KEY: sk-...
✅ SPEECHMATICS_API_KEY: eyJ...
✅ Environment variables are set correctly!

📦 Testing Dependencies...
✅ streamlit
✅ litellm
✅ edge-tts
✅ pygame
✅ speechmatics-python
✅ pypdf
✅ python-dotenv
✅ All required packages are installed!

🤖 Testing LLM Connection...
✅ LLM API working! Response: OK
==================================================
🎉 All tests passed! Your system is ready to run.
```

## 🚨 Common Issues & Solutions

### "Transcription failed: No API key"
- Set `SPEECHMATICS_API_KEY` in your `.env` file

### "LLM API call failed: 401"
- Check your `MISTRAL_API_KEY` or `OPENAI_API_KEY`
- Ensure `LLM_MODEL` matches your provider

### "No available audio device"
- Ensure audio output device is connected
- TTS will fail gracefully and continue without audio

### "asyncio.run() cannot be called from a running event loop"
- Fixed! The app now handles this automatically

## 📱 Using the App

1. **Upload Resume**: PDF format only
2. **Paste Job Description**: Copy from job posting
3. **Start Interview**: Click the button
4. **Answer Questions**: Use microphone (Chrome only)
5. **Get Feedback**: Review scores and suggestions

## 🆘 Still Having Issues?

1. Run `python test_setup.py` and share the output
2. Check the console for detailed error messages
3. Ensure you're using Chrome for microphone access
4. Verify your API keys are valid and have sufficient credits

## 🎯 Next Steps

Once everything is working:
1. Try a practice interview with your own resume
2. Customize the number of questions and AI voice
3. Review the feedback to improve your interview skills

---

**Happy interviewing! 🎉**
