import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:highfedilityadevar/models/InvitationModel/CommonMetingModel.dart';
import 'package:highfedilityadevar/models/InvitationModel/GetOneMeetingModel.dart';
import 'package:highfedilityadevar/models/InvitationModel/InvitationListModel.dart';
import 'package:highfedilityadevar/models/InvitationModel/InviteFriendsListModel.dart';
import '../../models/InvitationModel/ReceivedInvitationModel.dart';
import '../../models/InvitationModel/RecommendedPathModel.dart';
import '../../models/InvitationModel/ScheduleInvitationModel.dart';
import '../../services/api_service.dart';

class InvitationListController extends GetxController {
  Future<InvitationListModel> getInvitationList(
      String token, String pageNo, String size) async {
    try {
      final response = await ApiService.get(
        "/socialContact/meeting/myInvitaFindPage?lang=en_US&page=$pageNo&size=$size",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("invitationListResponse $response");
      return InvitationListModel.fromJson(response);
    } catch (error) {
      print("invitationError $error");
      throw error.toString();
    }
  }

  Future<ReceivedInvitationModel> getReceivedList(
      String token, String pageNo, String size) async {
    try {
      final response = await ApiService.get(
        "/socialContact/meeting/inviteMeFindPage?lang=en_US&page=$pageNo&size=$size",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("receivedInviteListResponse $response");
      return ReceivedInvitationModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<InviteFriendsListModel> getInviteFriendsList(
      String token, String pageNo, String size) async {
    try {
      final response = await ApiService.get(
        "/socialContact/recommend/myRecommendUserFindPage?lang=en_US&page=$pageNo&size=$size",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("InviteFriendsResponse $response");
      return InviteFriendsListModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<RecommendedPathModel> getRecommendedPath(
      String token, Map<String, String> params) async {
    print(params);
    try {
      final response = await ApiService.post(
          "/socialContact/recommend/getRecommendPath?lang=en_US",
          headerMap: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          params: params);
      print("RecommendedPathResponse $response");
      return RecommendedPathModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<ScheduleInvitationModel> getScheduledInvitations(
      String token, String pageNo, String size) async {
    try {
      final response = await ApiService.get(
        "/socialContact/meeting/queryMeetingSchedules?lang=en_US&page=$pageNo&limit=$size",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("ScheduleInviteResponse $response");
      return ScheduleInvitationModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<GetOneMeetingModel> getOneMeeting(
      String token, String meetingId) async {
    try {
      final response = await ApiService.get(
        "/socialContact/meeting/getOneMeeting?lang=en_US&meetingId=$meetingId",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("oneMeetingInvitationResponse $response");
      return GetOneMeetingModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<CommonMeetingModel> consentMeeting(
      String token, String meetingId) async {
    try {
      final response = await ApiService.put(
        "/socialContact/meeting/consentMeeting?lang=en_US&meetingId=$meetingId",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("consentMeetingResponse $response");
      return CommonMeetingModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<CommonMeetingModel> cancelMeeting(
      String token, Map<String, String> params) async {
    try {
      final response = await ApiService.putPost(
          "/socialContact/meeting/cancelMeeting?lang=en_US",
          headerMap: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          params: params);
      print("consentMeetingResponse $response");
      return CommonMeetingModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<CommonMeetingModel> refuseMeeting(
      String token, Map<String, String> params) async {
    try {
      final response = await ApiService.putPost(
          "/socialContact/meeting/refuseMeeting?lang=en_US",
          headerMap: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          params: params);
      print("consentMeetingResponse $response");
      return CommonMeetingModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<CommonMeetingModel> meetingConcat(
      String token, String meetingId) async {
    try {
      final response = await ApiService.put(
        "/socialContact/meeting/meetingConcat?lang=en_US&meetingId=$meetingId",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("meetingConcatResponse $response");
      return CommonMeetingModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<CommonMeetingModel> confirmMeeting(
      String token, String meetingId) async {
    try {
      final response = await ApiService.put(
        "/socialContact/meeting/confirmIsMeet?lang=en_US&meetingId=$meetingId",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("confirmMeeting $response");
      return CommonMeetingModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<CommonMeetingModel> denyMeeting(String token, String meetingId) async {
    try {
      final response = await ApiService.put(
        "/socialContact/meeting/denyIsMeet?lang=en_US&meetingId=$meetingId",
        headerMap: {"Authorization": token, "Content-Type": "application/json"},
      );
      print("meetingConcatResponse $response");
      return CommonMeetingModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
