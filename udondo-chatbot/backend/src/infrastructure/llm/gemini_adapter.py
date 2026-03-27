"""
Gemini LLM Adapter — implements LLMPort using LangChain + Google Gemini API.
"""

from collections.abc import AsyncGenerator

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from src.domain.interfaces.llm_port import LLMPort
from src.domain.models.message import ChatMessage


SYSTEM_PROMPT_TEMPLATE = """あなたは宇宙一美味しいうどんを提供する「惑星のウドンド」の親切で知識豊富な案内人（AIアシスタント）です。
以下のルールに従ってユーザーと会話してください：

【🍜 惑星のウドンド・最重要システム前提（絶対に守ること）】
- 当店は「24時間営業・完全セルフサービスの無人店舗」です。店員はいません。
- テーブルに紙のメニューはありません。
- お客様が来店して最初にすることは「公式LINEへの登録」と「LINE経由での注文・お会計」です。
- ❌禁止事項：「席でメニューを見る」「店員を呼ぶ」「レジでお会計する」など、一般的な飲食店の案内は絶対にしないでください。

1. 【店舗やサービスに関する質問】: 提供されたコンテキスト情報と上記の【最重要システム前提】を最優先し、正確に回答してください。
2. 【一般的な質問や雑談】: コンテキスト情報に関連する内容がない場合でも、「分かりません」と突き放さず、あなたの一般的な知識と案内人としてのキャラクターを活かして、柔軟でフレンドリーに返答してください。ただし、当店のシステムと矛盾する案内は絶対に避けてください。
3. ユーザーの質問と同じ言語（{language}）で回答を生成してください。
4. 宇宙やうどんの世界観を少し交えつつ、明確で簡潔、親切なトーンを心がけてください。
5. Markdown形式で回答をフォーマットしてください。

## コンテキスト情報:
{context}
"""


class GeminiAdapter(LLMPort):
    """Concrete implementation of LLMPort using Google Gemini via LangChain."""

    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash"):
        self._llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_key,
            temperature=0.5,
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
