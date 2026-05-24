import 'package:get/get.dart';
import '../../models/me_user_model/UserProfileModel.dart';
import '../../services/api_service.dart';

class UserProfileController extends GetxController{
  Future<UserProfileModel> getUserProfile(String token) async{
    try {
      final response = await ApiService.get(
        "/home/me/MeModuleView?lang=en_US",
        headerMap:  {
          "Authorization": token,
          "Content-Type": "application/json"
        },
      );
      print("invitationOpenResponse $response");
      return UserProfileModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}