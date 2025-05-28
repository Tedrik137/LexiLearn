export const requiredXP = (level: number) => {
  return 100 * level * 1.25;
};

export const checkLevelUp = (xp: number, level: number) => {
  console.log(
    `checkLevelUp: Input totalPotentialXP=${xp}, currentLevel=${level}`
  );

  let reqXP = requiredXP(level);

  while (xp >= reqXP) {
    xp -= reqXP;
    level++;
    reqXP = Math.floor(reqXP * 1.25);
  }
  const newCalculatedLevel = level;
  const xpForNewLevel = xp; // This should be the XP *within* the new level, or total XP depending on your system

  console.log(
    `checkLevelUp: Output newLevel=${newCalculatedLevel}, xp=${xpForNewLevel}`
  );

  return { level: newCalculatedLevel, xp: xpForNewLevel };
};
