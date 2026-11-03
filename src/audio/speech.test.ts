import { describe, expect, it } from 'vitest';
import { chunk, cleanName, rankVoices, toSpeech, type VoiceLike } from './speech';
import { defaultProgress, migrate } from '../state/model';

const v = (name: string, lang = 'en-GB', voiceURI = `com.apple.voice.${name}`): VoiceLike => ({ name, lang, voiceURI });

describe('voice ranking', () => {
  const list = [
    v('Daniel (English (United Kingdom))', 'en-GB', 'com.apple.voice.compact.en-GB.Daniel'),
    v('Samantha', 'en-US', 'com.apple.voice.compact.en-US.Samantha'),
    v('Serena (Premium)', 'en-GB', 'com.apple.voice.premium.en-GB.Serena'),
    v('Ava (Enhanced)', 'en-US', 'com.apple.voice.enhanced.en-US.Ava'),
    v('Kate (Enhanced)', 'en-GB', 'com.apple.voice.enhanced.en-GB.Kate'),
    v('Zoe', 'en-US', 'com.apple.voice.premium.en-US.Zoe'),
    v('Amélie', 'fr-CA'),
    v('Bad News', 'en-US'), v('Zarvox', 'en-US'), v('Whisper', 'en-US'), v('Fred', 'en-US'), v('Organ', 'en-US'),
    v('Grandma (English (United Kingdom))', 'en-GB'), v('Eddy (English (US))', 'en-US'), v('Flo (Enhanced)', 'en-GB'),
  ];
  const { main, more } = rankVoices(list);

  it('puts Premium first, then Enhanced, then the rest, en-GB ahead of other accents', () => {
    expect(main.map((x) => x.name)).toEqual(['Serena (Premium)', 'Zoe', 'Kate (Enhanced)', 'Ava (Enhanced)', 'Daniel', 'Samantha']);
    expect(main[0].quality).toBe('premium');
    expect(main[1].quality).toBe('premium'); // detected from the voice ID
  });

  it('hides joke voices and non-English voices', () => {
    const names = [...main, ...more].map((x) => x.name);
    for (const joke of ['Bad News', 'Zarvox', 'Whisper', 'Fred', 'Organ', 'Amélie']) expect(names).not.toContain(joke);
  });

  it('folds robotic Eloquence voices into "more" so Automatic never picks them', () => {
    expect(more.map((x) => x.name).sort()).toEqual(['Eddy', 'Flo (Enhanced)', 'Grandma']);
    expect(main.some((x) => /grandma|eddy|flo/i.test(x.name))).toBe(false);
  });

  it('returns nothing when only joke/robotic voices exist in "main"', () => {
    expect(rankVoices([v('Zarvox', 'en-US'), v('Rocko', 'en-GB')]).main).toEqual([]);
  });
});

describe('clean names', () => {
  it('strips the language suffix', () => {
    expect(cleanName('Daniel (English (United Kingdom))')).toBe('Daniel');
    expect(cleanName('Karen (English (Australia))')).toBe('Karen');
    expect(cleanName('Serena (Premium)')).toBe('Serena (Premium)');
    expect(cleanName('Google UK English Female')).toBe('Google UK English Female');
  });
});

describe('speech text', () => {
  it('reads maths in words and drops emoji and arrows', () => {
    expect(toSpeech('3² + 4')).toBe('3 squared + 4');
    expect(toSpeech('2³')).toBe('2 to the power 3');
    expect(toSpeech('Simplify 15 : 25')).toBe('Simplify 15 to 25');
    expect(toSpeech('180 − 125 = 55°')).toBe('180 minus 125 equals 55 degrees');
    expect(toSpeech('−5 + 8')).toBe('minus 5 + 8');
    expect(toSpeech('Find 3/5 of 40.')).toBe('Find 3 over 5 of 40.');
    expect(toSpeech('📐 Next: flashcards →')).toBe('Next: flashcards,');
    expect(toSpeech('20% of 60 ÷ 2')).toBe('20 percent of 60 divided by 2');
    expect(toSpeech('Water boils at 100 °C')).toBe('Water boils at 100 degrees Celsius');
  });
  it('splits long text into chunks', () => {
    const long = Array.from({ length: 12 }, (_, i) => `Sentence number ${i} is here.`).join(' ');
    const parts = chunk(long, 80);
    expect(parts.length).toBeGreaterThan(3);
    expect(parts.join(' ')).toBe(long);
  });
});

describe('settings migration', () => {
  it('adds Listen mode defaults to old saves', () => {
    const old = { v: 1, onboarded: true, name: 'Ariya', xp: 120, muted: true };
    const p = migrate(old);
    expect(p.listen).toBe(false);
    expect(p.voiceURI).toBeNull();
    expect(p.speechRate).toBe(1);
    expect(p.xp).toBe(120);
    expect(p.muted).toBe(true);
  });
  it('repairs bad values', () => {
    const p = migrate({ ...defaultProgress(), listen: 'yes', voiceURI: 42, speechRate: 3 });
    expect(p.listen).toBe(false);
    expect(p.voiceURI).toBeNull();
    expect(p.speechRate).toBe(1);
  });
  it('moves the old Space / Arcade / Map looks to the pastel themes', () => {
    expect(migrate({ theme: 'space' }).theme).toBe('blossom');
    expect(migrate({ theme: 'arcade' }).theme).toBe('mint');
    expect(migrate({ theme: 'map' }).theme).toBe('peach');
    expect(migrate({ theme: 'mint' }).theme).toBe('mint');
    expect(migrate({ theme: 'nonsense' }).theme).toBe('blossom');
    expect(migrate({}).theme).toBe('blossom');
  });
  it('restarts the plan from Day 1 but keeps finished work', () => {
    const p = migrate({ planStart: '2026-10-31', missions: { '2026-11-01': [], '2026-11-03': [{ id: 'a', subject: 'maths', kind: 'quiz', minutes: 20 }], '2026-11-04': [] },
      missionsDone: { '2026-11-04': ['x'] } });
    expect(p.planStart).toBe('2026-11-03');
    expect(p.missions['2026-11-01']).toBeDefined(); // before Day 1: left alone
    expect(p.missions['2026-11-03']).toBeUndefined(); // re-planned from Day 1
    expect(p.missions['2026-11-04']).toBeDefined(); // has finished work: kept
  });
  it('keeps good values', () => {
    const p = migrate({ ...defaultProgress(), listen: true, voiceURI: 'com.apple.voice.premium.en-GB.Serena', speechRate: 0.8 });
    expect(p.listen).toBe(true);
    expect(p.voiceURI).toBe('com.apple.voice.premium.en-GB.Serena');
    expect(p.speechRate).toBe(0.8);
  });
});
