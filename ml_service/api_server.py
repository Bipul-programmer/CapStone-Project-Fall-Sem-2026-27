"""
FastAPI REST Server for Deep Learning Dysgraphia Detection (MobileNetV2)
Research Paper Reference:
"DETECTION AND ANALYSIS OF DYSGRAPHIA USING DEEP LEARNING MODELS"
(Özkum, Burukanlı, & Yumuşak, 2025 - ASES I. International Nevruz Scientific Research Congress)
"""

import os
import io
import base64
import json
from typing import Optional, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dysgraphia_classifier import get_classifier, METRICS_PATH, MODELS_DIR

app = FastAPI(
    title="Dysgraphia Deep Learning API (MobileNetV2)",
    description="API for detecting dysgraphia from handwriting images using MobileNetV2 based on Özkum et al. (2025)",
    version="1.0.0"
)

# Enable CORS for frontend and backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'samples')


class HandwritingAnalysisRequest(BaseModel):
    imageBase64: str
    metadata: Optional[Dict[str, Any]] = None


@app.get("/")
def root():
    return {
        "service": "MobileNetV2 Dysgraphia Detection Service",
        "reference_paper": "Detection and Analysis of Dysgraphia Using Deep Learning Models (Özkum, Burukanlı, Yumuşak, 2025)",
        "status": "online",
        "endpoints": [
            "GET /health",
            "GET /api/model/info",
            "POST /api/predict/handwriting",
            "POST /api/predict/upload",
            "GET /api/samples"
        ]
    }


@app.get("/health")
def health_check():
    clf = get_classifier()
    return {
        "status": "healthy",
        "model_loaded": clf.model is not None,
        "device": str(clf.device),
        "architecture": "MobileNetV2",
        "class_names": clf.class_names
    }


@app.get("/api/model/info")
def get_model_info():
    clf = get_classifier()
    metrics = clf.metrics
    return {
        "architecture": "MobileNetV2",
        "reference_paper": "Detection and Analysis of Dysgraphia Using Deep Learning Models (Özkum, Burukanlı, Yumuşak, 2025)",
        "paper_performance": {
            "model": "mobilenet_v2",
            "accuracy": 85.00,
            "precision": 85.35,
            "recall": 85.00,
            "f1_score": 84.96,
            "mcc": 70.35,
            "note": "Ranked highest among VGG19, SqueezeNet, GoogLeNet, EfficientNet-B0 in the 2025 comparative study"
        },
        "hyperparameters": {
            "optimizer": "SGD (momentum=0.9)",
            "learning_rate": 0.0007,
            "batch_size": 4,
            "epochs": 50,
            "resolution": "224x224 RGB"
        },
        "metrics_data": metrics
    }


@app.post("/api/predict/handwriting")
def predict_handwriting(request: HandwritingAnalysisRequest):
    """
    Analyzes base64 encoded handwriting image from canvas or upload.
    Returns deep learning classification, probabilities, kinematic features, and clinical notes.
    """
    if not request.imageBase64:
        raise HTTPException(status_code=400, detail="imageBase64 field is required.")

    clf = get_classifier()
    try:
        result = clf.predict(request.imageBase64)
        if request.metadata:
            result['metadata'] = request.metadata
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@app.post("/api/predict/upload")
async def predict_upload(file: UploadFile = File(...)):
    """
    Upload an image file (PNG/JPG) of child handwriting for MobileNetV2 inference.
    """
    clf = get_classifier()
    try:
        contents = await file.read()
        result = clf.predict(contents)
        result['filename'] = file.filename
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")


@app.get("/api/samples")
def get_sample_handwriting_images():
    """
    Returns pre-packaged handwriting test samples (from the research dataset)
    with base64 preview thumbnails and ground truth labels.
    """
    if not os.path.exists(SAMPLES_DIR):
        return {"samples": []}

    sample_files = sorted(os.listdir(SAMPLES_DIR))
    results = []

    for fn in sample_files:
        if not fn.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        fp = os.path.join(SAMPLES_DIR, fn)
        is_dysgraphia = "dysgraphia" in fn.lower()
        ground_truth = "Potential Dysgraphia" if is_dysgraphia else "Low Potential Dysgraphia"

        try:
            with open(fp, 'rb') as f:
                b64 = base64.b64encode(f.read()).decode('utf-8')
                data_url = f"data:image/jpeg;base64,{b64}"

            results.append({
                "id": fn,
                "filename": fn,
                "label": "Dysgraphia Sample" if is_dysgraphia else "Normal Handwriting Sample",
                "ground_truth": ground_truth,
                "dataUrl": data_url
            })
        except Exception as e:
            print(f"Error encoding sample {fn}: {e}")

    return {"samples": results}


@app.get("/api/samples/{filename}")
def get_sample_image(filename: str):
    fp = os.path.join(SAMPLES_DIR, filename)
    if not os.path.exists(fp):
        raise HTTPException(status_code=404, detail="Sample not found")
    return FileResponse(fp)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=False)
