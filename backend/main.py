import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.documents import Document
from pydantic import BaseModel
from typing import List, Optional
from typing_extensions import List, TypedDict

load_dotenv()

# Set up environment variables
app = FastAPI()


os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # or ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentModel(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    createdAt: str
    fileSize: int
    pages: int
    contents: List[str]

class QueryRequest(BaseModel):
    document: DocumentModel
    query: str

class Source(BaseModel):
    text: str
    page: int

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]


class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

async def get_sources(vector_store, query: str, max_sources: int = 3) -> List['Source']:
    # Retrieve the most similar chunks for the query
    retrieved_docs = vector_store.similarity_search(query, k=max_sources)
    sources = []
    for doc in retrieved_docs:
        page = doc.metadata.get("page", 0)
        sources.append(Source(
            text=doc.page_content[:200] + ("..." if len(doc.page_content) > 200 else ""),
            page=page
        ))
    return sources

def split_document(document: DocumentModel):
    docs = [
        Document(page_content=content, metadata={"page": i+1})
        for i, content in enumerate(document.contents)
    ]
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True,
    )
    all_splits = text_splitter.split_documents(docs)
    return all_splits

def get_vector_store(all_splits):
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    API = os.environ["GOOGLE_API_KEY"]
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", api_key=API)
    from langchain_core.vectorstores import InMemoryVectorStore
    vector_store = InMemoryVectorStore(embeddings)
    _ = vector_store.add_documents(documents=all_splits)
    return vector_store

def retrieve(vector_store, state: State):
    retrieved_docs = vector_store.similarity_search(state["question"])
    return {"context": retrieved_docs}

def generate(prompt, llm, state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}

@app.post("/query", response_model=QueryResponse)
async def query_document(request: QueryRequest):
    # Split document correctly
    all_splits = split_document(request.document)
    vector_store = get_vector_store(all_splits)

    from langchain import hub
    prompt = hub.pull("rlm/rag-prompt")
    example_messages = prompt.invoke(
        {"context": "(context goes here)", "question": "(question goes here)"}
    ).to_messages()
    assert len(example_messages) == 1

    from langchain_google_genai import ChatGoogleGenerativeAI
    API = os.environ["GOOGLE_API_KEY"]
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", api_key=API)

    from langgraph.graph import START, StateGraph

    def retrieve_step(state: State):
        return retrieve(vector_store, state)

    def generate_step(state: State):
        return generate(prompt, llm, state)

    graph_builder = StateGraph(State).add_sequence([retrieve_step, generate_step])
    graph_builder.add_edge(START, "retrieve_step")
    graph = graph_builder.compile()

    result = graph.invoke({"question": request.query})
    answer = result.get("answer")
    print(f'Context: {result.get("context")}\n\n')
    print(f'Answer: {result.get("answer")}')

    sources = await get_sources(vector_store, request.query)

    return QueryResponse(answer=answer, sources=sources)
