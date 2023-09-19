import * as d from "io-ts/Decoder";

export const jestSuiteStatusDecoder = d.literal(
  "passed",
  "failed",
  "pending",
  "focused"
);

export const jestAssertionStatusDecoder = d.literal(
  "passed",
  "failed",
  "pending"
);

export const jestAssertionResultDecoder = d.struct({
  title: d.string,
  fullName: d.string,
  ancestorTitles: d.array(d.string),
  status: jestAssertionStatusDecoder,
  duration: d.nullable(d.number),
  invocations: d.number,
});

export const jestTestResultDecoder = d.struct({
  name: d.string,
  status: jestSuiteStatusDecoder,
  message: d.string,
  startTime: d.number,
  endTime: d.number,
  assertionResults: d.array(jestAssertionResultDecoder),
});

export const jestReportDecoder = d.struct({
  startTime: d.number,
  numTotalTests: d.number,
  testResults: d.array(jestTestResultDecoder),
});

export type JestReport = d.TypeOf<typeof jestReportDecoder>;
