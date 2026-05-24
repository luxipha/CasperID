import 'package:get/get.dart';

import '../../models/accessTimeModel/GetAccessTimeModel.dart';
import '../../models/accessTimeModel/SetAccessTimeModel.dart';
import '../../services/api_service.dart';

class AccessTimeController extends GetxController {
  Future<SetAccessTimeModel> setAccessTime(
      String token, Map<String, String> params) async {
    try {
      final response = await ApiService.putPost(
          "/setting/userPersonSetting/setAccessTime?lang=en_US",
          headerMap: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          params: params);
      print("CloseInvitationResponse: $response");
      return SetAccessTimeModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<GetAccessTimeModel> getAccessTime(String token) async {
    try {
      final response = await ApiService.get(
        "/setting/userPersonSetting/queryAccessTime?lang=en_US",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("CloseInvitationResponse: $response");
      return GetAccessTimeModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
