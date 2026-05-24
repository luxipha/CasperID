import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class LockAccountController extends GetxController {

  Future<void> lockAccountApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
          "account/lockAccount",
          params: params
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}