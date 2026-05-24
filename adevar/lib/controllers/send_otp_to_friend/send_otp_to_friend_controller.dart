import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class SendOtpToFriendController extends GetxController {

  Future<void> sendOtpToFriendApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
          "account/mobile/sendFriendCode",
          params: params
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}