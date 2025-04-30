'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels, loadAllSavedDescriptors } from '@/lib/faceUtils';

export default function FaceRecognizer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [recognized, setRecognized] = useState<string | null>(null);

  useEffect(() => {
    const startRecognition = async () => {
      await loadModels();

      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const saved = loadAllSavedDescriptors();
      const labeledDescriptors = saved.map(
        ({ name, descriptor }) =>
          new faceapi.LabeledFaceDescriptors(name, [descriptor])
      );
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

      videoRef.current?.addEventListener('play', () => {
        const interval = setInterval(async () => {
          if (!videoRef.current) return;

          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();

          detections.forEach((detection) => {
            const match = faceMatcher.findBestMatch(detection.descriptor);
            if (match.label !== 'unknown') {
              setRecognized(match.label);
              localStorage.setItem(`attendance-${match.label}`, new Date().toISOString());
            }
          });
        }, 1000);

        return () => clearInterval(interval);
      });
    };

    startRecognition();
  }, []);

  return (
    <div className="p-4 border rounded">
      <video ref={videoRef} autoPlay muted width="320" height="240" />
      <div className="mt-2 text-green-600 font-bold">
        {recognized ? `Attendance marked for: ${recognized}` : 'No face matched yet.'}
      </div>
    </div>
  );
}
