import { isEventPast, parseDateOnly } from './date-utils';

describe('date utilities', () => {
  const today = new Date(2026, 6, 18);

  it('parses date-only strings as local calendar dates', () => {
    const parsedDate = parseDateOnly('2026-07-18');

    expect(parsedDate.getFullYear()).toBe(2026);
    expect(parsedDate.getMonth()).toBe(6);
    expect(parsedDate.getDate()).toBe(18);
  });

  it('classifies yesterday as past', () => {
    expect(isEventPast('2026-07-17', today)).toBe(true);
  });

  it('does not classify today as past', () => {
    expect(isEventPast('2026-07-18', today)).toBe(false);
  });

  it('does not classify tomorrow as past', () => {
    expect(isEventPast('2026-07-19', today)).toBe(false);
  });
});
