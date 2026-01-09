# 🎯 Real Datasets for Sentimental Audio Analysis

## 📋 Overview

This guide shows you how to find, download, and use real datasets to train your sentimental analysis system with actual human emotional speech data instead of synthetic data.

## 🚀 **Top 5 Free Datasets You Can Use Right Now**

### **1. RAVDESS (Ryerson Audio-Visual Database)**
- **Size**: 2.4 GB
- **Emotions**: 8 emotions (Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral, Calm)
- **Format**: Audio + Video
- **Download**: https://zenodo.org/record/1188976
- **Perfect for**: Interview confidence and stress analysis

### **2. CREMA-D (Crowd-sourced Emotional Multimodal Actors)**
- **Size**: 7.5 GB
- **Emotions**: 6 emotions (Happy, Sad, Angry, Fear, Disgust, Neutral)
- **Format**: Audio + Video
- **Download**: https://github.com/CheyneyComputerScience/CREMA-D
- **Perfect for**: Professional communication analysis

### **3. IEMOCAP (Interactive Emotional Dyadic Motion Capture)**
- **Size**: 12 GB
- **Emotions**: 9 emotions (Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral, Excited, Frustrated)
- **Format**: Audio + Video + Motion
- **Download**: https://sail.usc.edu/iemocap/
- **Perfect for**: Advanced emotional intelligence assessment

### **4. MSP-IMPROV (MSP-IMPROV Corpus)**
- **Size**: 5.2 GB
- **Emotions**: 4 emotions (Happy, Sad, Angry, Neutral)
- **Format**: Audio + Video
- **Download**: https://ecs.utdallas.edu/research/researchlabs/msp-lab/MSP-Improv.html
- **Perfect for**: Natural conversation analysis

### **5. TESS (Toronto Emotional Speech Set)**
- **Size**: 1.8 GB
- **Emotions**: 7 emotions (Anger, Disgust, Fear, Happiness, Sadness, Surprise, Neutral)
- **Format**: Audio only
- **Download**: https://tspace.library.utoronto.ca/handle/1807/24487
- **Perfect for**: Pure audio analysis

## 📥 **How to Download These Datasets**

### **Option 1: Direct Download (Easiest)**
```bash
# Create datasets directory
mkdir -p datasets/RAVDESS
cd datasets/RAVDESS

# Download RAVDESS dataset
wget https://zenodo.org/record/1188976/files/Audio_Speech_Actors_01-24.zip
unzip Audio_Speech_Actors_01-24.zip
```

### **Option 2: Python Script Download**
```python
import requests
import zipfile
import os

def download_dataset(url, filename, extract_to):
    """Download and extract dataset"""
    print(f"Downloading {filename}...")
    
    # Download file
    response = requests.get(url, stream=True)
    with open(filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    # Extract
    print(f"Extracting {filename}...")
    with zipfile.ZipFile(filename, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    
    # Clean up
    os.remove(filename)
    print("Download and extraction complete!")

# Download RAVDESS
download_dataset(
    "https://zenodo.org/record/1188976/files/Audio_Speech_Actors_01-24.zip",
    "RAVDESS.zip",
    "datasets/RAVDESS"
)
```

### **Option 3: Hugging Face Datasets (Recommended)**
```python
from datasets import load_dataset

# Load RAVDESS dataset
ravdess = load_dataset("mstz/ravdess")

# Load CREMA-D dataset  
crema_d = load_dataset("mstz/crema_d")

# Load IEMOCAP dataset
iemocap = load_dataset("mstz/iemocap")
```

## 🔧 **Dataset Integration Script**

Create this script to automatically download and prepare datasets:

```python
# download_datasets.py
import os
import requests
import zipfile
from pathlib import Path

class DatasetDownloader:
    def __init__(self):
        self.datasets_dir = Path("datasets")
        self.datasets_dir.mkdir(exist_ok=True)
        
        self.dataset_urls = {
            "RAVDESS": {
                "url": "https://zenodo.org/record/1188976/files/Audio_Speech_Actors_01-24.zip",
                "filename": "RAVDESS.zip",
                "size": "2.4 GB"
            },
            "CREMA-D": {
                "url": "https://github.com/CheyneyComputerScience/CREMA-D/archive/refs/heads/master.zip",
                "filename": "CREMA-D.zip", 
                "size": "7.5 GB"
            },
            "TESS": {
                "url": "https://tspace.library.utoronto.ca/bitstream/1807/24487/3/TESS%20Toronto%20emotional%20speech%20set%20data.zip",
                "filename": "TESS.zip",
                "size": "1.8 GB"
            }
        }
    
    def download_dataset(self, dataset_name: str):
        """Download specific dataset"""
        if dataset_name not in self.dataset_urls:
            print(f"Dataset {dataset_name} not found!")
            return False
            
        dataset_info = self.dataset_urls[dataset_name]
        dataset_dir = self.datasets_dir / dataset_name
        dataset_dir.mkdir(exist_ok=True)
        
        print(f"Downloading {dataset_name} ({dataset_info['size']})...")
        print(f"URL: {dataset_info['url']}")
        
        try:
            # Download file
            response = requests.get(dataset_info['url'], stream=True)
            file_path = dataset_dir / dataset_info['filename']
            
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Extract
            print(f"Extracting {dataset_name}...")
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(dataset_dir)
            
            # Clean up
            file_path.unlink()
            print(f"✅ {dataset_name} downloaded and extracted successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error downloading {dataset_name}: {e}")
            return False
    
    def download_all(self):
        """Download all available datasets"""
        print("🚀 Starting download of all datasets...")
        
        for dataset_name in self.dataset_urls:
            self.download_dataset(dataset_name)
            print("-" * 50)
        
        print("🎉 All downloads completed!")

if __name__ == "__main__":
    downloader = DatasetDownloader()
    
    print("Available datasets:")
    for name, info in downloader.dataset_urls.items():
        print(f"- {name}: {info['size']}")
    
    print("\nChoose option:")
    print("1. Download specific dataset")
    print("2. Download all datasets")
    
    choice = input("Enter choice (1 or 2): ")
    
    if choice == "1":
        dataset_name = input("Enter dataset name (RAVDESS, CREMA-D, TESS): ")
        downloader.download_dataset(dataset_name)
    elif choice == "2":
        downloader.download_all()
    else:
        print("Invalid choice!")
```

