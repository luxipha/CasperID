import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class ConfirmNewPhoneIdentityController extends GetxController {

  Future<void> confirmNewPhoneIdentityApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
          "account/mobile/checkNewMobile",
          params: params
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}