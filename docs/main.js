const CELL_WIDTH = 50;
const CELL_HEIGHT = 50;

const mapSizeX = 9;
const mapSizeY = 9;

const drawBackground = (ctx) => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "gray";
  ctx.fillRect(
    2 * CELL_WIDTH,
    2 * CELL_HEIGHT,
    5 * CELL_WIDTH,
    5 * CELL_HEIGHT
  );
};

class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  checkCollision(entities, x, y, klass) {
    for (let entity of entities) {
      if (klass === undefined || entity instanceof klass) {
        if (entity.x === x && entity.y === y) {
          return true;
        }
      }
    }
    if (x < 0 || x >= mapSizeX || y < 0 || y >= mapSizeY) {
      return true;
    }
    return false;
  }

  tick(ctx, entities) {
    throw new Error("draw method is not implemented");
  }

  draw(ctx) {
    throw new Error("draw method is not implemented");
  }
}

class Player extends Entity {
  constructor(x, y) {
    super(x, y);
    this.direction = "stop";
    this.directionFrame = 0;
  }

  checkCollision(entities, x, y) {
    for (let entity of entities) {
      if (entity instanceof TeaCup) {
        if (entity.x === x && entity.y === y) {
          if (entity.pushedFrom(this.direction, entities)) {
            return false;
          } else {
            return true;
          }
        }
      }
    }
    return super.checkCollision(entities, x, y, StablePot);
  }

  tick(ctx, entities) {
    if (this.directionFrame % 5 === 0) {
      switch (this.direction) {
        case "up":
          if (!this.checkCollision(entities, this.x, this.y - 1)) {
            this.y--;
          }
          break;
        case "down":
          if (!this.checkCollision(entities, this.x, this.y + 1)) {
            this.y++;
          }
          break;
        case "left":
          if (!this.checkCollision(entities, this.x - 1, this.y)) {
            this.x--;
          }
          break;
        case "right":
          if (!this.checkCollision(entities, this.x + 1, this.y)) {
            this.x++;
          }
          break;
      }
    }
    this.directionFrame++;
  }

  draw(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(
      this.x * CELL_WIDTH,
      this.y * CELL_HEIGHT,
      CELL_WIDTH,
      CELL_HEIGHT
    );
  }

  changeDirection(direction) {
    if (this.direction === direction) {
      return;
    }
    this.direction = direction;
    this.directionFrame = 0;
  }
}

class StablePot extends Entity {
  constructor(x, y, color) {
    super(x, y);
    this.color = color;
  }

  tick(ctx, entities) {}

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x * CELL_WIDTH,
      this.y * CELL_HEIGHT,
      CELL_WIDTH,
      CELL_HEIGHT
    );
  }
}

const TEACUP_RANGE_X_MIN = 2;
const TEACUP_RANGE_X_MAX = 6;
const TEACUP_RANGE_Y_MIN = 2;
const TEACUP_RANGE_Y_MAX = 6;

class TeaCup extends Entity {
  constructor(x, y, color) {
    super(x, y);
    this.color = color;
  }

  tick(ctx, entities) {}

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(
      this.x * CELL_WIDTH,
      this.y * CELL_HEIGHT,
      CELL_WIDTH,
      CELL_HEIGHT
    );
    ctx.globalAlpha = 1;
  }

  pushedFrom(direction, entities) {
    let x = this.x;
    let y = this.y;
    let moved = false;
    switch (direction) {
      case "up":
        while (y >= TEACUP_RANGE_Y_MIN + 1) {
          if (this.checkCollision(entities, x, y - 1)) {
            break;
          }
          y--;
          moved = true;
        }
        break;
      case "down":
        while (y <= TEACUP_RANGE_Y_MAX - 1) {
          if (this.checkCollision(entities, x, y + 1)) {
            break;
          }
          y++;
          moved = true;
        }
        break;
      case "left":
        while (x >= TEACUP_RANGE_X_MIN + 1) {
          if (this.checkCollision(entities, x - 1, y)) {
            break;
          }
          x--;
          moved = true;
        }
        break;
      case "right":
        while (x <= TEACUP_RANGE_X_MAX - 1) {
          if (this.checkCollision(entities, x + 1, y)) {
            break;
          }
          x++;
          moved = true;
        }
        break;
    }
    console.log(moved);
    this.x = x;
    this.y = y;
    return moved;
  }

  checkSetToStablePot(entities) {
    for (let entity of entities) {
      if (entity instanceof StablePot) {
        if (entity.x === this.x && entity.y === this.y - 1) {
          return true;
        }
        if (entity.x === this.x && entity.y === this.y + 1) {
          return true;
        }
        if (entity.x === this.x - 1 && entity.y === this.y) {
          return true;
        }
        if (entity.x === this.x + 1 && entity.y === this.y) {
          return true;
        }
      }
    }
    return false;
  }
}

const init = () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let entities = [];
  let cleared = false;

  let player = new Player(0, 0);
  entities.push(player);
  entities.push(new StablePot(7, 4, "red"));
  entities.push(new StablePot(5, 1, "blue"));
  entities.push(new StablePot(1, 2, "yellow"));
  entities.push(new StablePot(3, 7, "green"));
  let redCup = new TeaCup(3, 2, "red");
  let blueCup = new TeaCup(2, 4, "blue");
  let yellowCup = new TeaCup(6, 5, "yellow");
  let greenCup = new TeaCup(5, 4, "green");
  entities.push(redCup);
  entities.push(blueCup);
  entities.push(yellowCup);
  entities.push(greenCup);

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowUp":
        player.changeDirection("up");
        break;
      case "ArrowDown":
        player.changeDirection("down");
        break;
      case "ArrowLeft":
        player.changeDirection("left");
        break;
      case "ArrowRight":
        player.changeDirection("right");
        break;
    }
  });

  document.addEventListener("keyup", (_event) => {
    player.changeDirection("stop");
  });

  const tick = () => {
    drawBackground(ctx);
    entities.forEach((entity) => {
      entity.tick(ctx, entities);
      entity.draw(ctx);
    });
    if (
      !cleared &&
      redCup.checkSetToStablePot(entities) &&
      blueCup.checkSetToStablePot(entities) &&
      yellowCup.checkSetToStablePot(entities) &&
      greenCup.checkSetToStablePot(entities)
    ) {
      cleared = true;
    }
    if (cleared) {
      ctx.fillStyle = "white";
      ctx.font = "bold 50px sans-serif";
      ctx.fillText("Cleared!", 100, 100);
    }
    requestAnimationFrame(tick);
  };
  tick();
};

document.addEventListener("DOMContentLoaded", init);
