import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';

import '../../Service/Urls.dart';

class IdeaCommentProvider extends ChangeNotifier {
  ScrollController ideaCommentScrollController = ScrollController();

  late Map commentsData;
  late List commentItems;
  bool isLoading = false;
  bool isMoreLoading = false;

  int pageNumber = 1;
  late String? topicOid;
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());
  Future<void> getCommentItems(String? ideaId) async {
    UserDataModel token = await _getSharedPref.getUserData();
    // topicOid is assigned a value that will be used later in the getMoreCommentItems Function
    topicOid = ideaId;

    print('Getting Idea Comments...');
    print('Idea ID ==> $ideaId');
    print(
        '${Urls.supportForum}/userIdeaCommentViewFindPage?lang=en_US&page=1&size=10&topicOid=$ideaId');

    try {
      isLoading = true;
      Uri url = Uri.parse(
          '${Urls.supportForum}/userIdeaCommentViewFindPage?lang=en_US&page=1&size=10&topicOid=$ideaId');

      var _response = await http.get(
        url,
        headers: {
          "Content-Type": "Application/Json",
          "Authorization": "${token.authToken}",
        },
      );

      print(_response.statusCode);
      print('================Comment Info===============> ${_response.body}');

      var body = jsonDecode(
        utf8.decode(_response.bodyBytes),
      );

      commentsData = body;
      commentItems = body['items'];
    } on HttpException catch (e) {
      print('Error Getting Idea Info');
      print('===> $e');
    }
    isLoading = false;
    notifyListeners();
  }

  Future<void> getMoreCommentItems() async {
    print('Getting More Idea Comments...');
    print('topicOid ID ==> $topicOid');

    // Increment page before getting more Items
    pageNumber++;
    print(
        '${Urls.supportForum}/userIdeaCommentViewFindPage?lang=en_US&page=$pageNumber&size=10&topicOid=$topicOid');

    try {
      UserDataModel token = await _getSharedPref.getUserData();
      isMoreLoading = true;
      Uri url = Uri.parse(
          '${Urls.supportForum}/userIdeaCommentViewFindPage?lang=en_US&page=$pageNumber&size=10&topicOid=$topicOid');

      var _response = await http.get(
        url,
        headers: {
          "Content-Type": "Application/Json",
          "Authorization": "${token.authToken}",
        },
      );

      print(_response.statusCode);
      print('=================Comment Item===============> ${_response.body}');

      var body = jsonDecode(
        utf8.decode(_response.bodyBytes),
      );

      commentsData = body;
      for (Map item in body['items'] ?? []) {
        print('===> Comment Item ===> ${item['callUserFirstName']}');
        commentItems.add(item);
      }
    } on HttpException catch (e) {
      print('Error Getting Idea Info');
      print('===> $e');
    }
    isMoreLoading = false;
    notifyListeners();
  }
}
