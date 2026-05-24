import 'dart:developer';
import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get/get_instance/src/extension_instance.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/invitation_list_controller/InvitationListController.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:share/share.dart';

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/InvitationModel/InviteFriendsListModel.dart';
import '../../../models/user_data/user_model.dart';
import '../../bottom_sheets/share_sheet/share_bottom_sheet.dart';
import 'package:device_information/device_information.dart';

class InviteFriendsPage extends StatefulWidget {
  @override
  _InviteFriendsPage createState() => _InviteFriendsPage();
}

class _InviteFriendsPage extends State<InviteFriendsPage> with BaseClass {
  List<InviteFriendsData> inviteFriendsData = [];
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final InvitationListController _invitationListController =
      Get.isRegistered<InvitationListController>()
          ? Get.find<InvitationListController>()
          : Get.put(InvitationListController());

  int pageNo = 0;
  var size = 20;

  ScrollController _scrollController = new ScrollController();
  bool isLoading = false;
  bool noMoreItems = false;
  bool inviteFriendsListLoaded = false;
  var sharePath = "";
  var count = 0;

  @override
  void initState() {
    super.initState();
    getRecommendedPath();
    getInviteFriendsList();
    setScrollListener();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Invite friends',
          style: GoogleFonts.roboto(color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: inviteFriendsData.length > 0
          ? Container(
              margin: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  InkWell(
                    onTap: () {
                      final RenderObject? box = context.findRenderObject();
                      Share.share(sharePath);
                      // ShareBottomSheet().showUploadImageActionSheet(context);
                    },
                    child: Container(
                      height: 85,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: AppColors.BUTTON_COLOR.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(
                          color: AppColors.BUTTON_COLOR,
                        ),
                      ),
                      child: Icon(
                        Icons.add,
                        size: 40,
                        color: AppColors.HINT_GREY,
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 9,
                  ),
                  Expanded(
                    child: ListView.builder(
                        controller: _scrollController,
                        shrinkWrap: true,
                        itemCount: inviteFriendsData.length,
                        itemBuilder: (BuildContext context, int index) {
                          return _getInviteWidget(index);
                        }),
                  ),
                  isLoading
                      ? Container(
                          height: 40,
                          width: 40,
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
                          ))
                      : Container(),
                ],
              ),
            )
          : !inviteFriendsListLoaded
              ? Center(
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
                )
              : inviteFriendsData.isEmpty
                  ? InkWell(
                      onTap: () {
                        final RenderObject? box = context.findRenderObject();
                        Share.share(sharePath);
                        // ShareBottomSheet().showUploadImageActionSheet(context);
                      },
                      child: Container(
                        height: 85,
                        margin:
                            EdgeInsets.symmetric(horizontal: 15, vertical: 15),
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: AppColors.BUTTON_COLOR.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(15),
                          border: Border.all(
                            color: AppColors.BUTTON_COLOR,
                          ),
                        ),
                        child: Icon(
                          Icons.add,
                          size: 40,
                          color: AppColors.HINT_GREY,
                        ),
                      ),
                    )
                  : Container(),
    );
  }

  Widget _getInviteWidget(int index) {
    return Container(
      padding: EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.FORM_GREY,
        borderRadius: BorderRadius.circular(15),
      ),
      margin: EdgeInsets.symmetric(vertical: 9),
      child: ListTile(
        contentPadding: EdgeInsets.zero,
        leading: Container(
          margin: EdgeInsets.only(right: 20),
          child: ClipOval(
            child: Image.network(
              inviteFriendsData[index].logo,
              height: 50,
              width: 50,
              fit: BoxFit.cover,
            ),
          ),
        ),
        title: Text(
          '${inviteFriendsData[index].firstName} ${inviteFriendsData[index].lastName}',
          style: GoogleFonts.roboto(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.w400,
          ),
        ),
        subtitle: Container(
          margin: EdgeInsets.only(top: 10),
          child: Text(
            'ID:${inviteFriendsData[index].userId.toString()}',
            style: GoogleFonts.roboto(
              color: Colors.black,
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
          ),
        ),
        trailing: Container(
          height: 10,
          width: 10,
          decoration: BoxDecoration(
            color: inviteFriendsData[index].lastOnline == 1
                ? Colors.green
                : AppColors.FORM_GREY,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }

  void setScrollListener() {
    _scrollController.addListener(() {
      if (_scrollController.position.userScrollDirection ==
          ScrollDirection.reverse) {
        if (_scrollController.position.pixels ==
            _scrollController.position.maxScrollExtent) {
          setState(() {});
          if (noMoreItems) {
            isLoading = false;
          } else {
            getInviteFriendsList();
            isLoading = true;
          }
        }
      }
    });
  }

  void getInviteFriendsList() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      pageNo = pageNo + 1;
      var model = await _invitationListController.getInviteFriendsList(
          userDataModel.authToken.toString(),
          pageNo.toString(),
          size.toString());
      if (model.flag) {
        // showSuccess(title: "Success", message: model.message);
        setState(() {
          count = model.counts;
          noMoreItems = model.inviteFriendsData.isEmpty;
          isLoading = false;
          inviteFriendsListLoaded = true;
          if (!noMoreItems) {
            inviteFriendsData.addAll(model.inviteFriendsData);
          }
          print(model.inviteFriendsData.length);
        });
      } else {
        throw model.message;
      }
    } catch (error) {
      print('Error in  $error');
      // showError(title: "Error", message: error.toString());
    }
  }

  void getRecommendedPath() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    var deviceId = await _getId();

    final Map<String, String> params = {"imei": deviceId.toString()};
    try {
      var model = await _invitationListController.getRecommendedPath(
          userDataModel.authToken.toString(), params);
      log('${model}');
      if (model.flag) {
        // showSuccess(title: "Success", message: model.message);
        setState(() {
          sharePath = model.data;
        });
      } else {
        throw model.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }

  Future<String?> _getId() async {
    var deviceInfo = DeviceInfoPlugin();
    if (Platform.isIOS) {
      // import 'dart:io'
      var iosDeviceInfo = await deviceInfo.iosInfo;
      return iosDeviceInfo.identifierForVendor; // unique ID on iOS
    } else {
      var androidDeviceInfo = await deviceInfo.androidInfo;

      return androidDeviceInfo.androidId; // unique ID on Android
    }
  }
}
