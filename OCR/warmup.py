# warmup.py
import easyocr
import os

# Suppress noisy warnings from easyocr
os.environ['EASYOCR_LOGGER'] = 'ERROR'

print("Initializing EasyOCR... This may trigger a one-time model download.")
reader = easyocr.Reader(['en'])
print("✅ Models are ready.")