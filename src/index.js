/**
 * 游戏逻辑
 * 方向键控制 上下左右 移动🐍
 * 碰撞检测
 * 碰到自己或墙壁则game over
 * 碰到食物则🐍变长 食物刷新
 */

const BASE_LENGTH = 10; // 网格大小
const GAP = 1; // 间隙

const canvas = document.createElement("canvas");
canvas.width = 550;
canvas.height = 450;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
// 网格化地图
const map = {
  HEIGHT: 32,
  WIDTH: 48,
  init() {
    this.render();
  },
  clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },
  render() {
    ctx.fillStyle = "black";
    ctx.fillRect(
      0,
      0,
      (BASE_LENGTH + GAP) * this.WIDTH,
      (BASE_LENGTH + GAP) * this.HEIGHT
    ); // x, y, width, height
  }
};
// 网格化🐍
const snake = {
  init() {
    // <=蛇头=====蛇身=====蛇尾
    this.snakeList = [9, 8, 7, 6, 5, 4].map(item => {
      return { x: item, y: 6 };
    });
    this.totalTime = 0;
    this.speed = 0.2;
    this.direction = { x: 1, y: 0 };
    this.lastDirection = "right";
  },
  eat() {
    this.next = {
      x: this.snakeList[0].x + this.direction.x,
      y: this.snakeList[0].y + this.direction.y
    };
    this.snakeList.unshift(this.next);
    this.speedUp();
  },
  speedUp() {
    this.speed /= 1.1;
  },
  handleInput(input) {
    switch (input) {
      case "left":
        direction = { x: -1, y: 0 };
        break;
      case "up":
        direction = { x: 0, y: -1 };
        break;
      case "right":
        direction = { x: 1, y: 0 };
        break;
      case "down":
        direction = { x: 0, y: 1 };
        break;
      default:
        break;
    }
    const next = {
      x: this.snakeList[0].x + direction.x,
      y: this.snakeList[0].y + direction.y
    };
    if (!isSamePosition(next, this.snakeList[1])) {
      this.direction = direction;
    }
  },
  render() {
    this.snakeList.forEach(block => {
      ctx.fillStyle = "white";
      ctx.fillRect(
        block.x * (BASE_LENGTH + GAP),
        block.y * (BASE_LENGTH + GAP),
        BASE_LENGTH,
        BASE_LENGTH
      );
    });
  },
  update(dt) {
    this.totalTime += dt;
    if (this.totalTime < this.speed) return;
    this.totalTime = 0;
    this.snakeList.pop();
    this.next = {
      x: this.snakeList[0].x + this.direction.x,
      y: this.snakeList[0].y + this.direction.y
    };
    this.snakeList.unshift(this.next);
  }
};
// 网格化🍜
const food = {
  init() {
    this.position = { x: 10, y: 8 };
  },
  eat() {
    this.position = randomPostion();
    snake.snakeList.forEach(item => {
      if (isSamePosition(item, this.position)) {
        this.eat();
      }
    });
  },
  render() {
    ctx.fillStyle = "green";
    ctx.fillRect(
      this.position.x * (BASE_LENGTH + GAP),
      this.position.y * (BASE_LENGTH + GAP),
      BASE_LENGTH,
      BASE_LENGTH
    );
  }
};
// game control🎮
const game = {
  isOver: false, // 游戏是否结束
  init() {
    map.init();
    this.ready();
  },
  ready() {
    ui.start();
    canvas.addEventListener("click", event => {
      const x = event.pageX - canvas.getBoundingClientRect().left;
      const y = event.pageY - canvas.getBoundingClientRect().top;
      if (x > 229 && x < 317 && y > 145 && y < 167) {
        this.start();
      }
    });
  },
  start() {
    snake.init();
    food.init();
    this.isOver = false;
    this.lastTime = Date.now();
    this.loop();
    this.controlHandler();
  },
  over() {
    map.clear();
    map.render();
    this.isOver = true;
    ui.over();
    ui.restart();
    canvas.addEventListener("click", event => {
      const x = event.pageX - canvas.getBoundingClientRect().left;
      const y = event.pageY - canvas.getBoundingClientRect().top;
      if (x > 233 && x < 294 && y > 189 && y < 200) {
        this.start();
      }
    });
  },
  loop() {
    const now = Date.now(),
      dt = (now - this.lastTime) / 1000.0;

    /* Call our update/render functions, pass along the time delta to
     * our update function since it may be used for smooth animation.
     */
    this.update(dt);
    this.render();
    this.checkCollisions();

    /* Set our lastTime variable which is used to determine the time delta
     * for the next time this function is called.
     */
    this.lastTime = now;
    if (this.isOver) return;
    window.requestAnimationFrame(this.loop.bind(this));
  },
  update(dt) {
    snake.update(dt);
  },
  checkCollisions() {
    const snakeList = copy(snake.snakeList);
    const head = snakeList.shift();
    if (!head) return;
    if (
      head.x === map.WIDTH ||
      head.y === map.HEIGHT ||
      head.x < 0 ||
      head.y < 0
    ) {
      this.over();
    }
    snakeList.forEach(item => {
      if (item.x === head.x && item.y === head.y) {
        this.over();
      }
    });
    if (head.x === food.position.x && head.y === food.position.y) {
      this.eat();
    }
  },
  render() {
    map.clear();
    map.render();
    snake.render();
    food.render();
  },
  eat() {
    snake.eat();
    food.eat();
  },
  controlHandler() {
    document.addEventListener("keydown", function(e) {
      const allowedKeys = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
      };
      snake.handleInput(allowedKeys[e.keyCode]);
    });
  }
};
const ui = {
  start() {
    ctx.font = "48px serif";
    ctx.fillStyle = "white";
    ctx.fillText("Start", 225, 170);
  },
  over() {
    ctx.font = "48px serif";
    ctx.fillStyle = "white";
    ctx.fillText("Game Over", 150, 160);
  },
  restart() {
    ctx.font = "24px serif";
    ctx.fillStyle = "white";
    ctx.fillText("restart", 230, 200);
  }
};
function randomPostion() {
  return {
    x: Math.round(Math.random() * (map.WIDTH - 1)),
    y: Math.round(Math.random() * (map.HEIGHT - 1))
  };
}
function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function isSamePosition(a, b) {
  return a.x === b.x && a.y === b.y;
}
game.init();
