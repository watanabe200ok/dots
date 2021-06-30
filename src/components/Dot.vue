/**
 * Dot 1体当たりの描画と行動を制御する。
 */
<template>
  <!-- 身体 -->
  <circle :cx="state.x" :cy="state.y" :r="state.radius" :stroke="darkColor" :fill="color" />
  <!-- 鼻 -->
  <circle :cx="noseX" :cy="noseY" :r="noseRadius" :stroke="darkColor" :fill="color" />
  <!-- 白目 -->
  <circle :cx="leftEyeX" :cy="leftEyeY" :r="eyeRadius" :stroke="darkColor" fill="white" />
  <circle :cx="rightEyeX" :cy="rightEyeY" :r="eyeRadius" :stroke="darkColor" fill="white" />
  <!-- 黒目 -->
  <circle :cx="innerLeftEyeX" :cy="innerLeftEyeY" :r="innerEyeRadius" fill="black" />
  <circle :cx="innerRightEyeX" :cy="innerRightEyeY" :r="innerEyeRadius" fill="black" />
</template>

<script>
// Dotが進む方向の分解度: 360度をこの定数で割った角度がDotの向きの単位になる
const DIRECTION_RESOLUTION = 16
// Dot同士が衝突した際、1フレーム当たりに回転する角度 = Dotが進む方向の分解度 x この定数
const TURN_SPEED_WHEN_COLLIDE = 5
// Dotが進む方向を基準とした目の位置: 角度の絶対値を定義する
const EYE_ANGLE = 45 * (2 * Math.PI / 360)
// Dotの色に対する縁取りの色の割合: RGBの各要素に対してこの定数を掛ける
const DARK_COLOR_RATE = 0.8

