FROM python:3.11-bookworm

WORKDIR /app

# Tells Playwright to always install/find browsers here regardless of which user runs it
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libwebp-dev \
    curl \
    adduser \
    git \
    cmake \
    g++ \
    xvfb \
    fontconfig \
    libfreetype6 \
    libx11-6 \
    libxext6 \
    libxrender1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/opt/poetry python && \
    ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry

# Configure Poetry to not use virtualenvs
RUN poetry config virtualenvs.create false

# Add option for installing dev dependencies
ARG INSTALL_DEV=false

# Copy only dependency files first to leverage caching
COPY pyproject.toml poetry.lock* ./

# Install Python dependencies
RUN bash -c "if [ \"$INSTALL_DEV\" = \"true\" ]; then \
    poetry install --no-root --no-interaction --no-ansi; \
else \
    poetry install --no-root --only main --no-interaction --no-ansi; \
fi"

# Install Playwright deps (needs apt/root) then browser into /ms-playwright
RUN poetry run playwright install-deps chromium
RUN poetry run playwright install chromium

# Make the browser dir readable by appuser
RUN chmod -R 755 /ms-playwright

# Check for syntax issues
RUN poetry check

# App configuration
ARG PORT=8000
ENV PORT=${PORT}
EXPOSE ${PORT}
ENV PYTHONPATH=/app

# Copy app code after dependencies (to leverage cache)
COPY alembic.ini ./
COPY ./app /app/app
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# Fix permissions
RUN chown -R appuser:appuser /app

# Switch to non-root
USER appuser

ENTRYPOINT ["/app/entrypoint.sh"]