import * as d from 'io-ts/Decoder';
// TODO: надо импоритовать из @spec-box/sync
import { attributeKeyPartDecoder, literalKeyPartDecoder } from '../config/models';

export const storybookConfigDecoder = d.struct({
  indexPath: d.string,
  keys: d.array(d.union(literalKeyPartDecoder, attributeKeyPartDecoder)),
});

export const storyDecoder = d.intersect(
  d.struct({
    type: d.literal('story', 'docs'),
    id: d.string,
    name: d.string,
    title: d.string,
    importPath: d.string,
  }),
)(
  d.partial({
    tags: d.array(d.string),
  }),
);

export const storybookIndexDecoder = d.struct({
  v: d.number,
  entries: d.record(storyDecoder),
});

export type StorybookConfig = d.TypeOf<typeof storybookConfigDecoder>;
export type Story = d.TypeOf<typeof storyDecoder>;
export type StorybookIndex = d.TypeOf<typeof storybookIndexDecoder>;
