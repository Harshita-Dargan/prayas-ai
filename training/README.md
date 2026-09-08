# Fine-Tuning LLaVA on Indian Crop Disease Datasets (Free Kaggle Guide)

This guide explains how to fine-tune an open-source Vision-Language Model (**LLaVA-1.5-7B** or **SmolVLM**) on Indian crop disease images using Kaggle's free GPU quota (30 hours/week of dual NVIDIA T4 GPUs) to replace proprietary cloud APIs like Google Gemini.

---

## 1. Select a Kaggle Dataset
Search for or attach any of the following popular crop disease datasets on Kaggle:
- **Tomato Leaf Disease**: `kaustubhb999/tomatoleaf`
- **PlantVillage Indian Subsets**: `emmarex/plantdisease`
- **Cotton Disease & Pest**: `janmejaybhatt/cotton-disease-dataset`
- **Rice Leaf Disease**: `vbookshelf/rice-leaf-diseases`

---

## 2. Setup Kaggle Notebook (100% Free)
1. Go to [kaggle.com](https://www.kaggle.com/) and create a new **Notebook**.
2. In the right-hand panel under **Notebook Options**:
   - **Accelerator**: Choose `GPU T4 x 2` or `GPU P100`.
   - **Internet**: Toggle `ON`.
3. Add your chosen dataset via **+ Add Data**.

---

## 3. Run the Training Script
In your Kaggle notebook, install dependencies:
```bash
!pip install -q -U transformers peft trl bitsandbytes accelerate torchvision datasets huggingface_hub
```

Then run `kaggle_train_llava.py`:
```python
from kaggle_train_llava import create_llava_dataset_from_kaggle, train_llava_qlora

# Path to your Kaggle input dataset
kaggle_input = "/kaggle/input/tomatoleaf/tomato"

# Step 1: Automatically format image classes into conversational Marathi & Hindi instructions
create_llava_dataset_from_kaggle(kaggle_input, "./prayas_llava_dataset.json")

# Step 2: Fine-tune LLaVA with 4-bit QLoRA
train_llava_qlora("./prayas_llava_dataset.json")
```

---

## 4. Deploying Your Trained Model
Once training completes:
1. **Push to Hugging Face Hub**:
   ```python
   model.push_to_hub("your-username/prayas-llava-crop-v1")
   processor.push_to_hub("your-username/prayas-llava-crop-v1")
   ```
2. **Deploy as a Hugging Face Inference Endpoint** or run inside a free **Hugging Face Space**.
3. Set your endpoint URL in the Prayas AI backend:
   ```env
   HF_LLAVA_ENDPOINT=https://api-inference.huggingface.co/models/your-username/prayas-llava-crop-v1
   HF_API_TOKEN=hf_your_free_token
   ```
