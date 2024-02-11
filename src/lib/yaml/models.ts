import * as d from 'io-ts/Decoder';

export const assertionDecoder = d.intersect(
  d.struct({
    assert: d.string,
  }),
)(
  d.partial({
    description: d.string,
  }),
);

export const entityDecoder = d.intersect(
  d.struct({
    code: d.string,
    feature: d.string,
  }),
)(
  d.partial({
    'specs-unit': d.record(d.array(assertionDecoder)),
    definitions: d.record(d.array(d.string)),
    description: d.string,
  }),
);

export type Entity = d.TypeOf<typeof entityDecoder>;
export type Assertion = d.TypeOf<typeof assertionDecoder>;
