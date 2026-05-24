import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class GetTokenFromEmergencyOtpController extends GetxController {

  Future<void> getTokenFromEmergencyOtpApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
          "account/mobile/checkCodeAndGetToken",
          params: params
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}