"""
Gemini LLM Adapter — implements LLMPort using LangChain + Google Gemini API.
"""

from collections.abc import AsyncGenerator

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from src.domain.interfaces.llm_port import LLMPort
from src.domain.models.message import ChatMessage


SYSTEM_PROMPT_TEMPLATE = """あなたは「うどんど」という名前の親切で知識豊富なAIアシスタントです。
以下のルールに厳密に従ってください：

1. 提供されたコンテキスト情報のみに基づいて回答してください。
2. コンテキストに答えが見つからない場合は、「申し訳ありませんが、その情報は私のナレッジベースにありません。」と正直に伝えてください。
3. ユーザーの質問と同じ言語（{language}）で回答を生成してください。
4. 回答は明確で、簡潔で、親切なトーンで提供してください。
5. Markdown形式で回答をフォーマットしてください（リスト、太字、見出しなどを適切に使用）。

## コンテキスト情報:
{context}
"""


class GeminiAdapter(LLMPort):
    """Concrete implementation of LLMPort using Google Gemini via LangChain."""

    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash"):
        self._llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_key,
            temperature=0.3,
            streaming=True,
        )

    async def generate_stream(
        self,
        query: str,
        context: str,
        history: list[ChatMessage],
        language: str,
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens from Gemini."""
        # Build message list
        messages = []

        # System message with context
        system_content = SYSTEM_PROMPT_TEMPLATE.format(
            language=language,
            context=context if context else "コンテキスト情報は利用できません。",
        )
        messages.append(SystemMessage(content=system_content))

        # Conversation history
        for msg in history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                messages.append(AIMessage(content=msg.content))

        # Current query
        messages.append(HumanMessage(content=query))

        # Stream tokens
        async for chunk in self._llm.astream(messages):
            if chunk.content:
                yield chunk.content
