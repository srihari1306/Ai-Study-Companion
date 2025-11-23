import pdfplumber
from docx import Document
import threading
from concurrent.futures import ThreadPoolExecutor
import re

class DocumentProcessor:
    @staticmethod
    def extract_text_from_pdf(file_path):
        """Optimized PDF extraction with parallel page processing"""
        text = ""
        
        try:
            with pdfplumber.open(file_path) as pdf:
                with ThreadPoolExecutor(max_workers=4) as executor:
                    page_texts = list(executor.map(
                        lambda page: page.extract_text() or "",
                        pdf.pages
                    ))
                text = "\n".join(page_texts)
        except Exception as e:
            print(f"Error extracting PDF using threads: {e}")
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        
        return text
    
    @staticmethod
    def extract_text_from_docx(file_path):
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    
    @staticmethod
    def chunking(text, chunk_size=500, overlap=100):
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = ""

        for sentence in sentences:
            if len(current_chunk) + len(sentence) < chunk_size:
                current_chunk += sentence + " "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                
                if overlap > 0 and len(current_chunk) > overlap:
                    current_chunk = current_chunk[-overlap:] + sentence + " "
                else:
                    current_chunk = sentence + " "

        if current_chunk.strip():
            chunks.append(current_chunk.strip())

        return chunks