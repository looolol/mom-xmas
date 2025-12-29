import {EmojiToken, Token, TokenType} from './token';

describe('Token base class', () => {
  class TestToken extends Token {
    constructor(kind: TokenType, id?: string) {
      super(kind, id);
    }

    override get visual() {
      return 'test';
    }
  }

  it('equals returns false if other is undefined', () => {
    const token = new TestToken(TokenType.Emoji, 'id1');
    expect(token.equals(undefined)).toBeFalse();
  });

  it('equals returns false if kinds differ', () => {
    const token1 = new TestToken(TokenType.Emoji, 'id1');
    const token2 = new TestToken('different-kind' as TokenType, 'id1');
    expect(token1.equals(token2)).toBeFalse();
  });

  it('equals returns false if ids differ', () => {
    const token1 = new TestToken(TokenType.Emoji, 'id1');
    const token2 = new TestToken(TokenType.Emoji, 'id2');
    expect(token1.equals(token2)).toBeFalse();
  });

  it('equals returns true if ids and kinds match', () => {
    const token1 = new TestToken(TokenType.Emoji, 'id1');
    const token2 = new TestToken(TokenType.Emoji, 'id1');
    expect(token1.equals(token2)).toBeTrue();
  });
});

describe('EmojiToken subclass', () => {

  it('visual getter returns emoji', () => {
    const emoji = '😀';
    const token = new EmojiToken(emoji);
    expect(token.visual).toBe(emoji);
  });

  it('equals returns true for tokens with same id and emoji', () => {
    const id = 'id1';
    const emoji = '😀';
    const token1 = new EmojiToken(emoji, id);
    const token2 = new EmojiToken(emoji, id);
    expect(token1.equals(token2)).toBeTrue();
  });

  it('equals returns false if emojis differ', () => {
    const id = 'id1';
    const token1 = new EmojiToken('😀', id);
    const token2 = new EmojiToken('😎', id);
    expect(token1.equals(token2)).toBeFalse();
  });

  it('random excludes provided tokens', () => {
    const excluded = new Set<string>(['🍪', '🌏', '🔥', '🎠', '⭐']);
    const token = EmojiToken.random(excluded);
    expect(token.emoji === '😈').toBeTrue();
  })
});
