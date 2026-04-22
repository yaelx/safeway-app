import time
import functools
from utils.logger import logger


def timer(func):
    """
    Decorator that measures wall-clock execution time of any function
    and emits a structured 'performance_metric' log line via structlog.
    Apply to any geospatial or CPU-heavy analysis function.
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.info(
            "performance_metric",
            function=func.__name__,
            duration_ms=duration_ms,
        )
        return result
    return wrapper
