import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class DeleteEmergencyContactController extends GetxController {

  Future<void> deleteEmergencyContactApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.delete(
        "setting/deleteEmergencyContact?userMobile=1320356866",
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}