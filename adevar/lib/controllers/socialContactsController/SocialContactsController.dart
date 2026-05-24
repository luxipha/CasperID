import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:highfedilityadevar/controllers/socialContactsController/RemoveFriendModel.dart';
import 'package:highfedilityadevar/models/recent_contact_page_model/RecentContactsModel.dart';

import '../../services/api_service.dart';

class SocialContactController extends GetxController {

  Future<RecentContactsModel> getRecentContacts(
      String token, String pageNo, String size) async {
    try {
      final response = await ApiService.get(
        "/socialContact/friends/friendsFindPage?lang=en_US&page=$pageNo&size=$size",
        headerMap: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
      );

      print("recentContactsResponse $response");
      return RecentContactsModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }


  Future<RemoveFriendModel> removeRecentContact(Map<String,String> params,String token) async {
    try {
      final response = await ApiService.delete(
          "/socialContact/friends/deleteMyFriend?lang=en_US",
          headerMap: {
            "Authorization": token,
            "Content-Type": "application/json"
          },

          params: params
      );

      print("recentContactsResponse $response");
      return RemoveFriendModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }


  Future<RemoveFriendModel> blockRecentContact(String friendUserId,String token) async {
    try {
      final response = await ApiService.put(
          "/setting/userPersonSetting/addBlackList?lang=en_US&blackUserId=$friendUserId",
          headerMap: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
      );
      print("blockUserResponse $response");
      return RemoveFriendModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }


}
