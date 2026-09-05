import datetime
from typing import Any, Optional, Dict

def api_response(data: Any = None, success: bool = True, error: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    return {
        "success": success,
        "data": data,
        "error": error,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
