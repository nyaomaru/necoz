const dataSelector = <T extends string>(attribute: T) => `[${attribute}]` as const;
const classSelector = <T extends string>(className: T) => `.${className}` as const;

export const SCENE_DOM_ATTRIBUTES = {
  walker: 'data-nyaomaru-walker',
  spriteVariant: 'data-sprite-variant',
  hero: {
    start: 'data-nyaomaru-start',
    target: 'data-nyaomaru-target',
    mobileTarget: 'data-nyaomaru-mobile-target',
    block1: 'data-nyaomaru-block-1',
    block2: 'data-nyaomaru-block-2',
    block3: 'data-nyaomaru-block-3',
    block4: 'data-nyaomaru-block-4',
  },
  work: {
    anchor: 'data-work-scene-anchor',
    phase: 'data-work-scene-phase',
    display: 'data-work-scene-display',
    mobileTarget: 'data-work-mobile-target',
    mobileClampTarget: 'data-work-mobile-clamp-target',
    mobileOrigin: 'data-work-mobile-origin',
    exit: 'data-nyaomaru-work-exit',
    step: 'data-nyaomaru-work-step',
  },
  studio: {
    scene: 'data-nyaomaru-studio-scene',
    step: 'data-nyaomaru-studio-step',
    blockFive: 'data-nyaomaru-studio-block-five',
    blockSix: 'data-nyaomaru-studio-block-six',
    blockFiveStep: 'data-studio-walker-block-five-step',
    blockSixStep: 'data-studio-walker-block-six-step',
    blockSevenStep: 'data-studio-walker-step',
    desk: 'data-nyaomaru-studio-desk',
    poop: 'data-nyaomaru-studio-poop',
    questionMark: 'data-nyaomaru-studio-question-mark',
  },
  contact: {
    scene: 'data-nyaomaru-contact-scene',
    step: 'data-nyaomaru-contact-step',
    heart: 'data-nyaomaru-contact-heart',
    manya: 'data-nyaomaru-contact-manya',
    footer: 'data-nyaomaru-contact-footer',
    goalFish: 'data-nyaomaru-goal-fish',
    goalFlag: 'data-nyaomaru-goal-flag',
    goalFishBone: 'data-nyaomaru-goal-fish-bone',
  },
} as const;

export const SCENE_DOM_CLASSES = {
  blockShape: {
    cell: 'block-shape__cell',
    emptyCell: 'block-shape__cell--empty',
  },
  work: {
    activeBlockThree: 'block-three',
    firstRow: 'block-three-1',
    thirdRow: 'block-three-3',
    workIcon: 'icon-work',
    plumberIcon: 'icon-plumbing',
    shotIcon: 'icon-shot',
  },
} as const;

export const WORK_SCENE_PHASES = {
  hidden: 'hidden',
  reveal: 'reveal',
} as const;

export const SCENE_DOM_SELECTORS = {
  walker: dataSelector(SCENE_DOM_ATTRIBUTES.walker),
  hero: {
    start: dataSelector(SCENE_DOM_ATTRIBUTES.hero.start),
    target: dataSelector(SCENE_DOM_ATTRIBUTES.hero.target),
    mobileTarget: dataSelector(SCENE_DOM_ATTRIBUTES.hero.mobileTarget),
    block1: dataSelector(SCENE_DOM_ATTRIBUTES.hero.block1),
    block2: dataSelector(SCENE_DOM_ATTRIBUTES.hero.block2),
    block3: dataSelector(SCENE_DOM_ATTRIBUTES.hero.block3),
  },
  work: {
    anchor: dataSelector(SCENE_DOM_ATTRIBUTES.work.anchor),
    phaseTarget: dataSelector(SCENE_DOM_ATTRIBUTES.work.phase),
    display: dataSelector(SCENE_DOM_ATTRIBUTES.work.display),
    mobileTarget: dataSelector(SCENE_DOM_ATTRIBUTES.work.mobileTarget),
    mobileClampTarget: dataSelector(SCENE_DOM_ATTRIBUTES.work.mobileClampTarget),
    mobileOrigin: dataSelector(SCENE_DOM_ATTRIBUTES.work.mobileOrigin),
    exit: dataSelector(SCENE_DOM_ATTRIBUTES.work.exit),
    step: dataSelector(SCENE_DOM_ATTRIBUTES.work.step),
    activeBlockThree: classSelector(SCENE_DOM_CLASSES.work.activeBlockThree),
    firstRow: classSelector(SCENE_DOM_CLASSES.work.firstRow),
    thirdRow: classSelector(SCENE_DOM_CLASSES.work.thirdRow),
    workIcon: classSelector(SCENE_DOM_CLASSES.work.workIcon),
    plumberIcon: classSelector(SCENE_DOM_CLASSES.work.plumberIcon),
    shotIcon: classSelector(SCENE_DOM_CLASSES.work.shotIcon),
  },
  studio: {
    scene: dataSelector(SCENE_DOM_ATTRIBUTES.studio.scene),
    step: dataSelector(SCENE_DOM_ATTRIBUTES.studio.step),
    blockTarget: `${dataSelector(SCENE_DOM_ATTRIBUTES.studio.blockFive)}, ${dataSelector(
      SCENE_DOM_ATTRIBUTES.studio.blockSix,
    )}`,
    blockStep: `${dataSelector(SCENE_DOM_ATTRIBUTES.studio.blockFiveStep)}, ${dataSelector(
      SCENE_DOM_ATTRIBUTES.studio.blockSixStep,
    )}`,
    blockSevenStep: dataSelector(SCENE_DOM_ATTRIBUTES.studio.blockSevenStep),
    desk: dataSelector(SCENE_DOM_ATTRIBUTES.studio.desk),
    poop: dataSelector(SCENE_DOM_ATTRIBUTES.studio.poop),
    questionMark: dataSelector(SCENE_DOM_ATTRIBUTES.studio.questionMark),
  },
  contact: {
    scene: dataSelector(SCENE_DOM_ATTRIBUTES.contact.scene),
    step: dataSelector(SCENE_DOM_ATTRIBUTES.contact.step),
    heart: dataSelector(SCENE_DOM_ATTRIBUTES.contact.heart),
    manya: dataSelector(SCENE_DOM_ATTRIBUTES.contact.manya),
    footer: dataSelector(SCENE_DOM_ATTRIBUTES.contact.footer),
    goalFish: dataSelector(SCENE_DOM_ATTRIBUTES.contact.goalFish),
    goalFlag: dataSelector(SCENE_DOM_ATTRIBUTES.contact.goalFlag),
    goalFishBone: dataSelector(SCENE_DOM_ATTRIBUTES.contact.goalFishBone),
  },
  blockShape: {
    filledCell: `${classSelector(SCENE_DOM_CLASSES.blockShape.cell)}:not(${classSelector(
      SCENE_DOM_CLASSES.blockShape.emptyCell,
    )})`,
  },
} as const;
