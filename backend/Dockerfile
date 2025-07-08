FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libwebp-dev \
    curl \
    adduser \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Now create non-root user
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

# Install dependencies
RUN bash -c "if [ \"$INSTALL_DEV\" = \"true\" ]; then poetry install --no-root --no-interaction --no-ansi; else poetry install --no-root --only main --no-interaction --no-ansi; fi"

# Check for syntax issues
RUN poetry check

# Not neccessary but for clarity
ARG PORT=8000
ENV PORT=${PORT}
EXPOSE ${PORT}
ENV PYTHONPATH=/app

# Copy app code
COPY alembic.ini ./
COPY ./app /app/app
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# Fix permissions for non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

ENTRYPOINT ["/app/entrypoint.sh"]