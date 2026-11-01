import { describe, expect, it } from 'vitest';
import { getSanitizedSvg } from '../svg/get.sanitized.svg';
import type { SanitizedSvg } from '../svg/interfaces/SanitizedSvg';
import type { SvgImportFailure } from '../svg/interfaces/SvgImportFailure';
import { isSvgImportFailure } from '../svg/is.svg.import.failure';
import { getImportedProjectFile } from './get.imported.project.file';
import { getObjectCorners } from './get.object.corners';
import { getProjectFileText } from './get.project.file.text';
import type { ImportedProjectFile } from './interfaces/ImportedProjectFile';
import type { ObjectCornerPoint } from './interfaces/ObjectCornerPoint';
import type { ProjectDocument } from './interfaces/ProjectDocument';
import type { ProjectObject } from './interfaces/ProjectObject';
import { newProjectObject } from './new.project.object';
import {
  DEFAULT_OBJECT_SVG_TEXT,
  FULL_TURN_DEG,
  MAX_OBJECT_NAME_LENGTH,
  MAX_OBJECT_SIZE_MM,
  MAX_PROJECT_NAME_LENGTH,
  MAX_PROJECT_OBJECTS,
  MIN_OBJECT_SIZE_MM,
  PROJECT_FILE_FORMAT,
  PROJECT_FILE_VERSION,
} from './project.constants';

const PROJECT_NAME = 'Coasters';
const OBJECT_NAME = 'Leaf';
const RAW_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="20mm"><rect width="5" height="5"/></svg>';
const SCRIPT_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="20mm">'
  + '<script>alert(1)</script><rect width="5" height="5"/></svg>';
const SCRIPT_TAG_NAME = '<script';
const OVERSIZED_MM = 9000;
const UNDERSIZED_MM = 0.01;
const UNKNOWN_FIELD_NAME = 'injected';
const SVG_WIDTH_MM = 10;
const SVG_HEIGHT_MM = 20;
const HUGE_ROTATION_DEG = 1e306;
const NEGATIVE_ROTATION_DEG = -30;
const NORMALIZED_NEGATIVE_ROTATION_DEG = 330;
const LARGE_X_MM = 123456;
const INFINITE_NUMBER_TEXT = '1e999';

const getSanitizedSvgText = (svgText: string): string => {
  const sanitizeResult: SanitizedSvg | SvgImportFailure = getSanitizedSvg(svgText);

  return isSvgImportFailure(sanitizeResult) ? '' : sanitizeResult.svgText;
};

const SANITIZED_SVG_TEXT: string = getSanitizedSvgText(RAW_SVG_TEXT);

const newFileObject = (overrides: Partial<ProjectObject> = {}): ProjectObject =>
  newProjectObject({ name: OBJECT_NAME, svgText: SANITIZED_SVG_TEXT, intrinsicWidthMm: SVG_WIDTH_MM,
    intrinsicHeightMm: SVG_HEIGHT_MM, xMm: 5, yMm: 6, widthMm: 30, heightMm: 40,
    rotationDeg: 15, ...overrides });

/** The file of one object as a plain value a test can break field by field. */
const getFileValue = (objects: ProjectObject[] = [newFileObject()]): Record<string, unknown> =>
  JSON.parse(getProjectFileText(PROJECT_NAME, { objects }));

const getImportedValue = (fileValue: unknown): ImportedProjectFile | undefined =>
  getImportedProjectFile(JSON.stringify(fileValue));

const getObjectWithoutId = ({ id: _id, ...objectFields }: ProjectObject): Omit<ProjectObject, 'id'> => objectFields;

describe(getProjectFileText.name, () => {
  it('writes pretty JSON with the format fields first and a stable field order per object', () => {
    const fileText: string = getProjectFileText(PROJECT_NAME, { objects: [newFileObject()] });
    const fileValue: Record<string, unknown> = JSON.parse(fileText);
    const fileObjects: object[] = fileValue.objects as object[];

    expect(fileText.startsWith(`{\n  "format": "${PROJECT_FILE_FORMAT}",\n  "version": ${PROJECT_FILE_VERSION},`))
      .toBe(true);
    expect(Object.keys(fileValue)).toEqual(['format', 'version', 'name', 'objects']);
    expect(Object.keys(fileObjects[0] ?? {})).toEqual([
      'id', 'name', 'svgText', 'intrinsicWidthMm', 'intrinsicHeightMm', 'xMm', 'yMm', 'widthMm', 'heightMm',
      'rotationDeg',
    ]);
  });
});

