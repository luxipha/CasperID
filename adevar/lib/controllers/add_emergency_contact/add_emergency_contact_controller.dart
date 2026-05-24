import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class AddEmergencyContactController extends GetxController {

  Future<void> addEmergencyContactApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
        "setting/addEmergencyContact",
        params: params,
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}