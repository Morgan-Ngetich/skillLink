import logging
from sqlalchemy import Engine
from sqlmodel import Session, select
from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed
from app.core.db import engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Retry config: wailt 1s between tries, retry for up to 5 minutes
max_tries = 60 * 5
wait_seconds = 1

@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)

def wait_for_db(db_engine: Engine) -> None:
  try:
    with Session(db_engine) as session:
      # Just test if db responds
      session.exec(select(1))
  except Exception as e:
    logger.error("❌ Could not connect to the database.")
    raise e
  
def main() -> None:
    logger.info("⏳ Waiting for the database to be ready...")
    wait_for_db(engine)
    logger.info("✅ Database is ready!")
    
if __name__ == "__main__":
  main()