import 'package:get/get.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/account_security/change_phone_number/verify_otp_sent_to_phone_model.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

import '../../models/account_security/change_phone_number/send_verification_code_model.dart';

class ChangePhoneNumberController extends GetxController {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  Future<SendVerificationCodeToPhoneModel>
      sendVerificationCodeToPhoneApi() async {
    UserDataModel token = await _getSharedPref.getUserData();

    print(token.authToken);
    try {
      final response = await ApiService.post(
        "account/mobile/sendCode?lang=en_US",
        params: {},
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return SendVerificationCodeToPhoneModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<SendVerificationCodeToPhoneModel> sendVerificationCodeToNewPhoneApi(
      Map<String, String> params) async {
    UserDataModel token = await _getSharedPref.getUserData();

    print(token.authToken);
    try {
      final response = await ApiService.post(
        "account/mobile/sendCodeToNewMobile?lang=en_US",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return SendVerificationCodeToPhoneModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<VerifyOTPSentToPhoneModel> verifyCodeForChangeMobile(
      Map<String, String> params) async {
    UserDataModel token = await _getSharedPref.getUserData();
    print(token.authToken);
    try {
      final response = await ApiService.post(
        "account/checkSmsCodeGetCer?lang=en_US",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return VerifyOTPSentToPhoneModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<SendVerificationCodeToPhoneModel> verifyCodeForChangeNewMobile(
      Map<String, String> params) async {
    UserDataModel token = await _getSharedPref.getUserData();
    print(token.authToken);
    try {
      final response = await ApiService.post(
        "account/mobile/onlineChangeMobile?lang=en_US",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return SendVerificationCodeToPhoneModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
