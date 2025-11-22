class RagPipeline:
    def __init__(self, embedding_service, llm_service):
        self.embedding_service = embedding_service
        self.llm_service = llm_service

    def answer_question(self, workspace_id, question):
        context_chunks = self.embedding_service.search(
            workspace_id=workspace_id,
            query = question,
            top_k=5
        )

        if not context_chunks:
            return "I couldn't find any relevant information in your uploaded documents. Please upload study materials first!"
        
        answer = self.llm_service.generate_answer(question, context_chunks)

        return answer