import * as d from 'io-ts/Decoder';

export const testplaneTestStatusDecoder = d.literal('success', 'fail', 'skipped', 'error');

export const testplaneTestResultDecoder = d.intersect(
  d.struct({
    suitePath: d.array(d.string),
    fullName: d.string,
    browserId: d.string,
    file: d.nullable(d.string),
    duration: d.nullable(d.number),
    meta: d.UnknownRecord,
    startTime: d.number,
    status: testplaneTestStatusDecoder,
  }),
)(
  d.partial({
    errorReason: d.struct({
      message: d.string,
      stack: d.string,
    }),
    retries: d.array(
      d.struct({
        message: d.string,
        stack: d.string,
        startTime: d.number,
        duration: d.number,
      }),
    ),
    url: d.string,
  }),
);

export const testplaneReportDecoder = d.record(testplaneTestResultDecoder);

export type TestplaneReport = d.TypeOf<typeof testplaneReportDecoder>;
export type TestplaneTestStatus = d.TypeOf<typeof testplaneTestStatusDecoder>;
