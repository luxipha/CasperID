import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class SetPasswordController extends GetxController {

  Future<void> setPasswordApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
          "setting/security/setPin",
          params: params
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}