import 'package:get/get.dart';
import 'package:highfedilityadevar/models/register/register_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class LoginWithPhoneController extends GetxController {
  Future<RegisterModel> hitLoginWithPhoneApi(Map<String, String> params) async {
    try {
      final response = await ApiService.post(
        "user/login?lang=en_US",
        headerMap: {"Content-Type": "application/json"},
        params: params,
      );
      print(response.toString());
      return RegisterModel.fromJson(response);
    } catch (error) {
      print(error.toString());
      throw error.toString();
    }
  }
}
