const game = document.getElementById('game');
const spaceship = document.getElementById('spaceship');
const propellant = document.querySelector('.propellant');
const hudLives = document.getElementById('lives');
const hudScore = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScore = document.getElementById('final-score');
const restartButton = document.getElementById('restart');

let lives = 3;
let score = 0;
let asteroids = [];
let fragments = [];
let lasers = [];
let isGameOver = false;
let hyperspaceCooldown = 0;

const spaceshipSpeed = 5;
const asteroidSpeed = 2;
const fragmentSpeed = 3;
const laserSpeed = 10;
const asteroidSpawnRate = 1000;
const hyperspaceCooldownTime = 5000;

let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
  Hyperspace: false
};

// Initialize spaceship position
let spaceshipX = window.innerWidth / 2;
let spaceshipY = window.innerHeight / 2;
spaceship.style.left = `${spaceshipX}px`;
spaceship.style.top = `${spaceshipY}px`;

// Handle keyboard input
document.addEventListener('keydown', (e) => {
  if (e.code in keys) keys[e.code] = true;
  if (e.code === 'KeyH') hyperspace();
});

document.addEventListener('keyup', (e) => {
  if (e.code in keys) keys[e.code] = false;
});

// Update game state
function update() {
  if (isGameOver) return;

  // Move spaceship
  if (keys.ArrowUp) {
    spaceshipY -= spaceshipSpeed;
    propellant.style.opacity = 1;
    propellant.style.height = '30px';
  } else if (keys.ArrowDown) {
    spaceshipY += spaceshipSpeed;
    propellant.style.opacity = 1;
    propellant.style.height = '20px';
  } else {
    propellant.style.opacity = 0;
  }

  if (keys.ArrowLeft) spaceshipX -= spaceshipSpeed;
  if (keys.ArrowRight) spaceshipX += spaceshipSpeed;

  // Keep spaceship within bounds
  spaceshipX = Math.max(0, Math.min(window.innerWidth, spaceshipX));
  spaceshipY = Math.max(0, Math.min(window.innerHeight, spaceshipY));

  spaceship.style.left = `${spaceshipX}px`;
  spaceship.style.top = `${spaceshipY}px`;

  // Shoot laser
  if (keys.Space && lasers.length < 1) {
    shootLaser();
  }

  // Update asteroids
  asteroids.forEach((asteroid, index) => {
    asteroid.y += asteroidSpeed;
    asteroid.element.style.top = `${asteroid.y}px`;

    // Check collision with spaceship
    if (checkCollision(spaceshipX, spaceshipY, asteroid.x, asteroid.y, 20, asteroid.size)) {
      loseLife();
      destroyAsteroid(index);
    }

    // Remove asteroid if out of bounds
    if (asteroid.y > window.innerHeight) {
      asteroid.element.remove();
      asteroids.splice(index, 1);
    }
  });

  // Update fragments
  fragments.forEach((fragment, index) => {
    fragment.y += fragmentSpeed;
    fragment.element.style.top = `${fragment.y}px`;

    // Check collision with spaceship
    if (checkCollision(spaceshipX, spaceshipY, fragment.x, fragment.y, 10, fragment.size)) {
      loseLife();
      destroyFragment(index);
    }

    // Remove fragment if out of bounds
    if (fragment.y > window.innerHeight) {
      fragment.element.remove();
      fragments.splice(index, 1);
    }
  });

  // Update lasers
  lasers.forEach((laser, index) => {
    laser.y -= laserSpeed;
    laser.element.style.top = `${laser.y}px`;

    // Check collision with asteroids
    asteroids.forEach((asteroid, asteroidIndex) => {
      if (checkCollision(laser.x, laser.y, asteroid.x, asteroid.y, 10, asteroid.size)) {
        destroyAsteroid(asteroidIndex);
        laser.element.remove();
        lasers.splice(index, 1);
        score += asteroid.size * 10;
        hudScore.textContent = score;
      }
    });

    // Check collision with fragments
    fragments.forEach((fragment, fragmentIndex) => {
      if (checkCollision(laser.x, laser.y, fragment.x, fragment.y, 5, fragment.size)) {
        destroyFragment(fragmentIndex);
        laser.element.remove();
        lasers.splice(index, 1);
        score += fragment.size * 5;
        hudScore.textContent = score;
      }
    });

    // Remove laser if out of bounds
    if (laser.y < 0) {
      laser.element.remove();
      lasers.splice(index, 1);
    }
  });

  // Hyperspace cooldown
  if (hyperspaceCooldown > 0) {
    hyperspaceCooldown -= 16; // Approximate 60 FPS
  }

  requestAnimationFrame(update);
}

