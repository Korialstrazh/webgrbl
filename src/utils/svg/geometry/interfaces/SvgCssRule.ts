/**
 * One simple CSS rule of a style element: a selector, its weight and its declarations.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SvgCssRule {
  /** One simple selector of the rule: type, class or id parts only. */
  selector: string;
  /** How specific the selector is; higher wins. */
  specificity: number;
  /** Position of the rule in the document; a later rule wins at equal specificity. */
  position: number;
  /** Property name to value. */
  declarations: Record<string, string>;
}
