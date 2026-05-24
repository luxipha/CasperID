import 'dart:convert';
import 'dart:developer';

import 'package:get/get.dart';
import 'package:highfedilityadevar/models/account_security/change_pin/verify_old_pin_model.dart';
import 'package:highfedilityadevar/models/help_center/check_code_get_token_error_model.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

import '../user_data/get_shared_pref.dart';

class ChangePinPasswordController extends GetxController {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());
  Future<void> changePinPasswordApi(Map<String, String> params) async {
    try {
      print(params);
      final response =
          await ApiService.put("setting/security/changePin", params: params);
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future verifyOldPinApi(Map<String, String> params) async {
    UserDataModel token = await _getSharedPref.getUserData();

    print(token.authToken);
    try {
      print(params);
      final response = await ApiService.putPost(
        "setting/security/changePin-verifyOldPin?lang=en_US",
        params: params,
        headerMap: {
          "content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      if (response['flag'] == true) {
        return VerifyOldPinModel.fromJson(response);
      } else {
        return CheckCodeAndGetTokenErrorModel.fromJson(response);
      }
    } catch (error) {
      throw error.toString();
    }
  }

  Future<VerifyOldPinModel> changeNewPin(Map<String, String> params) async {
    UserDataModel token = await _getSharedPref.getUserData();

    print(token.authToken);
    try {
      print(params);
      final response = await ApiService.putPost(
        "setting/security/changePin-doChange?lang=en_US",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return VerifyOldPinModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<VerifyOldPinModel> setPin(Map<String, String> params) async {
    UserDataModel token = await _getSharedPref.getUserData();

    print(token.authToken);
    try {
      print(params);
      final response = await ApiService.post(
        "setting/security/setPin?lang=en_US",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return VerifyOldPinModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
