import 'dart:convert';

import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:highfedilityadevar/models/me_user_model/ChangeProfileImageModel.dart';
import 'package:highfedilityadevar/models/me_user_model/GetUserInfoModel.dart';
import 'package:highfedilityadevar/models/me_user_model/UpdateUserProfileModel.dart';
import '../../models/me_user_model/DeleteUserProfile.dart';
import '../../services/api_service.dart';
import 'UsersPreviousProfileModel.dart';

class UpdateUserProfileController extends GetxController {
  Future<UserPreviousProfileModel> getUserProfile(String token) async {
    try {
      final response = await ApiService.get(
        "/user/queryUserLogos?lang=en_US",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("previousProfileResponse $response");
      return UserPreviousProfileModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<DeleteUserProfile> removeUserProfile(
      String token, Map<String, dynamic> params) async {
    try {
      final response = await ApiService.deleteJson(
          "/user/deleteUserLogo?lang=en_US",
          headerMap: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          params: params);
      print("DeleteProfileResponse $response");
      return DeleteUserProfile.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<GetUserInfoModel> getUserInfo(String token) async {
    try {
      final response = await ApiService.get(
        "/setting/userInfo/showAll?lang=en_US",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("getUserInfoResponse $response");
      return GetUserInfoModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<ChangeProfileImageModel> changeProfileImage(
      String token, String logoId) async {
    try {
      final response = await ApiService.put(
        "/user/chengeLogo/?lang=en_US&logoId=$logoId",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("changeProfileImageResponse $response");
      return ChangeProfileImageModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<UpdateUserProfileModel> updateUserInfo(
      String token, Map<String, dynamic> params) async {
    try {
      String jsonToBeSent = json.encode(params);
      print("newData $jsonToBeSent");
      final response = await ApiService.putPostNew(
          "/setting/userInfo/update?lang=en_US",
          headerMap: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          params: params);
      print("updateUserInfoResponse $response");
      return UpdateUserProfileModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
