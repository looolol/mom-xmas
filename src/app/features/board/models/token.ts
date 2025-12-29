import {TOKENS} from '../../../core/utils/constants';
import {getRandomFrom} from '../../../core/utils/random';

export enum TokenType {
  Emoji = 'emoji',
}

export type TokenVisual = string; // can add like SVGElement or something else later

export abstract class Token {
  readonly id: string;
  readonly kind: TokenType;

  protected constructor(kind: TokenType, id: string = crypto.randomUUID()) {
    this.kind = kind;
    this.id = id;
  }

  abstract get visual(): TokenVisual;

  /**
   * Value equality (useful for reducers / comparisons)
   */
  equals(other?: Token): boolean {
    return !!other && this.kind === other.kind && this.id === other.id;
  }
}


export class EmojiToken extends Token {
  readonly emoji: string;

  constructor(emoji: string, id?: string) {
    super(TokenType.Emoji, id);
    this.emoji = emoji;
  }

  get visual(): string {
    return this.emoji;
  }

  override equals(other?: Token): boolean {
    return other instanceof EmojiToken &&
      this.id === other.id &&
      this.emoji === other.emoji;
  }


  static random(excluding: Set<string> = new Set()): EmojiToken {
    const options = TOKENS.filter(s => !excluding.has(s));
    const emoji = getRandomFrom(options);
    return new EmojiToken(emoji);
  }
}

