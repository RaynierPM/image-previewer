import { DownloableCanvas } from "./CanvasDownloable";
import { ImagePointer } from "./CanvasImagePointer";
import { DragHandler } from "./DragHandler";

const DEFAULT_COORD = 0;

/**
 * @typedef CanvasOptions
 * @property {boolean} withCrosshair
 * @property {string | number} crossHairRadius
 * @property {number} width
 * @property {number} height
 */

/** @type {CanvasOptions} */
const DEFAULT_OPTIONS = {
  withCrosshair: true,
  crossHairRadius: "auto",
};

export class ImagePreviewer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasOptions?} options
   */
  constructor(canvas, options) {
    if (
      !(canvas instanceof HTMLCanvasElement) ||
      canvas.tagName.toLowerCase() != "canvas"
    ) {
      throw new Error("Canvas element required");
    }

    if (!options) {
      this.#options = { ...DEFAULT_OPTIONS };
    } else {
      this.#options = { ...DEFAULT_OPTIONS, ...options };
    }

    if (!options.width || !options.height)
      throw new Error("Width|height options required");

    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (ctx instanceof CanvasRenderingContext2D) {
      this.context = ctx;
    }

    const dimensions = {
      width: options.width,
      height: options.height,
    };

    this.#dimensions = dimensions;
    this.#GRID_INCREMENT =
      (this.dimensions.width + this.dimensions.height) * 0.1;

    this.#dragHandler = new DragHandler(this);
    this.drawPreview();
  }

  /** @type {HTMLCanvasElement} */
  canvas;

  /** @type {CanvasRenderingContext2D} */
  context;

  /** @type {{width: number; height: number}} */
  #dimensions;

  get dimensions() {
    const { width, height } = this.#dimensions;

    return {
      width: width * this.#responsiveScale,
      height: height * this.#responsiveScale,
    };
  }

  /** @param {{width: number, height: number}} dimensions */
  set dimensions(dimensions) {
    if (
      dimensions &&
      typeof dimensions.width === "number" &&
      typeof dimensions.height === "number"
    ) {
      this.#dimensions = { width: dimensions.width, height: dimensions.height };
      this.drawPreview();
    }
  }

  get aspectRatio() {
    return this.#dimensions.width / this.#dimensions.height;
  }

  /** @type {number} - Space between grid's lines */
  #GRID_INCREMENT;

  /** @type {CanvasOptions} */
  #options;

  /** @param {CanvasOptions} opts */
  set options(opts) {
    this.#options = { ...this.#options, ...opts };
  }

  /** @type {number} */
  #responsiveScale = 1;
  /**
   * @type {ImagePointer | null}
   */
  #imageInfo = null;

  get isThereImage() {
    return Boolean(this.#imageInfo);
  }

  /** @type {boolean} */
  #isClicked = false;

  get isClicked() {
    return this.#isClicked;
  }

  set isClicked(clicked) {
    if (typeof clicked === "boolean") this.#isClicked = clicked;
  }

  /** @type {DragHandler | null} */
  #dragHandler = null;

  get dragHandler() {
    return this.#dragHandler;
  }

  set dragHandler(dragHandler) {
    if (dragHandler instanceof DragHandler || dragHandler === null) {
      this.#dragHandler = dragHandler;
    }
  }

  drawGrid() {
    const ctx = this.context;
    const { height, width } = this.dimensions;
    ctx.beginPath();
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 0.25;
    for (
      let col = this.#GRID_INCREMENT;
      col < width;
      col += this.#GRID_INCREMENT
    ) {
      ctx.moveTo(col, 0);
      ctx.lineTo(col, height);
    }

    for (
      let row = this.#GRID_INCREMENT;
      row < height;
      row += this.#GRID_INCREMENT
    ) {
      ctx.moveTo(0, row);
      ctx.lineTo(width, row);
    }
    ctx.stroke();
  }

  drawCrosshair() {
    const { crossHairRadius, withCrosshair } = this.#options;
    if (!withCrosshair) return;

    const ctx = this.context;
    const { width, height } = this.dimensions;
    ctx.beginPath();
    ctx.fillStyle = "#0007";
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.lineTo(0, 0);
    ctx.arc(
      width / 2,
      height / 2,
      !crossHairRadius || crossHairRadius === "auto"
        ? (width + height) * 0.21
        : crossHairRadius * this.#responsiveScale,
      0,
      2 * Math.PI,
      true
    );
    ctx.fill();
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.dimensions.width, this.dimensions.height);
  }

  addImage(imgPath, withCrosshair = true) {
    const img = new Image();
    this.clearCanvas();
    img.addEventListener("load", () => {
      this.#imageInfo = this.#getCanvasImageInfo(img);
      this.drawImage();
      withCrosshair && this.drawCrosshair();
    });
    img.src = imgPath;
  }

  drawPreview() {
    this.#calcResponsiveness();
    this.clearCanvas();
    this.drawGrid();
    if (this.isThereImage) {
      this.#imageInfo = new ImagePointer(this.#imageInfo.img, this.#dimensions);
    }
    this.drawImage();
    this.drawCrosshair();
  }

  #calcResponsiveness() {
    const { width: canvasWidth } = this.#dimensions;
    const { width: canvasContainerWidth } =
      this.canvas.parentElement.getClientRects()[0];

    this.#responsiveScale = Math.min(1, canvasContainerWidth / canvasWidth);

    this.canvas.width = this.dimensions.width;
    this.canvas.height = this.dimensions.height;
  }

  drawImage() {
    if (this.isThereImage) {
      const { img } = this.#imageInfo;

      this.context.drawImage(
        img,
        this.#imageInfo.x,
        this.#imageInfo.y,
        this.#imageInfo.slicedWidth,
        this.#imageInfo.slicedHeight,
        DEFAULT_COORD,
        DEFAULT_COORD,
        this.dimensions.width,
        this.dimensions.height
      );
    }
  }

  /**
   *
   * @param {HTMLImageElement} img
   */
  #getCanvasImageInfo(img) {
    return new ImagePointer(img, this.#dimensions);
  }

  /**
   *
   * @param {number} xPxQty Horizontal pixels quantity
   * @param {number} yPxQty Horizontal pixels quantity
   */
  moveImage(xPxQty, yPxQty) {
    this.#imageInfo.move(xPxQty, yPxQty);
    this.drawImage();
    this.drawCrosshair();
  }

  async downloadImage() {
    if (this.isThereImage) {
      return await new DownloableCanvas(this.#imageInfo).download();
    }
    return;
  }

  async getBlob() {
    if (this.isThereImage) {
      return await new DownloableCanvas(this.#imageInfo).getBlob();
    }
  }

  addDragEvent() {
    this.#dragHandler.addDragEvent();
  }

  removeDragEvent() {
    this.#dragHandler?.removeDragEvent();
  }
}
