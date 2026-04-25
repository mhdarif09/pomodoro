# LLM Provider (OpenAI-compatible)

Project ini bisa pakai API yang OpenAI-compatible, termasuk **Groq**.

## Konfigurasi (.env)

- **Mode A (single provider)**: `LLM_PROVIDER=openai|groq`
- **Mode B (fallback)**:
  - `LLM_PRIMARY_PROVIDER=openai`
  - `LLM_SECONDARY_PROVIDER=groq`

- `OPENAI_API_KEY=...` dan/atau `GROQ_API_KEY=...`
- `LLM_API_KEY` + `LLM_BASE_URL` (opsional override global; kalau diisi, akan dipakai untuk semua request)
- `LLM_MODEL=...` (model default yang dipakai di berbagai fitur)

Contoh pakai Groq (single provider):

```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_key_here
LLM_MODEL=llama-3.1-8b-instant
```

Contoh fallback (OpenAI dulu baru Groq):

```env
LLM_PRIMARY_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
LLM_SECONDARY_PROVIDER=groq
GROQ_API_KEY=your_groq_key
LLM_MODEL=gpt-4o-mini
```

## List “all models”

Endpoint:

- `GET /api/ai/models` (butuh `auth:sanctum`, `premium`, dan `throttle:ai`)

Endpoint ini bisa ambil model dari provider tertentu:

- `GET /api/ai/models?provider=all` (default)
- `GET /api/ai/models?provider=primary`
- `GET /api/ai/models?provider=secondary`
- `GET /api/ai/models?provider=openai`
- `GET /api/ai/models?provider=groq`
