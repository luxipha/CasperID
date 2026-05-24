import 'package:get/get.dart';
import 'package:highfedilityadevar/models/manageAccessSettingsModel/ManageAccessSettingsModel.dart';

import '../../models/manageAccessSettingsModel/SetManageAccessSettings.dart';
import '../../services/api_service.dart';



class ManageAccessSettingsController extends GetxController {

  Future<ManageAccessSettingsModel> getManageAccessSettings(String token) async{
    try {
      final response = await ApiService.get(
        "/setting/userPersonSetting/queryAccessSetting?lang=en_US",
        headerMap:  {
          "Authorization": token,
          "Content-Type": "application/json"
        },
      );
      print("invitationOpenResponse $response");
      return ManageAccessSettingsModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<SetManageAccessSettings> setManageAccessSettings(String token,Map<String,String> params) async{
    try {
      final response = await ApiService.putPost(
        "/setting/userPersonSetting/setAccessSetting?lang=en_US",
        params: params,

        headerMap:  {
          "Authorization": token,
          "Content-Type": "application/json"
        },

      );
      print("setManageSettings $response");
      return SetManageAccessSettings.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}