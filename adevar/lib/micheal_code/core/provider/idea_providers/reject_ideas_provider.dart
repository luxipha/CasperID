import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../../../../controllers/user_data/get_shared_pref.dart';
import '../../../../models/user_data/user_model.dart';
import '../../../Constants/AppConstants.dart';
import '../../../Service/Urls.dart';

class RejectIdeasProvider extends ChangeNotifier {
  Map? rejectIdeas;
  Map? moreRejectIdeas;
  bool isLoading = false;
  int page = 1;
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());
  Future<void> getRejectIdeas() async {
    UserDataModel token = await _getSharedPref.getUserData();
    if (rejectIdeas != null) {
      print('RejectIdeas have been gotten already');
    } else {
      isLoading = true;
      page = 1;
      try {
        print('===> Getting RejectIdeas');
        String url =
            '${Urls.supportForum}/getRejectIdea?lang=${AppConstants.language}&page=$page&size=10';
        var response = await http.get(
          Uri.parse(url),
          headers: {
            "Content-Type": "Application/Json",
            "Authorization": "${token.authToken}",
          },
        );

        print('==ResponseMike==> ${response.body}');

        var body = jsonDecode(
          utf8.decode(response.bodyBytes),
        );

        print('==BodyMike==> $body');
        rejectIdeas = body;

        print('===RejectMikky===> $rejectIdeas');
        print('===> RejectIdeas Gotten');
      } on HttpException catch (e) {
        print('===> Error Getting RejectIdeas');
        print(e);
        print('===> Error Getting RejectIdeas <===');
      }
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> getMoreVotedFeature() async {
    isLoading = true;
    page++;
    try {
      UserDataModel token = await _getSharedPref.getUserData();
      print('===> Getting MoreVotedFeature');
      String url =
          '${Urls.supportForum}/getRejectIdea?lang=${AppConstants.language}&page=$page&size=10';
      var response = await http.get(
        Uri.parse(url),
        headers: {
          "Content-Type": "Application/Json",
          "Authorization": "${token.authToken}",
        },
      );

      print('==ResponseMike==> ${response.body}');

      var body = jsonDecode(
        utf8.decode(response.bodyBytes),
      );

      moreRejectIdeas = body;
      for (var item in moreRejectIdeas!['items']) {
        rejectIdeas!['items']!.add(item);
      }
      print('===> MoreVotedFeature Gotten');
    } on HttpException catch (e) {
      print('===> Error Getting MoreVotedFeature');
      print(e);
      print('===> Error Getting MoreVotedFeature <===');
    }
    isLoading = false;
    notifyListeners();
  }
}
