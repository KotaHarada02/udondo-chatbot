"""
Vercel Python Serverless Function entry point.
Imports the FastAPI app from the backend package.
"""

import sys
import os

# The backend directory is copied into api/backend during the build step.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from src.main import app  # noqa: E402, F401
