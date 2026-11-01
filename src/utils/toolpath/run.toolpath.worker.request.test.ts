import { afterEach, describe, expect, it, vi } from 'vitest';
import * as getToolpathModule from './get.toolpath';
import type { ToolpathWorkerMessage } from './interfaces/ToolpathWorkerMessage';
import type { ToolpathWorkerRequest } from './interfaces/ToolpathWorkerRequest';
import { runToolpathWorkerRequest } from './run.toolpath.worker.request';
import { getBoxSubpath } from './test.support/get.box.subpath';
import { newBedDrawable } from './test.support/new.bed.drawable';
import { newDrawablePaint } from './test.support/new.drawable.paint';
import { newSvgPaint } from './test.support/new.svg.paint';
import { TOOLPATH_WORKER_MESSAGE_KIND } from './toolpath.worker.constants';
import { getNewLayer } from '../layers/get.new.layer';
import { DEFAULT_CUT_ENTRY, DEFAULT_PALETTE, DEFAULT_SCORE_ENTRY } from '../palette/palette.constants';

const REQUEST_ID = 7;
const BOX_SIZE_MM = 10;
const HALF_DONE = 0.5;
const ALL_DONE = 1;
const WORKER_ERROR_TEXT = 'out of memory';

const getStrokedBox = (colour: string, paintOrder: number) => newBedDrawable({
  subpaths: [getBoxSubpath({ minX: 0, minY: 0, maxX: BOX_SIZE_MM, maxY: BOX_SIZE_MM })],
  paint: newDrawablePaint({ fill: undefined, stroke: newSvgPaint({ colour }), strokeWidth: 1 }),
  paintOrder,
});

const newCutAndScoreRequest = (): ToolpathWorkerRequest => ({
  requestId: REQUEST_ID,
  drawables: [getStrokedBox(DEFAULT_CUT_ENTRY.colour, 0), getStrokedBox(DEFAULT_SCORE_ENTRY.colour, 1)],
  warnings: [],
  layers: [
    getNewLayer(DEFAULT_CUT_ENTRY.colour, DEFAULT_PALETTE, 0),
    getNewLayer(DEFAULT_SCORE_ENTRY.colour, DEFAULT_PALETTE, 1),
  ],
});

describe(runToolpathWorkerRequest.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts the progress after each layer, then the toolpath, all with the request id', () => {
    const request: ToolpathWorkerRequest = newCutAndScoreRequest();
    const postedMessages: ToolpathWorkerMessage[] = [];

    runToolpathWorkerRequest(request, (message: ToolpathWorkerMessage) => postedMessages.push(message));

    expect(postedMessages).toEqual([
      { kind: TOOLPATH_WORKER_MESSAGE_KIND.PROGRESS, requestId: REQUEST_ID, progress: HALF_DONE },
      { kind: TOOLPATH_WORKER_MESSAGE_KIND.PROGRESS, requestId: REQUEST_ID, progress: ALL_DONE },
      {
        kind: TOOLPATH_WORKER_MESSAGE_KIND.RESULT,
        requestId: REQUEST_ID,
        toolpath: getToolpathModule.getToolpath(request.drawables, request.warnings, request.layers),
      },
    ]);
  });

  it('posts the error text with the request id when the toolpath cannot be built', () => {
    vi.spyOn(getToolpathModule, 'getToolpath').mockImplementation(() => {
      throw new Error(WORKER_ERROR_TEXT);
    });
    const postedMessages: ToolpathWorkerMessage[] = [];

    runToolpathWorkerRequest(
      newCutAndScoreRequest(),
      (message: ToolpathWorkerMessage) => postedMessages.push(message),
    );

    expect(postedMessages).toEqual([
      { kind: TOOLPATH_WORKER_MESSAGE_KIND.ERROR, requestId: REQUEST_ID, errorText: WORKER_ERROR_TEXT },
    ]);
  });
});
