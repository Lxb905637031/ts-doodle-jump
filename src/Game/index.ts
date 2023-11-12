import doodlejumpbg from '../asset/doodlejumpbg.png'
import platform from '../asset/platform.png'
import doodlerLeft from '../asset/doodler-left.png'
import doodlerRight from '../asset/doodler-right.png'

const boardWidth: number = 360
const boardHeight: number = 576

const platformWidth: number = 60
const platformHeight: number = 18

const doodlerWidth: number = 46
const doodlerHeight: number = 46

// 初始化速度y
const initialVelocityY: number = -8
const gravity = 0.4

enum code {
  ArrowRight = 'ArrowRight',
  ArrowLeft = 'ArrowLeft',
  Space = 'Space'
}

class Game {
  board: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  platformImage: HTMLImageElement = new Image()
  platfromArr: any[] = []

  doodlerImage: HTMLImageElement = new Image()
  doodlerX: number = boardWidth / 2 - doodlerWidth / 2
  doodlerY: number = boardHeight * 7 / 8 - doodlerHeight

  doodlerLeftImage: HTMLImageElement = new Image()
  doodlerRightImage: HTMLImageElement = new Image()

  velocityX: number = 0
  velocityY: number = 0

  score: number = 0
  maxScore: number = 0
  gameOver: boolean = false

  constructor(
    selector: string
  ) {
    this.board = document.getElementById(selector) as HTMLCanvasElement
    this.ctx = this.board.getContext('2d') as CanvasRenderingContext2D
    
    this.platformImage.src = platform

    this.doodlerLeftImage.src = doodlerLeft
    this.doodlerRightImage.src = doodlerRight
    this.doodlerImage = this.doodlerRightImage

    this.doodlerImage.onload = () => {
      this.ctx.drawImage(
        this.doodlerImage,
        this.doodlerX,
        this.doodlerY,
        doodlerWidth,
        doodlerHeight
      )
    }

    this.velocityY = initialVelocityY
  }

  init() {
    this.render()
    this.placePlatform()
    this.bindEvent()
  }

  // 渲染画布
  render() {
    this.board.width = boardWidth
    this.board.height = boardHeight    
  }

  // 创建跳板
  placePlatform() {
    this.platfromArr = []

    this.platfromArr.push({
      platformImage: this.platformImage,
      x: boardWidth / 2,
      y: boardHeight - 50,
      platformWidth,
      platformHeight
    })

    for (let i = 0; i < 6; i++) {
      const x = Math.floor(Math.random() * boardWidth * 3 / 4)
      const y = boardHeight - 75 * i - 150
      const platformImage = new Image()
      platformImage.src = platform
      platformImage.onload = () => {
        this.platfromArr.push({
          platformImage,
          x,
          y,
          platformWidth,
          platformHeight
        })
        this.ctx.drawImage(
          platformImage,
          x,
          y,
          platformWidth,
          platformHeight
        )
      }
    }
  }

  // 事件绑定
  bindEvent() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e))
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.code === code.ArrowRight) {
      this.velocityX = 4
      this.doodlerImage = this.doodlerRightImage
    } else if (e.code === code.ArrowLeft) {
      this.velocityX = -4
      this.doodlerImage = this.doodlerLeftImage
    } else if (e.code === code.Space) {

      this.doodlerX = boardWidth / 2 - doodlerWidth / 2
      this.doodlerY = boardHeight * 7 / 8 - doodlerHeight
      this.doodlerImage = this.doodlerRightImage

      this.velocityX = 0
      this.velocityY = initialVelocityY
      this.gameOver = false
      this.score = 0
      this.maxScore = 0
      this.placePlatform()
    }
  }

  // 重置
  reset() {
    this.ctx.clearRect(0, 0, boardWidth, boardHeight)
  }

  // 实现上下跳动
  jump() {
    this.reset()

    if (this.gameOver) {
      this.ctx.fillText(
        `Game Over: Press 'Space' to Restart`,
        boardWidth / 7, 
        boardHeight / 2
      )
      return
    }

    this.doodlerX += this.velocityX
    if (this.doodlerX > boardWidth) {
      this.doodlerX = 0
    } else if (this.doodlerX + doodlerWidth < 0) {
      this.doodlerX = boardWidth
    }

    this.velocityY += gravity
    this.doodlerY += this.velocityY

    if (this.doodlerY > boardHeight) {
      this.gameOver = true
    }

    this.ctx.drawImage(
      this.doodlerImage,
      this.doodlerX,
      this.doodlerY,
      doodlerWidth,
      doodlerHeight
    )

    for (let i = 0; i < this.platfromArr.length; i++) {
      let {
        platformImage,
        x,
        y,
        platformWidth,
        platformHeight
      } = this.platfromArr[i]

      if (this.velocityY < 0 && this.doodlerY < boardHeight * 3 / 4) {
        y -= initialVelocityY
        this.platfromArr[i].y -= initialVelocityY
      }

      if (this.detectCollision(
        {
          x: this.doodlerX,
          y: this.doodlerY,
          width: doodlerWidth,
          height: doodlerHeight
        },
        {
          x,
          y,
          width: platformWidth,
          height: platformHeight
        }
      ) && this.velocityY >= 0) {
        this.velocityY = initialVelocityY
      }
      this.ctx.drawImage(
        platformImage,
        x,
        y,
        platformWidth,
        platformHeight
      )
    }

    while(this.platfromArr.length > 0 && this.platfromArr[0].y >= boardHeight) {
      this.platfromArr.shift()
      this.createPlatform()
    }

    this.updateScore()
    this.ctx.fillStyle = 'black'
    this.ctx.font = '16px sans-serif'
    this.ctx.fillText(`score:${this.score}`, 5, 20)

    // if (this.gameOver) {
    //   this.ctx.fillText(
    //     `Game Over: Press 'Space' to Restart`,
    //     boardWidth / 7, 
    //     boardHeight * 7 / 8
    //   )
    // }
  }

  createPlatform() {
    this.platfromArr.push({
      platformImage: this.platformImage,
      x: Math.floor(Math.random() * boardWidth*3/4),
      y: -platformHeight,
      platformWidth,
      platformHeight
    })
  }

  // 临界点判断
  detectCollision(a: any, b: any) {
    return (
      a.x + a.width > b.x &&
      a.x < b.x + b.width &&
      a.y + a.height > b.y && 
      a.y < b.height + b.y
    )
  }

  updateScore() {
    const points = Math.floor(Math.random() * 50)
    if (this.velocityY < 0) {
      this.maxScore += points
      if (this.score < this.maxScore) this.score = this.maxScore
    } else if (this.velocityY > 0) {
      this.maxScore -= points
    }
  }
}

export default Game
