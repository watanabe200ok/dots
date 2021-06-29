<template>
  <div :style="{width: `${width}px`, height: `${height}px`}">
    <svg xmlns="http://www.w3.org/2000/svg"
      @click="addDot($event.offsetX, $event.offsetY)">
      <dot v-for="dot in dotInintializeData"
        :ref="bindDot"
        :key="`dot-${dot.id}`"
        :id="dot.id"
        :canvasWidth="this.width"
        :canvasHeight="this.height"
        :rgbColor="dot.rgbColor"
        :initX="dot.x"
        :initY="dot.y"
        :radius="dot.radius"
        :speed="dot.speed" />
    </svg>
  </div>
</template>

<style lang="scss">
div {
  margin: 0 auto;
}
svg {
  width: 100%;
  height: 100%;
}
</style>

<script>
import Dot from '@/components/Dot.vue'
import CollisionDetector from '@/util/CollisionDetector'
// キャンバスのサイズ = ウインドウサイズ * この定数
const CANVAS_SIZE_RATE = 0.9
// 1秒当たりのフレーム数
const FRAMES_PER_SECOND = 20
// FRAMES_PER_SECONDによって定まるインバール(ミリ秒)
const INTERVAL_MILLISECOND = 1000 / FRAMES_PER_SECOND
// Dotの最大数
const MAX_DOT_COUNT = 256
// Dotの速さの範囲
const SPEED = { min: 1, max: 10 }
// Dotの半径の範囲
const RADIUS = { min: 5, max: 30 }
// 当たり判定
const collisionDetector = new CollisionDetector()

export default {
  name: 'App',
  components: {
    Dot
  },
  data () {
    const [width, height] = this.canvasSize()
    return {
      frameTimer: 0,
      width: width,
      height: height,
      dotInintializeData: [],
      dots: []
    }
  },
  methods: {
    /**
     * @returns {Number[2]} キャンバスサイズ, [幅, 高さ]
     */
    canvasSize () {
      return [
        ~~(window.innerWidth * CANVAS_SIZE_RATE),
        ~~(window.innerHeight * CANVAS_SIZE_RATE)
      ]
    },
    /**
     * ウインドウのサイズが変更された時のハンドリング
     */
    handleResize () {
      const [width, height] = this.canvasSize()
      this.dotInintializeData = []
      this.dots = []
      this.width = width
      this.height = height
    },
    /**
     * 引数で指定されたDotを内部状態のDot配列に追加する。
     *
     * Dotが動的に増加する配列である為、各Dotにアクセスする為に実装した。
     * テンプレートの dotタグの ref属性にて実行すること。
     *
     * @param {Dot} dot Dot
     */
    bindDot (dot) {
      if (dot) {
        this.dots.push(dot)
      }
    },
    /**
     * 引数で指定された位置にDotを追加する。
     *
     * 配置する場所に他のDotが存在する場合は追加しない。
     *
     * @param {Number} x X座標
     * @param {Number} y Y座標
     */
    addDot (x, y) {
      const dotCount = this.dots.length
      if (MAX_DOT_COUNT <= dotCount) {
        return
      }

      // 配置する場所に既に他のDotが存在しないことをチェックする
      const radius = this.random(RADIUS)
      const newDot = {
        x: x,
        y: y,
        radius: radius
      }
      const oldDots = this.dots.map(dot => dot.range(dot.x, dot.y, dot.radius))
      if (!collisionDetector.collisional(newDot, oldDots)) {
        // 追加するDotの初期化に必要なプロパティーを作成する
        const MAX = 256
        const dot = {
          id: dotCount,
          rgbColor: [
            ~~(MAX * Math.random()),
            ~~(MAX * Math.random()),
            ~~(MAX * Math.random())
          ],
          x: x,
          y: y,
          radius: radius,
          speed: this.random(SPEED)
        }
        this.dotInintializeData.push(dot)
      }
    },
    /**
     * 最小値以上、最大値以下の乱数を返す。
     *
     * @param <Object> range
     * @param <Nubmber> range.min 最小値
     * @param <Nubmber> range.max 最大値
     */
    random (range) {
      return range.min + (range.max + 1 - range.min) * Math.random()
    },
    /**
     * 1フレーム当たりの処理
     */
    frame () {
      this.dots.forEach(dot => dot.move())
      collisionDetector
        .detect(this.dots.map(dot => dot.range()))
        .forEach(indexes => {
          const [index1, index2] = indexes
          const [dot1, dot2] = [this.dots[index1], this.dots[index2]]
          dot1.collide(dot2)
          dot2.collide(dot1)
        })
    }
  },
  // インスタンスがDOM要素にマウントされた後: DOMを参照することができる
  mounted () {
    this.frameTimer = setInterval(this.frame, INTERVAL_MILLISECOND)
    window.addEventListener('resize', this.handleResize)
  },
  // 再描画が必要な時: データは更新されたがDOMに適用される前
  beforeUpdate () {
    this.dots = []
  },
  // インスタンスのDOMへのマウントが解除される前
  beforeUnmount () {
    window.clearInterval(this.frameTimer)
    this.dotInintializeData = null
    this.dots = null
  }
}
</script>
