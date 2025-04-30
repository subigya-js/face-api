'use client';

import React, { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

const FacePage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // STEP 1: Load the face-api models from /models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      startVideo(); // begin webcam after models are loaded
    };

    loadModels();
  }, []);

  // STEP 2: Start the webcam stream
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  // STEP 3: Detect faces every few ms
  const handleVideoPlay = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      // match canvas to video size
      const canvas = canvasRef.current;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      const resized = faceapi.resizeResults(detections, displaySize);

      // clear and redraw
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceLandmarks(canvas, resized);
      }
    }, 200); // run every 200ms

    return () => clearInterval(interval);
  };

  return (
    <div>
      <h1>No need of server 🤷🏻‍♂️</h1>
      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          onPlay={handleVideoPlay}
          width={720}
          height={560}
          style={{ borderRadius: 10 }}
        />
        <canvas
          ref={canvasRef}
          width={720}
          height={560}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
    </div>
  );
};

export default FacePage;
