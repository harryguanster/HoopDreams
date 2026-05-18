type Listener = (heroVisible: boolean) => void;
const listeners = new Set<Listener>();
let heroVisible = true;

export const mascotStore = {
  setHeroVisible(v: boolean) {
    if (heroVisible === v) return;
    heroVisible = v;
    listeners.forEach(l => l(v));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
  get heroVisible() { return heroVisible; },
};
