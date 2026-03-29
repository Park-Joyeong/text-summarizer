from functools import lru_cache

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import BartForConditionalGeneration, PreTrainedTokenizerFast

app = FastAPI(title="Mini Summarizer API")

# React 개발 서버(localhost:5173)에서 호출할 수 있게 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=20, max_length=5000) # ...은 필수 필드를 의미합니다.

class SummarizeResponse(BaseModel):
    summary: str

@lru_cache # 메모이제이션(캐시)을 사용하여 모델 로드 최적화. FastAPI 서버가 한번 실행될 때만 모델을 로드하고, 이후에는 캐시된 모델을 사용합니다.
def get_model():
    """
    처음 한 번만 모델/토크나이저를 로드합니다.
    """
    model_name = "gogamza/kobart-summarization"
    tokenizer = PreTrainedTokenizerFast.from_pretrained(model_name)
    model = BartForConditionalGeneration.from_pretrained(model_name)
    model.eval() # 모델을 평가 모드로 설정. 학습 모드가 아닌 추론 모드로 설정하여 메모리 사용량을 줄입니다.
    return tokenizer, model

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/summarize", response_model=SummarizeResponse)
def summarize(req: SummarizeRequest):
    text = req.text.strip()

    if not text:
        raise HTTPException(status_code=400, detail="텍스트를 입력해주세요.")

    tokenizer, model = get_model()

    # JOJO 여기부터 보기
    # 너무 길면 잘라서 첫 버전만 단순하게 처리
    raw_input_ids = tokenizer.encode(
        text,
        add_special_tokens=False,
        truncation=True,
        max_length=1022,
    )

    input_ids = [tokenizer.bos_token_id] + raw_input_ids + [tokenizer.eos_token_id]
    input_tensor = torch.tensor([input_ids])

    with torch.no_grad():
        summary_ids = model.generate(
            input_tensor,
            max_length=128,
            min_length=32,
            num_beams=4,
            early_stopping=True,
            no_repeat_ngram_size=2,
        )
    
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    return SummarizeResponse(summary=summary)