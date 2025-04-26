import React, { useRef, useEffect, useState } from 'react';

import { drawMask, drawVelocityField } from '../utils/rendering';

interface VisualizationCanvasProps {
  width: number;
  height: number;
  className?: string;
  onImageLoad?: (imageData: ImageData, dimensions?: { width: number; height: number }) => void;
  obstacleMask?: boolean[][] | null;
  showMask?: boolean;
  velocityField?: { u: number[][]; v: number[][] } | null;
  vectorScale?: number;
  displayGridDensity?: number;
  onAddForce?: (force: { x: number; y: number; fx: number; fy: number }) => void;
  forceVectors?: { x: number; y: number; fx: number; fy: number }[];
  showVelocity?: boolean;
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
  forceVectors = [],
  showVelocity = true,
}: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Store the loaded image to persist it across renders
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

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

    // Get mouse position in canvas coordinates (fractional [0,1] range)
    const rect = canvas.getBoundingClientRect();
    const endX = (e.clientX - rect.left) / width; // normalized [0,1] coordinates
    const endY = (e.clientY - rect.top) / height; // normalized [0,1] coordinates

    // Calculate the force components directly in the normalized space
    // No additional scaling - the forces should be roughly in [0,1] range too for a full-canvas drag
    const fx = endX - forceStartPoint.x; // Leave in normalized [0,1] range
    const fy = endY - forceStartPoint.y; // Leave in normalized [0,1] range

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
        // Store the image for later use
        setLoadedImage(image);

        // Create a temporary canvas to get the image data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          // Draw the image to get its pixel data
          tempCtx.drawImage(image, 0, 0);
          const imageData = tempCtx.getImageData(0, 0, image.width, image.height);

          // Calculate new canvas dimensions that preserve aspect ratio
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;

          const aspectRatio = image.width / image.height;
          let newWidth, newHeight;

          if (aspectRatio >= 1) {
            // Landscape or square orientation
            newWidth = Math.min(MAX_WIDTH, image.width);
            newHeight = newWidth / aspectRatio;
          } else {
            // Portrait orientation
            newHeight = Math.min(MAX_HEIGHT, image.height);
            newWidth = newHeight * aspectRatio;
          }

          // Round to nearest even number for better rendering
          newWidth = Math.round(newWidth);
          newHeight = Math.round(newHeight);

          // Pass the image data and dimensions to the parent component
          if (onImageLoad) {
            onImageLoad(imageData, { width: newWidth, height: newHeight });
          }
        }
      };
      image.src = event.target.result as string;
    };

    reader.readAsDataURL(file);
  }; // Draw the visualization (image, mask, grid, velocity field)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Check if we have a loaded image
    if (loadedImage) {
      // Draw the original image (under the mask if showing)
      if (!showMask || !obstacleMask) {
        // Draw the image scaled to fit the canvas
        const scale = Math.min(width / loadedImage.width, height / loadedImage.height);
        const scaledWidth = loadedImage.width * scale;
        const scaledHeight = loadedImage.height * scale;

        // Center the image
        const offsetX = (width - scaledWidth) / 2;
        const offsetY = (height - scaledHeight) / 2;

        ctx.drawImage(loadedImage, offsetX, offsetY, scaledWidth, scaledHeight);
      }
    }

    // If we have a mask and should show it, draw it on top
    if (showMask && obstacleMask && obstacleMask.length > 0) {
      drawMask(ctx, obstacleMask, width, height);
    }

    // If no image is loaded, draw the placeholder grid
    if (!loadedImage && !obstacleMask) {
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

    // Draw velocity field if available and enabled
    if (showVelocity && velocityField && velocityField.u.length > 0 && velocityField.v.length > 0) {
      drawVelocityField(ctx, velocityField, displayGridDensity, width, height, vectorScale);
    }

    // Draw existing force vectors
    if (forceVectors && forceVectors.length > 0) {
      // Draw the force vectors
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.lineWidth = 2;

      for (const force of forceVectors) {
        // Convert normalized positions to canvas pixel coordinates
        const startX = force.x * width; // startX in pixels
        const startY = force.y * height; // startY in pixels

        // No additional scaling needed - forces are already in normalized [0,1] range
        const endX = startX + force.fx * width; // Scale to canvas width
        const endY = startY + force.fy * height; // Scale to canvas height

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw an arrowhead
        const arrowSize = 10;
        const angle = Math.atan2(force.fy, force.fx);

        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle - Math.PI / 6),
          endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle + Math.PI / 6),
          endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        // Draw a small circle at the start point
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(startX, startY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw force vector being created (if any)
    if (isDrawingForce && forceStartPoint && currentMousePos) {
      // Convert normalized positions to canvas pixel coordinates
      const startX = forceStartPoint.x * width; // startX in pixels
      const startY = forceStartPoint.y * height; // startY in pixels
      const currentX = currentMousePos.x * width; // currentX in pixels
      const currentY = currentMousePos.y * height; // currentY in pixels

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
    loadedImage,
    forceVectors,
    showVelocity,
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
