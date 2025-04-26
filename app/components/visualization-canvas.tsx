import React, { useRef, useEffect, useState } from 'react';

import { drawMask, drawVelocityField } from '../utils/rendering';

interface VisualizationCanvasProps {
  width: number;
  height: number;
  className?: string;
  onImageLoad?: (imageData: ImageData) => void;
  obstacleMask?: boolean[][] | null;
  showMask?: boolean;
  velocityField?: { u: number[][]; v: number[][] } | null;
  vectorScale?: number;
  displayGridDensity?: number;
  onAddForce?: (force: { x: number; y: number; fx: number; fy: number }) => void;
}

export default function VisualizationCanvas({
  width,
  height,
  className,
  onImageLoad,
  obstacleMask = null,
  showMask = false,
  velocityField = null,
  vectorScale = 1,
  displayGridDensity = 16,
  onAddForce,
}: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Force vector drawing state
  const [isDrawingForce, setIsDrawingForce] = useState(false);
  const [forceStartPoint, setForceStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  // Mouse event handlers for force vector creation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only if we have an obstacle mask (simulation is ready)
    if (!obstacleMask) return;

    // Get canvas-relative coordinates
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / width;
    const y = (e.clientY - rect.top) / height;

    // Start drawing a force vector
    setIsDrawingForce(true);
    setForceStartPoint({ x, y });
    setCurrentMousePos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingForce || !forceStartPoint) return;

    // Update current mouse position
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / width;
    const y = (e.clientY - rect.top) / height;

    setCurrentMousePos({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingForce || !forceStartPoint || !onAddForce) return;

    // Calculate the force vector
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const endX = (e.clientX - rect.left) / width;
    const endY = (e.clientY - rect.top) / height;

    // Calculate the force components (ensure they're scaled appropriately)
    const FORCE_SCALE = 0.2; // Scale down the force for better control
    const fx = (endX - forceStartPoint.x) * FORCE_SCALE;
    const fy = (endY - forceStartPoint.y) * FORCE_SCALE;

    // Add the force vector
    onAddForce({
      x: forceStartPoint.x,
      y: forceStartPoint.y,
      fx,
      fy,
    });

    // Reset drawing state
    setIsDrawingForce(false);
    setForceStartPoint(null);
    setCurrentMousePos(null);
  };

  const handleMouseLeave = () => {
    // Cancel force drawing if the mouse leaves the canvas
    if (isDrawingForce) {
      setIsDrawingForce(false);
      setForceStartPoint(null);
      setCurrentMousePos(null);
    }
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

  // Draw the visualization (mask, grid, velocity field)
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

    // Draw velocity field if available
    if (velocityField && velocityField.u.length > 0 && velocityField.v.length > 0) {
      drawVelocityField(ctx, velocityField, displayGridDensity, width, height, vectorScale);
    }

    // Draw force vector being created (if any)
    if (isDrawingForce && forceStartPoint && currentMousePos) {
      const startX = forceStartPoint.x * width;
      const startY = forceStartPoint.y * height;
      const currentX = currentMousePos.x * width;
      const currentY = currentMousePos.y * height;

      // Draw the force vector line
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      // Draw an arrowhead
      const arrowSize = 10;
      const angle = Math.atan2(currentY - startY, currentX - startX);

      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      ctx.lineTo(
        currentX - arrowSize * Math.cos(angle - Math.PI / 6),
        currentY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        currentX - arrowSize * Math.cos(angle + Math.PI / 6),
        currentY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Draw a small circle at the start point
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(startX, startY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [
    width,
    height,
    obstacleMask,
    showMask,
    velocityField,
    vectorScale,
    displayGridDensity,
    isDrawingForce,
    forceStartPoint,
    currentMousePos,
  ]);

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
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: obstacleMask ? 'crosshair' : 'default' }}
    />
  );
}
