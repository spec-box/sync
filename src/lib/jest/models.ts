import * as d from "io-ts/Decoder";

export const jestSuiteStatusDecoder = d.literal(
  "passed",
  "failed",
  "pending",
  "focused",
  "skipped",
);

export const jestAssertionStatusDecoder = d.literal(
  "passed",
  "failed",
  "pending",
  "todo",
  "skipped",
);

export const jestAssertionResultDecoder = d.struct({
  title: d.string,
  fullName: d.string,
  ancestorTitles: d.array(d.string),
  status: jestAssertionStatusDecoder,
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
export type JestAssertionStatus = d.TypeOf<typeof jestAssertionStatusDecoder>;
