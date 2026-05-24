import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class DisplayPhoneNumbersInEmergencyContactController extends GetxController {

  Future<void> displayPhoneNumbersInEmergencyContactApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.get(
          "setting/searchUserOfEmergencyContact?mobile=71",
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}