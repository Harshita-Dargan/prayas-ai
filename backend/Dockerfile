FROM python:3.12-slim

WORKDIR /app

# Install build essentials & audio libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and frontend
COPY backend/ /app/backend/
COPY prayas-ai/ /app/prayas-ai/

WORKDIR /app/backend

# Default port for Hugging Face Spaces is 7860, or Render/Railway PORT
ENV PORT=7860
EXPOSE 7860

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
