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
   *
   * @param {import('./CanvasImagePointer').ImagePointer} imageInfo
   */
  constructor(imageInfo) {
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
    const promise = new Promise((resolve) => {
      res = resolve;
    });

    this.#canvas.toBlob(
      (blob) => {
        const { slicedWidth: width, slicedHeight: height } = this.#imageInfo;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `React-Image-Previewer-${width}X${height}${EXTENSIONS[IMAGE_TYPE]}`;
        a.click();

        URL.revokeObjectURL(url);

        res?.();
      },
      IMAGE_TYPE,
      1
    );

    return promise;
  }

  /**
   *
   * @returns {Promise<Blob>} file
   */
  async getBlob() {
    let res;
    /** @type {Promise<Blob>} */
    const promise = new Promise((resolve) => {
      res = resolve;
    });

    this.#canvas.toBlob((blob) => {
      res?.(blob);
    });

    return promise;
  }
}
