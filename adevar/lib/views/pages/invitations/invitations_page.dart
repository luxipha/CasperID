import 'dart:developer';

import 'package:badges/badges.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/invitation_list_controller/InvitationListController.dart';
import 'package:highfedilityadevar/models/InvitationModel/InvitationListModel.dart';
import 'package:highfedilityadevar/models/InvitationModel/ReceivedInvitationModel.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/invitation_schedule/invitation_schedule_page.dart';
import 'package:highfedilityadevar/views/pages/my_invitations/my_invitations_page.dart';
import 'package:highfedilityadevar/views/pages/received_invitations/received_invitations_page.dart';
import 'package:provider/provider.dart';

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';
import '../../../utils/AppDataNotifiier.dart';

class InvitationsPage extends StatefulWidget {
  final bool fromNotification;
  const InvitationsPage({Key? key, this.fromNotification = false})
      : super(key: key);
  @override
  _InvitationsPageState createState() => _InvitationsPageState();
}

class _InvitationsPageState extends State<InvitationsPage> with BaseClass {
  int _selectedIndex = 0;

  bool invitationListLoaded = false;
  bool receivedListLoaded = false;

  InvitationListModel? invitationListModel;
  ReceivedInvitationModel? receivedInvitationModel;
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final InvitationListController _invitationListController =
      Get.isRegistered<InvitationListController>()
          ? Get.find<InvitationListController>()
          : Get.put(InvitationListController());

  @override
  void initState() {
    super.initState();
    getInvitationList();
    getReceivedList();
    if (widget.fromNotification) {
      _selectedIndex = 1;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Invitation',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
        actions: [
          GestureDetector(
            onTap: () {
              Provider.of<AppDataNotifier>(context, listen: false)
                  .setInvitationIndex(0);
              Provider.of<AppDataNotifier>(context, listen: false)
                  .setInvitationStatus(0);
              Get.to(() => InvitationSchedulePage());
            },
            child: Image(
              image: AssetImage(
                AppImages.SEND_INVITATION,
              ),
              height: 24,
              width: 24,
            ),
          ),
          SizedBox(
            width: 10,
          )
        ],
      ),
      body: receivedListLoaded
          ? Column(
              children: [
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
                                height: 20,
                                width: 20,
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
                                    fontSize: /*_selectedIndex == 0 ? 18 : */ 16),
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
                                image: AssetImage(AppImages.RECEIVED_COMMENTS),
                                height: /*_selectedIndex == 1 ?25:*/ 20,
                                width: /*_selectedIndex == 1 ?25:*/ 20,
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
                              SizedBox(
                                width: 10,
                              ),
                              receivedInvitationModel?.latestCount == 0 ||
                                      receivedInvitationModel?.latestCount ==
                                          null ||
                                      receivedInvitationModel?.latestCount == ""
                                  ? Container()
                                  : Container(
                                      padding: EdgeInsets.all(7),
                                      decoration: BoxDecoration(
                                          color: Colors.red,
                                          shape: BoxShape.circle),
                                      child: Text(
                                        receivedInvitationModel?.latestCount
                                                .toString() ??
                                            "",
                                        style: GoogleFonts.roboto(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w400,
                                            fontSize: 12),
                                      ),
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
                Expanded(
                  child: SingleChildScrollView(
                    child: _selectedIndex == 0
                        ? invitationListModel != null
                            ? MyInvitationsPage(
                                invitationListModel: invitationListModel!)
                            : Container()
                        : receivedInvitationModel != null
                            ? ReceivedInvitationPage(
                                receivedInvitationModel:
                                    receivedInvitationModel!)
                            : Container(),
                  ),
                )
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

  void getInvitationList() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      invitationListModel = await _invitationListController.getInvitationList(
          userDataModel.authToken.toString(), "1", "20");
      if (invitationListModel?.flag) {
        // showSuccess(title: "Success", message: invitationListModel?.message);
        invitationListLoaded = true;
        setState(() {
          invitationListModel;
        });
      } else {
        throw invitationListModel?.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }

  void getReceivedList() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      receivedInvitationModel = await _invitationListController.getReceivedList(
          userDataModel.authToken.toString(), "1", "20");
      if (receivedInvitationModel?.flag) {
        // showSuccess(title: "Success", message: receivedInvitationModel?.message);
        receivedListLoaded = true;
        setState(() {
          receivedInvitationModel;
        });
      } else {
        throw receivedInvitationModel?.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }
}
