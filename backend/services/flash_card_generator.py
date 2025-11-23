from datetime import datetime, timedelta
import ollama
import re

class FlashCardGenerator:
    def __init__(self, model_name="llama3.1"):
        self.model_name = model_name

    def generate_flashcards(self, documents, embedding_service, workspace_id, count=10):
        if not documents:
            return []
        
        collection = embedding_service.get_or_create_collection(workspace_id)
        try:
            all_data = collection.get()
            chunks = all_data.get('documents', [])
            if not chunks:
                return []
            
            sample_chunks = chunks[:10]
            combined_text = "\n\n".join(sample_chunks)

            if len(combined_text)>3000:
                combined_text = combined_text[:3000]
        
        except Exception as e:
            print(f"Error fetching chunks: {e}")
            return []
        
        prompt = f"""Based on the following study material, create {count} flashcard-style question and answer pairs.

**Study Material:**
{combined_text}

**Instructions:**
1. Create clear, specific questions that test understanding
2. Keep questions concise (1-2 sentences)
3. Provide complete, accurate answers
4. Focus on key concepts, definitions, and important facts
5. Make questions diverse - mix definitions, applications, and examples
6. Use this EXACT format for each flashcard:

Q: [Your question here]
A: [Your answer here]

Q: [Next question]
A: [Next answer]

Generate {count} flashcards now:"""
        
        try:
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 1500
                }
            )

            flashcards = self.parse_flashcards(response['response'])
            return flashcards[:count]
        
        except Exception as e:
            print(f"Error getting flashcards")
            return self.generate_fallback_flashcards()
        
    def parse_flashards(self, text):
        flashcards = []
        parts = re.split(r'\n*Q:\s*', text, flags=re.IGNORECASE)
        
        for part in parts:
            if 'A:' in part or 'a:' in part:
                qa_split = re.split(r'\n*A:\s*', part, maxsplit=1, flags=re.IGNORECASE)
                if len(qa_split) == 2:
                    question = qa_split[0].strip()
                    answer = qa_split[1].strip()

                    question = re.sub(r'\n+', ' ', question)
                    answer = re.sub(r'\n+', ' ', answer)

                    if question and answer and len(question) > 5 and len(answer) > 5:
                        flashcards.append({
                            'question':question,
                            'answer':answer
                        })

        return flashcards
    
    def generate_fallback_flashcards(self):
        return [
            {
                'question': 'What is the main topic covered in your study materials?',
                'answer': 'Review your uploaded documents to understand the main concepts.'
            },
            {
                'question': 'What are the key terms you need to remember?',
                'answer': 'Create a list of important terminology from your materials.'
            }
        ]
    
    def update_sm2(self, flashcard, quality):
        if quality >= 3:
            if flashcard.repetitions == 0:
                flashcard.interval = 1
            elif flashcard.repetitions == 1:
                flashcard.interval = 6
            else:
                flashcard.interval = round(flashcard.interval * flashcard.easiness_factor)
            
            flashcard.repetitions+=1
        
        else:
            flashcard.repetitions = 0
            flashcard.interval = 1

        flashcard.easiness_factor = max(
            1.3,
            flashcard.easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        )

        flashcard.next_review = datetime.utcnow() + timedelta(days=flashcard.interval)
        flashcard.last_reviewed = datetime.utcnow()

        return flashcard
    # def update_sm2_deadline(self, flashcard, quality, deadline_date):

    #     today = datetime.utcnow()
    #     remaining_days = (deadline_date - today).days
        
    #     if remaining_days < 0:
    #         remaining_days = 0

    #     # Determine how many repetitions the card still needs
    #     if quality <= 2:
    #         remaining_reps = 4  # hard
    #     elif quality == 3:
    #         remaining_reps = 3  # medium
    #     else:
    #         remaining_reps = 2  # easy

    #     # Compressed interval
    #     if remaining_reps == 0:
    #         interval = 1
    #     else:
    #         interval = max(0.5, remaining_days / remaining_reps)

    #     # Update flashcard data
    #     flashcard.interval = interval
    #     flashcard.repetitions += 1
    #     flashcard.last_reviewed = today
    #     flashcard.next_review = today + timedelta(days=interval)

    #     return flashcard
