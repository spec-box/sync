import * as d from 'io-ts/Decoder';

export const testplaneTestStatusDecoder = d.literal('success', 'fail', 'skipped', 'error');

export const testplaneTestResultDecoder = d.intersect(
  d.struct({
    suitePath: d.array(d.string),
    fullName: d.string,
    browserId: d.string,
    file: d.string,
    duration: d.number,
    meta: d.intersect(
      d.struct({
        browserVersion: d.string,
        pid: d.number,
        testXReqId: d.string,
        traceparent: d.string,
        platform: d.string,
        url: d.string,
      }),
    )(
      d.partial({
        'tus-internal': d.struct({
          accounts: d.array(
            d.struct({
              login: d.string,
              uid: d.string,
            }),
          ),
        }),
        tus: d.struct({
          uid: d.string,
          login: d.string,
          auth: d.boolean,
        }),
      }),
    ),
    startTime: d.number,
    status: testplaneTestStatusDecoder,
    url: d.string,
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
  }),
);

export const testplaneReportDecoder = d.record(testplaneTestResultDecoder);

export type TestplaneReport = d.TypeOf<typeof testplaneReportDecoder>;
export type TestplaneTestStatus = d.TypeOf<typeof testplaneTestStatusDecoder>;
