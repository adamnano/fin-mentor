import os
from typing import AsyncGenerator

from openai import AsyncOpenAI

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def generate_completion(prompt: str) -> str:
    response = await client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


async def stream_completion(prompt: str) -> AsyncGenerator[str, None]:
    stream = await client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
