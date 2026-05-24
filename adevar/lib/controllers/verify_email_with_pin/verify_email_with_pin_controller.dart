import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class VerifyEmailWithOtpController extends GetxController {

  Future<void> verifyEmailWithOtpApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.put(
        "setting/security/email/setEmail",
        params: params,
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}
