'use client';

import React, { useRef, useState } from 'react';
import { loadModels, getFaceDescriptor, saveDescriptorToStorage } from '@/lib/faceUtils';

export default function FaceUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !name) return;

    setMessage('Loading...');
    await loadModels();

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      try {
        const descriptor = await getFaceDescriptor(img);
        saveDescriptorToStorage(name, descriptor);
        setMessage(`Face saved for "${name}"`);
      } catch {
        setMessage('No face detected');
      }
    };
  };

  return (
    <div className="p-4 border rounded">
      <input
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-1 mr-2"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="mb-2"
      />
      <div>{message}</div>
    </div>
  );
}
