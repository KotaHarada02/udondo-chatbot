"""
Supabase Knowledge Retriever — implements RetrieverPort using Supabase pgvector.

Flow:
  1. Embed the user query via Gemini Embedding API
  2. Call Supabase RPC `match_knowledge` (pgvector cosine similarity)
  3. Return matched rows as RetrievedDocument list
"""

import logging

from supabase import Client, create_client
from google import genai

from src.domain.interfaces.retriever_port import RetrieverPort, RetrievedDocument

logger = logging.getLogger(__name__)


class SupabaseKnowledgeRetriever(RetrieverPort):
    """Concrete implementation of RetrieverPort using Supabase + pgvector."""

    def __init__(
        self,
        supabase_url: str,
        supabase_key: str,
        gemini_api_key: str,
        embedding_model: str = "gemini-embedding-001",
        match_threshold: float = 0.3,
    ):
        self._client: Client = create_client(supabase_url, supabase_key)
        self._genai_client = genai.Client(api_key=gemini_api_key)
        self._embedding_model = embedding_model
        self._match_threshold = match_threshold

    def _embed(self, text: str) -> list[float]:
        """Generate an embedding vector for *text* using Gemini."""
        from google.genai import types
        result = self._genai_client.models.embed_content(
            model=self._embedding_model,
            contents=text,
            config=types.EmbedContentConfig(output_dimensionality=768),
        )
        return result.embeddings[0].values

    async def retrieve(self, query: str, top_k: int = 5) -> list[RetrievedDocument]:
        """Retrieve relevant knowledge entries via pgvector similarity search."""
        try:
            query_embedding = self._embed(query)

            response = (
                self._client.rpc(
                    "match_knowledge",
                    {
                        "query_embedding": query_embedding,
                        "match_count": top_k,
                        "match_threshold": self._match_threshold,
                    },
                ).execute()
            )

            if not response.data:
                logger.info("No matching knowledge entries found.")
                return []

            documents: list[RetrievedDocument] = []
            for row in response.data:
                metadata = row.get("metadata") or {}
                metadata["title"] = row.get("title", "")
                metadata["category"] = row.get("category", "")
                metadata["similarity"] = row.get("similarity", 0.0)

                documents.append(
                    RetrievedDocument(
                        content=row["content"],
                        metadata=metadata,
                        score=row.get("similarity", 0.0),
                    )
                )

            logger.info(
                f"Retrieved {len(documents)} documents (top similarity: "
                f"{documents[0].score:.3f})"
            )
            return documents

        except Exception as e:
            logger.error(f"Supabase knowledge retrieval failed: {e}", exc_info=True)
            return []
