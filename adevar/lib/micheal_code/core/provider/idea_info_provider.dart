import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';

import '../../Service/Urls.dart';

class IdeaInfoProvider extends ChangeNotifier {
  late Map ideaInfo;
  bool isLoading = false;

  Future<void> getIdeaInfo(String ideaId) async {
    print('Getting Idea Info...');
    final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
        ? Get.find<GetSharedPref>()
        : Get.put(GetSharedPref());
    UserDataModel token = await _getSharedPref.getUserData();
    try {
      Uri url = Uri.parse(
          '${Urls.supportForum}/getIdeaInfoView?lang=en_US&ideaId=$ideaId');

      var _response = await http.get(
        url,
        headers: {
          "Content-Type": "Application/Json",
          "Authorization": "${token.authToken}",
        },
      );

      print(_response.statusCode);
      print('==================IdeaInfo===============> ${_response.body}');

      var body = jsonDecode(
        utf8.decode(_response.bodyBytes),
      );

      if (body['flag'] == true) {
        ideaInfo = body['data'];
      }
    } on HttpException catch (e) {
      print('Error Getting Idea Info');
      print('===> $e');
    }
  }
}
