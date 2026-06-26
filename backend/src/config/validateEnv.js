const WEAK_SECRETS = new Set([
  'your_secret_key_change_me',
  'change_me_in_production',
  'docker_jwt_secret_change_in_production',
  'secret',
  'jwt_secret',
  'test',
]);

const validateEnv = () => {
  const errors = [];

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET не задан. Укажите его в файле .env');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET должен быть не короче 32 символов');
  } else if (WEAK_SECRETS.has(process.env.JWT_SECRET)) {
    errors.push('JWT_SECRET содержит небезопасное значение по умолчанию');
  }

  if (!process.env.DB_HOST) errors.push('DB_HOST не задан');
  if (!process.env.DB_NAME) errors.push('DB_NAME не задан');
  if (!process.env.DB_USER) errors.push('DB_USER не задан');
  if (!process.env.DB_PASSWORD) errors.push('DB_PASSWORD не задан');

  if (errors.length > 0) {
    console.error('Ошибки конфигурации окружения:');
    errors.forEach((msg) => console.error(`  - ${msg}`));
    process.exit(1);
  }
};

module.exports = { validateEnv };
