/**
 * A stand-in for the browser's animation frames, for tests: the frames run only when the test runs one, at the
 * timestamp it gives, so a playback can be stepped through time without a real clock.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { act } from '@testing-library/react';
import { vi } from 'vitest';

export class AnimationFrameStub {
  // The callbacks waiting for the next frame, by their request id.
  private readonly waitingCallbacks: Map<number, FrameRequestCallback> = new Map<number, FrameRequestCallback>();

  // The id the next request gets; ids start at 1, like the browser's.
  private nextRequestId = 1;

  /** Replaces requestAnimationFrame and cancelAnimationFrame until vi.unstubAllGlobals. */
  public install(): void {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback): number => {
      const requestId: number = this.nextRequestId++;

      this.waitingCallbacks.set(requestId, callback);

      return requestId;
    });
    vi.stubGlobal('cancelAnimationFrame', (requestId: number): void => {
      this.waitingCallbacks.delete(requestId);
    });
  }

  /** How many frames were requested since the stub was made, cancelled ones included. */
  public getRequestCount(): number {
    return this.nextRequestId - 1;
  }

  /** How many callbacks wait for the next frame. */
  public getWaitingCallbackCount(): number {
    return this.waitingCallbacks.size;
  }

  /** Runs one frame at the timestamp: every callback that waited for it, inside act. */
  public runFrame(timestampMs: number): void {
    const frameCallbacks: FrameRequestCallback[] = Array.from(this.waitingCallbacks.values());

    this.waitingCallbacks.clear();
    act(() => {
      for (const frameCallback of frameCallbacks) {
        frameCallback(timestampMs);
      }
    });
  }

  /** Runs a frame at every step from the first timestamp up to and including the last one. */
  public runFrames(firstTimestampMs: number, lastTimestampMs: number, stepMs: number): void {
    for (let timestampMs = firstTimestampMs; timestampMs <= lastTimestampMs; timestampMs += stepMs) {
      this.runFrame(timestampMs);
    }
  }
}
