import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class SendVerificationCodeToEmailController extends GetxController {

  Future<void> sendVerificationCodeToEmailApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
        "setting/security/email/sendSetEmailCode",
        params: params,
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}