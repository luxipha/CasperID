import 'package:get/get.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/me_user_model/UserProfileModel.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';

import '../../models/home/myPersonView_model.dart';
import '../../models/me_user_model/LatMeetingModel.dart';
import '../../models/me_user_model/RecentCommentsModel.dart';
import '../../models/me_user_model/RecentContactsModel.dart';
import '../../services/api_service.dart';

class UserProfileController extends GetxController {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  Future<UserProfileModel> getUserProfile(String token) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      final response = await ApiService.get(
        "/home/me/MeModuleView?lang=en_US",
        headerMap: {
          "Authorization": userDataModel.authToken.toString(),
          "Content-Type": "application/json"
        },
      );
      print("userProfileResponse: $response");
      return UserProfileModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<MyPersonViewModel> getMyPersonView(String token) async {
    try {
      final response = await ApiService.get(
        "/home/myPersonView?lang=en_US",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("myPersonViewResponse: $response");
      return MyPersonViewModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<LastMeetingModel> getLastMeeting(String token) async {
    try {
      final response = await ApiService.get(
        "/home/getLastMeeting?lang=en_US",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("lastMeetingResponse: $response");
      return LastMeetingModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<RecentContactsModel> getRecentContacts(String token) async {
    try {
      final response = await ApiService.get(
        "/home/recentContactsHomeView?lang=en_US",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("recentContactsResponse: $response");
      return RecentContactsModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<RecentCommentsModel> getRecentComments(String token) async {
    try {
      final response = await ApiService.get(
        "/home/getRecentComment?lang=en_US",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("recentCommentsResponse: $response");
      return RecentCommentsModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
