from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import cv2
import numpy as np
import os
from supabase import create_client, Client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase from environment variables
# (When running locally, you can set these in your terminal, or hardcode them temporarily)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://lqfcgutfqyomareoecdv.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_cqQSoM7LrwGfYPoFVn5MVA_TPU_gLZS")

# If testing locally, replace the "COPIED_..." strings above with your actual keys
# Do NOT commit hardcoded keys to a public GitHub repo!
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
async def root():
    return {"status": "Active", "message": "Supabase Central Face AI Operating Online"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Biometric engine actively listening"}

@app.post("/register-face")
async def register_face(user_id: str = Form(...), image: UploadFile = File(...)):
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    temp_path = f"temp_reg_{user_id}.jpg"
    cv2.imwrite(temp_path, img)

    try:
        # Extract face embedding using Facenet512
        embedding_objs = DeepFace.represent(img_path=temp_path, model_name="Facenet512", enforce_detection=False)
        embedding = embedding_objs[0]["embedding"]
        
        # Save embedding directly to Supabase cloud database
        data = {"user_id": user_id, "embedding": embedding}
        supabase.table("face_templates").upsert(data).execute()
        
        # --- NEW: Upload to Supabase Storage ---
        file_ext = image.filename.split('.')[-1] if image.filename and '.' in image.filename else 'jpg'
        storage_path = f"{user_id}_{os.path.basename(temp_path)}"
        
        # Open the image file and push it up to the 'civilians' bucket
        with open(temp_path, "rb") as f:
            supabase.storage.from_("civilians").upload(
                path=storage_path, 
                file=f, 
                file_options={"content-type": f"image/{file_ext}", "upsert": "true"}
            )
            
        # Extract the public Web URL
        public_url = supabase.storage.from_("civilians").get_public_url(storage_path)
        # ---------------------------------------
        
        print(f"[BIOMETRIC] Registered face for user: {user_id} in Supabase")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return {
            "status": "success", 
            "message": "Face and Image registered successfully in Supabase", 
            "photo_url": public_url
        }
    except Exception as e:
        print(f"[BIOMETRIC] Register error: {str(e)}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return {"status": "error", "message": f"Service error: {str(e)}"}

@app.post("/verify-face")
async def verify_face(image: UploadFile = File(...)):
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    temp_path = "temp_verify.jpg"
    cv2.imwrite(temp_path, img)

    try:
        # 1. Extract embedding from the new uploaded image
        embedding_objs = DeepFace.represent(img_path=temp_path, model_name="Facenet512", enforce_detection=False)
        candidate_embedding = embedding_objs[0]["embedding"]

        # 2. Tell Supabase to find a vector match instantly via the RPC function created in SQL
        response = supabase.rpc(
            "match_face", 
            {"query_embedding": candidate_embedding, "match_threshold": 0.65, "match_count": 1}
        ).execute()

        if os.path.exists(temp_path):
            os.remove(temp_path)

        matches = response.data
        if matches and len(matches) > 0:
            best_match = matches[0]
            similarity = best_match["similarity"]
            # Map similarity to a human-readable 0-100% confidence
            confidence = 80 + (similarity - 0.65) / (1 - 0.65) * 20
            
            print(f"[BIOMETRIC] Match found: {best_match['user_id']} ({confidence:.2f}%)")
            return {
                "status": "match",
                "user_id": best_match["user_id"],
                "confidence": round(min(99.99, confidence), 2),
                "similarity": round(similarity, 4)
            }
        else:
            print("[BIOMETRIC] No match found.")
            return {"status": "no_match", "message": "No matching face found"}
            
    except Exception as e:
        print(f"[BIOMETRIC] Verify error: {str(e)}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return {"status": "error", "message": str(e)}

@app.post("/register-fingerprint")
async def register_fingerprint(user_id: str = Form(...), template: str = Form(...)):
    # Legacy endpoint: Migrating to Supabase
    try:
        data = {"user_id": user_id, "type": "fingerprint", "template": template}
        # Assuming you created a separate table for fingerprints or modified the schema
        # For now, we will return a pending migration message since we moved face templates strictly to vector table
        return {"status": "error", "message": "Fingerprints are migrating to Supabase cloud. Use face registration."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/verify-fingerprint")
async def verify_fingerprint(template: str = Form(...)):
    return {"status": "error", "message": "Fingerprints are migrating to Supabase cloud. Use face verification."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
