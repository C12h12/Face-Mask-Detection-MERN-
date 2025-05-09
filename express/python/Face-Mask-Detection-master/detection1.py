#final code for detection of face mask
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import load_model
from imutils.video import VideoStream
from pymongo import MongoClient
import numpy as np
import imutils
import time
import cv2
import os
from datetime import datetime

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")  # Update with your MongoDB URI if needed
db = client["mask_detection"]
collection = db["logs"]

def log_detection(data):
    collection.insert_one(data)

def detect_and_predict_mask(frame, faceNet, maskNet):
    (h, w) = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(frame, 1.0, (224, 224), (104.0, 177.0, 123.0))
    faceNet.setInput(blob)
    detections = faceNet.forward()
    
    faces = []
    locs = []
    preds = []
    
    for i in range(0, detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        
        if confidence > 0.5:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (startX, startY, endX, endY) = box.astype("int")
            (startX, startY) = (max(0, startX), max(0, startY))
            (endX, endY) = (min(w - 1, endX), min(h - 1, endY))
            
            face = frame[startY:endY, startX:endX]
            face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
            face = cv2.resize(face, (224, 224))
            face = img_to_array(face)
            face = preprocess_input(face)
            
            faces.append(face)
            locs.append((startX, startY, endX, endY))
    
    if len(faces) > 0:
        faces = np.array(faces, dtype="float32")
        preds = maskNet.predict(faces, batch_size=32)
    
    return (locs, preds)

prototxtPath = r"C:\\Users\\Chaitanya\\Desktop\\projects\\express\\python\\Face-Mask-Detection-master\\face_detector\\deploy.prototxt"
weightsPath = r"C:\\Users\\Chaitanya\\Desktop\\projects\\express\\python\\Face-Mask-Detection-master\\face_detector\\res10_300x300_ssd_iter_140000.caffemodel"
faceNet = cv2.dnn.readNet(prototxtPath, weightsPath)
maskNet = load_model("C:\\Users\\Chaitanya\\Desktop\\projects\\express\\python\\Face-Mask-Detection-master\\mask_detector.h5")

print("[INFO] starting video stream...")

address="https://192.168.178.235:8080//video"   #change IP address here from IP webcam
vs = VideoStream(src=address).start()

time.sleep(2.0)
while True:
    
    frame = vs.read()
    frame = imutils.resize(frame, width=400)
    (locs, preds) = detect_and_predict_mask(frame, faceNet, maskNet)
    
    for (box, pred) in zip(locs, preds):
        (startX, startY, endX, endY) = box
        (mask, withoutMask) = pred
        label = "Mask" if mask > withoutMask else "No Mask"
        color = (0, 255, 0) if label == "Mask" else (0, 0, 255)
        confidence = max(mask, withoutMask) * 100
        
        label_text = f"{label}: {confidence:.2f}%"
        cv2.putText(frame, label_text, (startX, startY - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 2)
        cv2.rectangle(frame, (startX, startY), (endX, endY), color, 2)
        
        log_data = {
            "timestamp": datetime.now(),
            "label": label,
            "confidence": float(confidence)
        }
        log_detection(log_data)
    
    cv2.imshow("Frame", frame)
    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break

cv2.destroyAllWindows()
vs.stop()
client.close()
