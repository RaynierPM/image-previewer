# Image Previewer Core

A powerful yet lightweight JavaScript library for previewing images on a canvas. No frameworks, no fluff—just raw, pixel-moving, zoom-loving, crosshair-placing goodness.

## Features

- **Image Upload & Preview**: Load images into a canvas like a pro.
- ~**Zoom In & Out**: Because sometimes you need to see every pixel.~ (COMING SOON)
- **Move Image**: Drag your image around like you're rearranging furniture.
- **Crosshair Overlay**: Feel like a sniper with an optional crosshair.
- **Download Image**: Export your masterpiece to show off later.

## Getting Started

### Prerequisites

Make sure you have a modern web browser and a basic understanding of JavaScript.

### Installation

Since this is a pure JS library, just include the script in your project and you're good to go.

```js
const previewer = new ImagePreviewer(myCanvas, { withCrosshair: true });
```

## API Documentation

### Constructor

```js
new ImagePreviewer(canvas, options);
```

- `canvas` (HTMLCanvasElement) – The canvas where all the magic happens.
- `options` (Object) – Optional settings (e.g., crosshair size, toggle crosshair).

### Public Methods

#### `addImage(imgPath, withCrosshair = true)`

Loads an image into the canvas and optionally slaps a crosshair on it.

#### `clearCanvas()`

Wipes the canvas clean like it never happened.

#### `moveImage(xPxQty, yPxQty)`

Moves the image around. Use wisely or get lost in an endless drag fest.

#### `refreshImage()`

Redraws the image. Good for when things start looking weird.

#### `drawGrid()`

Draws a stylish grid on the canvas. Perfect for feeling fancy.

#### `downloadImage()`

Download the cropped image on user's computer.

#### `getBlob()`

Returns a Blob of the image. Techy, but useful.

### Public Properties

#### `canvas`

The HTMLCanvasElement where the magic happens.

#### `context`

The 2D context of the canvas. Use it if you want to draw extra stuff.

#### `dimensions`

Get or set the width and height of the canvas. Resize responsibly.

#### `aspectRatio`

Returns the aspect ratio of the canvas. Good for keeping things proportional.

## License

This project is licensed under the MIT License. Use it, break it, improve it!
