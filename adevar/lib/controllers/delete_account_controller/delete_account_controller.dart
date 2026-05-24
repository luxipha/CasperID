import 'package:get/get.dart';
import 'package:highfedilityadevar/models/account_security/get_current_user_info.dart';
import 'package:highfedilityadevar/models/help_center/check_code_get_token_error_model.dart';
import 'package:highfedilityadevar/models/register/register_model.dart';

import '../../models/user_data/user_model.dart';
import '../../services/api_service.dart';
import '../user_data/get_shared_pref.dart';

class DeleteAccountController extends GetxController {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  Future deleteAccount({required String pin}) async {
    UserDataModel token = await _getSharedPref.getUserData();
    print(token.authToken!.toString());
    try {
      final response = await ApiService.delete(
        "user/disuseAccount?lang=en_US",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
        params: {
          "pin": pin,
        },
      );
      print(response);
      if (response['flag'] = true) {
        return RegisterModel.fromJson(response);
      } else {
        return CheckCodeAndGetTokenErrorModel.fromJson(response);
      }
    } catch (error) {
      throw error.toString();
    }
  }
}
