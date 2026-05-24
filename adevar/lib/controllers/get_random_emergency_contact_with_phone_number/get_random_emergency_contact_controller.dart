import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class GetEmergencyContactController extends GetxController {

  Future<void> getEmergencyContactApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
        "account/queryRandomEmergency",
        params: params
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}