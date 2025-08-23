from app.core.llm.async_executor import AsyncExecutor
from celery.signals import worker_process_init, worker_shutdown
from app.utils.logger_config import llm_logger

# Global executor instance
_llm_executor = None

def get_llm_executor() -> AsyncExecutor:
  """Get the shared LLM executor instance"""
  global _llm_executor
  if _llm_executor is None:
    raise RuntimeError("LLM executor not initialized")
  return _llm_executor

@worker_process_init.connect
def init_llm_executor(*args, **kwargs):
  """Initialize executor in each worker process"""
  global _llm_executor
  _llm_executor = AsyncExecutor()
  llm_logger.info("LLM executor initialized with worker process")
  
@worker_shutdown.connect
def shutdown_llm_executor(*args, **kwargs):
  """Cleanup executor on worjer shutdown"""
  global _llm_executor
  if _llm_executor is not None:
    _llm_executor.shutdown()
    _llm_executor = None
  llm_logger.info("LLM executor shutdown")

