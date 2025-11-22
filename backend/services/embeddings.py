from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import numpy as np

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer('BAAI/bge-m3')
        self.client = chromadb.PersistentClient(path="./chroma_db")

    def encoding(self, texts):
        instruction = "Represent this sentence for searching relevant passages: "
        processed = [instruction + t for t in texts]

        embeddings = self.model.encode(
            processed,
            normalize_embeddings=True,
            batch_size=32
        )
        #for cpu
        # embeddings = self.model.encode(
        #     processed,
        #     normalize_embeddings=True
        # )
        return embeddings.tolist()
    
    def get_or_create_collection(self, workspace_id):
        collection_name = f"workspace_{workspace_id}"
        return self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}# for retrival accuray we use cosine similarity
        )
    
    def embed_and_store(self, workspace_id, document_id, chunks):
        collection = self.get_or_create_collection(workspace_id)
        embeddings = self.encoding(chunks)

        ids = [f"doc{document_id}_chunk{i}" for i in range(len(chunks))]
        metadatas = [{"document_id": document_id, "chunk_index": i} for i in range(len(chunks))]

        collection.add(
            embeddings=embeddings,
            documents=chunks,
            ids=ids,
            metadatas=metadatas
        )

        return len(chunks)
    
    def search(self, workspace_id, query, top_k=5):
        collection = self.get_or_create_collection(workspace_id)
        query_embedding = self.encoding([query])

        results = collection.query(
            query_embeddings=query_embedding,
            n_results=top_k
        )

        return results["documents"][0] if results["documents"] else []
