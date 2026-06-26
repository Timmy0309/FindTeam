const fs = require('fs');
const path = require('path');

class FuzzReporter {
  constructor(globalConfig, options) {
    this.globalConfig = globalConfig;
    this.options = options;
    this.results = {
      generatedAt: new Date().toISOString(),
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
      suites: [],
    };
  }

  onRunComplete(contexts, results) {
    this.results.summary = {
      total: results.numTotalTests,
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      skipped: results.numPendingTests,
      durationMs: results.testResults.reduce((sum, r) => sum + (r.perfStats?.end - r.perfStats?.start || 0), 0),
    };

    this.results.suites = results.testResults.map((suite) => ({
      file: path.relative(process.cwd(), suite.testFilePath),
      status: suite.numFailingTests > 0 ? 'failed' : 'passed',
      tests: suite.testResults.map((test) => ({
        name: test.fullName,
        status: test.status,
        durationMs: test.duration,
        failureMessages: test.failureMessages,
      })),
    }));

    const reportsDir = path.resolve(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, 'fuzz-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2), 'utf8');

    const mdPath = path.join(reportsDir, 'fuzz-report.md');
    const md = [
      '# Fuzz Test Report',
      '',
      `Generated: ${this.results.generatedAt}`,
      '',
      '## Summary',
      '',
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total | ${this.results.summary.total} |`,
      `| Passed | ${this.results.summary.passed} |`,
      `| Failed | ${this.results.summary.failed} |`,
      `| Skipped | ${this.results.summary.skipped} |`,
      `| Duration (ms) | ${this.results.summary.durationMs || 0} |`,
      '',
      '## Suites',
      '',
      ...this.results.suites.map((s) => `- **${s.file}**: ${s.status} (${s.tests.length} tests)`),
      '',
    ].join('\n');
    fs.writeFileSync(mdPath, md, 'utf8');
  }
}

module.exports = FuzzReporter;
