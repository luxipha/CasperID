import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:highfedilityadevar/models/help_center/send_help_feedback_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class HelpCenterController extends GetxController {
  TextEditingController emailController = TextEditingController();
  TextEditingController subjectController = TextEditingController();
  TextEditingController messageController = TextEditingController();
  String deviceModel = "";
  String deviceId = "";
  getDeviceInformation() async {
    DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    AndroidDeviceInfo? androidInfo;
    IosDeviceInfo? iosInfo;

    if (Platform.isAndroid) {
      androidInfo = await deviceInfo.androidInfo;
      deviceModel = androidInfo.model!;
      deviceId = androidInfo.androidId!;
    } else {
      iosInfo = await deviceInfo.iosInfo;
      deviceModel = iosInfo.name!;

      deviceId = iosInfo.identifierForVendor!;
    }
  }

  Future<SendHelpAndFeedbackModel> sendHelpAndFeedBack(
      Map<String, String> params) async {
    try {
      print(params);
      final response = await ApiService.post(
        "system/helpAndFeedBack?lang=en_US",
        headerMap: {"Content-Type": "application/json"},
        params: params,
      );
      print(response);
      return SendHelpAndFeedbackModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
