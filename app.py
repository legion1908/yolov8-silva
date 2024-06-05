from flask import Flask, request, jsonify, render_template
from ultralytics import YOLO
import cv2
import numpy as np

app = Flask(__name__)

# Initialize YOLO model
model = YOLO('yolov8')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        # Read file as image or video
        file_bytes = file.read()
        np_arr = np.frombuffer(file_bytes, np.uint8)
        
        # Check if the file is an image or video
        if file.content_type.startswith('image'):
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            results = model(image)
        elif file.content_type.startswith('video'):
            video_path = 'temp_video.mp4'
            with open(video_path, 'wb') as f:
                f.write(file_bytes)
            cap = cv2.VideoCapture(video_path)
            results = []
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                frame_results = model(frame)
                results.append(frame_results)
            cap.release()
        else:
            return jsonify({'error': 'Unsupported file type'}), 400
        
        # Convert results to JSON serializable format
        results_json = [result.to_dict() for result in results]
        return jsonify(results_json)

if __name__ == "__main__":
    app.run(debug=True)