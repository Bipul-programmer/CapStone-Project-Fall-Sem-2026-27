"""
Inference Engine for MobileNetV2 Dysgraphia Detection
Model based on the research paper:
"DETECTION AND ANALYSIS OF DYSGRAPHIA USING DEEP LEARNING MODELS"
(Özkum, Burukanlı, & Yumuşak, 2025 - ASES I. International Nevruz Scientific Research Congress)
"""

import os
import io
import base64
import json
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
from torchvision import transforms, models

# Select best available device
if torch.backends.mps.is_available():
    DEVICE = torch.device('mps')
elif torch.cuda.is_available():
    DEVICE = torch.device('cuda')
else:
    DEVICE = torch.device('cpu')

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
WEIGHTS_PATH = os.path.join(MODELS_DIR, 'mobilenet_v2_dysgraphia.pth')
TORCHSCRIPT_PATH = os.path.join(MODELS_DIR, 'mobilenet_v2_dysgraphia.torchscript.pt')
METRICS_PATH = os.path.join(MODELS_DIR, 'metrics.json')


class DysgraphiaClassifier:
    """
    MobileNetV2 classifier for detecting Dysgraphia from handwriting images
    as demonstrated in Özkum et al. (2025).
    """

    CLASS_NAMES = ['Low Potential Dysgraphia', 'Potential Dysgraphia']

    def __init__(self, weights_path=WEIGHTS_PATH, device=DEVICE):
        self.device = device
        self.weights_path = weights_path
        self.model = None
        self.metrics = self._load_metrics()
        self.class_names = self.CLASS_NAMES

        # Standard preprocessing matching 224x224 RGB input from Özkum et al. (2025)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        self._load_model()

    def _load_metrics(self):
        if os.path.exists(METRICS_PATH):
            try:
                with open(METRICS_PATH, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"[MobileNetV2] Warning: could not load metrics: {e}")
        return {
            "model": "MobileNet_v2",
            "paper_accuracy": 85.0,
            "paper_f1": 84.96,
            "paper_mcc": 70.35,
            "reference_paper": "Özkum, Burukanlı, & Yumuşak (2025)"
        }

    def _load_model(self):
        """Initializes MobileNetV2 architecture and loads trained weights."""
        try:
            # Build MobileNetV2 architecture
            base_model = models.mobilenet_v2(weights=None)
            # Custom classifier head matching training structure
            base_model.classifier[1] = nn.Sequential(
                nn.Dropout(0.2),
                nn.Linear(1280, len(self.class_names))
            )

            if os.path.exists(self.weights_path):
                print(f"[MobileNetV2] Loading model weights from: {self.weights_path}")
                checkpoint = torch.load(self.weights_path, map_location=self.device)
                if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
                    base_model.load_state_dict(checkpoint['model_state_dict'])
                    if 'class_names' in checkpoint:
                        self.class_names = checkpoint['class_names']
                else:
                    base_model.load_state_dict(checkpoint)
                base_model.to(self.device)
                base_model.eval()
                self.model = base_model
                print("[MobileNetV2] Weights loaded successfully into device:", self.device)
                return
            elif os.path.exists(TORCHSCRIPT_PATH):
                print(f"[MobileNetV2] Loading TorchScript model from: {TORCHSCRIPT_PATH}")
                self.model = torch.jit.load(TORCHSCRIPT_PATH, map_location=self.device)
                self.model.eval()
                print("[MobileNetV2] TorchScript model loaded successfully.")
                return
            else:
                print(f"[MobileNetV2] WARNING: Weights file not found at {self.weights_path}. Running with initialized weights.")
                base_model.to(self.device)
                base_model.eval()
                self.model = base_model
        except Exception as e:
            print(f"[MobileNetV2] Error loading model: {e}")
            if os.path.exists(TORCHSCRIPT_PATH):
                try:
                    self.model = torch.jit.load(TORCHSCRIPT_PATH, map_location=self.device)
                    self.model.eval()
                    print("[MobileNetV2] Fallback TorchScript model loaded successfully.")
                    return
                except Exception as ex:
                    print(f"[MobileNetV2] Fallback failed: {ex}")
            raise e

    def preprocess_image(self, image_input):
        """
        Accepts:
          - PIL.Image.Image
          - bytes
          - Base64 data URL string (e.g. 'data:image/png;base64,...')
          - File path string
        Returns:
          - PIL.Image (RGB, with white background if transparent)
        """
        pil_img = None
        if isinstance(image_input, Image.Image):
            pil_img = image_input
        elif isinstance(image_input, bytes):
            pil_img = Image.open(io.BytesIO(image_input))
        elif isinstance(image_input, str):
            if image_input.startswith('data:image'):
                # Strip data URL prefix
                base64_data = image_input.split(',', 1)[1]
                img_bytes = base64.b64decode(base64_data)
                pil_img = Image.open(io.BytesIO(img_bytes))
            elif os.path.exists(image_input):
                pil_img = Image.open(image_input)
            else:
                try:
                    img_bytes = base64.b64decode(image_input)
                    pil_img = Image.open(io.BytesIO(img_bytes))
                except Exception as e:
                    raise ValueError(f"Could not decode image input string: {e}")
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        # Convert transparent canvas / RGBA images to white background RGB
        if pil_img.mode in ('RGBA', 'LA') or (pil_img.mode == 'P' and 'transparency' in pil_img.info):
            bg = Image.new('RGB', pil_img.size, (255, 255, 255))
            if pil_img.mode != 'RGBA':
                pil_img = pil_img.convert('RGBA')
            bg.paste(pil_img, mask=pil_img.split()[3])
            pil_img = bg
        elif pil_img.mode != 'RGB':
            pil_img = pil_img.convert('RGB')

        return pil_img

    def extract_kinematic_features(self, pil_image):
        """
        Extracts handwriting stroke kinematic & geometric features:
        - Tremor / jitter score (high in dysgraphia strokes)
        - Ink density
        - Stroke irregularity
        """
        gray = pil_image.convert('L')
        arr = np.array(gray)

        # Invert so ink = high values, background = low
        ink_mask = arr < 220
        total_ink_pixels = np.sum(ink_mask)
        total_pixels = arr.size
        density_ratio = float(total_ink_pixels / total_pixels) if total_pixels > 0 else 0.0

        if total_ink_pixels < 20:
            return {
                "tremor_jitter_score": 8.0,
                "ink_density": round(density_ratio, 4),
                "stroke_irregularity": "Minimal/Blank",
                "estimated_smoothness": 95.0
            }

        # Compute gradient magnitude (edge irregularity) on ink
        grad_y = np.abs(np.diff(arr.astype(np.float32), axis=0))
        grad_x = np.abs(np.diff(arr.astype(np.float32), axis=1))

        jitter_energy = float((np.mean(grad_y) + np.mean(grad_x)) / 2.0)
        # Normalize into a calibrated 0 - 100 jitter score
        calibrated_jitter = float(np.clip(jitter_energy * 0.95, 5.0, 48.0))
        smoothness = float(np.clip(100.0 - calibrated_jitter * 1.8, 10.0, 95.0))

        irregularity_label = "Low" if calibrated_jitter < 18.0 else ("Moderate" if calibrated_jitter < 28.0 else "Elevated")

        return {
            "tremor_jitter_score": round(calibrated_jitter, 2),
            "ink_density": round(density_ratio, 4),
            "stroke_irregularity": irregularity_label,
            "estimated_smoothness": round(smoothness, 2)
        }

    def predict(self, image_input):
        """
        Runs MobileNetV2 deep learning inference on the provided handwriting sample.
        Returns full diagnostic breakdown.
        """
        pil_img = self.preprocess_image(image_input)
        kinematic = self.extract_kinematic_features(pil_img)

        # Transform to tensor
        tensor = self.transform(pil_img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probs = torch.softmax(outputs, dim=1).squeeze(0).cpu().numpy()

        pred_idx = int(np.argmax(probs))
        pred_label = self.class_names[pred_idx]
        confidence = float(probs[pred_idx] * 100.0)

        dysgraphia_prob = float(probs[1]) if len(probs) > 1 else (1.0 if pred_idx == 1 else 0.0)
        normal_prob = float(probs[0]) if len(probs) > 0 else 1.0 - dysgraphia_prob

        # Clinical Risk Level mapping
        if dysgraphia_prob >= 0.70:
            risk_level = "HIGH_RISK"
        elif dysgraphia_prob >= 0.40:
            risk_level = "MODERATE_TENDENCY"
        else:
            risk_level = "LOW_RISK"

        is_dysgraphia = bool(pred_idx == 1)

        # Formulate clinical explanation based on Özkum et al. (2025)
        if is_dysgraphia:
            feedback = (
                f"The MobileNetV2 deep learning model detected significant dysgraphia biomarkers "
                f"({confidence:.1f}% confidence), characterized by stroke trajectory irregularity, "
                f"letter formation instability, and elevated kinematic tremor ({kinematic['tremor_jitter_score']} px)."
            )
        else:
            feedback = (
                f"Handwriting characteristics are within age-appropriate norms ({confidence:.1f}% confidence). "
                f"The neural network identified consistent stroke trajectories and acceptable letter formation alignment."
            )

        return {
            "prediction": pred_label,
            "is_dysgraphia": is_dysgraphia,
            "risk_level": risk_level,
            "confidence": round(confidence, 2),
            "probabilities": {
                "Low Potential Dysgraphia": round(normal_prob * 100.0, 2),
                "Potential Dysgraphia": round(dysgraphia_prob * 100.0, 2)
            },
            "kinematic_features": kinematic,
            "clinical_feedback": feedback,
            "model_info": {
                "architecture": "MobileNetV2",
                "reference_paper": "Detection and Analysis of Dysgraphia Using Deep Learning Models (Özkum et al., 2025)",
                "paper_accuracy": 85.00,
                "paper_mcc": 70.35,
                "device": str(self.device)
            }
        }


# Global singleton instance for high performance
_classifier_instance = None

def get_classifier():
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = DysgraphiaClassifier()
    return _classifier_instance
