"""
Training Pipeline for MobileNetV2 Dysgraphia Detection
Strictly following the paper:
"DETECTION AND ANALYSIS OF DYSGRAPHIA USING DEEP LEARNING MODELS"
(Özkum, Burukanlı, & Yumuşak, 2025 - ASES I. International Nevruz Scientific Research Congress)

Hyperparameters specified in paper:
- Architecture: MobileNetV2
- Image input size: 224x224 RGB
- Optimizer: SGD (momentum = 0.9)
- Learning rate: 0.0007
- Batch size: 4
- Number of epochs: 50
- Train / Val / Test split: ~66.67% train, 16.67% val, 16.67% test
"""

import os
import sys
import math
import json
import time
import argparse
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms, models

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, matthews_corrcoef, confusion_matrix

DEFAULT_DATASET_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'datasets',
    'DATASET DYSGRAPHIA HANDWRITING'
)

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
BEST_MODEL_PATH = os.path.join(OUTPUT_DIR, 'mobilenet_v2_dysgraphia.pth')
TORCHSCRIPT_PATH = os.path.join(OUTPUT_DIR, 'mobilenet_v2_dysgraphia.torchscript.pt')
METRICS_PATH = os.path.join(OUTPUT_DIR, 'metrics.json')


class DysgraphiaDataset(Dataset):
    """Custom dataset loader for handwriting images with RGB conversion."""
    def __init__(self, file_paths, labels, transform=None):
        self.file_paths = file_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        img_path = self.file_paths[idx]
        image = Image.open(img_path).convert('RGB')
        label = self.labels[idx]

        if self.transform:
            image = self.transform(image)

        return image, label


def load_dataset_filelist(dataset_dir):
    """Loads all image paths and labels from the two classes."""
    class_names = ['Low Potential Dysgraphia', 'Potential Dysgraphia']
    class_to_idx = {cls: idx for idx, cls in enumerate(class_names)}

    all_paths = []
    all_labels = []

    for cls in class_names:
        cls_folder = os.path.join(dataset_dir, cls)
        if not os.path.exists(cls_folder):
            raise FileNotFoundError(f"Class folder not found: {cls_folder}")

        files = [
            os.path.join(cls_folder, f)
            for f in os.listdir(cls_folder)
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))
        ]
        files.sort()
        for fp in files:
            all_paths.append(fp)
            all_labels.append(class_to_idx[cls])

    print(f"[Dataset] Found {len(all_paths)} total samples across classes {class_names}")
    for cls in class_names:
        c_count = sum(1 for l in all_labels if l == class_to_idx[cls])
        print(f"  - {cls}: {c_count} images")

    return all_paths, all_labels, class_names, class_to_idx


def calculate_metrics(y_true, y_pred):
    """Calculates evaluation metrics as defined in Section 3 of Özkum et al. (2025)."""
    acc = float(accuracy_score(y_true, y_pred) * 100.0)
    prec = float(precision_score(y_true, y_pred, zero_division=0) * 100.0)
    rec = float(recall_score(y_true, y_pred, zero_division=0) * 100.0)
    f1 = float(f1_score(y_true, y_pred, zero_division=0) * 100.0)
    mcc = float(matthews_corrcoef(y_true, y_pred) * 100.0)

    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    # cm: [[tn, fp], [fn, tp]]
    tn, fp, fn, tp = int(cm[0][0]), int(cm[0][1]), int(cm[1][0]), int(cm[1][1])

    return {
        "accuracy": round(acc, 2),
        "precision": round(prec, 2),
        "recall": round(rec, 2),
        "f1_score": round(f1, 2),
        "mcc": round(mcc, 2),
        "confusion_matrix": {
            "tp": tp,
            "tn": tn,
            "fp": fp,
            "fn": fn
        }
    }


def build_mobilenet_v2(num_classes=2, pretrained=True):
    """Constructs MobileNetV2 with transfer learning classifier head."""
    weights = models.MobileNet_V2_Weights.DEFAULT if pretrained else None
    model = models.mobilenet_v2(weights=weights)
    in_features = model.classifier[1].in_features

    # Replace classifier head
    model.classifier[1] = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(in_features, num_classes)
    )
    return model


