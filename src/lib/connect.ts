export type Point = { x: number; y: number };

export type HitRect = {
  id: string;
  pairId: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ConnectStrokeEval = {
  locked: string | null;
  rejected: boolean;
  attemptDelta: number;
};

function pointInRect(p: Point, r: HitRect): boolean {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

function findHit(p: Point, rects: HitRect[]): HitRect | undefined {
  return rects.find((r) => pointInRect(p, r));
}

export function evaluateConnectPair(
  picturePairId: string,
  wordPairId: string,
  lockedPairIds: string[],
): ConnectStrokeEval {
  if (lockedPairIds.includes(picturePairId) || lockedPairIds.includes(wordPairId)) {
    return { locked: null, rejected: false, attemptDelta: 0 };
  }
  if (picturePairId === wordPairId) {
    return { locked: picturePairId, rejected: false, attemptDelta: 0 };
  }
  return { locked: null, rejected: true, attemptDelta: 1 };
}

export function evaluateConnectStroke(args: {
  stroke: Point[];
  pictures: HitRect[];
  words: HitRect[];
  lockedPairIds: string[];
}): ConnectStrokeEval {
  const noop: ConnectStrokeEval = {
    locked: null,
    rejected: false,
    attemptDelta: 0,
  };
  if (!args.stroke.length) return noop;
  const start = args.stroke[0];
  const end = args.stroke[args.stroke.length - 1];
  if (!start || !end) return noop;

  const startPic = findHit(start, args.pictures);
  const startWord = findHit(start, args.words);
  const endPic = findHit(end, args.pictures);
  const endWord = findHit(end, args.words);

  let picture: HitRect | undefined;
  let word: HitRect | undefined;
  if (startPic && endWord) {
    picture = startPic;
    word = endWord;
  } else if (startWord && endPic) {
    picture = endPic;
    word = startWord;
  } else {
    return noop;
  }

  return evaluateConnectPair(picture.pairId, word.pairId, args.lockedPairIds);
}
