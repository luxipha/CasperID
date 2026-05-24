import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class GetEmergencyContactController extends GetxController {

  Future<void> getEmergencyContactApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.get(
        "setting/queryAllEmergencyContact",
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}