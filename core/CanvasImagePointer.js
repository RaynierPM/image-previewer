export class ImagePointer {
  /**
   *
   * @param {HTMLImageElement} img
   * @param {{width: number, height: number}} canvasDimensions
   */
  constructor(img, canvasDimensions) {
    if (!(img instanceof Image)) {
      throw new Error("Not valid image");
    }

    const nidea = "";

    this.#img = img;
    const { width, height } = img;

    if (!height || !width) {
      throw new Error("Not valid image dimensions");
    }

    this.#height = height;
    this.#width = width;

    this.#canvasDimensions = canvasDimensions;

    this.#aspectRatio = width / height;
    this.#canvasAspectRatio = canvasDimensions.width / canvasDimensions.height;

    this.#calculateSlicedImage();
  }

  #calculateSlicedImage() {
    if (this.showImageFullWidth) {
      this.#slicedWidth = this.#width;
      this.#slicedHeight = this.#width / this.#canvasAspectRatio;
    } else {
      this.#slicedWidth = this.#height * this.#canvasAspectRatio;
      this.#slicedHeight = this.#height;
    }

    this.#calculateZoom();
  }

  #calculateZoom() {
    if (!this.showImageFullWidth) {
      if (this.#slicedWidth >= this.#width) {
        this.#scale = Math.min(this.#width / this.#slicedWidth, 1);
      }
    } else {
      if (this.#slicedHeight >= this.#height) {
        this.#scale = Math.min(this.#height / this.#slicedHeight, 1);
      }
    }
  }

  #img;

  get img() {
    return this.#img;
  }

  set img(img) {
    if (img instanceof Image) {
      this.#img = img;
    }
  }

  #x = 0;

  get x() {
    return this.#x;
  }

  set x(x) {
    if (typeof x === "number" && x >= 0 && x <= this.horizontalMovementLimit) {
      this.#x = x;
    }
  }

  #y = 0;

  get y() {
    return this.#y;
  }

  set y(y) {
    if (typeof y === "number" && y >= 0 && y <= this.verticalMovementLimit) {
      this.#y = y;
    }
  }

  #width;

  get width() {
    return this.#width;
  }

  set width(width) {
    if (typeof width === "number") {
      this.#width = Math.abs(width);
    }
  }

  #height;

  get height() {
    return this.#height;
  }

  set height(height) {
    if (typeof height === "number") {
      this.#height = Math.abs(height);
    }
  }
  #aspectRatio;

  get aspectRatio() {
    return this.#aspectRatio;
  }

  #canvasDimensions;

  get canvasDimensions() {
    return this.#canvasDimensions;
  }

  #canvasAspectRatio;

  get canvasAspectRatio() {
    return this.#canvasAspectRatio;
  }

  get showImageFullWidth() {
    return this.#aspectRatio < 1;
  }

  #slicedWidth;

  get slicedWidth() {
    return this.#slicedWidth * this.#scale;
  }

  #slicedHeight;

  get slicedHeight() {
    return this.#slicedHeight * this.#scale;
  }

  get horizontalMovementLimit() {
    return this.#width - this.slicedWidth;
  }

  get verticalMovementLimit() {
    return this.#height - this.slicedHeight;
  }

  /** @type {number} */
  #scale = 1;

  /**
   *
   * @param {*} xPxQty - Pixels quantity to add/remove
   * @param {*} yPxQty - Pixels quantity to add/remove
   */
  move(xPxQty, yPxQty) {
    this.x = this.#x + xPxQty;
    this.y = this.#y + yPxQty;
  }
}
