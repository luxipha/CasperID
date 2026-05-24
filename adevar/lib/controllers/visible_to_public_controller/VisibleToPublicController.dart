

import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:highfedilityadevar/models/visibleInVisibleTOPublicModel/visibleInVisibleTOPublic.dart';
import '../../services/api_service.dart';

class VisibleToPublicController extends GetxController {

  Future<VisibleInVisibleTOPublic> openVisiblePublic(String token) async{
    try {

      final response = await ApiService.put(
        "/setting/userPersonSetting/openVisiblePublic?lang=en_US",
        headerMap:  {
          "Authorization":token,
          "Content-Type": "application/json"
        },
      );
      print(response);
      return VisibleInVisibleTOPublic.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<VisibleInVisibleTOPublic> closeVisiblePublic(String token) async{
    try {

      final response = await ApiService.put(
        "/setting/userPersonSetting/closeVisiblePublic?lang=en_US",
        headerMap:  {
          "Authorization":token,
          "Content-Type": "application/json"
        },
      );
      print(response);
      return VisibleInVisibleTOPublic.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

}