export class DragHandler {
  #x;
  #y;
  
  /**
   * 
   * @param {number} x 
   * @param {number} y 
   */
  constructor(x, y) {
    if (typeof x != 'number' || typeof y != 'number') {
      throw new Error('Not valid coords')
    }

    this.#x = x
    this.#y = y
  }

  getDifference(x, y) {
    return {
      x: this.#x - x,
      y: this.#y - y,
    }
  }
}