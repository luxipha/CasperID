import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import '../../models/badgesModel/GetBadgesModel.dart';
import '../../services/api_service.dart';

class BadgesController extends GetxController {
  Future<GetBadgesModel> getAllBadges(
      String token, String pageNo, String size) async {
    try {
      final response = await ApiService.get(
        "/userInfo/badge/getAllBadge?lang=en_US&page=$pageNo&size=$size",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("getAllBadgesResponse $response");
      return GetBadgesModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<GetBadgesModel> getEarnedBadges(
      String token, String pageNo, String size) async {
    try {
      final response = await ApiService.get(
        "/userInfo/badge/getCurrentUserBadge?lang=en_US&page=$pageNo&size=$size",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("earnedBadgesResponse $response");
      return GetBadgesModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<GetBadgesModel> setEarnedBadge(
      String token, Map<String, String> params) async {
    try {
      final response = await ApiService.putPost(
          "/userInfo/badge/enableBadge?lang=en_US",
          headerMap: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          params: params);
      print("earnedBadgesResponse $response");
      return GetBadgesModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
