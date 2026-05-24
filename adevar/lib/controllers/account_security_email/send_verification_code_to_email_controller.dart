import 'package:get/get.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/account_security/change_email/new_email_set_model.dart';
import 'package:highfedilityadevar/models/account_security/change_email/verify_email_model.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

import '../../models/account_security/change_email/account_security_model.dart';

class SendVerificationCodeToEmailController extends GetxController {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  Future<AccountSecurityModel> sendVerificationCodeToOldEmailApi(
      Map<String, String> params) async {
    UserDataModel token = await _getSharedPref.getUserData();
    print(token.authToken);
    try {
      print(params);
      final response = await ApiService.post(
        "setting/security/email/sendEmailVerificationCode?lang=en_US",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return AccountSecurityModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<VerifyEmailOTPModel> checkEmailVerificationCodeApi(
      Map<String, String> params) async {
    UserDataModel token = await _getSharedPref.getUserData();
    print(token.authToken);
    try {
      print(params);
      final response = await ApiService.post(
        "setting/security/email/checkEmailVerification?lang=en_US",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return VerifyEmailOTPModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<AccountSecurityModel> sendVerificationCodeToEmailApi(
      Map<String, String> params) async {
    UserDataModel token = await _getSharedPref.getUserData();
    print(token.authToken);
    try {
      print(params);
      final response = await ApiService.post(
        "setting/security/email/sendSetEmailCode?lang=en_US",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return AccountSecurityModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<NewEmailSetModel> setNewEmail(Map<String, String> params) async {
    UserDataModel token = await _getSharedPref.getUserData();
    print(token.authToken);
    try {
      print(params);
      final response = await ApiService.putPost(
        "setting/security/email/setEmail?lang=en_US",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return NewEmailSetModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
