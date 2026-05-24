import 'package:get/get.dart';
import 'package:highfedilityadevar/models/help_center/check_code_get_token_error_model.dart';
import 'package:highfedilityadevar/models/help_center/check_code_get_token_model.dart';
import 'package:highfedilityadevar/models/help_center/random_emergency_contact_model.dart';
import 'package:highfedilityadevar/models/help_center/random_emergency_contact_model.dart'
    as contact;
import 'package:highfedilityadevar/models/help_center/send_help_feedback_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class HelpCenterChangePhoneController extends GetxController {
  List<contact.ContactData> emergencyContactData = <contact.ContactData>[].obs;
  String myMobileNumber = '';
  String myNewMobileNumber = '';
  String emergencyContactId = '';
  String emergencyContactName = '';
  String emergencyContactLogo = '';
  String safeToken = '';
  Future<RandomEmergeancyContactModel> getRendomEmergencyContactApi(
      phoneNumber) async {
    myMobileNumber = phoneNumber;
    try {
      final response = await ApiService.get(
        "account/queryRandomEmergency?lang=en_US&mobile=${phoneNumber.toString().replaceAll('+', '%2B')}",
      );
      print(response);

      return RandomEmergeancyContactModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<SendHelpAndFeedbackModel> sendCodeToFriend(
      Map<String, dynamic> params) async {
    try {
      final response = await ApiService.post(
        "account/mobile/sendFriendCode?lang=en_US",
        params: params,
        headerMap: {"Content-Type": "application/json"},
      );
      print(response);

      return SendHelpAndFeedbackModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future checkCodeAndGetToken(Map<String, dynamic> params) async {
    try {
      var response = await ApiService.post(
        "account/mobile/checkCodeAndGetToken?lang=en_US",
        params: params,
        headerMap: {"Content-Type": "application/json"},
      );

      if (response['flag'] == false) {
        return CheckCodeAndGetTokenErrorModel.fromJson(response);
      } else {
        return CheckCodeAndGetTokenModel.fromJson(response);
      }
    } catch (error) {
      print('\x1b[97m Catch Error: $error');
    }
  }

  Future<SendHelpAndFeedbackModel> sendCodeToNewMobile(newPhoneNumber) async {
    myNewMobileNumber = newPhoneNumber;
    try {
      final response = await ApiService.post(
        "account/mobile/sendCodeToNewMobile?lang=en_US",
        params: {
          "newMobile": newPhoneNumber,
        },
        headerMap: {"Content-Type": "application/json"},
      );
      update();
      return SendHelpAndFeedbackModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future checkNewMobile(newMobileCode) async {
    try {
      final response = await ApiService.post(
        "account/mobile/checkNewMobile?lang=en_US",
        params: {
          "newMobile": myNewMobileNumber.toString(),
          "newMobileCode": newMobileCode,
          "safetyToken": safeToken.toString(),
        },
        headerMap: {"Content-Type": "application/json"},
      );

      if (response['flag'] == false) {
        return CheckCodeAndGetTokenErrorModel.fromJson(response);
      } else {
        return CheckCodeAndGetTokenModel.fromJson(response);
      }
    } catch (error) {
      print('\x1b[97m Catch Error: $error');
      // throw error.toString();
    }
  }

  Future<SendHelpAndFeedbackModel> checkPinToChangeMobile(pin) async {
    try {
      final response = await ApiService.putPost(
        "account/mobile/checkPinToChangeMobile?lang=en_US",
        params: {
          "pin": pin,
          "safetyToken": safeToken.toString(),
        },
        headerMap: {"Content-Type": "application/json"},
      );
      update();
      return SendHelpAndFeedbackModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
