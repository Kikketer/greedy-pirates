class Militia extends Enemy {
  static walkRightAnimation: Image[] = assets.animation`Militia Walk`;
  static walkLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Militia Walk`);
  static attackRightAnimation: Image[] = assets.animation`Militia Shoot`;
  static attackLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Militia Shoot`);
  static deathRightAnimation: Image[] = assets.animation`Militia Die`;
  static deathLeftAnimation: Image[] = Utils.flipAnimation(assets.animation`Militia Die`);
  static parrySound: music.SoundEffect = music.createSoundEffect(
    WaveShape.Noise,
    5000,
    5000,
    255,
    0,
    100,
    SoundExpressionEffect.Vibrato,
    InterpolationCurve.Curve
  );

  static directionChangeInterval: number = 1000;
  static attackDelayMin: number = 4000;
  static attackDelayMax: number = 6000;

  constructor({ x, y, target, riches }: { x: number; y: number; target?: Pirate; riches?: number }) {
    super({ x, y, target, sprite: sprites.create(assets.animation`Militia Walk`[0]), riches });

    // Most often we spawn to the right, so walk left
    this.walk("left");
  }

  public hit({ attacker, damage }: { attacker: Pirate; damage: number }): boolean {
    super.hit({ attacker, damage });

    if (this.health <= 0) {
      animation.runImageAnimation(
        this.sprite,
        this._facing === "right" ? Militia.deathRightAnimation : Militia.deathLeftAnimation,
        100,
        false
      );
    }

    return true;
  }

  public render() {
    // No Undead walking!
    if (this.health <= 0 || this._isAttacking) return;

    super.render();

    // Attack randomly
    if (control.millis() - this._lastAttackTick > this._nextAttackTime) {
      this._lastAttackTick = control.millis();
      this._nextAttackTime = Math.randomRange(Militia.attackDelayMin, Militia.attackDelayMax);
      this.attack();
    }
  }

  public lootTheBody() {
    if (this.riches > 0) {
      TreasureStats.currentTreasure = {
        onBoat: TreasureStats.currentTreasure.onBoat,
        onIsland: TreasureStats.currentTreasure.onIsland,
        inPocket: TreasureStats.currentTreasure.inPocket + this.riches,
      };
      TreasureStats.show({});
      this.riches = 0;
      const oldX = this.sprite.x;
      const oldY = this.sprite.y;

      this.sprite.destroy();
      if (this._facing === "left") {
        this.sprite = sprites.create(assets.image`Militia Broken and Broke Left`);
      } else {
        this.sprite = sprites.create(assets.image`Militia Broken and Broke`);
      }

      this.sprite.x = oldX;
      this.sprite.y = oldY;
    }
  }

  protected walk(direction?: "left" | "right") {
    super.walk(direction);

    if (this._facing === "left") {
      animation.runImageAnimation(this.sprite, Militia.walkLeftAnimation, 500, true);
    } else {
      animation.runImageAnimation(this.sprite, Militia.walkRightAnimation, 500, true);
    }
  }

  protected attack() {
    super.attack();

    // Play the fire animation
    if (this._facing === "right") {
      animation.runImageAnimation(this.sprite, Militia.attackRightAnimation, 100, false);
    } else {
      animation.runImageAnimation(this.sprite, Militia.attackLeftAnimation, 100, false);
    }

    // Slightly after the animation we check to see if we hit
    setTimeout(() => {
      // Make sure we didn't die in this tiny delay:
      if (this.health > 0 && this._currentTarget && this.sprite) {
        // bigCrash or sonar....
        music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.InBackground);

        // Check to see that our target is in range and fire the hit
        if (Math.abs(this.sprite.y - this._currentTarget.sprite.y) < 20) {
          // scene.cameraShake(2, 500)
          this._currentTarget.hit(this, 1);
        }
      }
    }, (Militia.attackRightAnimation.length / 2) * 100);

    // Resume walking
    setTimeout(() => {
      this._isAttacking = false;
      if (this.health > 0 && this._currentTarget && this.sprite) {
        this.walk();
      }
    }, Militia.attackRightAnimation.length * 100);
  }
}
