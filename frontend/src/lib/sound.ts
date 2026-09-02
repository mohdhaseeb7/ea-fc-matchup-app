// Sounds removed per user directive
class SoundEffects {
  public enabled: boolean = false;
  playClick() {}
  playSpinTick() {}
  playMatchReveal() {}
}

export const soundFx = new SoundEffects();
