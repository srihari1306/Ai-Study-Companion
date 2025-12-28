import ollama

class LLMService:
    def __init__(self, model_name="qwen:7b"):
        self.model_name = model_name
    
    def generate_answer(self, question, context_chunks):
        context = "\n\n".join([f"[{i+1}] {chunk}" for i,chunk in enumerate(context_chunks)])
        prompt = f"""You are a helpful study assistant. Answer the student's question based on the provided context from their study materials.

Context from study materials:
{context}

Student's Question: {question}

Instructions:
- Answer based on the context provided
- If the context doesn't contain the answer, say so clearly
- Cite which context snippet you used (e.g., "According to [1]...")
- Be clear, concise, and educational

Answer:"""
        
        response = ollama.generate(
            model=self.model_name,
            prompt=prompt,
            options={
                "temperature": 0.7,
                "top_p": 0.9,
                "max_tokens": 500
            }
        )

        return response['response']

        # response = ollama.chat(
        #     model=self.model_name,
        #     messages=[
        #         { "role": "system", "content": "You are an accurate study assistant." },
        #         { "role": "user", "content": prompt }
        #     ],
        #     options={
        #         "temperature": 0.7,
        #         "top_p": 0.9,
        #         "max_tokens": 500
        #     }
        # )

        # return response["message"]["content"]
