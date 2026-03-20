import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader, UnstructuredImageLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import Ollama

embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

FAISS_INDEX_PATH = "faiss_index"

def get_vector_store():
    if os.path.exists(FAISS_INDEX_PATH):
        try:
            return FAISS.load_local(FAISS_INDEX_PATH, embedding, allow_dangerous_deserialization=True)
        except Exception:
            return None
    return None

def index_document(file_path):
    
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
    elif ext == ".txt":
        loader = TextLoader(file_path, encoding="utf-8")
    elif ext == ".docx":
        loader = Docx2txtLoader(file_path)
    elif ext in [".jpg", ".jpeg", ".png"]:
        loader = UnstructuredImageLoader(file_path)
    else:
        raise ValueError(f"Unsupported file extension: {ext}")

    pages = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    docs = splitter.split_documents(pages)

    vector_store = get_vector_store()

    if vector_store is None:
        vector_store = FAISS.from_documents(docs, embedding)
    else:
        vector_store.add_documents(docs)

    vector_store.save_local(FAISS_INDEX_PATH)


import asyncio
from langchain_community.llms import Ollama

llm = Ollama(model="llama3.2")


async def ask_ai(question, context):

    prompt = f"""
Answer the question using the context below.

Context:
{context}

Question:
{question}
"""

    loop = asyncio.get_event_loop()

    response = await loop.run_in_executor(
        None,
        lambda: llm.invoke(prompt)
    )

    return response