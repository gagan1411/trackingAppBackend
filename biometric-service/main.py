from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import sqlite3
import cv2
import numpy as np
import os
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "biometrics.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            template TEXT NOT NULL,
            UNIQUE(user_id, type)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.post("/register-face")
async def register_face(user_id: str = Form(...), image: UploadFile = File(...)):
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Save temp image for DeepFace
    temp_path = f"temp_reg_{user_id}.jpg"
    cv2.imwrite(temp_path, img)

    try:
        # Get face embedding using Facenet512 (more accurate than standard Facenet)
        embedding_objs = DeepFace.represent(img_path=temp_path, model_name="Facenet512", enforce_detection=False)
        embedding = embedding_objs[0]["embedding"]
        
        # Store embedding in DB
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO templates (user_id, type, template) VALUES (?, ?, ?)", 
                       (user_id, "face", json.dumps(embedding)))
        conn.commit()
        conn.close()
        
        print(f"[BIOMETRIC] Registered face for user: {user_id}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return {"status": "success", "message": "Face registered successfully"}
    except Exception as e:
        print(f"[BIOMETRIC] Register error: {str(e)}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return {"status": "error", "message": f"DeepFace error: {str(e)}"}

@app.post("/verify-face")
async def verify_face(image: UploadFile = File(...)):
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    temp_path = "temp_verify.jpg"
    cv2.imwrite(temp_path, img)

    try:
        # Use Facenet512 for verification too
        embedding_objs = DeepFace.represent(img_path=temp_path, model_name="Facenet512", enforce_detection=False)
        candidate_embedding = np.array(embedding_objs[0]["embedding"])

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, template FROM templates WHERE type='face'")
        rows = cursor.fetchall()
        conn.close()

        best_match = None
        max_similarity = -1.0
        # Cosine similarity threshold (0.4 is generally strict for Facenet512 cosine distance, 
        # but similarity [1-distance] > 0.6 is good)
        SIMILARITY_THRESHOLD = 0.65 

        for row in rows:
            user_id = row[0]
            db_embedding = np.array(json.loads(row[1]))
            
            # Use Cosine Similarity for better accuracy across devices/lighting
            dot_product = np.dot(db_embedding, candidate_embedding)
            norm_db = np.linalg.norm(db_embedding)
            norm_cand = np.linalg.norm(candidate_embedding)
            similarity = dot_product / (norm_db * norm_cand)

            if similarity > max_similarity:
                max_similarity = similarity
                if similarity > SIMILARITY_THRESHOLD:
                    best_match = user_id

        if os.path.exists(temp_path):
            os.remove(temp_path)

        if best_match:
            # Map similarity to a human-readable 0-100% confidence
            # (threshold -> 1.0) maps to (80% -> 100%)
            confidence = 80 + (max_similarity - SIMILARITY_THRESHOLD) / (1 - SIMILARITY_THRESHOLD) * 20
            print(f"[BIOMETRIC] Match found: {best_match} ({confidence:.2f}%)")
            return {
                "status": "match", 
                "user_id": best_match, 
                "confidence": round(min(99.99, confidence), 2),
                "similarity": round(float(max_similarity), 4)
            }
        else:
            print(f"[BIOMETRIC] No match found. Best similarity: {max_similarity:.4f}")
            return {"status": "no_match", "message": "No matching face found", "best_sim": round(float(max_similarity), 4)}
            
    except Exception as e:
        print(f"[BIOMETRIC] Verify error: {str(e)}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return {"status": "error", "message": str(e)}

@app.post("/register-fingerprint")
async def register_fingerprint(user_id: str = Form(...), template: str = Form(...)):
    # This endpoint receives the raw template string from Mantra MFS100 SDK via the App
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO templates (user_id, type, template) VALUES (?, ?, ?)", 
                       (user_id, "fingerprint", template))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Fingerprint template registered successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/verify-fingerprint")
async def verify_fingerprint(template: str = Form(...)):
    # Simple strict exact match for demo purposes
    # Alternatively send list back for SDK to compare locally, or use a Python fingerprint logic engine
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, template FROM templates WHERE type='fingerprint'")
        rows = cursor.fetchall()
        conn.close()

        best_match = None
        
        for row in rows:
            user_id = row[0]
            db_template = row[1]
            if template == db_template:
                best_match = user_id
                break

        if best_match:
            return {"status": "match", "user_id": best_match, "confidence": 99.9}
        else:
            return {"status": "no_match"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
