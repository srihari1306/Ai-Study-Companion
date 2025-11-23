from datetime import datetime, timedelta
import ollama

class StudyPlanGenerator:
    def __init__(self,model_name="llama3.1"):
        self.model_name=model_name

    def generate_plan(self, workspace_name, deadline, documents):
        today = datetime.now()
        days_until_deadline = (deadline - today).days
        if days_until_deadline < 0:
            return "Your deadline has passed!"
        
        if days_until_deadline == 0:
            days_until_deadline = 1
        
        doc_list = "\n".join([f"- {doc.filename} ({doc.chunk_count} sections)" for doc in documents])

        if not doc_list:
            doc_list = "No documents uploaded yet"

        prompt = f"""You are an expert study planner. Create a detailed, day-by-day study plan for a student.

**Workspace**: {workspace_name}
**Days Available**: {days_until_deadline} days
**Deadline**: {deadline.strftime('%B %d, %Y')}

**Materials to Study**:
{doc_list}

**Instructions**:
1. Create a realistic day-by-day breakdown
2. Allocate time for initial learning, practice, and review
3. Include buffer days for unexpected delays
4. Schedule review sessions using spaced repetition principles
5. Reserve the last 2-3 days for final review and practice
6. Be specific about what topics to cover each day
7. Include estimated time per activity

**Format the plan like this**:

📅 **Day 1** ({(today + timedelta(days=1)).strftime('%A, %B %d')})
- Morning (2 hours): [Specific topic/chapter]
- Afternoon (2 hours): [Specific topic/chapter]
- Evening (1 hour): Review and practice problems

📅 **Day 2** ({(today + timedelta(days=2)).strftime('%A, %B %d')})
...

🎯 **Final Review Days**
...

✅ **Success Tips**
- Take regular breaks (Pomodoro technique)
- Stay consistent with daily goals
- Don't cram everything at the end

Create the complete plan now:"""
        
        try:
            response = ollama.generate(
                model= self.model_name,
                prompt=prompt,
                options={
                    "temperature":0.7,
                    "top_p":0.9,
                    "num_predict":2000
                }
            )

            return response['response']
        
        except Exception as e:
            print(f"Error generating study plan {e}")
            return self.generate_fallback_plan(workspace_name, days_until_deadline, documents)
    
    def generate_fallback_plan(self, workspace_name, days_until_deadline, documents):

        plan = f"""📅 **Day 1** (Monday, November 24)
- Morning (2 hours): Introduction to Data Science — history, evolution, key milestones
- Afternoon (2 hours): Study Data Science Roles & Skill Tracks (Engineering, Analysis, Modelling)
- Evening (1 hour): Review — Flashcards on history and role definitions

📅 **Day 2** (Tuesday, November 25)
- Morning (2 hours): Deep dive into individual roles — Data Engineer to ML Engineer
- Afternoon (2 hours): Study Soft Skills, Statistician vs Data Scientist, Three Pillars of Knowledge
- Evening (1 hour): Practice — Explain the difference between statisticians and data scientists

📅 **Day 3** (Wednesday, November 26)
- Morning (2 hours): Data Science Project Cycle — Offline/Online data, planning, modelling
- Afternoon (2 hours): Common Mistakes — Problem formulation, modelling, deployment
- Evening (1 hour): Spaced repetition review — Recall project cycle steps, mistakes, solutions

📅 **Day 4** (Thursday, November 27)
- Morning (2 hours): Full revision of summaries, diagrams, and major tables
- Afternoon (2 hours): Final mock test — create 15 self-test questions
- Evening (1 hour): Light review & buffer for unfinished topics

🎯 **Final Review Days**
- Day 3 evening: Spaced repetition
- Day 4 morning & afternoon: Consolidation & final practice
- Day 4 evening: Buffer for any remaining weak areas

✅ **Success Tips**
- Study using 25–5 Pomodoro cycles
- Stick to the daily goals — avoid skipping sessions
- Use active recall instead of rereading notes
- Review key points twice daily for better retention
- Get proper sleep before the deadline
"""

        return plan

        
#     def generate_fallback_plan(self, workspace_name, days_until_deadline, documents):
#         """Fallback plan if LLM fails"""
        
#         plan = f"""📚 **Study Plan for {workspace_name}**

# ⏰ **Timeline**: {days_until_deadline} days

# 📖 **Materials**: {len(documents)} documents uploaded

# ---

# 🗓️ **Suggested Schedule**:

# **Week 1**: Initial Learning
# - Study all uploaded materials thoroughly
# - Take notes on key concepts
# - Identify challenging topics

# **Week 2**: Practice & Application
# - Work on practice problems
# - Create summaries of each topic
# - Test yourself with flashcards

# **Final Days**: Comprehensive Review
# - Review all notes and summaries
# - Focus on weak areas
# - Do full practice tests

# ---

# 💡 **Pro Tips**:
# - Study in focused 25-minute blocks (Pomodoro)
# - Take 5-minute breaks between sessions
# - Review material multiple times (spaced repetition)
# - Get enough sleep before the deadline!

# 🎯 Use the chat feature to ask questions about your materials!
# """
#         return plan
        