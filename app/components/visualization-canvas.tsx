import React, { useRef, useEffect, useState } from 'react';

import { drawMask } from '../utils/rendering';

interface VisualizationCanvasProps {
  width: number;
  height: number;
  className?: string;
  onImageLoad?: (imageData: ImageData) => void;
  obstacleMask?: boolean[][] | null;
  showMask?: boolean;
}

export default function VisualizationCanvas({
  width,
  height,
  className,
  onImageLoad,
  obstacleMask = null,
  showMask = false,
}: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please drop an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      if (!event.target?.result) return;

      const image = new Image();
      image.onload = () => {
        // Create a temporary canvas to get the image data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          // Draw the image to get its pixel data
          tempCtx.drawImage(image, 0, 0);
          const imageData = tempCtx.getImageData(0, 0, image.width, image.height);

          // Pass the image data to the parent component
          if (onImageLoad) {
            onImageLoad(imageData);
          }

          // Also draw the image on our visible canvas
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, width, height);

              // Draw the image scaled to fit the canvas
              const scale = Math.min(width / image.width, height / image.height);
              const scaledWidth = image.width * scale;
              const scaledHeight = image.height * scale;

              // Center the image
              const offsetX = (width - scaledWidth) / 2;
              const offsetY = (height - scaledHeight) / 2;

              ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
            }
          }
        }
      };
      image.src = event.target.result as string;
    };

    reader.readAsDataURL(file);
  };

  // Draw the placeholder grid or mask
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // If we have a mask and should show it, draw it
    if (showMask && obstacleMask && obstacleMask.length > 0) {
      // Draw the mask
      drawMask(ctx, obstacleMask, width, height);
    } else {
      // Draw a placeholder grid
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 0.5;

      // Draw vertical lines
      for (let x = 0; x <= width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y <= height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Show drag-and-drop instruction if no image has been loaded
      ctx.fillStyle = '#888';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Drag & drop an image here', width / 2, height / 2);
    }
  }, [width, height, obstacleMask, showMask]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`border border-gray-300 bg-white dark:bg-gray-700 ${
        isDraggingOver ? 'border-blue-500 border-2' : ''
      } ${className || ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  );
}
