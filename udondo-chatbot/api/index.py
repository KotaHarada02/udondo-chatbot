"""
Vercel Python Serverless Function entry point.
Imports the FastAPI app from the backend package.
"""

import sys
import os

# Add backend directory to Python path so `src.*` imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from src.main import app  # noqa: E402, F401
