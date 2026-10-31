/**
 * A row of mutually exclusive options with radio semantics: one tab stop, arrow keys move the selection.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { KeyboardEvent, ReactNode } from 'react';
import type { SegmentedOption } from './interfaces/SegmentedOption';
import styles from './styles.module.scss';

interface SegmentedControlProps {
  /** The accessible name of the group. */
  label: string;
  options: SegmentedOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  isDisabled?: boolean;
}

const ARROW_RIGHT_KEY = 'ArrowRight';
const ARROW_DOWN_KEY = 'ArrowDown';
const ARROW_LEFT_KEY = 'ArrowLeft';
const ARROW_UP_KEY = 'ArrowUp';
const NEXT_KEYS: readonly string[] = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY];
const PREVIOUS_KEYS: readonly string[] = [ARROW_LEFT_KEY, ARROW_UP_KEY];
const NEXT_STEP = 1;
const PREVIOUS_STEP = -1;
const NO_STEP = 0;
const FOCUSABLE_TAB_INDEX = 0;
const NOT_FOCUSABLE_TAB_INDEX = -1;

const getKeyStep = (key: string): number => {
  if (NEXT_KEYS.includes(key)) {
    return NEXT_STEP;
  }

  return PREVIOUS_KEYS.includes(key) ? PREVIOUS_STEP : NO_STEP;
};

export const SegmentedControl = ({
  label,
  options,
  selectedValue,
  onSelect,
  isDisabled = false,
}: SegmentedControlProps): ReactNode => {
  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, optionIndex: number): void => {
    const step: number = getKeyStep(event.key);

    if (isDisabled || !step) {
      return;
    }

    event.preventDefault();
    const nextIndex: number = (optionIndex + step + options.length) % options.length;
    const nextOption: SegmentedOption | undefined = options[nextIndex];
    const nextButton: Element | undefined = event.currentTarget.parentElement?.children[nextIndex];

    if (!nextOption) {
      return;
    }

    onSelect(nextOption.value);

    if (nextButton instanceof HTMLElement) {
      nextButton.focus();
    }
  };

  return (
    <div className={styles.segmentedControl} role="radiogroup" aria-label={label}>
      {options.map((option: SegmentedOption, optionIndex: number) => {
        const isSelected: boolean = option.value === selectedValue;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={[styles.option, isSelected ? styles.selected : ''].join(' ')}
            tabIndex={isSelected ? FOCUSABLE_TAB_INDEX : NOT_FOCUSABLE_TAB_INDEX}
            disabled={isDisabled}
            onClick={() => onSelect(option.value)}
            onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => handleOptionKeyDown(event, optionIndex)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
