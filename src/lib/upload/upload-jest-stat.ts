import {
  SpecBoxWebApi,
  SpecBoxWebApiModelStatAutotestsStatUploadData,
} from "../../api";
import { ApiConfig } from "../config/models";
import { JestReport } from "../jest/models";

export const uploadJestStat = async (
  jestReport: JestReport,
  config: ApiConfig
) => {
  const { host, project } = config;
  const { startTime, numTotalTests, testResults } = jestReport;

  // считаем суммарную длительность всех тестов
  // (как при выполнении в одном потоке)
  const totalDuration = testResults.reduce(
    (sum, { startTime, endTime }) => sum + (endTime - startTime),
    0
  );

  const client = new SpecBoxWebApi(host, { allowInsecureConnection: true });

  const body: SpecBoxWebApiModelStatAutotestsStatUploadData = {
    timestamp: new Date(startTime),
    assertionsCount: numTotalTests,
    duration: totalDuration,
  };

  await client.statAutotestsUpload({ project, body });
};
