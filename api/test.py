
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import cv2
import io
from PIL import Image

app = FastAPI()

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this list to include only the allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model
model = load_model('./model5/breast_cancer_model.h5')

class Prediction(BaseModel):
    prediction: int
    confidence: float

@app.post("/predict/", response_model=Prediction)
async def predict(file: UploadFile = File(...)):
    # Read the image file
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))
    img = img.convert('L')  # Convert to grayscale
    img = img.resize((64, 64))  # Resize to the same size as training images
    img_array = np.array(img)
    img_array = img_array.reshape(1, 64, 64, 1)  # Reshape for the model

    # Predict
    prediction = model.predict(img_array)
    confidence = prediction[0][0]
    label = 1 if confidence > 0.7 else 0  # Assuming 0.7 as threshold for positive class

    return Prediction(prediction=label, confidence=confidence)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
