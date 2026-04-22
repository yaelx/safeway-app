import structlog
import sys

# Define a processor to map structlog levels to GCP severity: display it in the Logs Explorer
def gcp_severity_processor(logger, method_name, event_dict):
    severity_map = {
        "debug": "DEBUG",
        "info": "INFO",
        "warning": "WARNING",
        "error": "ERROR",
        "critical": "CRITICAL",
    }
    event_dict["severity"] = severity_map.get(method_name, "DEFAULT")
    return event_dict


structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        gcp_severity_processor,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    logger_factory=structlog.PrintLoggerFactory(sys.stdout),
    cache_logger_on_first_use=True,
)

# Module-level singleton — import this directly:
# from utils.logger import logger
logger = structlog.get_logger(service="logic-server")