describe(getImportedProjectFile.name, () => {
  it('reads back an equal document with new ids', () => {
    const firstObject: ProjectObject = newFileObject();
    const secondObject: ProjectObject = newFileObject({ name: 'Stem', xMm: 50 });
    const projectDocument: ProjectDocument = { objects: [firstObject, secondObject] };

    const importedFile: ImportedProjectFile | undefined = getImportedProjectFile(
      getProjectFileText(PROJECT_NAME, projectDocument),
    );

    expect(importedFile?.name).toBe(PROJECT_NAME);
    expect(importedFile?.document.objects.map(getObjectWithoutId))
      .toEqual(projectDocument.objects.map(getObjectWithoutId));
    expect(importedFile?.document.objects[0]?.id).not.toBe(firstObject.id);
    expect(importedFile?.document.objects[1]?.id).not.toBe(secondObject.id);
    expect(importedFile?.document.objects[0]?.id).not.toBe(importedFile?.document.objects[1]?.id);
  });

  it('reads a file with no objects', () => {
    expect(getImportedValue(getFileValue([]))).toEqual({ name: PROJECT_NAME, document: { objects: [] } });
  });

  it('cleans a script out of an object SVG', () => {
    const importedFile: ImportedProjectFile | undefined = getImportedValue(
      getFileValue([newFileObject({ svgText: SCRIPT_SVG_TEXT })]),
    );
    const importedSvgText: string = importedFile?.document.objects[0]?.svgText ?? SCRIPT_TAG_NAME;

    expect(importedSvgText).not.toContain(SCRIPT_TAG_NAME);
    expect(importedSvgText).toBe(getSanitizedSvgText(SCRIPT_SVG_TEXT));
  });

  it('trims the name', () => {
    expect(getImportedValue({ ...getFileValue(), name: `  ${PROJECT_NAME} ` })?.name).toBe(PROJECT_NAME);
  });

  it('trims an object name and cuts it to the object name limit', () => {
    const paddedName: string = `  ${'n'.repeat(MAX_OBJECT_NAME_LENGTH + 1)}  `;
    const imported: ImportedProjectFile | undefined = getImportedValue(
      getFileValue([newFileObject({ name: paddedName })]),
    );

    expect(imported?.document.objects[0]?.name).toBe('n'.repeat(MAX_OBJECT_NAME_LENGTH));
  });

  it('keeps an object name of exactly the limit and trims a short one', () => {
    const limitName: string = 'm'.repeat(MAX_OBJECT_NAME_LENGTH);
    const imported: ImportedProjectFile | undefined = getImportedValue(
      getFileValue([newFileObject({ name: limitName }), newFileObject({ name: ` ${OBJECT_NAME} ` })]),
    );

    expect(imported?.document.objects.map((projectObject: ProjectObject): string => projectObject.name)).toEqual([
      limitName,
      OBJECT_NAME,
    ]);
  });

  it('limits the box size to the allowed range', () => {
    const importedFile: ImportedProjectFile | undefined = getImportedValue(getFileValue([
      newFileObject({ widthMm: OVERSIZED_MM, heightMm: UNDERSIZED_MM }),
    ]));
    const importedObject: ProjectObject | undefined = importedFile?.document.objects[0];

    expect(importedObject?.widthMm).toBe(MAX_OBJECT_SIZE_MM);
    expect(importedObject?.heightMm).toBe(MIN_OBJECT_SIZE_MM);
  });

  it('takes the intrinsic size from the SVG, not from the file', () => {
    const importedFile: ImportedProjectFile | undefined = getImportedValue(
      getFileValue([newFileObject({ intrinsicWidthMm: 0, intrinsicHeightMm: -5 })]),
    );
    const importedObject: ProjectObject | undefined = importedFile?.document.objects[0];

    expect(importedObject?.intrinsicWidthMm).toBe(SVG_WIDTH_MM);
    expect(importedObject?.intrinsicHeightMm).toBe(SVG_HEIGHT_MM);
  });

  it('brings a huge rotation into one turn, so the corners stay finite', () => {
    const importedFile: ImportedProjectFile | undefined = getImportedValue(
      getFileValue([newFileObject({ rotationDeg: HUGE_ROTATION_DEG })]),
    );
    const importedObject: ProjectObject | undefined = importedFile?.document.objects[0];
    const rotationDeg: number = importedObject?.rotationDeg ?? Number.NaN;
    const cornerValues: number[] = importedObject
      ? getObjectCorners(importedObject).flatMap((corner: ObjectCornerPoint): number[] => [corner.x, corner.y])
      : [];

    expect(rotationDeg >= 0 && rotationDeg < FULL_TURN_DEG).toBe(true);
    expect(cornerValues).toHaveLength(8);
    expect(cornerValues.every(Number.isFinite)).toBe(true);
  });

  it('turns a negative rotation into the same angle within one turn', () => {
    const importedFile: ImportedProjectFile | undefined = getImportedValue(
      getFileValue([newFileObject({ rotationDeg: NEGATIVE_ROTATION_DEG })]),
    );

    expect(importedFile?.document.objects[0]?.rotationDeg).toBe(NORMALIZED_NEGATIVE_ROTATION_DEG);
  });

  it('drops fields the file format does not know', () => {
    const fileValue: Record<string, unknown> = getFileValue();
    const fileObjects: unknown[] = Array.isArray(fileValue.objects) ? fileValue.objects : [];
    const importedFile: ImportedProjectFile | undefined = getImportedValue({
      ...fileValue,
      objects: [{ ...Object(fileObjects[0]), [UNKNOWN_FIELD_NAME]: true }],
    });

    expect(importedFile?.document.objects[0]).not.toHaveProperty(UNKNOWN_FIELD_NAME);
  });

  it('rejects malformed JSON', () => {
    expect(getImportedProjectFile('{"format": ')).toBeUndefined();
  });

  it('rejects another format or another version', () => {
    expect(getImportedValue({ ...getFileValue(), format: 'other-app' })).toBeUndefined();
    expect(getImportedValue({ ...getFileValue(), version: PROJECT_FILE_VERSION + 1 })).toBeUndefined();
  });

  it('rejects a file with a missing or mistyped field', () => {
    const { widthMm: _widthMm, ...objectWithoutWidth } = newFileObject();

    expect(getImportedValue({ ...getFileValue(), objects: [objectWithoutWidth] })).toBeUndefined();
    expect(getImportedValue({ ...getFileValue(), objects: [{ ...newFileObject(), xMm: '5' }] })).toBeUndefined();
    expect(getImportedValue({ ...getFileValue(), name: undefined })).toBeUndefined();
    expect(getImportedValue({ ...getFileValue(), objects: {} })).toBeUndefined();
    expect(getImportedValue(null)).toBeUndefined();
  });

  it('rejects a number too large to be finite', () => {
    const fileText: string = getProjectFileText(PROJECT_NAME, { objects: [newFileObject({ xMm: LARGE_X_MM })] });

    expect(getImportedProjectFile(fileText.replace(String(LARGE_X_MM), INFINITE_NUMBER_TEXT))).toBeUndefined();
  });

  it('rejects an empty or too long name', () => {
    expect(getImportedValue({ ...getFileValue(), name: '   ' })).toBeUndefined();
    expect(getImportedValue({ ...getFileValue(), name: 'a'.repeat(MAX_PROJECT_NAME_LENGTH + 1) })).toBeUndefined();
  });

  it('accepts the maximum number of objects and rejects one more', () => {
    const maximumObjects: ProjectObject[] = Array.from({ length: MAX_PROJECT_OBJECTS }, () => newFileObject());

    expect(getImportedValue(getFileValue(maximumObjects))?.document.objects).toHaveLength(MAX_PROJECT_OBJECTS);
    expect(getImportedValue(getFileValue([...maximumObjects, newFileObject()]))).toBeUndefined();
  });

  it('rejects the whole file when one object SVG is not a usable SVG', () => {
    expect(getImportedValue(getFileValue([newFileObject(), newFileObject({ svgText: DEFAULT_OBJECT_SVG_TEXT })])))
      .toBeUndefined();
    expect(getImportedValue(getFileValue([newFileObject({ svgText: '<html></html>' })]))).toBeUndefined();
  });
});
