import boxIntersect from 'box-intersect'

/**
 * 円形の当たり判定を行う。
 */
export default class CollisionDetector {
  /**
   * 円の配列の全要素について当たり判定をし、衝突した円のインデックスを返す。
   *
   * @param {Object[]} ovals 当たり判定を行う円の配列
   * @param {Number} ovals[].x 中心のX座標
   * @param {Number} ovals[].y 中心のY座標
   * @param {Number} ovals[].radius 半径
   * @returns {Number[2][]} result 衝突した円のインデックスを保持する配列
   * @returns {Number[2]} result[] [円Xのインデックス, 円Xと衝突した円のインデックス]
   */
  detect (ovals) {
    // 四角形による高速な当たり判定行い、厳密な当たり判定を行う対象を絞り込む
    const boxes = ovals.map(o => this.toBox(o))
    return boxIntersect(boxes)
      .map(indexes => {
        const [index1, index2] = indexes
        // box-intersectは衝突した円のインデックスのみ返す
        // 後続処理の都合により、インデックスと対応する円をまとめて返す
        return {
          indexes: [index1, index2],
          ovals: [ovals[index1], ovals[index2]]
        }
      })
      // 楕円同士の厳密な当たり判定を行い、絞り込む
      .filter(target => {
        const [oval1, oval2] = target.ovals
        const distance = this.distance(oval1.x, oval1.y, oval2.x, oval2.y)
        return distance < oval1.radius + oval2.radius
      })
      // 最終的にインデックスを返す
      .map(target => target.indexes)
  }

  /**
   * 第1引数の円が第2引数の円のいずれかと衝突しているか否かを判定する。
   *
   * @param {Object} targetOval 当たり判定の対象となる円
   * @param {Number} targetOval.x 中心のX座標
   * @param {Number} targetOval.y 中心のY座標
   * @param {Number} targetOval.radius 半径
   * @param {Object[]} otherOvals targetOvalと当たり判定を行う円の配列
   * @param {Number} otherOvals[].x 中心のX座標
   * @param {Number} otherOvals[].y 中心のY座標
   * @param {Number} otherOvals[].radius 半径
   * @returns {Boolean} 第1引数の円が第2引数の円のいずれかと衝突している場合はtrue、それ以外はfalse
   */
  collisional (targetOval, otherOvals) {
    const other = otherOvals.find(o => {
      const distance = this.distance(o.x, o.y, targetOval.x, targetOval.y)
      return distance < targetOval.radius + o.radius
    })
    return other !== undefined
  }

  /**
   * 円を内包する四角形を返す。
   *
   * @param {Object} oval 円
   * @param {Number} oval.x 中心のX座標
   * @param {Number} oval.y 中心のY座標
   * @param {Number} oval.radius 半径
   * @returns {Number[4]} 四角形, [左上端のX座標, 左上端のY座標, 幅, 高さ]
   */
  toBox (oval) {
    const radius = oval.radius
    const diameter = radius * 2
    return [
      oval.x - radius,
      oval.y - radius,
      oval.x + diameter,
      oval.y + diameter
    ]
  }

  /**
   * 2点間の距離を返す。
   *
   * @param {Number} x1 点1のX座標
   * @param {Number} y1 点1のY座標
   * @param {Number} x2 点2のX座標
   * @param {Number} y2 点2のY座標
   * @returns {Number} 距離
   */
  distance (x1, y1, x2, y2) {
    return Math.sqrt(
      Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
  }
}