def train_and_evaluate(dataset_dir=DEFAULT_DATASET_DIR,
                       epochs=50,
                       batch_size=4,
                       lr=0.0007,
                       momentum=0.9,
                       save_dir=OUTPUT_DIR):
    os.makedirs(save_dir, exist_ok=True)

    device = torch.device('mps' if torch.backends.mps.is_available() else ('cuda' if torch.cuda.is_available() else 'cpu'))
    print(f"\n=======================================================")
    print(f" MobileNetV2 Dysgraphia Training (Özkum et al. 2025)")
    print(f" Using Device: {device}")
    print(f" Hyperparameters: epochs={epochs}, batch={batch_size}, lr={lr}, momentum={momentum}")
    print(f"=======================================================\n")

    all_paths, all_labels, class_names, class_to_idx = load_dataset_filelist(dataset_dir)
    total_count = len(all_paths)

    # Deterministic split: ~66.67% Train, 16.67% Val, 16.67% Test (Section 2.1 Table 1)
    val_size = int(math.floor(total_count * 0.1667))
    test_size = int(math.floor(total_count * 0.1667))
    train_size = total_count - val_size - test_size

    # Seed for reproducible scientific split
    indices = list(range(total_count))
    rng = np.random.RandomState(42)
    rng.shuffle(indices)

    train_idx = indices[:train_size]
    val_idx = indices[train_size:train_size + val_size]
    test_idx = indices[train_size + val_size:]

    print(f"[Split] Train: {len(train_idx)}, Validation: {len(val_idx)}, Test: {len(test_idx)}")

    # Data augmentations & normalization matching paper
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.2),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    train_paths = [all_paths[i] for i in train_idx]
    train_labels = [all_labels[i] for i in train_idx]
    val_paths = [all_paths[i] for i in val_idx]
    val_labels = [all_labels[i] for i in val_idx]
    test_paths = [all_paths[i] for i in test_idx]
    test_labels = [all_labels[i] for i in test_idx]

    train_loader = DataLoader(DysgraphiaDataset(train_paths, train_labels, train_transform),
                              batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(DysgraphiaDataset(val_paths, val_labels, eval_transform),
                            batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(DysgraphiaDataset(test_paths, test_labels, eval_transform),
                             batch_size=batch_size, shuffle=False)

    model = build_mobilenet_v2(num_classes=2, pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.SGD(model.parameters(), lr=lr, momentum=momentum, weight_decay=1e-4)

    best_val_f1 = -1.0
    best_epoch = -1
    best_state_dict = None
    best_val_metrics = None

    print("\nStarting training loop...")
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * images.size(0)

        train_loss /= len(train_idx)

        # Validation phase
        model.eval()
        val_preds, val_targets = [], []
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                preds = torch.argmax(outputs, dim=1).cpu().numpy()
                val_preds.extend(preds)
                val_targets.extend(labels.cpu().numpy())

        val_metrics = calculate_metrics(val_targets, val_preds)

        if val_metrics['f1_score'] >= best_val_f1:
            best_val_f1 = val_metrics['f1_score']
            best_epoch = epoch
            best_state_dict = {k: v.cpu().clone() for k, v in model.state_dict().items()}
            best_val_metrics = val_metrics

        if epoch % 5 == 0 or epoch == epochs or epoch == 1:
            print(f"Epoch [{epoch:02d}/{epochs}] - Loss: {train_loss:.4f} | Val Acc: {val_metrics['accuracy']:.1f}% | Val F1: {val_metrics['f1_score']:.1f}% | Val MCC: {val_metrics['mcc']:.1f}%")

    print(f"\nTraining Complete! Best epoch: {best_epoch} (Val F1: {best_val_f1:.2f}%)")

    # Load best weights to evaluate on independent Test set
    model.load_state_dict({k: v.to(device) for k, v in best_state_dict.items()})
    model.eval()

    test_preds, test_targets = [], []
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            preds = torch.argmax(outputs, dim=1).cpu().numpy()
            test_preds.extend(preds)
            test_targets.extend(labels.cpu().numpy())

    test_metrics = calculate_metrics(test_targets, test_preds)

    print("\n================== FINAL TEST METRICS ==================")
    print(f"Test Accuracy : {test_metrics['accuracy']}% (Paper benchmark: 85.00%)")
    print(f"Test Precision: {test_metrics['precision']}% (Paper benchmark: 85.35%)")
    print(f"Test Recall   : {test_metrics['recall']}% (Paper benchmark: 85.00%)")
    print(f"Test F1-Score : {test_metrics['f1_score']}% (Paper benchmark: 84.96%)")
    print(f"Test MCC      : {test_metrics['mcc']}% (Paper benchmark: 70.35%)")
    print(f"Confusion Mtx : {test_metrics['confusion_matrix']}")
    print("========================================================\n")

    # Save best checkpoint
    save_payload = {
        'epoch': best_epoch,
        'model_state_dict': best_state_dict,
        'val_metrics': best_val_metrics,
        'test_metrics': test_metrics,
        'class_names': class_names,
        'class_labels': class_to_idx,
        'architecture': 'MobileNetV2',
        'reference_paper': 'Özkum et al. (2025)'
    }
    torch.save(save_payload, BEST_MODEL_PATH)
    print(f"[Export] Saved PyTorch weights to: {BEST_MODEL_PATH}")

    # Export TorchScript format
    try:
        model.eval().to('cpu')
        example_input = torch.randn(1, 3, 224, 224)
        scripted_model = torch.jit.trace(model, example_input)
        scripted_model.save(TORCHSCRIPT_PATH)
        print(f"[Export] Saved TorchScript model to: {TORCHSCRIPT_PATH}")
    except Exception as e:
        print(f"[Export] Warning: TorchScript export failed: {e}")

    # Save metrics.json
    metrics_data = {
        "model": "MobileNet_v2",
        "reference_paper": "Detection and Analysis of Dysgraphia Using Deep Learning Models (Özkum, Burukanlı, Yumuşak, 2025)",
        "hyperparameters": {
            "batch_size": batch_size,
            "learning_rate": lr,
            "optimizer": "SGD",
            "momentum": momentum,
            "epochs": epochs,
            "best_epoch": best_epoch,
            "input_resolution": "224x224 RGB"
        },
        "dataset_summary": {
            "total_samples": total_count,
            "train_samples": len(train_idx),
            "val_samples": len(val_idx),
            "test_samples": len(test_idx)
        },
        "test_results": test_metrics,
        "paper_comparison": {
            "paper_accuracy": 85.00,
            "paper_precision": 85.35,
            "paper_recall": 85.00,
            "paper_f1": 84.96,
            "paper_mcc": 70.35,
            "our_accuracy": test_metrics['accuracy'],
            "our_precision": test_metrics['precision'],
            "our_recall": test_metrics['recall'],
            "our_f1": test_metrics['f1_score'],
            "our_mcc": test_metrics['mcc']
        }
    }

    with open(METRICS_PATH, 'w', encoding='utf-8') as f:
        json.dump(metrics_data, f, indent=2)
    print(f"[Export] Saved comparison metrics to: {METRICS_PATH}")

    return metrics_data


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Train MobileNetV2 Dysgraphia Detection Model")
    parser.add_argument('--dataset_dir', type=str, default=DEFAULT_DATASET_DIR, help="Path to handwriting dataset")
    parser.add_argument('--epochs', type=int, default=50, help="Number of training epochs (paper uses 50)")
    parser.add_argument('--batch_size', type=int, default=4, help="Batch size (paper uses 4)")
    parser.add_argument('--lr', type=float, default=0.0007, help="Learning rate (paper uses 0.0007)")
    parser.add_argument('--momentum', type=float, default=0.9, help="SGD momentum (paper uses 0.9)")

    parser.add_argument('--evaluate_only', action='store_true', help="Only evaluate existing checkpoint on test set without retraining")

    args = parser.parse_args()

    if args.evaluate_only:
        print(f"\n[Evaluate Only] Loading model from {BEST_MODEL_PATH} and evaluating...")
        device = torch.device('mps' if torch.backends.mps.is_available() else ('cuda' if torch.cuda.is_available() else 'cpu'))
        all_paths, all_labels, class_names, class_to_idx = load_dataset_filelist(args.dataset_dir)
        total_count = len(all_paths)
        val_size = int(math.floor(total_count * 0.1667))
        test_size = int(math.floor(total_count * 0.1667))
        train_size = total_count - val_size - test_size

        indices = list(range(total_count))
        rng = np.random.RandomState(42)
        rng.shuffle(indices)
        test_idx = indices[train_size + val_size:]

        test_paths = [all_paths[i] for i in test_idx]
        test_labels = [all_labels[i] for i in test_idx]
        eval_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        test_loader = DataLoader(DysgraphiaDataset(test_paths, test_labels, eval_transform),
                                 batch_size=args.batch_size, shuffle=False)

        model = build_mobilenet_v2(num_classes=2, pretrained=False).to(device)
        ckpt = torch.load(BEST_MODEL_PATH, map_location=device)
        model.load_state_dict(ckpt['model_state_dict'] if 'model_state_dict' in ckpt else ckpt)
        model.eval()

        test_preds, test_targets = [], []
        with torch.no_grad():
            for images, labels in test_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                preds = torch.argmax(outputs, dim=1).cpu().numpy()
                test_preds.extend(preds)
                test_targets.extend(labels.cpu().numpy())

        test_metrics = calculate_metrics(test_targets, test_preds)
        print("\n================== TEST SET EVALUATION ==================")
        print(f"Test Accuracy : {test_metrics['accuracy']}% (Paper benchmark: 85.00%)")
        print(f"Test Precision: {test_metrics['precision']}% (Paper benchmark: 85.35%)")
        print(f"Test Recall   : {test_metrics['recall']}% (Paper benchmark: 85.00%)")
        print(f"Test F1-Score : {test_metrics['f1_score']}% (Paper benchmark: 84.96%)")
        print(f"Test MCC      : {test_metrics['mcc']}% (Paper benchmark: 70.35%)")
        print(f"Confusion Mtx : {test_metrics['confusion_matrix']}")
        print("=========================================================\n")
    else:
        train_and_evaluate(
            dataset_dir=args.dataset_dir,
            epochs=args.epochs,
            batch_size=args.batch_size,
            lr=args.lr,
            momentum=args.momentum
        )

