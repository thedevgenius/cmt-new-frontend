"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function ImageUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core optimization & conversion function
  const optimizeAndConvertToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          // Optimization: Max width/height to prevent massive uploads (e.g., 4K phone photos)
          const MAX_DIMENSION = 1920;
          if (width > height && width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Failed to get canvas context"));

          // Draw the resized image onto the canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to WebP Blob (0.8 = 80% quality, which is the sweet spot for WebP)
          canvas.toBlob(
            (blob) => {
              if (!blob)
                return reject(new Error("Canvas to Blob conversion failed"));

              // Replace the original extension with .webp
              const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";

              // Create a new File object from the blob
              const webpFile = new File([blob], newFileName, {
                type: "image/webp",
                lastModified: Date.now(),
              });

              resolve(webpFile);
            },
            "image/webp",
            0.8,
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      setUploadStatus("error");
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus("idle");
      setErrorMessage("");

      // Create a temporary preview of the original
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // 1. Optimize and Convert
      const webpFile = await optimizeAndConvertToWebP(file);

      console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(
        `Optimized WebP size: ${(webpFile.size / 1024 / 1024).toFixed(2)} MB`,
      );

      // 2. Prepare for upload
      const formData = new FormData();
      formData.append("image", webpFile);

      // 3. Send to backend
      const response = await fetch(
        "http://192.168.0.82:8000/api/upload/image/?type=business_cover",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Upload failed on the server.");

      const data = await response.json();
      console.log("Upload successful:", data);
      setUploadStatus("success");
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "An unexpected error occurred.");
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Upload Image</h2>
        <p className="text-sm text-gray-500 mt-1">
          Images are automatically optimized to WebP
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          preview
            ? "border-gray-200 bg-gray-50"
            : "border-blue-200 bg-blue-50/50 hover:bg-blue-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="p-4 bg-white rounded-full shadow-sm mb-3">
              <UploadCloud className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Click to browse or drag file here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports JPG, PNG, HEIC
            </p>
          </>
        )}
      </div>

      {/* Status Messages */}
      {uploadStatus === "success" && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center text-sm font-medium">
          <CheckCircle className="w-4 h-4 mr-2" />
          Image optimized and uploaded successfully!
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm font-medium">
          <XCircle className="w-4 h-4 mr-2 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Try Again Button */}
      {(uploadStatus === "success" || uploadStatus === "error") && (
        <button
          onClick={() => {
            setPreview(null);
            setUploadStatus("idle");
          }}
          className="w-full mt-4 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Upload Another Image
        </button>
      )}
    </div>
  );
}
