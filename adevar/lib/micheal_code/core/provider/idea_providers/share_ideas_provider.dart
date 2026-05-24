// ignore_for_file: unnecessary_brace_in_string_interps

import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

import '../../../../controllers/user_data/get_shared_pref.dart';
import '../../../../models/user_data/user_model.dart';
import '../../../Constants/AppConstants.dart';
import '../../../Service/ApiFunctions/idea_list_service.dart';
import '../../../Service/ApiModels/FormIdeaListModel.dart';
import '../../../Service/Urls.dart';
import '../../../widgets/error_bottomsheet.dart';

class ShareIdeasProvider extends ChangeNotifier {
  /// Pop Up
  bool showPopUp = false;
  List listItem = ['item1', 'item2']; // ion 2
  var latest = 'Latest';
  var popular = 'Popular';
  var temp = 'latest';
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());
  void changeShowPopUp() {
    showPopUp = !showPopUp;
    notifyListeners();
  }

  void refreshIdea() {
    String tempLatest = latest;
    if (latest == 'Popular') {
      tempLatest = 'like';
    }
    getIdealList(queryType: tempLatest, force: true);
  }

  void changeNotifiers() {
    notifyListeners();
  }

  FormIdeaListModel? idealList;
  FormIdeaListModel? moreIdealList;
  bool ideaListLoading = true;
  bool moreIdeaListLoading = false;
  int currentPage = 1;

  void increaseCurrentPage() {
    currentPage++;
    notifyListeners();
  }

  void addItemToList(Items item) {
    idealList!.items!.add(item);
    notifyListeners();
  }

  Future<void> getMoreIdealList({int? page, required String queryType}) async {
    moreIdeaListLoading = true;

    notifyListeners();

    try {
      moreIdealList = await IdeaListService().getIdeas(
        ideaType: 100011,
        page: page,
        queryType: queryType.toLowerCase(),
      );

      if (moreIdealList!.items != null && moreIdealList!.items!.isNotEmpty) {
        for (var item in moreIdealList!.items ?? []) {
          idealList!.items!.add(item);
        }
      } else {}

      moreIdeaListLoading = false;
      notifyListeners();
    } on HttpException catch (e) {
      moreIdeaListLoading = false;
      notifyListeners();
    }
  }

  Future<void> getIdealList(
      {int? page, required String queryType, bool force = false}) async {
    // if (idealList != null && !force) {

    // } else {
    ideaListLoading = true;
    currentPage = 1;
    // if (idealList == null && idealList!.items!.isEmpty) {
    // notifyListeners();

    try {
      idealList = await IdeaListService().getIdeas(
        ideaType: 100011,
        page: page,
        queryType: queryType.toLowerCase(),
      );

      ideaListLoading = false;
    } on HttpException catch (e) {
      ideaListLoading = false;
    }
    // } else {
    //   print('======> Idea List has been gotten Already');
    //   print(idealList);
    //   print(idealList!.items);
    // }
    notifyListeners();
    // }
  }

  Future<void> likeIdea({required String topic0id}) async {
    print(
        '==LikeURL==> ${Urls.supportForum}/likeTopic?lang=${AppConstants.language}');
    try {
      UserDataModel token = await _getSharedPref.getUserData();
      print('====Liking====> Post :: ${topic0id}');
      Map body = {
        "topicOid": topic0id,
        "type": 1,
      };

      http.Response _response = await http.post(
        Uri.parse(
            "${Urls.supportForum}/likeTopic?lang=${AppConstants.language}"),
        headers: {
          "Content-Type": "Application/Json",
          "Authorization": "${token.authToken}",
        },
        body: jsonEncode(body),
      );

      print('===Like Status Code===> ${_response.statusCode}');
      if (_response.statusCode == 201 || _response.statusCode == 200) {
        print('=====> Post liked Successfully!!!');
      } else {
        print('=====> Post Like Failed');
      }
    } on HttpException catch (e) {
      print('====Status====> ${e.message}');
      print("======> Post Like error: $e");
    }
  }

  Future<void> unlikeIdea({required String topic0id}) async {
    print(
        '==UnlikeURL==> ${Urls.supportForum}/unlikeTopic?lang=${AppConstants.language}&topicId=${topic0id}');
    try {
      UserDataModel token = await _getSharedPref.getUserData();
      print('====Unliking====> Post :: ${topic0id}');

      http.Response _response = await http.delete(
        Uri.parse(
            "${Urls.supportForum}/unlikeTopic?lang=${AppConstants.language}&topicId=${topic0id}"),
        headers: {
          "Content-Type": "Application/Json",
          "Authorization": "${token.authToken}",
        },
      );

      print('===Unlike Status Code===> ${_response.statusCode}');
      if (_response.statusCode == 201 || _response.statusCode == 200) {
        print('=====> Post unliked Successfully!!!');
      } else {
        print('=====> Post Unlike Failed');
      }
    } on HttpException catch (e) {
      print('====Status====> ${e.message}');
      print("======> Post Unlike error: $e");
    }
  }

  Future<void> replyIdea(
    BuildContext context, {
    required String ideaId,
    required String parentCommentId,
    required String commentBody,
    String? callUserFirstName,
    String? callUserLastName,
    int? callUserId,
    // required String topic0id,
    // required String category,
  }) async {
    Size size = MediaQuery.of(context).size;

    print('==CommentURL==> ${Urls.replyComment}?lang=${AppConstants.language}');
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          child: Container(
            height: 80,
            width: MediaQuery.of(context).size.width / 1.5,
            child: Center(
              child: Text('Loading...'),
            ),
          ),
        );
      },
    );

    try {
      print('====Commenting====> Post :: ${ideaId}');
      UserDataModel token = await _getSharedPref.getUserData();
      Map body = {
        "ideaId": ideaId,
        "parentCommentId": parentCommentId,
        "commentBody": commentBody,
        "callUserFirstName": callUserFirstName,
        "callUserLastName": callUserLastName,
        "callUserId": callUserId,
        // "topicOid": topic0id,
        // "type": 2,
      };

      http.Response _response = await http.post(
        Uri.parse("${Urls.replyComment}?lang=${AppConstants.language}"),
        headers: {
          "Content-Type": "Application/Json",
          "Authorization": "${token.authToken}",
        },
        body: jsonEncode(body),
      );

      if (_response.statusCode == 201 || _response.statusCode == 200) {
        print('=====> Post Commented Successfully!!!');
        Navigator.pop(context);
        Navigator.pop(context);
        // showModalBottomSheet(
        //   backgroundColor: Colors.transparent,
        //   shape: RoundedRectangleBorder(
        //     borderRadius: BorderRadius.circular(size.height * 0.06),
        //   ),
        //   context: context,
        //   builder: (context) {
        //     return confirmBottomSheet(
        //       context,
        //       '1',
        //       'QR Code',
        //     );
        //   },
        // );
      } else {
        print('=====> Post Comment Failed');
      }
      // Navigator.of(context).pop();
      // showModalBottomSheet(
      //   backgroundColor: Colors.transparent,
      //   shape: RoundedRectangleBorder(
      //     borderRadius: BorderRadius.circular(size.height * 0.06),
      //   ),
      //   context: context,
      //   builder: (context) {
      //     return confirmBottomSheet(
      //       context,
      //       '1',
      //     );
      //   },
      // );
      // Navigator.pop(context);
    } on HttpException catch (e) {
      print('====Status====> ${e.message}');

      Navigator.of(context).pop();
      showModalBottomSheet(
        backgroundColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(size.height * 0.06),
        ),
        context: context,
        builder: (context) {
          return errorBottomSheet(
            context,
            '1',
          );
        },
      );
    }
  }
}
