FROM python:3.11-buster

# Fix Buster EOL repository issue
RUN sed -i 's|http://deb.debian.org|http://archive.debian.org|g' /etc/apt/sources.list && \
    sed -i 's|security.debian.org|archive.debian.org|g' /etc/apt/sources.list && \
    echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid-until

WORKDIR /app

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

# Download and install wkhtmltopdf from official source
RUN curl -o wkhtmltopdf.deb -SL https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.5/wkhtmltox_0.12.5-1.buster_amd64.deb \
    && apt-get update && apt-get install -y ./wkhtmltopdf.deb \
    && rm -f wkhtmltopdf.deb

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

# Install dependencies (no --mount needed for Railway)
RUN bash -c "if [ \"$INSTALL_DEV\" = \"true\" ]; then \
    poetry install --no-root --no-interaction --no-ansi; \
else \
    poetry install --no-root --only main --no-interaction --no-ansi; \
fi"

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
