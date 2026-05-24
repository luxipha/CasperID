import 'package:get/get.dart';
import 'package:highfedilityadevar/models/invitationOpenCloseModel/InvitationOpenCloseModel.dart';
import 'package:highfedilityadevar/models/invitation_visible_status_model/InvitationAndVisibleStatusModel.dart';
import 'package:highfedilityadevar/services/api_service.dart';



class InvitationOpenCloseController extends GetxController {

  Future<InvitationOpenCloseModel> invitationOpen(String token) async{
    try {
      final response = await ApiService.put(
        "/setting/userPersonSetting/openInvitation?lang=en_US",
        headerMap:  {
          "Authorization": token,
          "Content-Type": "application/json"
        },
      );
      print("invitationOpenResponse $response");
      return InvitationOpenCloseModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
  
  Future<InvitationOpenCloseModel> invitationClose(String token) async{
    try {
      final response = await ApiService.put(
        "/setting/userPersonSetting/closeInvitation?lang=en_US",
        headerMap:  {
          "Authorization":token,
          "Content-Type": "application/json"
        },
      );
      print("CloseInvitationResponse: $response");
      return InvitationOpenCloseModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<InvitationAndVisibleStatusModel> getInvitationVisibleSetting(String token) async{
    try {
      final response = await ApiService.get(
        "/setting/userPersonSetting/querySettingsView?lang=en_US",
        headerMap:  {
          "Authorization":token,
          "Content-Type": "application/json"
        },
      );
      print("CloseInvitationResponse: $response");
      return InvitationAndVisibleStatusModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}