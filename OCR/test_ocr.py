# import_test.py
import traceback

try:
    print("Attempting to import easyocr...")
    import easyocr
    print("\n✅ Success! The easyocr library was imported correctly.")
    
except Exception as e:
    print(f"\n❌ Failure! An error occurred during the import.")
    print(f"Error Message: {e}\n")
    print("Full Traceback:\n")
    print(traceback.format_exc())