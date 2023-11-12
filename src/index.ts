import './index.css'
import Game from './Game'

const game = new Game('board')

window.onload = () => {
  game.init()
}

function update() {
  game.jump()
  requestAnimationFrame(update)
}

update()

