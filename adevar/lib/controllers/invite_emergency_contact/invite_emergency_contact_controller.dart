import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class InviteEmergencyContactController extends GetxController {

  Future<void> inviteEmergencyContactrApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
        "setting/inviteEmergencyContact",
        params: params,
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}