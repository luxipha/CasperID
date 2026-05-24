import 'package:get/get.dart';
import 'package:highfedilityadevar/models/logged_in_devices/logged_in_devices_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

import '../../models/user_data/user_model.dart';
import '../user_data/get_shared_pref.dart';

class GetLoggedInDeviceController extends GetxController {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());
  LoggedInDevicesModel ?loggedInDevicesModel ;

  Future<void> getLoggedInDeviceApi(Map<String, String> params) async {

    try {
      /*print(params);
      print(params);*/
      UserDataModel userDataModel = await _getSharedPref.getUserData();
      final response = await ApiService.getWithQueryParameters(
        "setting/security/loginDevice/loginDeviceFindPage",
        params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );
      loggedInDevicesModel = LoggedInDevicesModel.fromJson(response) ;
      update();
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<void> deleteLoginDeviceApi(Map<String,String>params,int index) async{
    try {
      print(params);
      final response = await ApiService.delete(
          "setting/security/loginDevice/deleteDevice?lang=en_US",
          params: params
      );
      print(response);
      //return LoginModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }



}
