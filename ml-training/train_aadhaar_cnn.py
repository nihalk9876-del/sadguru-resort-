"""
Sadguru Resort - Custom Aadhaar CNN Field Detector Training Script (YOLOv8-Nano)
---------------------------------------------------------------------------------
Trains a lightweight Convolutional Neural Network (YOLOv8n) on the Roboflow
AADHAAR-CARD-DETAILS dataset to accurately detect bounding boxes for:
  - Name
  - Date of Birth (DOB)
  - Gender
  - Aadhaar Number

Exports the trained model to ONNX format (`backend/ml/aadhaar_cnn.onnx`),
which runs directly inside the Node.js backend via `onnxruntime-node`.
"""

import os
import sys
import shutil
from pathlib import Path
from ultralytics import YOLO

ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATASET_DIR = ROOT_DIR / "ml-training" / "dataset"
BACKEND_ML_DIR = ROOT_DIR / "backend" / "ml"
OUTPUT_ONNX_PATH = BACKEND_ML_DIR / "aadhaar_cnn.onnx"


def find_data_yaml(dataset_dir: Path) -> Path:
    yaml_path = dataset_dir / "data.yaml"
    if yaml_path.exists():
        return yaml_path
    for p in dataset_dir.rglob("data.yaml"):
        return p
    raise FileNotFoundError(
        f"Could not find data.yaml inside {dataset_dir}.\n"
        "Please unzip your Roboflow YOLOv8 dataset into 'ml-training/dataset/' "
        "or pass the path to data.yaml as an argument:\n"
        "  python train_aadhaar_cnn.py path/to/data.yaml"
    )


def main():
    if len(sys.argv) > 1:
        data_yaml = Path(sys.argv[1]).resolve()
    else:
        data_yaml = find_data_yaml(DEFAULT_DATASET_DIR)

    if not data_yaml.exists():
        print(f"[ERROR] Dataset config not found: {data_yaml}")
        sys.exit(1)

    print(f"[CNN Train] Using dataset config: {data_yaml}")
    BACKEND_ML_DIR.mkdir(parents=True, exist_ok=True)

    # Load pretrained YOLOv8-nano CNN backbone (~6 MB, fast on CPU/GPU)
    model = YOLO("yolov8n.pt")

    # Train CNN on Aadhaar card fields
    results = model.train(
        data=str(data_yaml),
        epochs=50,
        imgsz=640,
        batch=16,
        patience=12,
        project=str(ROOT_DIR / "ml-training" / "runs"),
        name="aadhaar_cnn",
        exist_ok=True,
        verbose=True,
    )

    best_weights = Path(results.save_dir) / "weights" / "best.pt"
    if not best_weights.exists():
        print("[ERROR] Training completed but best.pt was not found.")
        sys.exit(1)

    print(f"[CNN Export] Exporting {best_weights} to ONNX...")
    best_model = YOLO(str(best_weights))
    exported_path = Path(best_model.export(format="onnx", imgsz=640, simplify=True))

    shutil.copy2(exported_path, OUTPUT_ONNX_PATH)
    print("==========================================================")
    print(f"SUCCESS! Trained CNN model exported to:\n  {OUTPUT_ONNX_PATH}")
    print("Restart or deploy your backend — CNN OCR will activate automatically.")
    print("==========================================================")


if __name__ == "__main__":
    main()
