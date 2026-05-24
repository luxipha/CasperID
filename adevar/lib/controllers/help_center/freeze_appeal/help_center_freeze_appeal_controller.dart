import 'package:get/get.dart';
import 'package:highfedilityadevar/models/help_center/check_code_get_token_error_model.dart';
import 'package:highfedilityadevar/models/help_center/check_user_lock_model.dart';
import 'package:highfedilityadevar/models/help_center/send_help_feedback_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class HelpCenterFreezeAppealController extends GetxController {
  String myMobile = '';
  int isAccountLocked = 0;
  Future lockAccount(pin) async {
    try {
      final response = await ApiService.post(
        "account/lockAccount?lang=en_US",
        params: {
          "pin": pin,
          "mobile": myMobile.toString(),
        },
        headerMap: {"Content-Type": "application/json"},
      );
      update();
      if (response['flag'] == false) {
        return CheckCodeAndGetTokenErrorModel.fromJson(response);
      } else {
        return SendHelpAndFeedbackModel.fromJson(response);
      }
    } catch (error) {
      throw error.toString();
    }
  }

  Future unLockAccount(pin) async {
    try {
      final response = await ApiService.post(
        "account/unlockAccount?lang=en_US",
        params: {
          "pin": pin,
          "mobile": myMobile.toString(),
        },
        headerMap: {"Content-Type": "application/json"},
      );

      update();
      if (response['flag'] == false) {
        return CheckCodeAndGetTokenErrorModel.fromJson(response);
      } else {
        return SendHelpAndFeedbackModel.fromJson(response);
      }
    } catch (error) {
      throw error.toString();
    }
  }

  Future<CheckUserLockModel> getUserLock(phoneNumber) async {
    myMobile = phoneNumber;
    try {
      final response = await ApiService.get(
        "/account/getUserLock?lang=en_US&mobile=${phoneNumber.toString().replaceAll('+', "%2B")}",
        headerMap: {"Content-Type": "application/json"},
      );
      update();
      return CheckUserLockModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
