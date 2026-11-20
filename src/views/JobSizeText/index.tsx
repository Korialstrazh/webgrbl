/**
 * Shows the size of a job as one line of text, or nothing while there is no size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getJobSizeText } from '../../utils/toolpath/get.job.size.text';
import type { JobSizeTextProps } from './interfaces/JobSizeTextProps';
import styles from './styles.module.scss';

export const JobSizeText = (props: JobSizeTextProps): ReactNode => {
  const { size } = props;
  const { t } = useTranslation();

  if (!size) {
    return null;
  }

  return <p className={styles.jobSize}>{getJobSizeText(size, t)}</p>;
};
