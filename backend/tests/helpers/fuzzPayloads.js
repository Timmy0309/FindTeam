const sqlInjectionPayloads = [
  "' OR '1'='1",
  "'; DROP TABLE users; --",
  "1; SELECT * FROM users",
  "admin'--",
  "' UNION SELECT NULL, email, password FROM users --",
];

const xssPayloads = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  "javascript:alert('xss')",
  '<svg onload=alert(1)>',
];

const pathTraversalPayloads = [
  '../../../etc/passwd',
  '..\\..\\windows\\system32',
  '%2e%2e%2f%2e%2e%2f',
  '....//....//etc/passwd',
];

const malformedJwtTokens = [
  '',
  'not.a.jwt',
  'Bearer invalid',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
  'null',
  'undefined',
  'a'.repeat(10000),
  '../../admin',
  "' OR 1=1 --",
];

const oversizedStrings = (maxLen = 5000) => [
  'A'.repeat(maxLen),
  'X'.repeat(maxLen * 2),
  '\u0000'.repeat(100),
  '🎮'.repeat(1000),
];

const randomIdPayloads = [
  '-1',
  '0',
  '999999999',
  'abc',
  '1.5',
  '1;DROP TABLE teams',
  'null',
  'undefined',
  '%00',
];

module.exports = {
  sqlInjectionPayloads,
  xssPayloads,
  pathTraversalPayloads,
  malformedJwtTokens,
  oversizedStrings,
  randomIdPayloads,
};
