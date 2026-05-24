import 'package:get/get.dart';
import 'package:highfedilityadevar/models/user_agreement/user_agreement_controller_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class UserAgreementController extends GetxController {
  UserAgreeementModel? userAgreeementModel;

  void getUserAgreement() async {
    try {
      final response =
          await ApiService.get("system/getUserAgreement?lang=en_US");
      userAgreeementModel = UserAgreeementModel.fromJson(response);
      update();
    } catch (e) {
      throw e.toString();
    }
  }
}
