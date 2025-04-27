/**
 * Utility functions for rendering visualization elements on the canvas
 */

/**
 * Draws a boolean mask on the canvas, filling cells where the mask is true
 *
 * @param ctx Canvas rendering context
 * @param mask Boolean mask representing obstacles (true = obstacle)
 * @param canvasWidth Width of the canvas
 * @param canvasHeight Height of the canvas
 * @param color Optional color for the cells (defaults to black)
 */
export function drawMask(
  ctx: CanvasRenderingContext2D,
  mask: boolean[][],
  canvasWidth: number,
  canvasHeight: number,
  color = 'rgba(0, 0, 0, 0.7)'
): void {
  if (!mask.length || !mask[0].length) return;

  const cellWidth = canvasWidth / mask[0].length;
  const cellHeight = canvasHeight / mask.length;

  ctx.fillStyle = color;

  // Draw filled cells where mask is true
  for (let y = 0; y < mask.length; y++) {
    for (let x = 0; x < mask[0].length; x++) {
      if (mask[y][x]) {
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  }

  // Draw grid lines
  ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
  ctx.lineWidth = 0.5;

  // Vertical lines
  for (let x = 0; x <= mask[0].length; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellWidth, 0);
    ctx.lineTo(x * cellWidth, canvasHeight);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= mask.length; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellHeight);
    ctx.lineTo(canvasWidth, y * cellHeight);
    ctx.stroke();
  }
}

/**
 * Draws an image on the canvas, properly scaled and centered
 *
 * @param ctx Canvas rendering context
 * @param image Image to draw
 * @param canvasWidth Width of the canvas
 * @param canvasHeight Height of the canvas
 */
export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Calculate scaling to fit the canvas while maintaining aspect ratio
  const scale = Math.min(canvasWidth / image.width, canvasHeight / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;

  // Center the image on the canvas
  const offsetX = (canvasWidth - scaledWidth) / 2;
  const offsetY = (canvasHeight - scaledHeight) / 2;

  // Draw the image
  ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
}

/**
 * Draws velocity field vectors on the canvas
 *
 * @param ctx Canvas rendering context
 * @param velocityField Velocity field with u and v components, grid units
 * @param displayGridDensity Spacing between displayed vectors
 * @param canvasWidth Width of the canvas
 * @param canvasHeight Height of the canvas
 * @param vectorScale Scale factor for the vectors
 */
export function drawVelocityField(
  ctx: CanvasRenderingContext2D,
  velocityField: { u: number[][]; v: number[][] },
  displayGridDensity: number,
  canvasWidth: number,
  canvasHeight: number,
  vectorScale: number = 1.0
): void {
  if (!velocityField.u.length || !velocityField.u[0].length) return;

  const { u, v } = velocityField;
  const fieldHeight = u.length;
  const fieldWidth = u[0].length;

  const cellWidth = canvasWidth / fieldWidth;
  const cellHeight = canvasHeight / fieldHeight;

  // Draw arrows for the velocity field
  ctx.strokeStyle = 'rgba(0, 100, 255, 0.7)';
  ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
  ctx.lineWidth = 1;

  // Only draw vectors at intervals defined by displayGridDensity
  for (let y = 0; y < fieldHeight; y += displayGridDensity) {
    for (let x = 0; x < fieldWidth; x += displayGridDensity) {
      const uVal = u[y][x];
      const vVal = v[y][x];

      // Calculate the magnitude of the vector
      const magnitude = Math.sqrt(uVal * uVal + vVal * vVal);
      if (magnitude < 0.001) continue; // Skip very small vectors

      // Calculate the position for this vector
      const startX = x * cellWidth + cellWidth / 2;
      const startY = y * cellHeight + cellHeight / 2;

      // Descale velocity values back from grid units to normalized units for consistent visual representation
      const normalizedUVal = uVal * fieldWidth;
      const normalizedVVal = vVal * fieldHeight;
      const normalizedMagnitude = Math.sqrt(
        normalizedUVal * normalizedUVal + normalizedVVal * normalizedVVal
      );

      if (normalizedMagnitude < 0.00001) continue; // Skip extremely small vectors after normalization

      // Calculate the vector endpoint with scaling
      // Use a stronger scaling factor to make the flow visualization more visible
      const vectorLength = Math.min(30, normalizedMagnitude * 80 * fieldWidth) * vectorScale;
      const endX = startX + (normalizedUVal / normalizedMagnitude) * vectorLength;
      const endY = startY + (normalizedVVal / normalizedMagnitude) * vectorLength;

      // Draw the line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw an arrowhead
      const arrowSize = 3;
      const angle = Math.atan2(normalizedVVal, normalizedUVal); // Use normalized values for consistent angle

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
    }
  }
}