// Check collision between two objects
function checkCollision(x1, y1, x2, y2, radius1, radius2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < radius1 + radius2;
}

// Lose a life
function loseLife() {
  lives--;
  hudLives.textContent = lives;
  if (lives <= 0) {
    gameOver();
  }
}

// Game over
function gameOver() {
  isGameOver = true;
  gameOverScreen.style.display = 'block';
  finalScore.textContent = score;
}

// Restart game
restartButton.addEventListener('click', () => {
  location.reload();
});

// Shoot laser
function shootLaser() {
  const laser = document.createElement('div');
  laser.className = 'laser';
  laser.style.left = `${spaceshipX}px`;
  laser.style.top = `${spaceshipY}px`;
  game.appendChild(laser);
  lasers.push({ x: spaceshipX, y: spaceshipY, element: laser });
}

// Spawn asteroid
function spawnAsteroid() {
  const size = Math.random() * 30 + 20;
  const asteroid = document.createElement('div');
  asteroid.className = 'asteroid';
  asteroid.style.width = `${size}px`;
  asteroid.style.height = `${size}px`;
  asteroid.style.left = `${Math.random() * window.innerWidth}px`;
  asteroid.style.top = `-${size}px`;
  game.appendChild(asteroid);
  asteroids.push({ x: parseFloat(asteroid.style.left), y: parseFloat(asteroid.style.top), size, element: asteroid });
}

// Destroy asteroid
function destroyAsteroid(index) {
  const asteroid = asteroids[index];
  asteroid.element.remove();
  asteroids.splice(index, 1);

  // Create fragments
  for (let i = 0; i < 3; i++) {
    const fragmentSize = asteroid.size / 2;
    const fragment = document.createElement('div');
    fragment.className = 'fragment';
    fragment.style.width = `${fragmentSize}px`;
    fragment.style.height = `${fragmentSize}px`;
    fragment.style.left = `${asteroid.x}px`;
    fragment.style.top = `${asteroid.y}px`;
    game.appendChild(fragment);
    fragments.push({ x: asteroid.x, y: asteroid.y, size: fragmentSize, element: fragment });
  }
}

// Destroy fragment
function destroyFragment(index) {
  const fragment = fragments[index];
  fragment.element.remove();
  fragments.splice(index, 1);
}

// Hyperspace feature
function hyperspace() {
  if (hyperspaceCooldown > 0) return;

  // Teleport spaceship to random location
  spaceshipX = Math.random() * window.innerWidth;
  spaceshipY = Math.random() * window.innerHeight;
  spaceship.style.left = `${spaceshipX}px`;
  spaceship.style.top = `${spaceshipY}px`;

  // Small chance of malfunction (collision with asteroid)
  if (Math.random() < 0.1) {
    asteroids.forEach((asteroid, index) => {
      if (checkCollision(spaceshipX, spaceshipY, asteroid.x, asteroid.y, 20, asteroid.size)) {
        loseLife();
        destroyAsteroid(index);
      }
    });
  }

  hyperspaceCooldown = hyperspaceCooldownTime;
}

// Start game loop
setInterval(spawnAsteroid, asteroidSpawnRate);
update();