"use client";

/**
 * Camera Dialog Component
 * 
 * Full-featured camera component with flash, zoom, and camera switching
 */

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw, ZoomIn, ZoomOut, Flashlight, FlashlightOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
  multiple?: boolean;
}

export function CameraDialog({ open, onOpenChange, onCapture, multiple = false }: CameraDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);

  // Start camera stream
  useEffect(() => {
    if (open && videoRef.current) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, facingMode]);

  const startCamera = async () => {
    try {
      setError("");
      stopCamera(); // Stop any existing stream

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Try to enable torch/flash if supported (mainly for mobile)
      if (flashEnabled && "torch" in stream.getVideoTracks()[0]?.getCapabilities?.()) {
        try {
          await stream.getVideoTracks()[0].applyConstraints({
            advanced: [{ torch: true } as any],
          });
        } catch (e) {
          // Torch not supported on this device
        }
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError(err.message || "Failed to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleFlash = async () => {
    if (!streamRef.current) return;

    const newFlashState = !flashEnabled;
    setFlashEnabled(newFlashState);

    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && "torch" in track.getCapabilities?.()) {
        await track.applyConstraints({
          advanced: [{ torch: newFlashState } as any],
        });
      }
    } catch (e) {
      // Flash/torch not supported
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const adjustZoom = (delta: number) => {
    const newZoom = Math.max(1, Math.min(5, zoom + delta));
    setZoom(newZoom);

    if (videoRef.current) {
      videoRef.current.style.transform = `scale(${newZoom})`;
      videoRef.current.style.transformOrigin = "center";
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      setIsCapturing(false);
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to blob and create File
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file);

          if (!multiple) {
            onOpenChange(false);
          } else {
            setIsCapturing(false);
          }
        } else {
          setIsCapturing(false);
        }
      },
      "image/jpeg",
      0.95
    );
  };

  const handleClose = () => {
    stopCamera();
    setError("");
    setFlashEnabled(false);
    setZoom(1);
    setIsCapturing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={true}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 max-w-[95vw]">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Camera</DialogTitle>
          <DialogDescription>Capture photos for inventory items</DialogDescription>
        </DialogHeader>

        <div className="relative bg-black rounded-lg overflow-hidden">
          {/* Video Preview */}
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover",
                zoom > 1 && "transition-transform duration-200"
              )}
            />
            
            {/* Error Message */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4">
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">{error}</p>
                  <Button onClick={startCamera} size="sm" variant="outline">
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Camera Controls Overlay */}
            {!error && (
              <div className="absolute top-4 right-4 flex gap-2">
                {/* Flash Toggle */}
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={toggleFlash}
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                >
                  {flashEnabled ? (
                    <Flashlight className="h-4 w-4" />
                  ) : (
                    <FlashlightOff className="h-4 w-4" />
                  )}
                </Button>

                {/* Camera Switch */}
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={switchCamera}
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Zoom Controls */}
            {!error && (
              <div className="absolute bottom-20 left-4 flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => adjustZoom(0.25)}
                  disabled={zoom >= 5}
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => adjustZoom(-0.25)}
                  disabled={zoom <= 1}
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Hidden Canvas for Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 pt-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isCapturing}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={capturePhoto}
            disabled={!!error || isCapturing}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            {isCapturing ? "Capturing..." : "Capture"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

