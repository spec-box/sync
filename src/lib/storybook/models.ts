import * as d from 'io-ts/Decoder';

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

export type Story = d.TypeOf<typeof storyDecoder>;
export type StorybookIndex = d.TypeOf<typeof storybookIndexDecoder>;
