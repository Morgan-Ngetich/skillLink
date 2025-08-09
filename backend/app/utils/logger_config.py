import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from app.core.config import settings

def configure_logging():
    """Configure application-wide logging"""
    
    # Create logs directory if it doesn't exist
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    # Main application logger
    logger = logging.getLogger("app")
    logger.setLevel(settings.LOG_LEVEL)  # Set from config
    
    # Clear existing handlers to avoid duplicate logs
    if logger.hasHandlers():
        logger.handlers.clear()
    
    # Formatting
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s '
        '[%(filename)s:%(lineno)d]'
    )
    
    # Console handler (for development)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    
    # File handler (rotating logs)
    file_handler = RotatingFileHandler(
        filename=logs_dir / "app.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    
    # Special LLM logger with more details
    llm_logger = logging.getLogger("llm")
    llm_logger.setLevel(logging.INFO)
    llm_handler = RotatingFileHandler(
        logs_dir / "llm_requests.log",
        maxBytes=20 * 1024 * 1024,
        backupCount=10
    )
    llm_handler.setFormatter(formatter)
    llm_logger.addHandler(llm_handler)
    
    # Add handlers to main logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    # Configure third-party loggers
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.INFO)

# Call the configuration when module is imported
configure_logging()

# Convenience logger instances
app_logger = logging.getLogger("app")
llm_logger = logging.getLogger("llm")