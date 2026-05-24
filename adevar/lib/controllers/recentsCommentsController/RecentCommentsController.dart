import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:highfedilityadevar/models/recentCommentsModel/RecentCommentsModel.dart';
import '../../services/api_service.dart';

class RecentCommentsController extends GetxController {
  Future<RecentCommentsModel> getRecentComments(
      String token, String pageNo, String size) async {
    try {
      final response = await ApiService.get(
        "/socialContact/comment/queryMyComment?lang=en_US&page=$pageNo&size=$size",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );

      return RecentCommentsModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<RecentCommentsModel> getMyRecentComments(
      String token, String pageNo, String size) async {
    try {
      final response = await ApiService.get(
        "/socialContact/comment/queryCommentMe?lang=en_US&page=$pageNo&size=$size",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );

      return RecentCommentsModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<RecentCommentsModel> getOtherReceivedComments(
      String token, String pageNo, String size, dynamic userId) async {
    try {
      final response = await ApiService.get(
        "socialContact/comment/queryUserRecCommentByUserId?lang=en_US&page=$pageNo&size=$size&userId=$userId",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );

      return RecentCommentsModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
