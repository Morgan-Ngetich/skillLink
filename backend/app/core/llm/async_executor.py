import asyncio
import concurrent.futures
from threading import Thread, Lock
from app.utils.logger_config import llm_logger
from app.core.config import settings

class AsyncExecutor:
  def __init__(self):
    self.loop = None
    self._thread = None
    self._shutdown = False
    self._pending = set()
    self._lock = Lock()
    self._start_loop_thread()
    
  def _start_loop_thread(self):
    """Initialize and start the event loop thread."""
    with self._lock:
      if self._thread and self._thread.is_alive():
        return
      
      self.loop = asyncio.new_event_loop()
      self._thread = Thread(target=self._run_loop, daemon=True)
      self._thread.start()
      
  def _run_loop(self):
    """Run the event loop in a dedicated thread."""
    asyncio.set_event_loop(self.loop)
    try:
      self.loop.run_forever()
    except Exception as e:
      llm_logger.error(f"Event loop crashed: {e}")
    finally:
      if self.loop.is_running():
        self.loop.close()
  
  def _check_thread_health(self):
    """Ensure the loop thread is running, restart if needed."""
    if not self._thread or not self._thread.is_alive():
      llm_logger.warning("Event loop thred dead, restarting...")
      self._start_loop_thread()
  
  def run(self, coro):
    """Execute a coroutine synchronously."""
    with self._lock:
      if self._shutdown:
        raise RuntimeError("Executor shutting down")
      self._check_thread_health()
    
    future = asyncio.run_coroutine_threadsafe(coro, self.loop)
    self._pending.add(future)
    future.add_done_callback(lambda f: self._pending.discard(f))
    
    try:
      return future.result(timeout=settings.LLM_TIMEOUT)
    except concurrent.futures.TimeoutError:
      future.cancel()
      raise
    except Exception as e:
      future.cancel()
      llm_logger.error(f"Unexpected error in async execution: {e}")
      raise
  
  def shutdown(self):
    """Clean shutdown of the executor."""
    with self._lock:
      self._shutdown = True
      for future  in self._pending:
        future.cancel()
        
      if self.loop.is_running():
        self.loop.call_soon_threadsafe(self.loop.stop)
      
    if self._thread:
      self._thread.join(timeout=5)
      if self._thread.is_alive():
        llm_logger.warning("Event loop thread did not shutdown cleanly")
    
      
      
    
      
      
      