FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libwebp-dev \
    curl \
    supervisor \
    adduser \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/opt/poetry python && \
    ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry

# Configure Poetry
RUN poetry config virtualenvs.create false

ARG INSTALL_DEV=false

COPY pyproject.toml poetry.lock* ./

RUN bash -c "if [ \"$INSTALL_DEV\" = \"true\" ]; then poetry install --no-root --no-interaction --no-ansi; else poetry install --no-root --only main --no-interaction --no-ansi; fi"

RUN poetry check

ARG PORT=8000
ENV PORT=${PORT}
ENV PYTHONPATH=/app

COPY alembic.ini ./
COPY ./app /app/app
COPY ./scripts/start-fastapi.sh /app/scripts/start-fastapi.sh
COPY ./supervisord.conf /etc/supervisord.conf

RUN chmod +x /app/scripts/start-fastapi.sh
RUN chown -R appuser:appuser /app

EXPOSE ${PORT}

USER appuser

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
