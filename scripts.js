document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('image-url').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            handlePasteLink('image-url');
        }
    });

    document.getElementById('video-url').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            handlePasteLink('video-url');
        }
    });
});

function handlePasteLink(inputId) {
    const inputField = document.getElementById(inputId);
    const url = inputField.value;

    if (url) {
        if (inputId === 'image-url') {
            if (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(url)) {
                alert(`Image URL pasted: ${url}`);
                inputField.value = ''; // Reset the input field
            } else {
                alert('Please paste a valid image URL');
            }
        } else if (inputId === 'video-url') {
            if (/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gi.test(url) || url.includes('.mp4')) {
                alert(`Video URL pasted: ${url}`);
                inputField.value = ''; // Reset the input field
            } else {
                alert('Please paste a valid video URL');
            }
        }
    } else {
        alert('Please paste a URL');
    }
}

function handleFileSelect(event, inputId) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const url = e.target.result;
        alert(`${inputId === 'image-file' ? 'Image' : 'Video'} file selected: ${url}`);
    };
    reader.readAsDataURL(file);
}

function handleUpload(type) {
    if (type === 'image') {
        const imageInput = document.getElementById('image-file');
        imageInput.click();
    } else if (type === 'video') {
        const videoInput = document.getElementById('video-file');
        videoInput.click();
    }
}

function handleKeyDown(event, inputId) {
    if (event.key === 'Enter') {
        handlePasteLink(inputId);
    }
}

let mediaRecorder;
let recordedChunks = [];
let stream;

async function startLiveFeed() {
    const video = document.getElementById('live-feed');
    video.style.display = 'block'; // Show the video element

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.play();
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = function (event) {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            document.getElementById('record-btn').style.display = 'block'; // Show the record button
        } catch (error) {
            alert('Unable to access your camera.');
            console.error('Error accessing the camera:', error);
        }
    } else {
        alert('getUserMedia not supported on your browser!');
    }
}

function toggleRecording() {
    const recordBtn = document.getElementById('record-btn');
    const stopRecordBtn = document.getElementById('stop-record-btn');
    if (mediaRecorder.state === 'inactive') {
        recordedChunks = []; // Clear any previous recordings
        mediaRecorder.start();
        recordBtn.style.display = 'none'; // Hide the start record button
        stopRecordBtn.style.display = 'block'; // Show the stop record button
    }
}

function stopRecording() {
    mediaRecorder.stop();
    stopLiveFeed();
    const stopRecordBtn = document.getElementById('stop-record-btn');
    stopRecordBtn.style.display = 'none'; // Hide the stop record button
}

function stopLiveFeed() {
    const video = document.getElementById('live-feed');
    video.srcObject.getTracks().forEach(track => track.stop());
    video.style.display = 'none';
    saveRecording();
}

function saveRecording() {
    const webmBlob = new Blob(recordedChunks, { type: 'video/webm' });

    const downloadLink = document.getElementById('download-link');
    const fileReader = new FileReader();

    fileReader.onload = function () {
        const buffer = fileReader.result;
        const mp4Blob = new Blob([buffer], { type: 'video/mp4' });
        downloadLink.href = URL.createObjectURL(mp4Blob);
        downloadLink.style.display = 'block'; // Show the download link
    };

    fileReader.readAsArrayBuffer(webmBlob);
}