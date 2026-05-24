import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class RegisterUserProfilePictureController extends GetxController {

  Future<void> sendUserInformationApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
        "head",
        params: params,
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}
