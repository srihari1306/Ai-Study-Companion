# 🧠 AI Study Companion

**AI Study Companion** is a locally powered, AI-driven learning assistant that helps students study more effectively by transforming their own study materials into an interactive, intelligent workspace.  
Users can upload documents, ask context-aware questions, generate summaries, flashcards, and structured study plans — all powered by **locally running LLMs (LLaMA 3.1 – 8B)** using **Ollama**, ensuring privacy, low latency, and full control over data.

---

## 🎯 Motivation & Purpose

Most AI study tools rely on cloud-based models, limited customization, and opaque pipelines.  
This project was built to:

- Gain **hands-on experience with local LLM inference**
- Understand and implement **real-world Retrieval-Augmented Generation (RAG) pipelines**
- Explore **document ingestion, embedding, vector search, and contextual AI responses**
- Build an **end-to-end AI system**, handling everything from raw PDFs to intelligent outputs

This repository serves both as a **functional study tool** and a **learning-oriented system design project**.

---

## ✨ Key Features

- 📄 **Document Upload & Processing**
  - Upload PDFs and study materials
  - Automatic text extraction and preprocessing

- 🧠 **Context-Aware AI Chat**
  - Ask questions strictly grounded in uploaded documents
  - Prevents hallucinations using RAG-based context retrieval

- 📝 **AI Summaries**
  - Generate concise summaries for individual documents
  - Useful for quick revision and overview

- 🗂️ **Workspace-Based Learning**
  - Create dedicated workspaces with deadlines
  - Organize documents per subject or goal

- 📅 **AI-Generated Study Plan**
  - Personalized study plan based on:
    - Uploaded content
    - Deadline
    - Document volume

- 🧩 **Flashcard Generation**
  - Convert dense material into active recall flashcards

- 📊 **Progress Tracking**
  - Track learning progress within a workspace
  - Designed for incremental study workflows

- 🔐 **Local & Private by Design**
  - No external API calls for inference
  - All LLM execution runs locally via Ollama

---

## 🏗️ System Architecture (High-Level)

User
↓
React Frontend (UI)
↓
Flask Backend (API Layer)
↓
Document Processing
├─ PDF Parsing (PyPDF2)
├─ Chunking
├─ Embedding Generation (Sentence-Transformers)
↓
Vector Store (ChromaDB)
↓
Context Retrieval (RAG)
↓
Local LLM Inference (LLaMA 3.1 via Ollama)
↓
AI Responses (Chat, Summary, Flashcards, Study Plan)


---

## ⚙️ Tech Stack

### Frontend
- **React.js**
- **Tailwind CSS**

### Backend
- **Python**
- **Flask**

### AI / NLP
- **Ollama** (Local LLM runtime)
- **LLaMA 3.1 – 8B**
- **Sentence-Transformers** (Embeddings)

### Document Processing
- **PyPDF2**

### Databases
- **SQLite** – User & workspace management
- **ChromaDB** – Vector storage for RAG context

---

## 🔁 Application Workflow

1. User registers and logs in
2. User creates a **workspace** and sets a target deadline
3. Study materials (PDFs) are uploaded
4. Documents are:
   - Parsed
   - Chunked
   - Converted into embeddings
   - Stored in **ChromaDB**
5. Stored vectors act as **contextual memory**
6. User can:
   - Chat with the AI about documents
   - Generate summaries
   - Create flashcards
   - Receive a deadline-aware study plan
7. Progress is tracked per workspace

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Ollama installed locally
- LLaMA 3.1 (8B) pulled via Ollama

```bash
ollama pull llama3.1:8b

Backend Setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py


Backend runs at:

http://localhost:5000

Frontend Setup
cd frontend
npm install
npm run dev


Frontend runs at:

http://localhost:5173