## 🎯 **Dataset Preprocessing for Your System**

### **Step 1: Convert to Your Format**
```python
import librosa
import soundfile as sf
import os
from pathlib import Path

def preprocess_dataset(dataset_path: str, output_path: str):
    """Convert dataset to your system's format"""
    
    # Create output directory
    Path(output_path).mkdir(exist_ok=True)
    
    # Process each audio file
    for audio_file in Path(dataset_path).rglob("*.wav"):
        try:
            # Load audio
            y, sr = librosa.load(str(audio_file), sr=16000)
            
            # Normalize
            y = librosa.util.normalize(y)
            
            # Save processed file
            output_file = Path(output_path) / f"{audio_file.stem}_processed.wav"
            sf.write(str(output_file), y, sr)
            
            print(f"Processed: {audio_file.name}")
            
        except Exception as e:
            print(f"Error processing {audio_file}: {e}")

# Usage
preprocess_dataset("datasets/RAVDESS", "processed_data/RAVDESS")
```

### **Step 2: Create Training Data**
```python
import json
from pathlib import Path
from utils.sentiment_audio_analyzer import SentimentAudioAnalyzer

def create_training_data(processed_path: str, labels_file: str):
    """Create training data for your sentiment analyzer"""
    
    training_data = []
    
    # Load labels
    with open(labels_file, 'r') as f:
        labels = json.load(f)
    
    # Process each audio file
    for audio_file in Path(processed_path).glob("*.wav"):
        try:
            # Extract features using your analyzer
            analyzer = SentimentAudioAnalyzer()
            features = analyzer.extract_sentiment_features(str(audio_file))
            
            # Get emotion label
            emotion = labels.get(audio_file.stem, "Neutral")
            
            training_data.append({
                'features': features,
                'label': emotion,
                'file': str(audio_file)
            })
            
        except Exception as e:
            print(f"Error processing {audio_file}: {e}")
    
    return training_data

# Usage
training_data = create_training_data("processed_data/RAVDESS", "labels.json")
```

## 🚀 **Quick Start with RAVDESS**

### **1. Download RAVDESS (Smallest & Best for Start)**
```bash
cd datasets
wget https://zenodo.org/record/1188976/files/Audio_Speech_Actors_01-24.zip
unzip Audio_Speech_Actors_01-24.zip
```

### **2. Use with Your System**
```python
from utils.sentiment_audio_analyzer import SentimentAudioAnalyzer
import os

# Initialize analyzer
analyzer = SentimentAudioAnalyzer()

# Find RAVDESS audio files
ravdess_path = "datasets/Audio_Speech_Actors_01-24"
audio_files = []

for root, dirs, files in os.walk(ravdess_path):
    for file in files:
        if file.endswith(".wav"):
            audio_files.append(os.path.join(root, file))

print(f"Found {len(audio_files)} audio files")

# Analyze first few files
for audio_file in audio_files[:5]:
    try:
        results = analyzer.analyze_sentiment(audio_file)
        print(f"\nFile: {os.path.basename(audio_file)}")
        print(f"Emotion: {results['emotional_states']['primary']}")
        print(f"Confidence: {results['confidence_analysis']['level']}")
        print(f"Stress: {results['stress_analysis']['level']}")
    except Exception as e:
        print(f"Error analyzing {audio_file}: {e}")
```

## 📊 **Dataset Comparison Table**

| Dataset | Size | Emotions | Quality | Best For | Difficulty |
|---------|------|----------|---------|----------|------------|
| **RAVDESS** | 2.4 GB | 8 | High | Beginners | Easy |
| **CREMA-D** | 7.5 GB | 6 | High | Professionals | Medium |
| **IEMOCAP** | 12 GB | 9 | Very High | Research | Hard |
| **MSP-IMPROV** | 5.2 GB | 4 | High | Natural Speech | Medium |
| **TESS** | 1.8 GB | 7 | Medium | Basic Analysis | Easy |

## 💡 **Recommendations**

### **For Beginners:**
1. **Start with RAVDESS** - Small, high-quality, easy to use
2. **Use TESS** as backup - Simple, clean audio
3. **Focus on 3-4 emotions** first (Happy, Sad, Angry, Neutral)

### **For Advanced Users:**
1. **Combine multiple datasets** for better generalization
2. **Use IEMOCAP** for research-level analysis
3. **Implement data augmentation** techniques

### **For Production:**
1. **Collect your own interview data** for domain-specific analysis
2. **Use transfer learning** from pre-trained models
3. **Implement continuous learning** with new data

## 🔧 **Installation Requirements**

```bash
# Install required packages
pip install datasets huggingface_hub requests tqdm

# For audio processing
pip install librosa soundfile numpy pandas
```

## 📚 **Additional Resources**

- **Hugging Face Datasets**: https://huggingface.co/datasets
- **Audio Datasets Collection**: https://github.com/jim-schwoebel/audio_datasets
- **Emotion Recognition Papers**: https://paperswithcode.com/task/emotion-recognition
- **Audio Analysis Tutorials**: https://librosa.org/doc/latest/tutorial.html

---

**🎯 Start with RAVDESS dataset - it's the perfect size and quality for your sentimental analysis system!**
