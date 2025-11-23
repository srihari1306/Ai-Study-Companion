import ollama
import re

class SummarizationService:
    def __init__(self, model_name="llama3.1"):
        self.model_name = model_name
    
    def summarize_document(self, document, chunks):
        
        combined_text = "\n\n".join(chunks[:15])
        
        if len(combined_text) > 8000:
            combined_text = combined_text[:8000]
        
        prompt = f"""You are an expert at creating structured study summaries. Analyze the following document and create a comprehensive summary.

**Document**: {document.filename}

**Content**:
{combined_text}

**Instructions**:
Create a well-structured summary with the following sections:

## 📋 Executive Summary
[2-3 sentence overview of the entire document]

## 🎯 Main Topics Covered
[List 4-6 main topics/themes as bullet points]

## 📚 Detailed Summary

### [Topic 1]
[Detailed explanation of first major topic]

### [Topic 2]
[Detailed explanation of second major topic]

### [Topic 3]
[Detailed explanation of third major topic]

[Continue for all major topics...]

## 💡 Key Takeaways
- [Important point 1]
- [Important point 2]
- [Important point 3]
- [Important point 4]
- [Important point 5]

## 🔑 Important Terms & Concepts
- **Term 1**: Definition
- **Term 2**: Definition
- **Term 3**: Definition

## ❓ Study Questions
1. [Question to test understanding]
2. [Question to test understanding]
3. [Question to test understanding]

Create the complete structured summary now:"""

        try:
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 2500
                }
            )
            
            summary_text = response['response']
            
            key_points = self._extract_key_points(summary_text)
            topics = self._extract_topics(summary_text)
            
            return {
                'summary': summary_text,
                'key_points': key_points,
                'topics': topics,
                'word_count': len(combined_text.split()),
                'chunk_count': len(chunks)
            }
            
        except Exception as e:
            print(f"Error generating summary: {e}")
            return self._generate_fallback_summary(document, chunks)
    
    def _extract_key_points(self, summary_text):
        key_points = []
        
        takeaways_match = re.search(r'## 💡 Key Takeaways(.*?)(?=##|\Z)', summary_text, re.DOTALL)
        
        if takeaways_match:
            takeaways_section = takeaways_match.group(1)
            points = re.findall(r'-\s+(.+)', takeaways_section)
            key_points = [p.strip() for p in points if p.strip()]
        
        return key_points[:5]
    
    def _extract_topics(self, summary_text):
        """Extract main topics from the summary"""
        import re
        
        topics = []
        
        topics_match = re.search(r'## 🎯 Main Topics Covered(.*?)(?=##|\Z)', summary_text, re.DOTALL)
        
        if topics_match:
            topics_section = topics_match.group(1)

            topic_items = re.findall(r'[-*]\s+(.+)', topics_section)
            topics = [t.strip() for t in topic_items if t.strip()]
        
        return topics[:6]
    
    def _generate_fallback_summary(self, document, chunks):
        """Generate a simple fallback summary if LLM fails"""
        
        summary = f"""## 📋 Document Summary

**File**: {document.filename}
**Chunks**: {len(chunks)}

## 📚 Content Overview

This document contains {len(chunks)} sections of content. The material covers various topics that are important for your studies.

## 💡 Key Points
- Review all sections carefully
- Take notes on important concepts
- Use the chat feature to ask questions about specific topics
- Create flashcards for key terms

## 🎯 Next Steps
1. Read through the entire document
2. Highlight important sections
3. Use the AI chat to clarify doubts
4. Practice with generated flashcards
"""
        
        return {
            'summary': summary,
            'key_points': [
                'Review the document thoroughly',
                'Take comprehensive notes',
                'Use AI chat for questions',
                'Practice with flashcards'
            ],
            'topics': ['General Study Material'],
            'word_count': sum(len(chunk.split()) for chunk in chunks),
            'chunk_count': len(chunks)
        }
    
    def generate_quick_summary(self, text, max_words=150):
        """Generate a quick one-paragraph summary"""
        
        if len(text) > 3000:
            text = text[:3000]
        
        prompt = f"""Summarize the following text in {max_words} words or less. Be concise and focus on the main points.

Text:
{text}

Summary:"""

        try:
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "temperature": 0.5,
                    "num_predict": 200
                }
            )
            
            return response['response'].strip()
            
        except Exception as e:
            print(f"Error generating quick summary: {e}")
            return "Summary generation failed. Please try again."