export default {
  name: 'Dot',
  props: {
    id: { type: Number, default: 0 },
    // キャンバスのサイズ
    canvasWidth: { type: Number, default: 100 },
    canvasHeight: { type: Number, default: 100 },
    // 色: RGB配列表現, 各要素は 0以上 255以下の整数
    rgbColor: { type: Array[Number], default: () => [0, 0, 0] },
    // 初期位置の座標
    initX: { type: Number, default: 0 },
    initY: { type: Number, default: 0 },
    // 半径
    radius: { type: Number, default: 10 },
    // 移動の速さ
    speed: { type: Number, default: 10 }
  },
  data () {
    return {
      state: {
        rgbColor: this.rgbColor,
        x: this.initX,
        y: this.initY,
        prevX: this.initX, // 移動前の座標を一時的に保持する
        prevY: this.initY, // 移動前の座標を一時的に保持する
        radius: this.radius,
        speed: this.speed,
        direction: 2 * Math.PI * ~~(DIRECTION_RESOLUTION * Math.random()) / DIRECTION_RESOLUTION
      }
    }
  },
  computed: {
    /**
     * @returns {String} カラーコード
     */
    color () {
      return this.toColorCode(this.state.rgbColor)
    },
    /**
     * @returns {String} 縁取りのカラーコード
     */
    darkColor () {
      const [red, green, blue] = this.state.rgbColor
      const darkRgb = [
        ~~(red * DARK_COLOR_RATE),
        ~~(green * DARK_COLOR_RATE),
        ~~(blue * DARK_COLOR_RATE)
      ]
      return this.toColorCode(darkRgb)
    },
    /**
     * @returns {Number} 直径
     */
    diameter () {
      return this.state.radius * 2
    },
    /**
     * @returns {Number} 鼻の半径
     */
    noseRadius () {
      const RATE = 0.2
      return this.state.radius * RATE
    },
    /**
     * @returns {Number} 鼻の中心 X座標
     */
    noseX () {
      const cos = Math.cos(this.state.direction)
      return this.state.x + ~~(cos * this.state.radius)
    },
    /**
     * @returns {Number} 鼻の中心 Y座標
     */
    noseY () {
      const sin = Math.sin(this.state.direction)
      return this.state.y + ~~(sin * this.state.radius)
    },
    /**
     * @returns {Number} 白目の半径
     */
    eyeRadius () {
      const RATE = 0.35
      return this.state.radius * RATE
    },
    /**
     * @returns {Number} 左白目の中心 X座標
     */
    leftEyeX () {
      const cos = Math.cos(this.state.direction - EYE_ANGLE)
      return this.state.x + ~~(cos * this.state.radius)
    },
    /**
     * @returns {Number} 左白目の中心 Y座標
     */
    leftEyeY () {
      const sin = Math.sin(this.state.direction - EYE_ANGLE)
      return this.state.y + ~~(sin * this.state.radius)
    },
    /**
     * @returns {Number} 右白目の中心 X座標
     */
    rightEyeX () {
      const cos = Math.cos(this.state.direction + EYE_ANGLE)
      return this.state.x + ~~(cos * this.state.radius)
    },
    /**
     * @returns {Number} 右白目の中心 Y座標
     */
    rightEyeY () {
      const sin = Math.sin(this.state.direction + EYE_ANGLE)
      return this.state.y + ~~(sin * this.state.radius)
    },
    /**
     * @returns {Number} 黒目の半径
     */
    innerEyeRadius () {
      const RATE = 0.2
      return this.state.radius * RATE
    },
    /**
     * @returns {Number} 左黒目の中心 X座標
     */
    innerLeftEyeX () {
      const cos = Math.cos(this.state.direction - EYE_ANGLE)
      return this.state.x + ~~(cos * this.state.radius) + this.random(this.eyeRadius / 2)
    },
    /**
     * @returns {Number} 左黒目の中心 Y座標
     */
    innerLeftEyeY () {
      const sin = Math.sin(this.state.direction - EYE_ANGLE)
      return this.state.y + ~~(sin * this.state.radius) + this.random(this.eyeRadius / 2)
    },
    /**
     * @returns {Number} 右黒目の中心 X座標
     */
    innerRightEyeX () {
      const cos = Math.cos(this.state.direction + EYE_ANGLE)
      return this.state.x + ~~(cos * this.state.radius) + this.random(this.eyeRadius / 2)
    },
    /**
     * @returns {Number} 右黒目の中心 Y座標
     */
    innerRightEyeY () {
      const sin = Math.sin(this.state.direction + EYE_ANGLE)
      return this.state.y + ~~(sin * this.state.radius) + this.random(this.eyeRadius / 2)
    }
  },
  methods: {
    /**
     * -range以上 range以下の乱数を返す。
     *
     * @param {Number} range 範囲
     * @returns {Number} -range以上 range以下の乱数
     */
    random (range) {
      const max = range + 1
      const min = -range
      return ~~(min + (max - min) * Math.random())
    },
    /**
     * RGB配列表現をカラーコードに変換する。
     *
     * @param {Number[3]} rgbColor RGB配列表現
     * @returns {String} カラーコード
     */
    toColorCode (rgbColor) {
      const HEX = 16
      const EACH_DIGIT = 2
      return '#' + rgbColor.map(value =>
        ('0' + value.toString(HEX)).slice(-EACH_DIGIT)
      ).join('')
    },
    /**
     * 移動する。
     */
    move () {
      // 方向を0～360度の範囲に正規化する
      const PIx2 = 2 * Math.PI
      while (this.state.direction < 0.0) {
        this.state.direction += PIx2
      }
      while (PIx2 < this.state.direction) {
        this.state.direction -= PIx2
      }
      // 移動先の座標を計算する
      let nextX = this.state.x + this.state.speed * Math.cos(this.state.direction)
      let nextY = this.state.y + this.state.speed * Math.sin(this.state.direction)
      // 画面端からはみ出た場合、対となる画面端に位置を補正する
      const width = this.canvasWidth
      const height = this.canvasHeight
      const radius = this.state.radius
      if (nextX + radius < 0) {
        nextX = width + radius
      } else if (width < nextX - radius) {
        nextX = 0 - radius
      }
      if (nextY + radius < 0) {
        nextY = height + radius
      } else if (height < nextY - radius) {
        nextY = 0 - radius
      }
      // 座標を更新する
      this.state.prevX = this.state.x
      this.state.prevY = this.state.y
      this.state.x = nextX
      this.state.y = nextY
    },
    /**
     * 左に回転する。
     *
     * @param {Number} pitch DIRECTION_RESOLUTIONを単位として、回転する角度の度合い
     */
    turnLeft (pitch) {
      this.state.direction = this.state.direction - 2 * Math.PI * pitch / DIRECTION_RESOLUTION
    },
    /**
     * 右に回転する。
     *
     * @param {Number} pitch DIRECTION_RESOLUTIONを単位として、回転する角度の度合い
     */
    turnRight (pitch) {
      this.state.direction = this.state.direction + 2 * Math.PI * pitch / DIRECTION_RESOLUTION
    },
    /**
     * 前フレームに居た座標に移動する。
     */
    moveToPrev () {
      this.state.x = this.state.prevX
      this.state.y = this.state.prevY
    },
    /**
     * 色を変更する。
     *
     * このDotと他のDotの色の中間の色を計算し、計算した色を設定する。
     * 他のDotの色は変更しない。
     *
     * @param {Dot} other 他のDot
     */
    modifyColor (other) {
      const MAX = 255
      const [red1, green1, blue1] = this.state.rgbColor
      const [red2, green2, blue2] = other.state.rgbColor
      const [red3, green3, blue3] = [
        ~~((red1 + red2) / 2) % MAX,
        ~~((green1 + green2) / 2) % MAX,
        ~~((blue1 + blue2) / 2) % MAX
      ]
      this.state.rgbColor = [red3, green3, blue3]
    },
    /**
     * このDotの(鼻と目は考慮しない)体の範囲を返す。
     *
     * @returns {Object} oval このDotの範囲
     * @returns {Number} oval.x 中心のX座標
     * @returns {Number} oval.y 中心のy座標
     * @returns {Number} oval.radius 半径
     */
    range () {
      const state = this.state
      return {
        x: state.x,
        y: state.y,
        radius: state.radius
      }
    },
    /**
     * 他のDotと衝突した時の行動をとる。
     *
     * @returns {Dot} other 衝突相手のDot
     */
    collide (other) {
      this.moveToPrev()
      this.turnRight(TURN_SPEED_WHEN_COLLIDE)
      // 自分の方が古い場合、自分の色を相手の色に近づける
      if (this.id < other.id) {
        this.modifyColor(other)
      }
    }
  }
}
</script>
