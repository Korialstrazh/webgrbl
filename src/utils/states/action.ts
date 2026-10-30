/**
 * Base of every Redux action: the class is the action creator (`new X(payload)`), the action type (`X.type`)
 * and the TypeScript type of the action at once. The ts-redux-class-actions codestyle prescribes this base
 * verbatim, including its two `as` casts.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export abstract class Action<TPayload = void> {
  public static readonly type: string;

  public readonly type: string;

  public readonly payload: TPayload;

  constructor(payload: TPayload extends void ? void : TPayload) {
    this.type = (this.constructor as typeof Action).type ?? this.constructor.name;
    this.payload = payload as TPayload;
  }

  public toPlainObject(): { type: string; payload: TPayload } {
    return { type: this.type, payload: this.payload };
  }
}
