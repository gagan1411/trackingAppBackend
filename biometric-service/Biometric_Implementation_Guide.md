# Biometric System Implementation Guide

Based on the architecture recommendations, I have implemented a production-ready **Python FastAPI Biometric Microservice** that runs on `FaceNet` (via `deepface`), `OpenCV`, and `SQLite`. 

## 1. The Python Backend `biometric-service/`
I have created the new service natively inside your workspace at `Tracking_App/biometric-service/`.

- `main.py`: The FastAPI server containing routes for `/register-face`, `/verify-face`, `/register-fingerprint`, and `/verify-fingerprint`.
- `requirements.txt`: The system dependencies.
- `biometrics.db`: The auto-generated SQLite database where it securely stores FaceNet embedding signatures and Fingerprint templates.

### Running the Biometric Engine
You will need Python installed on your machine.
1. Open a new terminal and navigate to the `biometric-service` folder:
   ```bash
   cd "d:\React Native\Tracking_App\biometric-service"
   ```
2. Install the necessary packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the biometric server:
   ```bash
   python main.py
   ```
   *The server will run on http://192.168.29.240:8000 (or your local IP).*

## 2. Integrated Expo App
I have also updated your React Native application components to start hitting this new AI backend!

### `BiometricVerify.js`
Your frontend app is utilizing a beautiful Neural-Link UI for scanning. It is now actually integrated with the FaceNet service!
- We attached `ref={setCameraRef}` to `<CameraView />`.
- When scanning is initiated, the app captures a frame and sends it over to `http://192.168.29.240:8000/verify-face`.
- If matched, the engine returns `status: match` with a dynamically calculated precision score, which maps cleanly to your existing success flow.

### `RegisterCivilian.js`
During Registration, the individual's face is sent directly over to the newly configured Face Recognition python DB, allowing the neural engine to register their embedding map for future recognition seamlessly across any device connected to that IP port. 

## 3. Fingerprint Scanner Integration
For fingerprints, mobile phones cannot universally read raw fingerprints directly. To fulfill the "Free & Accurate" scheme with Mantra MFS100:
1. You will need to build an external device scanner plugin for React Native using Mantra MFS100's Android driver in Java.
2. The custom module will emit the ISO-Template string directly to React.
3. Your React Native App takes that string and hits `POST http://192.168.29.240:8000/verify-fingerprint` with `template={MANTRA_STRING}` to get a match result across devices.

Until the physical Mantra Scanner is connected to the USB OTG, you can safely continue using the React Native UI Mock for "Deep Scan" while your real Face Recognition AI goes to work!
