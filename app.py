import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
import PyPDF2

load_dotenv()

app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ── HELPERS ──────────────────────────────────────────────────
def extract_text(file):
    filename = file.filename
    if filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    else:
        return file.read().decode("utf-8")

def chunk_text(text, chunk_size=1000, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

def get_relevant_chunks(chunks, query, top_k=3):
    query_words = set(query.lower().split())
    scored = []
    for chunk in chunks:
        chunk_words = set(chunk.lower().split())
        score = len(query_words & chunk_words)
        scored.append((score, chunk))
    scored.sort(reverse=True)
    return [chunk for _, chunk in scored[:top_k]]

def call_groq(system_prompt, user_prompt, max_tokens=1024):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=max_tokens,
        temperature=0.3
    )
    return response.choices[0].message.content

# ── ROUTE 1: Health check ─────────────────────────────────────
@app.route("/test", methods=["GET"])
def test():
    return jsonify({"message": "LLM Agent is running!", "status": "ok"})

# ── ROUTE 2: Summarize ────────────────────────────────────────
@app.route("/api/summarize", methods=["POST"])
def summarize():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        file = request.files["file"]
        text = extract_text(file)
        if not text.strip():
            return jsonify({"error": "Could not extract text from file"}), 400
        context = text[:3000]
        system_prompt = """You are an expert document analyst. 
        Your job is to provide clear, structured summaries of documents.
        Always respond with:
        1. A 2-3 sentence overview
        2. 5 key bullet points
        3. Main topics covered"""
        user_prompt = f"Please summarize this document:\n\n{context}"
        summary = call_groq(system_prompt, user_prompt)
        return jsonify({"summary": summary, "word_count": len(text.split()), "char_count": len(text)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── ROUTE 3: Extract ──────────────────────────────────────────
@app.route("/api/extract", methods=["POST"])
def extract():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        file = request.files["file"]
        text = extract_text(file)
        if not text.strip():
            return jsonify({"error": "Could not extract text from file"}), 400
        context = text[:3000]
        system_prompt = """You are a data extraction specialist.
        Extract structured information from documents.
        Always respond in valid JSON format with these fields:
        {
            "names": [],
            "dates": [],
            "organizations": [],
            "key_numbers": [],
            "locations": [],
            "emails": [],
            "main_topics": []
        }
        Only include fields that have actual data. Return ONLY the JSON, no extra text."""
        user_prompt = f"Extract all key information from this document:\n\n{context}"
        extracted_raw = call_groq(system_prompt, user_prompt)
        try:
            extracted = json.loads(extracted_raw)
        except:
            extracted = {"raw_extraction": extracted_raw}
        return jsonify({"extracted_data": extracted, "word_count": len(text.split())})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── ROUTE 4: Q&A with RAG + General Knowledge fallback ────────
@app.route("/api/ask", methods=["POST"])
def ask():
    try:
        question = request.form.get("question", "")
        if not question:
            return jsonify({"error": "No question provided"}), 400

        # If file is provided, use RAG
        if "file" in request.files and request.files["file"].filename:
            file = request.files["file"]
            text = extract_text(file)
            if text.strip():
                chunks = chunk_text(text)
                relevant_chunks = get_relevant_chunks(chunks, question)
                context = "\n\n".join(relevant_chunks)

                system_prompt = """You are an intelligent document assistant.
                First try to answer from the document context provided.
                If the answer is not found in the document, use your general knowledge to answer
                and clearly mention: '(Answered from general knowledge, not from document)'.
                Be precise and helpful."""

                user_prompt = f"""Document context:
{context}

Question: {question}

Answer:"""
                answer = call_groq(system_prompt, user_prompt)
                return jsonify({
                    "question": question,
                    "answer": answer,
                    "chunks_searched": len(chunks),
                    "relevant_chunks_used": len(relevant_chunks),
                    "source": "document + general knowledge"
                })

        # No file — answer from general knowledge only
        system_prompt = """You are a highly knowledgeable AI assistant.
        Answer questions clearly, accurately and helpfully.
        If asked about data science, analytics, programming or AI topics, give detailed explanations.
        Always be concise but thorough."""

        user_prompt = f"Question: {question}\n\nAnswer:"
        answer = call_groq(system_prompt, user_prompt)
        return jsonify({
            "question": question,
            "answer": answer,
            "source": "general knowledge",
            "chunks_searched": 0,
            "relevant_chunks_used": 0
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── ROUTE 5: Full analysis ────────────────────────────────────
@app.route("/api/analyze", methods=["POST"])
def analyze():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        file = request.files["file"]
        text = extract_text(file)
        if not text.strip():
            return jsonify({"error": "Could not extract text from file"}), 400
        context = text[:3000]

        summary = call_groq(
            "You are a document analyst. Provide a concise 3-sentence summary.",
            f"Summarize:\n\n{context}"
        )
        extracted_raw = call_groq(
            """Extract key info as JSON: {"names":[],"dates":[],"organizations":[],"key_numbers":[],"main_topics":[]}. Return ONLY JSON.""",
            f"Extract from:\n\n{context}"
        )
        try:
            extracted = json.loads(extracted_raw)
        except:
            extracted = {"raw": extracted_raw}

        insights = call_groq(
            "You are a business analyst. Provide 3 actionable insights from this document.",
            f"Give insights from:\n\n{context}"
        )
        return jsonify({
            "summary": summary,
            "extracted_data": extracted,
            "insights": insights,
            "word_count": len(text.split()),
            "char_count": len(text)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── ROUTE 6: AI Content Improver ──────────────────────────────
@app.route("/api/improve", methods=["POST"])
def improve():
    try:
        data = request.get_json()
        if not data or "content" not in data:
            return jsonify({"error": "No content provided"}), 400

        content = data["content"]
        improve_type = data.get("type", "general")

        prompts = {
            "general": "You are an expert writing coach. Improve this content for clarity, impact and professionalism.",
            "resume": "You are a professional resume writer and career coach. Improve this resume content to make it more impactful, quantified and ATS-friendly for data/tech roles.",
            "email": "You are a professional communication expert. Improve this email to be more clear, concise and professional.",
            "report": "You are a technical writer. Improve this report content to be more structured, clear and data-driven.",
            "bio": "You are a personal branding expert. Improve this bio to be more compelling, professional and memorable."
        }

        system_prompt = prompts.get(improve_type, prompts["general"])

        user_prompt = f"""Original content:
{content}

Please provide:
1. **Improved Version** — rewritten content
2. **Key Changes Made** — bullet points explaining what you improved
3. **Score** — rate the original out of 10 and the improved version out of 10"""

        improved = call_groq(system_prompt, user_prompt, max_tokens=1500)

        return jsonify({
            "original": content,
            "improved": improved,
            "type": improve_type,
            "original_word_count": len(content.split())
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5002))
    print(f"🤖 LLM Agent running on http://localhost:{port}")
    app.run(debug=True, port=port)