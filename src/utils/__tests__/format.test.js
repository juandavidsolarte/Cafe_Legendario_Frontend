import { describe, expect, it } from 'vitest';
import { formatTime } from '../format';

describe('formatTime', () => {
  it('formatea minutos menores a una hora', () => {
    expect(formatTime(25)).toBe('25 min');
  });

  it('formatea horas exactas sin minutos sobrantes', () => {
    expect(formatTime(120)).toBe('2 h');
  });

  it('formatea combinación de horas y minutos', () => {
    expect(formatTime(125)).toBe('2 h 5 min');
  });
});
