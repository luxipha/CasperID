import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:highfedilityadevar/models/black_list_model/BlackListModel.dart';

import '../../models/black_list_model/DeleteUserFromBlackListModel.dart';
import '../../models/black_list_model/SearchUserListModel.dart';
import '../../models/black_list_model/addUserInBlackListModel.dart';
import '../../services/api_service.dart';

class BlackListController extends GetxController {
  Future<BlackListModel> getBlackList(
      String token, String pageNo, String size) async {
    try {
      final response = await ApiService.get(
        "/setting/userPersonSetting/queryBlackList?lang=en_US&page=$pageNo&size=$size",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("backListResponse $response");
      return BlackListModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<DeleteUserFromBlackListModel> deleteUserFromBlackList(
      String token, String userId) async {
    try {
      final response = await ApiService.put(
        "/setting/userPersonSetting/deleteBlackList?lang=en_US&blackUserId=$userId",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("backListResponse $response");
      return DeleteUserFromBlackListModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<SearchUserListModel> searchUser(String token, String mobileNo) async {
    try {
      final response = await ApiService.get(
        "/setting/searchUserOfEmergencyContact?lang=en_US&mobile=$mobileNo&page=1&size=10",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("searchUserResponse $response");
      return SearchUserListModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<AddUserInBlackListModel> addUserInBlackList(
      String token, String blackUserId) async {
    try {
      final response = await ApiService.put(
        "/setting/userPersonSetting/addBlackList?lang=en_US&blackUserId=$blackUserId",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("searchUserResponse $response");
      return AddUserInBlackListModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
