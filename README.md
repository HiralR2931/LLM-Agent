# 🤖 DocuMind — LLM-Powered Document Intelligence Agent

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Groq](https://img.shields.io/badge/Groq-FF6B35?style=for-the-badge&logoColor=white)
![LLaMA](https://img.shields.io/badge/LLaMA_3-0467DF?style=for-the-badge&logoColor=white)
![Status](https://img.shields.io/badge/Status-Live-10b981?style=for-the-badge)

A full-stack AI agent that processes documents using **RAG (Retrieval-Augmented Generation)** pipelines powered by **Groq's LLaMA 3**. Upload any PDF or text file and get instant summaries, structured data extraction, intelligent Q&A, and AI-powered writing improvements.

## 🌐 Live Demo
👉 **[https://hiralr2931.github.io/LLM-Agent](https://hiralr2931.github.io/LLM-Agent)**

🔌 **Backend API:** [https://llm-agent-mhw0.onrender.com](https://llm-agent-mhw0.onrender.com)

---

## 🧠 What is This?

DocuMind is an **LLM-powered workflow automation agent** that demonstrates real-world AI/NLP engineering concepts:

- **RAG Pipeline** — chunks documents, finds relevant sections, feeds context to LLM for accurate answers
- **Prompt Engineering** — carefully crafted system prompts for each task (summarize, extract, Q&A, improve)
- **Structured Output** — forces LLM to return JSON for data extraction
- **General Knowledge Fallback** — answers questions even without a document
- **Multi-task Agent** — 5 specialized AI workflows in one application

---

## ✨ Features

| Feature | Description |
|---|---|
| ⚡ **Full Analysis** | Summary + Data Extraction + Key Insights in one call |
| 📋 **Summarize** | 3-sentence overview + 5 bullet points + main topics |
| 🔍 **Extract Data** | Pulls names, dates, organizations, numbers, emails as JSON |
| 💬 **Ask Anything** | RAG-powered Q&A on document + general knowledge fallback |
| ✨ **Improve Content** | AI writing suggestions for resume, email, bio, report |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   React Frontend (GitHub Pages)     │
│   5 modes · Drag & drop upload      │
│   Live results · Color-coded UI     │
└──────────────┬──────────────────────┘
               │ axios POST (multipart)
┌──────────────▼──────────────────────┐
│   Flask REST API (Python)           │
│   6 endpoints · CORS enabled        │
│   PDF extraction · RAG chunking     │
└──────────────┬──────────────────────┘
               │ Groq API call
┌──────────────▼──────────────────────┐
│   Groq · LLaMA 3.3 70B              │
│   Free · Ultra-fast inference       │
│   Structured prompt engineering     │
└─────────────────────────────────────┘
```

---

## 📊 Data & AI Concepts Demonstrated

| Concept | Implementation |
|---|---|
| **RAG Pipeline** | Text chunking → keyword scoring → context retrieval → LLM generation |
| **Prompt Engineering** | Task-specific system prompts for each workflow |
| **NLP** | Document parsing, text splitting, keyword extraction |
| **Structured Output** | JSON-forced extraction with fallback parsing |
| **LLM Orchestration** | Multi-step pipeline (analyze = summarize + extract + insights) |
| **General Knowledge** | Fallback to LLM knowledge when document doesn't contain answer |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 · Axios · GitHub Pages |
| **Backend** | Python · Flask · Flask-CORS |
| **AI Model** | Groq API · LLaMA 3.3 70B Versatile |
| **RAG** | Custom chunking + keyword scoring pipeline |
| **PDF Processing** | PyPDF2 |
| **Environment** | python-dotenv · Virtual environment |

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- Free Groq API key from https://console.groq.com

### 1. Clone the repo
```bash
git clone https://github.com/HiralR2931/LLM-Agent.git
cd LLM-Agent
```

### 2. Set up Python backend
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure environment
```bash
# Create .env file
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
echo "PORT=5002" >> .env
```

### 4. Start the backend
```bash
python app.py
```
Backend runs at `http://localhost:5002`

### 5. Start the frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs at `http://localhost:3000`
https
---

## 🧪 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/test` | GET | Health check |
| `/api/summarize` | POST | Summarize uploaded document |
| `/api/extract` | POST | Extract structured data as JSON |
| `/api/ask` | POST | RAG Q&A with general knowledge fallback |
| `/api/analyze` | POST | Full pipeline — summary + extract + insights |
| `/api/improve` | POST | AI content improvement suggestions |

### Example API call
```bash
# Summarize a document
curl -X POST http://localhost:5002/api/summarize \
  -F "file=@document.pdf"

# Ask a question
curl -X POST http://localhost:5002/api/ask \
  -F "file=@document.pdf" \
  -F "question=What are the main findings?"

# Improve content (no file needed)
curl -X POST http://localhost:5002/api/improve \
  -H "Content-Type: application/json" \
  -d '{"content": "Your text here", "type": "resume"}'
```

---

## 📁 Project Structure

```
llm-agent/
├── app.py                 # Flask backend — all API endpoints
├── requirements.txt       # Python dependencies
├── .env                   # API keys (not committed)
├── .gitignore
├── test.txt               # Sample test file
└── frontend/
    ├── public/
    │   └── logo.png       # DocuMind logo
    └── src/
        └── App.js         # React frontend — all 5 modes
```

---

## 🎯 Use Cases

- 📄 **Research** — summarize long papers instantly
- 📝 **Resume Review** — extract skills, improve bullet points
- 📧 **Email Drafting** — improve tone and clarity
- 🏢 **Business** — extract data from invoices, contracts, reports
- 💬 **General AI** — ask any question with or without a document


---

## 📄 License

This project is for educational and portfolio purposes.