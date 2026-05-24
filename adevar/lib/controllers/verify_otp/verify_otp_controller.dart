import 'package:get/get.dart';
import 'package:highfedilityadevar/models/verify_otp/verify_otp_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class VerifyOtpController extends GetxController {

  Future<VerifyOtpModel> hitVerifyOtpApi(Map<String,String>params) async{
    try {
      print(params);
      final response = await ApiService.post(
        "user/loginCode?lang=en_US",
        headerMap:  {"Content-Type": "application/json"},
        params: params,
      );
      print(response);
      return VerifyOtpModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}