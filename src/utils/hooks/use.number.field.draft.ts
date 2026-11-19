/**
 * The draft of a number field: while the user edits, the field shows exactly what was typed, an empty field included,
 * and only blur or Enter corrects it; until then the stored value stays the last valid one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useState } from 'react';
import type { NumberFieldDraft } from './interfaces/NumberFieldDraft';

export interface NumberFieldDraftControls {
  /** What the field shows: the draft while editing, else the stored value. */
  fieldValue: number | null;
  /** What was typed, null for a cleared field, undefined while not editing. */
  typedValue: number | null | undefined;
  changeDraft: (fieldValue: number | null) => void;
  clearDraft: () => void;
}

export const useNumberFieldDraft = (storedValue: number): NumberFieldDraftControls => {
  const [draft, setDraft] = useState<NumberFieldDraft | undefined>(undefined);

  return {
    fieldValue: draft ? draft.fieldValue : storedValue,
    typedValue: draft?.fieldValue,
    changeDraft: (fieldValue: number | null): void => setDraft({ fieldValue }),
    clearDraft: (): void => setDraft(undefined),
  };
};
