import * as d from 'io-ts/Decoder';
import { pipe } from 'fp-ts/lib/function';

export const playwrightTestStatusDecoder = d.literal('passed', 'failed', 'timedOut', 'skipped', 'interrupted');

// Define a decoder for a single test results
const TestResultDecoder = d.struct({
  status: d.union(playwrightTestStatusDecoder),
});

// Define a decoder for a single test case
const TestCaseDecoder = d.struct({
  expectedStatus: d.union(playwrightTestStatusDecoder),
  results: d.array(TestResultDecoder),
});

// Define a decoder for a single test spec
const TestSpecsDecoder = d.struct({
  title: d.string,
  tests: d.array(TestCaseDecoder),
});

export interface TestSuite {
  title: string;
  file: string;
  specs: d.TypeOf<typeof TestSpecsDecoder>[];
  suites?: TestSuite[];
}

// Define a decoder for a test suite
const TestSuiteDecoder: d.Decoder<unknown, TestSuite> = d.lazy('TestSuiteDecoder', () =>
  pipe(
    d.struct({
      title: d.string,
      file: d.string,
      specs: d.array(TestSpecsDecoder),
    }),
    d.intersect(
      d.partial({
        suites: d.array(TestSuiteDecoder),
      }),
    ),
  ),
);

// Define a decoder for the stats object
const StatsDecoder = d.struct({
  startTime: d.string,
  duration: d.number,
  expected: d.number,
  skipped: d.number,
  unexpected: d.number,
  flaky: d.number,
});

// Define the main decoder for the entire report
export const playwrightReportDecoder = d.struct({
  suites: d.array(TestSuiteDecoder),
  stats: StatsDecoder,
});

export type PlaywrightReport = d.TypeOf<typeof playwrightReportDecoder>;
export type PlaywrightTestStatus = d.TypeOf<typeof playwrightTestStatusDecoder>;
