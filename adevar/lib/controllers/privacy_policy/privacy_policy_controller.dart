import 'package:get/get.dart';
import 'package:highfedilityadevar/models/privacy_policy/privacy_policy_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class PrivacyPolicyController extends GetxController {
  PrivacyPolicyModel? privacyPolicyModel;

  void getPrivacyPolicy() async {
    try {
      final response =
          await ApiService.get("system/getPrivacyPolicy?lang=en_US");
      privacyPolicyModel = PrivacyPolicyModel.fromJson(response);
      update();
    } catch (e) {
      throw e.toString();
    }
  }
}
