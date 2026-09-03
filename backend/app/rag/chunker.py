from typing import List, Dict, Any

class Chunker:
    """Splits extracted text into semantic chunks while preserving document metadata."""

    @staticmethod
    def chunk_document(doc_id: str, doc_name: str, pages_content: List[Dict[str, Any]], chunk_size: int = 500) -> List[Dict[str, Any]]:
        chunks = []
        chunk_id_counter = 1

        for page_data in pages_content:
            page_num = page_data.get("page", 1)
            section_title = page_data.get("section", f"Page {page_num}")
            text = page_data.get("text", "")
            
            # Simple paragraph/line chunking
            paragraphs = text.split("\n")
            current_chunk_words = []
            
            for para in paragraphs:
                words = para.strip().split()
                if not words:
                    continue
                current_chunk_words.extend(words)
                
                if len(current_chunk_words) >= chunk_size:
                    chunk_text = " ".join(current_chunk_words)
                    chunks.append({
                        "id": f"{doc_id}_chunk_{chunk_id_counter}",
                        "document": doc_name,
                        "page": page_num,
                        "section": section_title,
                        "chapter": f"Section {page_num}",
                        "text": chunk_text
                    })
                    chunk_id_counter += 1
                    current_chunk_words = []

            if current_chunk_words:
                chunk_text = " ".join(current_chunk_words)
                chunks.append({
                    "id": f"{doc_id}_chunk_{chunk_id_counter}",
                    "document": doc_name,
                    "page": page_num,
                    "section": section_title,
                    "chapter": f"Section {page_num}",
                    "text": chunk_text
                })
                chunk_id_counter += 1

        return chunks

chunker = Chunker()
