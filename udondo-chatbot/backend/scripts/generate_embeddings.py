#!/usr/bin/env python3
"""
Generate embeddings for all knowledge_base rows that have a NULL embedding.

Usage:
    python scripts/generate_embeddings.py
"""

import sys
import os
import time
import logging

# Add project root to path so we can import src.*
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.core.config import get_settings
from supabase import create_client
from google import genai

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


def main():
    settings = get_settings()
    client = create_client(settings.supabase_url, settings.supabase_key)
    genai_client = genai.Client(api_key=settings.gemini_api_key)

    # Fetch rows without embeddings
    response = (
        client.table("knowledge_base")
        .select("id, title, content")
        .is_("embedding", "null")
        .eq("is_active", "true")
        .execute()
    )

    rows = response.data
    if not rows:
        logger.info("All rows already have embeddings. Nothing to do.")
        return

    logger.info(f"Found {len(rows)} rows without embeddings. Generating...")

    for i, row in enumerate(rows, 1):
        # Combine title + content for richer embedding
        text = f"{row['title']}\n{row['content']}"

        try:
            from google.genai import types
            result = genai_client.models.embed_content(
                model=settings.embedding_model,
                contents=text,
                config=types.EmbedContentConfig(output_dimensionality=768),
            )
            embedding = result.embeddings[0].values

            # Update the row
            client.table("knowledge_base").update(
                {"embedding": embedding}
            ).eq("id", row["id"]).execute()

            logger.info(f"[{i}/{len(rows)}] Embedded: {row['title']}")

            # Rate limit: Gemini free tier allows ~1500 RPM
            time.sleep(0.1)

        except Exception as e:
            logger.error(f"Failed to embed row {row['id']}: {e}")

    logger.info("Done! All embeddings generated.")


if __name__ == "__main__":
    main()
