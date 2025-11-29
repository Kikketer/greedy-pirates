namespace Utils {
  export function getArrayOfLength(length: number): number[] {
    const result = [];
    for (let i = 0; i < length; i++) {
      result.push(i);
    }
    return result;
  }

  // Used to re-use an animation but flip it horizontally (x)
  export function flipAnimation(frames: Image[]) {
    return frames.map((frame: Image) => {
      frame.flipX();
      return frame;
    });
  }

  export function getDistance(pointA: { x: number; y: number }, pointB: { x: number; y: number }) {
    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;

    return Math.abs(Math.sqrt(dx * dx + dy * dy));
  }

  export function swapAnimationColors(anim: Image[], fromColor: number, toColor: number) {
    anim.map((frame) => frame.replace(fromColor, toColor));
    return anim;
  }

  export function getHitEnemies({ pirate, enemies }: { pirate: Pirate; enemies: Enemy[] }) {
    const dirPix = pirate.direction === "left" ? -1 : 1;
    // The hit zone is the pirate "sword" box: [center, right|left] and [top, bottom]
    const hitXZone = [pirate.sprite.x, pirate.sprite.x + 13 * dirPix];
    // The sword is only near the top of the sprite, we don't kill with feet
    const hitYZone = [pirate.sprite.y - 4, pirate.sprite.y + 2];

    // manually check each enemy to see if they overlap, also check for parry
    return enemies.reduce((hitEnemies, enemy) => {
      // Don't hurt the dead, that's just mean
      if (enemy.health <= 0 && enemy.riches <= 0) {
        return hitEnemies;
      }

      if (
        pirate.direction === "right" &&
        enemy.sprite.x >= hitXZone[0] &&
        enemy.sprite.x <= hitXZone[1] &&
        // Bottom of pirate is overlapping the top of the enemy (and opposite)
        hitYZone[1] >= enemy.sprite.y - enemy.sprite.height / 2 &&
        hitYZone[0] <= enemy.sprite.y + enemy.sprite.height / 2
      ) {
        hitEnemies.push(enemy);
      } else if (
        pirate.direction === "left" &&
        enemy.sprite.x <= hitXZone[0] &&
        enemy.sprite.x >= hitXZone[1] &&
        // Same vertical check as the right side
        hitYZone[1] >= enemy.sprite.y - enemy.sprite.height / 2 &&
        hitYZone[0] <= enemy.sprite.y + enemy.sprite.height / 2
      ) {
        hitEnemies.push(enemy);
      }

      return hitEnemies;
    }, []);
  }
}
