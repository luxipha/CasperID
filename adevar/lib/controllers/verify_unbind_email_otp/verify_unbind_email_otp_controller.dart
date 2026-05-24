import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class VerifyUnbindEmailOtpController extends GetxController {

  Future<void> verifyUnbindEmailOtpApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.put(
        "setting/security/mail/unbindEmail",
        params: params,
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}