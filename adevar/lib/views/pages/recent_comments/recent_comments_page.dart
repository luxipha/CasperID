import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/recentsCommentsController/RecentCommentsController.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/my_comments/my_comments_page.dart';
import 'package:highfedilityadevar/views/pages/received_comments/received_comments_page.dart';

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/recentCommentsModel/RecentCommentsModel.dart';
import '../../../models/user_data/user_model.dart';

class RecentCommentsPage extends StatefulWidget {
  final bool fromScannedQr;
  final bool fromNotification;
  final dynamic userId;

  const RecentCommentsPage(
      {Key? key,
      this.fromScannedQr = false,
      required this.userId,
      this.fromNotification = false})
      : super(key: key);
  @override
  _RecentCommentsPageState createState() => _RecentCommentsPageState();
}

class _RecentCommentsPageState extends State<RecentCommentsPage>
    with BaseClass {
  int _selectedIndex = 0;

  List<RecentCommentsData> recentCommentsData = [];
  List<RecentCommentsData> myRecentCommentsData = [];
  bool commentsLoaded = false;
  bool myCommentsLoaded = false;

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final RecentCommentsController _recentCommentsController =
      Get.isRegistered<RecentCommentsController>()
          ? Get.find<RecentCommentsController>()
          : Get.put(RecentCommentsController());

  @override
  void initState() {
    super.initState();
    if (widget.fromScannedQr) {
      getOtherReceivedComments(widget.userId);
    } else {
      getRecentComments();
      getReceivedComments();
    }
    if (widget.fromNotification) {
      _selectedIndex = 1;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Recent comments',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: commentsLoaded && myCommentsLoaded
          ? Column(
              children: [
                if (!widget.fromScannedQr)
                  Container(
                    width: double.infinity,
                    height: 49,
                    color: AppColors.BOTTOM_NAV_COLOR,
                    child: Row(
                      children: [
                        InkWell(
                          onTap: () {
                            if (_selectedIndex == 0) return;
                            setState(() {
                              _selectedIndex = 0;
                            });
                          },
                          child: Container(
                            width: Get.width * 0.5,
                            height: 49,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Image(
                                  image: AssetImage(AppImages.MY_COMMENTS),
                                  height: /*_selectedIndex == 0 ? 25 :*/ 20,
                                  width: /* _selectedIndex == 0 ? 25 :*/ 20,
                                  color: _selectedIndex == 0
                                      ? Colors.blue
                                      : Colors.grey,
                                ),
                                SizedBox(
                                  width: 10,
                                ),
                                Text(
                                  'MY',
                                  style: GoogleFonts.roboto(
                                      color: _selectedIndex == 0
                                          ? Colors.blue
                                          : Colors.grey,
                                      fontWeight: FontWeight.w400,
                                      fontSize: /*_selectedIndex == 0 ? 18 :*/ 16),
                                ),
                              ],
                            ),
                          ),
                        ),
                        InkWell(
                          onTap: () {
                            if (_selectedIndex == 1) return;
                            setState(() {
                              _selectedIndex = 1;
                            });
                          },
                          child: Container(
                            width: Get.width * 0.5,
                            height: 49,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Image(
                                  image:
                                      AssetImage(AppImages.RECEIVED_COMMENTS),
                                  height: /* _selectedIndex == 1 ? 25 :*/ 20,
                                  width: /*_selectedIndex == 1 ? 25 :*/ 20,
                                  color: _selectedIndex == 1
                                      ? Colors.blue
                                      : Colors.grey,
                                ),
                                SizedBox(
                                  width: 10,
                                ),
                                Text(
                                  'Received',
                                  style: GoogleFonts.roboto(
                                      color: _selectedIndex == 1
                                          ? Colors.blue
                                          : Colors.grey,
                                      fontWeight: FontWeight.w400,
                                      fontSize: /*_selectedIndex == 1 ? 18 :*/ 16),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                SizedBox(
                  height: 20,
                ),
                if (!widget.fromScannedQr)
                  Expanded(
                    child: SingleChildScrollView(
                      child: _selectedIndex == 0
                          ? MyCommentsPage(
                              myRecentCommentsData: recentCommentsData)
                          : ReceivedCommentsPage(
                              receivedComments: myRecentCommentsData),
                    ),
                  ),
                if (widget.fromScannedQr)
                  Expanded(
                    child: SingleChildScrollView(
                      child: ReceivedCommentsPage(
                          receivedComments: myRecentCommentsData),
                    ),
                  ),
              ],
            )
          : Center(
              child: Container(
                  height: 96,
                  width: 96,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Image.asset(
                      //'assets/gif_files/otpModel.dataf',
                      'assets/gif_files/loader_transparent.gif',
                      height: 72,
                      width: 68,
                    ),
                  )),
            ),
    );
  }

  void getRecentComments() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _recentCommentsController.getRecentComments(
          userDataModel.authToken.toString(), "1", "20");
      if (model.flag) {
        // showSuccess(title: "Success", message: model.message);

        setState(() {
          myCommentsLoaded = true;
          recentCommentsData = model.recentCommentsData;
        });
      } else {
        throw model.message;
      }
    } catch (error) {
      // showError(title: "Error", message: error.toString());
    }
  }

  void getReceivedComments() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _recentCommentsController.getMyRecentComments(
          userDataModel.authToken.toString(), "1", "20");

      if (model.flag) {
        // showSuccess(title: "Success", message: model.message);
        commentsLoaded = true;
        setState(() {
          myRecentCommentsData = model.recentCommentsData;
        });
      } else {
        throw model.message;
      }
    } catch (error) {
      // showError(title: "Error", message: error.toString());
    }
  }

  void getOtherReceivedComments(userId) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _recentCommentsController.getOtherReceivedComments(
          userDataModel.authToken.toString(), "1", "20", userId);

      if (model.flag) {
        commentsLoaded = true;
        myCommentsLoaded = true;
        setState(() {
          myRecentCommentsData = model.recentCommentsData;
        });
      } else {
        throw model.message;
      }
    } catch (error) {
      // showError(title: "Error", message: error.toString());
    }
  }
}
