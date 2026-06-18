import os
import pdfplumber
import docx2txt

def extract_text_from_pdf(pdf_path):
    """Extracts raw text from a PDF file using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error extracting PDF text from {pdf_path}: {e}")
    return text.strip()

def extract_text_from_docx(docx_path):
    """Extracts raw text from a DOCX file using docx2txt."""
    text = ""
    try:
        text = docx2txt.process(docx_path)
    except Exception as e:
        print(f"Error extracting DOCX text from {docx_path}: {e}")
    return text.strip()

def extract_text(file_path):
    """Auto-detects file extension and extracts text."""
    if not os.path.exists(file_path):
        return ""
    
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif ext in ['.docx', '.doc']:
        return extract_text_from_docx(file_path)
    else:
        # Fallback to general text read
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read().strip()
        except Exception as e:
            print(f"Fallback reader error: {e}")
            return ""
