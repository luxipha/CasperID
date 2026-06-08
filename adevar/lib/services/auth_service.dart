import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._();
  AuthService._();
  factory AuthService() => _instance;

  final _secureStorage = const FlutterSecureStorage();
  final _api = ApiService();

  Future<UserModel?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');
    if (userData == null) return null;
    return UserModel.fromJson(jsonDecode(userData));
  }

  Future<void> saveUser(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_data', jsonEncode(user.toJson()));
    if (user.authToken != null) {
      await prefs.setString('auth_token', user.authToken!);
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_data');
    await prefs.remove('auth_token');
    await _secureStorage.delete(key: 'passkey_credential');
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token') != null;
  }

  Future<String> getPasskeyCredentialId() async {
    return await _secureStorage.read(key: 'passkey_credential') ?? '';
  }

  Future<void> savePasskeyCredentialId(String id) async {
    await _secureStorage.write(key: 'passkey_credential', value: id);
  }

  Future<Map<String, dynamic>> beginPasskeyRegistration() async {
    return await _api.post('/passkey/register/begin');
  }

  Future<Map<String, dynamic>> finishPasskeyRegistration(
      Map<String, dynamic> credential) async {
    return await _api.post('/passkey/register/finish', body: credential);
  }

  Future<Map<String, dynamic>> beginPasskeyAuth() async {
    return await _api.post('/passkey/auth/begin');
  }

  Future<Map<String, dynamic>> finishPasskeyAuth(
      Map<String, dynamic> credential) async {
    return await _api.post('/passkey/auth/finish', body: credential);
  }

  Future<Map<String, dynamic>> sendOtp(String email) async {
    return await _api.post('/auth/send-otp', body: {'email': email});
  }

  Future<Map<String, dynamic>> verifyOtp(String email, String otp) async {
    return await _api.post('/auth/verify-otp', body: {'email': email, 'otp': otp});
  }
}
