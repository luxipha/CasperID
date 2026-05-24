import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

import '../../models/user_data/user_model.dart';
import '../user_data/get_shared_pref.dart';

class AddLoginDeviceController extends GetxController {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  Future<void> addLoginDeviceApi(Map<String, String> params) async {
    try {
      print(params);
      UserDataModel userDataModel = await _getSharedPref.getUserData();
      final response = await ApiService.post(
        "setting/security/loginDevice/addLoginDevice",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
