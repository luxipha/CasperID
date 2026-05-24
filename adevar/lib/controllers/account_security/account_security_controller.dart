import 'package:get/get.dart';
import 'package:highfedilityadevar/models/account_security/get_current_user_info.dart';

import '../../models/user_data/user_model.dart';
import '../../services/api_service.dart';
import '../user_data/get_shared_pref.dart';

class AccountSecurityController extends GetxController {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  Future<GetCurrentUserInfoModel> getCurrentUserInfo() async {
    UserDataModel token = await _getSharedPref.getUserData();
    print(token.authToken!.toString());
    try {
      final response = await ApiService.get(
        "user/getCurrentUserAllInfo?lang=en_US",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return GetCurrentUserInfoModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
