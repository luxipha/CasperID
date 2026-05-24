import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class UnlockAccountController extends GetxController {

  Future<void> unlockAccountApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
          "account/unlockAccount",
          params: params
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}