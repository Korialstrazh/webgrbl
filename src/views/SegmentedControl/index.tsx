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
import { SCRIPT_FOCUS_ONLY_TAB_INDEX, TAB_STOP_INDEX } from '../../utils/tab.index.constants';
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

const getKeyStep = (key: string): number => {
  if (NEXT_KEYS.includes(key)) {
    return NEXT_STEP;
  }

  return PREVIOUS_KEYS.includes(key) ? PREVIOUS_STEP : NO_STEP;
};

const canMoveSelection = (isDisabled: boolean, step: number): boolean => !isDisabled && !!step;

const getOptionClassName = (isSelected: boolean): string | undefined =>
  isSelected ? [styles.option, styles.selected].join(' ') : styles.option;

export const SegmentedControl = ({
  label,
  options,
  selectedValue,
  onSelect,
  isDisabled = false,
}: SegmentedControlProps): ReactNode => {
  const handleOptionKeyDown = (keyboardEvent: KeyboardEvent<HTMLButtonElement>, optionIndex: number): void => {
    const step: number = getKeyStep(keyboardEvent.key);

    if (!canMoveSelection(isDisabled, step)) {
      return;
    }

    keyboardEvent.preventDefault();
    const nextIndex: number = (optionIndex + step + options.length) % options.length;
    const nextOption: SegmentedOption | undefined = options[nextIndex];
    const nextButton: Element | undefined = keyboardEvent.currentTarget.parentElement?.children[nextIndex];

    if (!nextOption) {
      return;
    }

    onSelect(nextOption.value);

    if (nextButton instanceof HTMLElement) {
      nextButton.focus();
    }
  };

  // Without a selected option the group would have no tab stop, so the first option takes it.
  const hasSelectedOption: boolean = options.some((option: SegmentedOption) => option.value === selectedValue);

  return (
    <div className={styles.segmentedControl} role="radiogroup" aria-label={label}>
      {options.map((option: SegmentedOption, optionIndex: number) => {
        const isSelected: boolean = option.value === selectedValue;
        const isFirstOptionWithoutSelection: boolean = !hasSelectedOption && !optionIndex;
        const isTabStop: boolean = isSelected || isFirstOptionWithoutSelection;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={getOptionClassName(isSelected)}
            tabIndex={isTabStop ? TAB_STOP_INDEX : SCRIPT_FOCUS_ONLY_TAB_INDEX}
            disabled={isDisabled}
            onClick={() => onSelect(option.value)}
            onKeyDown={(keyboardEvent: KeyboardEvent<HTMLButtonElement>) => {
              handleOptionKeyDown(keyboardEvent, optionIndex);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
