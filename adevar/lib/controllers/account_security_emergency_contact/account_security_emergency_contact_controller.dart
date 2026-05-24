import 'package:get/get.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/account_security/emergency_contact/add_energency_user_model.dart';
import 'package:highfedilityadevar/models/account_security/emergency_contact/get_emergency_contact_model.dart';
import 'package:highfedilityadevar/models/account_security/emergency_contact/invite_emergency_contact_model.dart';
import 'package:highfedilityadevar/models/account_security/emergency_contact/search_emergency_contact_model.dart';

import '../../models/user_data/user_model.dart';
import '../../services/api_service.dart';

class AccountSecurityEmergencyContactController extends GetxController {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  Future<SearchEmergencyContactModel> searchEmergencyContact(
      mobile, pageCount) async {
    UserDataModel token = await _getSharedPref.getUserData();

    print(token.authToken);
    try {
      final response = await ApiService.get(
        "setting/searchUserOfEmergencyContact?lang=en_US&mobile=$mobile&page=$pageCount&size=5",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return SearchEmergencyContactModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<AddEmergencyContactModel> addEmergencyContact(
      Map<String, dynamic> param) async {
    UserDataModel token = await _getSharedPref.getUserData();

    print(token.authToken);
    try {
      final response = await ApiService.post(
        "setting/addEmergencyContact?lang=en_US",
        params: param,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return AddEmergencyContactModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<GetEmergencyContactModel> getEmergencyContact() async {
    UserDataModel token = await _getSharedPref.getUserData();

    print(token.authToken);
    try {
      final response = await ApiService.get(
        "setting/queryAllEmergencyContact?lang=en_US",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response['data']);
      return GetEmergencyContactModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<IniviteEmergencyContactModel> inviteEmergencyContact(
      Map<String, dynamic> param) async {
    UserDataModel token = await _getSharedPref.getUserData();

    print(token.authToken);
    try {
      final response = await ApiService.post(
        "setting/inviteEmergencyContact?lang=en_US",
        params: param,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return IniviteEmergencyContactModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<IniviteEmergencyContactModel> deleteEmergencyContact(mobile) async {
    UserDataModel token = await _getSharedPref.getUserData();

    print(token.authToken);
    try {
      final response = await ApiService.delete(
        "setting/deleteEmergencyContact?lang=en_US&userMobile=${mobile.toString().replaceAll('+', "%2B")}",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return IniviteEmergencyContactModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
