import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class DeleteLoginDeviceController extends GetxController {

  Future<void> deleteLoginDeviceApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.delete(
          "setting/security/loginDevice/addLoginDevice",
          params: params
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}