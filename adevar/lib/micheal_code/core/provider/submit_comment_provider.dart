import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';
import '../../Service/Urls.dart';
import '../../widgets/confirm_bottom_sheet.dart';
import '../../widgets/error_bottomsheet.dart';
import 'app_provider.dart';

class SubmitCommentProvider extends ChangeNotifier {
  bool isLoading = false;

  Map<String, dynamic> oldBaseUserView = {};
  Map<String, dynamic> oldUserIdeaView = {};
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());
  int getCategoryCode(String category) {
    if (category == 'Share Ideas') {
      return 100011;
    } else if (category == 'App Questions') {
      return 100012;
    } else if (category == 'Colors') {
      return 100013;
    } else if (category == 'QR Code') {
      return 100012;
    } else if (category == 'Portfolio') {
      return 100015;
    } else if (category == 'Settings') {
      return 100016;
    } else {
      print('Error getting category code');
      return 100011;
    }
  }

  void jumpToIdeaTab(int index, BuildContext context) {
    AppProvider appPro = Provider.of<AppProvider>(context, listen: false);

    appPro.ideasTabController!
        .animateTo(index, duration: Duration(milliseconds: 500));
  }

  void changeIdeaTab(String category, BuildContext context) {
    if (category == 'Share Ideas') {
      jumpToIdeaTab(0, context);
    } else if (category == 'App Questions') {
      jumpToIdeaTab(1, context);
    } else if (category == 'Colors') {
      jumpToIdeaTab(2, context);
    } else if (category == 'QR Code') {
      jumpToIdeaTab(3, context);
    } else if (category == 'Portfolio') {
      jumpToIdeaTab(4, context);
    } else if (category == 'Settings') {
      jumpToIdeaTab(5, context);
    } else {
      print('Error getting category code');
      jumpToIdeaTab(0, context);
    }
  }

  Future<void> submitComment({
    required BuildContext context,
    // required id,
    required String category,
    required String title,
    required String details,
    // required Map<String, dynamic> baseUserView,
    // required Map<String, dynamic> userIdeaView,
  }) async {
    Size size = MediaQuery.of(context).size;
    isLoading = true;

    // oldBaseUserView = baseUserView;
    // oldUserIdeaView = userIdeaView;
    notifyListeners();

    // print(userIdeaView['title']);
    // print(userIdeaView['type']);
    print(category);

    try {
      UserDataModel token = await _getSharedPref.getUserData();

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

      Map body = {
        "title": title,
        // "category": category,
        "type": getCategoryCode(category),
        // "details": details,
        "text": details,
      };

      print(body);
      print(Uri.parse("${Urls.supportForum}/save?lang=en_US"));
      print({
        "Content-Type": "Application/Json",
        "Authorization": "${token.authToken}",
      });
      http.Response response = await http.post(
        Uri.parse("${Urls.supportForum}/save?lang=en_US"),
        headers: {
          "Content-Type": "Application/Json",
          "Authorization": "${token.authToken}",
        },
        body: jsonEncode(body),
      );

      print(response.statusCode);
      print('=This is it=> ${response.body}');

      var responseBody = jsonDecode(response.body)['data'];

      oldBaseUserView = responseBody['baseUserView'];
      oldUserIdeaView = responseBody['userIdeaView'];

      // if (_response.statusCode == 200) {
      //   VoteIdeaModel? _result =
      //       VoteIdeaModel.fromJson(json.decode(_response.body));
      //   return _result;
      // }
      isLoading = false;
      notifyListeners();
      Navigator.of(context).pop();

      // Show Modal Bottom Sheet
      showModalBottomSheet(
        backgroundColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(size.height * 0.06),
        ),
        context: context,
        builder: (context) {
          return confirmBottomSheet(
            context,
            '1',
            category,
          );
        },
      ).then((value) {
        /// Change the idea tab to that of the recently posted idea
        print('Change the idea tab to that of the recently posted idea');
        changeIdeaTab(category, context);
      });
      // Navigator.pop(context);
    } catch (e) {
      print("Submit Comment error: $e");
      isLoading = false;
      notifyListeners();

      Navigator.of(context).pop();

      // Show Error Modal Bottom Sheet
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
