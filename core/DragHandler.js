import { ImagePreviewer } from ".";

export class DragHandler {
  /** @type {{x: number, y: number}} */
  #coords = null;

  #isClicked = false;

  /** @type {ImagePreviewer} */
  #previewer;

  /** @type {string} */
  #TOUCH_ID;

  /** @param {ImagePreviewer} previewer */
  constructor(previewer) {
    this.#previewer = previewer;
    this.addDragEvent();
  }

  getDifference(x, y) {
    const { x: originX, y: originY } = this.#coords;
    return {
      x: originX - x,
      y: originY - y,
    };
  }

  // Mouse events handlers
  /**
   * @param {MouseEvent} event
   */
  #onDragHandler(event) {
    if (this.#isClicked && this.#previewer.isThereImage) {
      const { x, y } = this.#getCanvasClickPosition(event);
      const { x: xPxQty, y: yPxQty } = this.getDifference(x, y);
      this.#previewer.moveImage(xPxQty, yPxQty);
    }
  }

  /** @param {MouseEvent} event */
  #isClickedHandler(event) {
    if (this.#previewer.isThereImage) {
      const { x, y } = this.#getCanvasClickPosition(event);
      this.#coords = { x, y };
      this.#isClicked = true;
    }
  }

  #isUnclickedHandler() {
    this.#coords = null;
    this.#isClicked = false;
  }

  /**
   * @param {MouseEvent} event
   * @returns
   */
  #getCanvasClickPosition(event) {
    const { x: canvasX, y: canvasY } =
      this.#previewer.canvas.getBoundingClientRect();
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

  // Touch event Handlers

  /**
   * @param {TouchEvent} event
   * @returns {({x: number, y:number}) | null}
   */
  #getTouchedIdPosition(event) {
    const touchList = event.touches;
    for (let i = 0; i < touchList.length; i++) {
      const touch = touchList[i];
      if (touch.identifier === this.#TOUCH_ID) {
        return { x: touch.pageX, y: touch.pageY };
      }
    }
    return null;
  }

  /** @param {TouchEvent} event */
  #startTouch(event) {
    const touch = event.touches[0];
    if (touch) {
      this.#TOUCH_ID = touch.identifier;
    }
  }

  /** @param {TouchEvent} event */
  #startTouchHandler(event) {
    event.preventDefault();
    if (this.#previewer.isThereImage && !this.#TOUCH_ID) {
      this.#startTouch(event);
      const touchPosition = this.#getTouchedIdPosition(event);
      if (touchPosition) {
        const { x, y } = touchPosition;
        this.#isClicked = true;
        this.#coords = { x, y };
      }
    }
  }

  /** @param {TouchEvent} event */
  #touchLeaveHandler(event) {
    event.preventDefault();
    this.#TOUCH_ID = null;
    this.#isClicked = false;
    this.#coords = null;
  }

  /** @param {TouchEvent} event */
  #onTouchDragHandler(event) {
    event.preventDefault();
    const touchPosition = this.#getTouchedIdPosition(event);
    if (this.#previewer.isThereImage && touchPosition) {
      const { x: xPxQty, y: yPxQty } = this.getDifference(
        touchPosition.x,
        touchPosition.y
      );
      this.#previewer.moveImage(xPxQty, yPxQty);
    }
  }

  /** @type {(event: TouchEvent) => void} */
  #touchStartWrapper = (event) => {
    this.#startTouchHandler(event);
  };
  /** @type {(event: TouchEvent) => void} */
  #touchEndWrapper = (event) => {
    this.#touchLeaveHandler(event);
  };
  /** @type {(event: TouchEvent) => void} */
  #touchMoveWrapper = (event) => {
    this.#onTouchDragHandler(event);
  };
  /** @type {(event: TouchEvent) => void} */
  #touchCangelWrapper = (event) => {
    this.#touchLeaveHandler(event);
  };

  // Rezize event
  #resizeHandler = () => {
    this.#previewer.drawPreview();
  };

  addDragEvent() {
    this.#previewer.canvas.addEventListener(
      "mousedown",
      this.#mouseDownClickHandler
    );
    this.#previewer.canvas.addEventListener(
      "mouseup",
      this.#mouseUpClickHandler
    );
    this.#previewer.canvas.addEventListener(
      "mouseover",
      this.#mouseOverHandler
    );
    this.#previewer.canvas.addEventListener(
      "mousemove",
      this.#mouseMoveHandler
    );

    this.#previewer.canvas.addEventListener(
      "touchstart",
      this.#touchStartWrapper
    );
    this.#previewer.canvas.addEventListener("touchend", this.#touchEndWrapper);
    this.#previewer.canvas.addEventListener(
      "touchcancel",
      this.#touchCangelWrapper
    );
    this.#previewer.canvas.addEventListener(
      "touchmove",
      this.#touchMoveWrapper
    );

    window.addEventListener("resize", this.#resizeHandler);
  }

  removeDragEvent() {
    this.#previewer.canvas.removeEventListener(
      "mousedown",
      this.#mouseDownClickHandler
    );
    this.#previewer.canvas.removeEventListener(
      "mouseup",
      this.#mouseUpClickHandler
    );
    this.#previewer.canvas.removeEventListener(
      "mouseover",
      this.#mouseOverHandler
    );
    this.#previewer.canvas.removeEventListener(
      "mousemove",
      this.#mouseMoveHandler
    );

    this.#previewer.canvas.removeEventListener(
      "touchstart",
      this.#touchStartWrapper
    );
    this.#previewer.canvas.removeEventListener(
      "touchend",
      this.#touchEndWrapper
    );
    this.#previewer.canvas.removeEventListener(
      "touchcancel",
      this.#touchCangelWrapper
    );
    this.#previewer.canvas.removeEventListener(
      "touchmove",
      this.#touchMoveWrapper
    );

    window.removeEventListener("resize", this.#resizeHandler);
  }
}
