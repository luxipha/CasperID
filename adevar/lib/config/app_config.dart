class AppConfig {
  AppConfig._();

  static const String appName = 'CasperID';
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3001/api',
  );
}
