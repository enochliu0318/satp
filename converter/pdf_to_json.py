#!/usr/bin/env python3
"""
SAT PDF to JSON Converter
Converts SAT practice PDF files (questions + answers) to standardized JSON format.
"""

import re
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict

import pdfplumber
import fitz  # pymupdf
from tqdm import tqdm
import click