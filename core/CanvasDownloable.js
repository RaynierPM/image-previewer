const IMAGE_TYPE = "image/jpeg";

const EXTENSIONS = {
  [IMAGE_TYPE]: ".jpeg",
};

export class DownloableCanvas {
  /** @type {import('./CanvasImagePointer').ImagePointer} */
  #imageInfo = null;

  /** @type {HTMLCanvasElement} */
  #canvas;

  /** @type {CanvasRenderingContext2D} */
  #ctx;

  /**
   * @param {import('./CanvasImagePointer').ImagePointer} imageInfo Information about the image and position.
   */
  constructor(imageInfo, maxSize) {
    this.#imageInfo = imageInfo;

    this.#canvas = document.createElement("canvas");
    this.#ctx = this.#canvas.getContext("2d");

    this.#init();
  }

  #init() {
    this.#canvas.width = this.#imageInfo.slicedWidth;
    this.#canvas.height = this.#imageInfo.slicedHeight;

    const { img, slicedWidth, slicedHeight, x, y } = this.#imageInfo;

    this.#ctx.drawImage(
      img,
      x,
      y,
      slicedWidth,
      slicedHeight,
      0,
      0,
      this.#canvas.width,
      this.#canvas.height
    );
  }

  async download() {
    let res;
    let rej;
    const promise = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    });

    this.#canvas.toBlob(
      (blob) => {
        if (!blob) rej?.();
        const { slicedWidth: width, slicedHeight: height } = this.#imageInfo;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `React-Image-Previewer-${width}X${height}`;
        a.click();

        URL.revokeObjectURL(url);

        res?.();
      },
      IMAGE_TYPE,
      0.88
    );

    return promise;
  }

  /**
   *
   * @returns {Promise<Blob>} file
   */
  async getBlob() {
    let res;
    let rej;
    /** @type {Promise<Blob>} */
    const promise = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    });

    this.#canvas.toBlob(
      (blob) => {
        if (!blob) rej?.();
        res?.(blob);
      },
      IMAGE_TYPE,
      0.88
    );

    return promise;
  }
}
