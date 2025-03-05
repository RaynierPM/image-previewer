import { DownloableCanvas } from "./CanvasDownloable";
import { ImagePointer } from "./CanvasImagePointer";
import { DragHandler } from "./DragHandler";

const DEFAULT_COORD = 0;

/**
 * @typedef CanvasOptions
 * @property {boolean} withCrosshair
 * @property {string | number} crossHairRadius
 */

/** @type {CanvasOptions} */
const DEFAULT_OPTIONS = {
  withCrosshair: true,
  crossHairRadius: "auto",
};

export class ImagePreviewer {
  /** @type {HTMLCanvasElement} */
  canvas;

  /** @type {CanvasRenderingContext2D} */
  context;

  /** @type {{width: number; height: number}} */
  #dimensions;

  /** @param {{width: number, height: number}} dimensions */
  set dimensions(dimensions) {
    if (
      dimensions &&
      typeof dimensions.width === "number" &&
      typeof dimensions.height === "number"
    ) {
      this.#dimensions = { width: dimensions.width, height: dimensions.height };
      this.refreshImage();
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
  // #zoom = 1;
  /**
   * @type {ImagePointer | null}
   */
  #imageInfo = null;

  #isClicked = false;

  /** @type {DragHandler | null} */
  #dragHandler = null;

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

    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (ctx instanceof CanvasRenderingContext2D) {
      this.context = ctx;
    }

    const clientRectDOM = canvas.getClientRects()[0];

    const dimensions = {
      width: clientRectDOM.width,
      height: clientRectDOM.height,
    };
    this.#dimensions = dimensions;
    this.#GRID_INCREMENT =
      (this.#dimensions.width + this.#dimensions.height) * 0.1;

    this.addDragEvent();
  }

  drawGrid() {
    const ctx = this.context;
    const { height, width } = this.#dimensions;
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

    this.drawCrosshair();
  }

  drawCrosshair() {
    const { crossHairRadius, withCrosshair } = this.#options;
    if (!withCrosshair) return;

    const ctx = this.context;
    const { width, height } = this.#dimensions;
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
        : crossHairRadius,
      0,
      2 * Math.PI,
      true
    );
    ctx.fill();
  }

  clearCanvas() {
    this.context.clearRect(
      0,
      0,
      this.#dimensions.width,
      this.#dimensions.height
    );
    this.drawGrid();
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

  refreshImage() {
    if (this.#imageInfo) {
      this.#imageInfo = new ImagePointer(this.#imageInfo.img, this.#dimensions);
    }
    this.clearCanvas();
    this.drawImage();
  }

  drawImage() {
    if (this.#imageInfo) {
      const { img } = this.#imageInfo;

      this.context.drawImage(
        img,
        this.#imageInfo.x,
        this.#imageInfo.y,
        this.#imageInfo.slicedWidth,
        this.#imageInfo.slicedHeight,
        DEFAULT_COORD,
        DEFAULT_COORD,
        this.#dimensions.width,
        this.#dimensions.height
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
   * @param {MouseEvent} event
   */
  #onDragHandler(event) {
    if (this.#isClicked && this.#imageInfo.img) {
      const { x, y } = this.#getCanvasClickPosition(event);
      const { x: xPxQty, y: yPxQty } = this.#dragHandler.getDifference(x, y);
      this.moveImage(xPxQty, yPxQty);
    }
  }

  /** @param {MouseEvent} event */
  #isClickedHandler(event) {
    if (this.#imageInfo) {
      const { x, y } = this.#getCanvasClickPosition(event);
      this.#dragHandler = new DragHandler(x, y);
      this.#isClicked = true;
    }
  }

  #isUnclickedHandler() {
    this.#dragHandler = null;
    this.#isClicked = false;
  }

  /**
   *
   * @param {MouseEvent} event
   * @returns
   */
  #getCanvasClickPosition(event) {
    const { x: canvasX, y: canvasY } = this.canvas.getBoundingClientRect();
    const positionX = event.clientX - canvasX;
    const positionY = event.clientY - canvasY;
    return { x: positionX, y: positionY };
  }

  /** @type {(event: MouseEvent) => void} */
  #mouseDownClickHandler = (event) => {
    this.#isClickedHandler(event);
  };

  /** @type {(event: MouseEvent) => void} */
  #mouseUpClickHandler = (event) => {
    this.#isUnclickedHandler(event);
  };

  /** @type {(event: MouseEvent) => void} */
  #mouseOverHandler = (event) => {
    this.#isUnclickedHandler(event);
  };

  /** @type {(event: MouseEvent) => void} */
  #mouseMoveHandler = (event) => {
    this.#onDragHandler(event);
  };

  addDragEvent() {
    this.canvas.addEventListener("mousedown", this.#mouseDownClickHandler);
    this.canvas.addEventListener("mouseup", this.#mouseUpClickHandler);
    this.canvas.addEventListener("mouseover", this.#mouseOverHandler);
    this.canvas.addEventListener("mousemove", this.#mouseMoveHandler);
  }

  removeDragEvent() {
    this.canvas.removeEventListener("mousedown", this.#mouseDownClickHandler);
    this.canvas.removeEventListener("mouseup", this.#mouseUpClickHandler);
    this.canvas.removeEventListener("mouseover", this.#mouseOverHandler);
    this.canvas.removeEventListener("mousemove", this.#mouseMoveHandler);
  }

  /**
   *
   * @param {number} xPxQty Horizontal pixels quantity
   * @param {number} yPxQty Horizontal pixels quantity
   */
  moveImage(xPxQty, yPxQty) {
    this.#imageInfo.move(xPxQty, yPxQty);
    this.drawImage();
    +this.drawCrosshair();
  }

  async downloadImage() {
    if (this.#imageInfo) {
      return await new DownloableCanvas(this.#imageInfo).download();
    }
    return;
  }

  async getBlob() {
    if (this.#imageInfo) {
      return await new DownloableCanvas(this.#imageInfo).getBlob();
    }
  }
}
