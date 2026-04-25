# LLM Provider (OpenAI-compatible)

Project ini pakai provider OpenAI-compatible, fokus ke OpenAI dan Groq.

## Konfigurasi (.env)

- Mode A (single provider): `LLM_PROVIDER=openai|groq`
- Mode B (fallback):
  - `LLM_PRIMARY_PROVIDER=openai`
  - `LLM_SECONDARY_PROVIDER=groq`
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=...` (default model untuk request ke OpenAI)
- `GROQ_API_KEY=...`
- `GROQ_MODEL=...` (default model untuk request ke Groq; bisa `llama-*`, `mixtral-*`, `groq/compound`, dll)
- `LLM_MODEL=...` (opsional alias global; kalau diisi, tetap dipetakan ke default model per provider saat fallback)

## Behavior Hybrid

- Mode `hybrid` berjalan AI-first.
- Urutan provider: primary dulu (contoh OpenAI), lalu secondary (contoh Groq).
- Kalau AI tetap gagal, service yang punya heuristic lokal akan fallback ke local heuristic.

## Contoh Konfigurasi

Single provider Groq:

2```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
```

Fallback OpenAI -> Groq:

```env
LLM_PRIMARY_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini

LLM_SECONDARY_PROVIDER=groq
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
```

## List All Models

Endpoint:

- `GET /api/ai/models` (butuh `auth:sanctum`, `premium`, dan `throttle:ai`)

Filter provider:

- `GET /api/ai/models?provider=all` (default)
- `GET /api/ai/models?provider=primary`
- `GET /api/ai/models?provider=secondary`
- `GET /api/ai/models?provider=openai`
- `GET /api/ai/models?provider=groq`
