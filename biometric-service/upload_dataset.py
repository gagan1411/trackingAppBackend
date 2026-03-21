import os
import json
import cv2
from deepface import DeepFace
from supabase import create_client, Client

# --- CONFIGURATION ---
DATASET_JSON_PATH = "../mobile/assets/Galuta/GALUTA_filtered_data_with_images.json"
IMAGES_DIR = "../mobile/android/app/src/main/assets/Galuta/persImages/"
OUTPUT_JSON_PATH = "ready_for_mongodb.json"

# Supabase Keys (Same as main.py)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://lqfcgutfqyomareoecdv.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_cqQSoM7LrwGfYPoFVn5MVA_TPU_gLZS")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_dataset():
    # 1. Load the original dataset
    with open(DATASET_JSON_PATH, "r") as f:
        civilians = json.load(f)

    processed_civilians = []

    print(f"Starting bulk upload of {len(civilians)} civilians...")

    for i, civ in enumerate(civilians):
        try:
            name = civ.get("name", "Unknown")
            # Create a unique User ID. If Aadhar is 'NA' or missing, generate one.
            user_id = str(civ.get("aadhar no", "")).strip()
            if not user_id or user_id == "NA":
                user_id = f"GALUTA_{i}_{str(name).replace(' ', '_')}"
            
            # The image filename from the JSON
            img_filename = civ.get("imagePath")
            if not img_filename:
                print(f"[{i}] Skipping {name}: No image provided")
                continue
                
            img_path = os.path.join(IMAGES_DIR, img_filename)
            
            if not os.path.exists(img_path):
                print(f"[{i}] Error: Image file {img_path} not found on disk")
                continue

            # --- STEP A: Mathematics (Face Embedding) ---
            embedding_objs = DeepFace.represent(img_path=img_path, model_name="Facenet512", enforce_detection=False)
            embedding = embedding_objs[0]["embedding"]

            v_data = {"user_id": user_id, "embedding": embedding}
            supabase.table("face_templates").upsert(v_data).execute()

            # --- STEP B: Cloud Storage (Upload Photo) ---
            storage_path = f"{user_id}_{img_filename}"
            with open(img_path, "rb") as f:
                supabase.storage.from_("civilians").upload(
                    path=storage_path, 
                    file=f, 
                    file_options={"content-type": "image/jpeg", "upsert": "true"}
                )
            public_url = supabase.storage.from_("civilians").get_public_url(storage_path)

            # --- STEP C: Prepare MongoDB Data ---
            c_doc = {
                "name": name,
                "fatherName": civ.get("father's name"),
                "idProof": "Aadhar" if civ.get("aadhar no") != "NA" else "Other",
                "idNumber": user_id,
                "village": "Galuta",
                "houseDetails": civ.get("House No"),
                "photo": public_url,  # The permanent Supabase URL!
                "category": civ.get("sex"),
                "syncId": user_id  # required by your schema
            }
            
            processed_civilians.append(c_doc)
            print(f"[{i}] ✅ Successfully processed and uploaded: {name} ({user_id})")

        except Exception as e:
            print(f"[{i}] ❌ Failed to process {civ.get('name')}: {str(e)}")

    # 4. Save the cleanly formatted data intended for MongoDB
    with open(OUTPUT_JSON_PATH, "w") as out:
        json.dump(processed_civilians, out, indent=4)
        
    print(f"\n🎉 DONE! Successfully uploaded {len(processed_civilians)} faces to Supabase.")
    print(f"A file named '{OUTPUT_JSON_PATH}' has been created.")
    print("You can easily import this file directly into your MongoDB using MongoDB Compass!")

if __name__ == "__main__":
    upload_dataset()
