import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class SendOtpToUnboundEmailController extends GetxController {

  Future<void> sendOtpToUnboundApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
        "setting/security/mail/sendUnbindEmailCode",
        params: params,
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}