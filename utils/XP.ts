export const requiredXP = (level: number) => {
  return 100 * level * 1.25;
};

export const checkLevelUp = (xp: number, level: number) => {
  let reqXP = requiredXP(level);

  while (xp >= reqXP) {
    xp -= reqXP;
    level++;
    reqXP = Math.floor(reqXP * 1.25);
  }

  return { level, xp };
};
