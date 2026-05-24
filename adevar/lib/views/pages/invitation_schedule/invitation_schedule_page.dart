import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/invitation_list_controller/InvitationListController.dart';
import 'package:highfedilityadevar/micheal_widgets/invitation_call_dialog.dart';
import 'package:highfedilityadevar/models/InvitationModel/GetOneMeetingModel.dart';
import 'package:highfedilityadevar/models/InvitationModel/InviteFriendsListModel.dart';
import 'package:highfedilityadevar/models/InvitationModel/ScheduleInvitationModel.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/utils/AppDataNotifiier.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/utils/utils.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../controllers/user_data/get_shared_pref.dart';

class InvitationSchedulePage extends StatefulWidget {
  @override
  _InvitationSchedulePage createState() => _InvitationSchedulePage();
}

class _InvitationSchedulePage extends State<InvitationSchedulePage>
    with BaseClass {
  int pageNo = 0;
  int size = 20;
  bool hasData = true;
  List<ScheduleInvitationData> scheduleInvitationData = [];

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
    getScheduledInvitations();
  }

  @override
  Widget build(BuildContext context) {
    final notifier = context.watch<AppDataNotifier>();

    if (notifier.updateInvitationOf == "schedule" &&
        notifier.invitationStatus == 4) {
      //isCancelled
      scheduleInvitationData.removeAt(notifier.invitationIndex);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Meeting schedule',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: scheduleInvitationData.length > 0
          ? ListView.builder(
              itemCount: scheduleInvitationData.length,
              itemBuilder: (BuildContext context, int index) {
                return InkWell(
                  onTap: () {
                    getOneMeeting(
                        scheduleInvitationData[index].meetingId.toString(),
                        index);
                  },
                  child: Container(
                    margin: EdgeInsets.symmetric(vertical: 5, horizontal: 20),
                    padding: EdgeInsets.symmetric(vertical: 20, horizontal: 15),
                    decoration: BoxDecoration(
                        color: AppColors.FORM_GREY,
                        borderRadius: BorderRadius.circular(15)),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            ClipOval(
                              child: Image.network(
                                scheduleInvitationData[index].logo,
                                height: 50,
                                width: 50,
                                fit: BoxFit.cover,
                              ),
                            ),
                            SizedBox(
                              width: 15,
                            ),
                            Expanded(
                              flex: 2,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          '${scheduleInvitationData[index].firstName} ${scheduleInvitationData[index].lastName}',
                                          overflow: TextOverflow.ellipsis,
                                          style: GoogleFonts.roboto(
                                            fontWeight: FontWeight.w400,
                                            fontSize: 18,
                                            color: Colors.black,
                                          ),
                                          maxLines: 1,
                                        ),
                                      ),
                                      SizedBox(
                                        width: 5,
                                      ),
                                      Image(
                                        image: AssetImage(
                                            scheduleInvitationData[index]
                                                        .gender ==
                                                    "man"
                                                ? AppImages.male
                                                : AppImages.female),
                                        width: 11,
                                        height: 15,
                                      ),
                                    ],
                                  ),
                                  SizedBox(
                                    height: 7,
                                  ),
                                  Text(
                                    '${scheduleInvitationData[index].position} ·',
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.roboto(
                                        fontWeight: FontWeight.w400,
                                        fontSize: 12,
                                        color: AppColors.DARK_GREY),
                                  ),
                                ],
                              ),
                            ),
                            Expanded(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.end,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    getFormatedTime(
                                        scheduleInvitationData[index]
                                            .meetingTime),
                                    style: GoogleFonts.roboto(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 20,
                                        color: Colors.black),
                                  ),
                                  Text(
                                    getFormatedDate(
                                        scheduleInvitationData[index]
                                            .meetingTime),
                                    style: GoogleFonts.roboto(
                                        fontWeight: FontWeight.w400,
                                        fontSize: 10,
                                        color: AppColors.DARK_GREY),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        SizedBox(
                          height: 15,
                        ),
                        // if (scheduleInvitationData[index].senderConfirm == 0 ||
                        //     scheduleInvitationData[index].recipientConfirm == 0)
                        if (DateTime.parse(
                                scheduleInvitationData[index].meetingTime)
                            .isBefore(
                          DateTime.parse(DateTime.now().toString()),
                        ))
                          Container(
                            padding: EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: AppColors.BUTTON_COLOR,
                                width: 1.5,
                              ),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    'Whether this invitation has been completed?',
                                    style: GoogleFonts.roboto(
                                      fontWeight: FontWeight.w400,
                                      fontSize: 11,
                                      color: AppColors.BUTTON_COLOR,
                                    ),
                                    maxLines: 2,
                                  ),
                                ),
                                SizedBox(
                                  width: 8,
                                ),
                                InkWell(
                                  onTap: () {
                                    denyMeeting(
                                      scheduleInvitationData[index].meetingId,
                                      index,
                                    );
                                  },
                                  child: Container(
                                    height: 35,
                                    width: 55,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: AppColors.BUTTON_GREY,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      'No',
                                      style: GoogleFonts.roboto(
                                        fontWeight: FontWeight.w400,
                                        fontSize: 11,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(
                                  width: 8,
                                ),
                                InkWell(
                                  onTap: () {
                                    confirmMeeting(
                                        scheduleInvitationData[index].meetingId,
                                        index);
                                  },
                                  child: Container(
                                    height: 35,
                                    width: 55,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: AppColors.BUTTON_COLOR,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      'Yes',
                                      style: GoogleFonts.roboto(
                                        fontWeight: FontWeight.w400,
                                        fontSize: 11,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              })
          : Center(
              child: Container(
                child: Text(
                  "You haven’t invited, go search for interested people ~",
                  style: GoogleFonts.roboto(
                      color: Colors.black,
                      fontSize: 12,
                      fontWeight: FontWeight.w400),
                ),
              ),
            ),
    );
  }

  void getScheduledInvitations() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      pageNo = pageNo + 1;
      var model = await _invitationListController.getScheduledInvitations(
          userDataModel.authToken.toString(),
          pageNo.toString(),
          size.toString());
      hasData = model.flag;
      if (model.flag) {
        showSuccess(title: "Success", message: model.message);
        setState(() {
          scheduleInvitationData = model.scheduleInvitationData;
        });
      } else if (!model.flag && model.scheduleInvitationData.isEmpty) {
        setState(() {});
      } else {
        throw model.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }

  confirmMeeting(meetingId, index) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    showCircularDialog(context);
    try {
      var model = await _invitationListController.confirmMeeting(
        userDataModel.authToken.toString(),
        meetingId.toString(),
      );
      popToPreviousScreen(context: context);
      if (model.flag) {
        showSuccess(title: "Success", message: model.message);
        // getScheduledInvitations();
        scheduleInvitationData.removeAt(index);
        setState(() {});
      } else {
        showError(title: "Error", message: model.message);
        setState(() {});
      }
    } catch (error) {
      popToPreviousScreen(context: context);
      print(error);
    }
  }

  denyMeeting(meetingId, index) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    showCircularDialog(context);
    try {
      var model = await _invitationListController.denyMeeting(
        userDataModel.authToken.toString(),
        meetingId.toString(),
      );
      popToPreviousScreen(context: context);
      if (model.flag) {
        showSuccess(title: "Success", message: model.message);
        scheduleInvitationData.removeAt(index);
        setState(() {});
      } else {
        showSuccess(title: "Error", message: model.message);
        setState(() {});
      }
    } catch (error) {
      popToPreviousScreen(context: context);
      print(error);
    }
  }

  String getFormatedDate(meetingTime) {
    var dateString = DateTime.parse(meetingTime.toString().substring(0, 10));
    return "${DateFormat.MMM().format(dateString)} ${dateString.day.toString().padLeft(2, "0")}, ${dateString.year}";
  }

  String getFormatedTime(meetingTime) {
    var dateString = DateTime.parse(meetingTime.toString());
    return "${dateString.hour.toString().padLeft(2, "0")}:${dateString.minute.toString().padLeft(2, "0")}";
  }

  void getOneMeeting(String meetingId, int index) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _invitationListController.getOneMeeting(
          userDataModel.authToken.toString(), meetingId);
      if (model.flag) {
        showCallDialog(model, index);
      } else {
        throw model.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }

  void showCallDialog(GetOneMeetingModel oneMeetingData, int index) {
    showDialog(
        context: context,
        builder: (context) {
          return InvitationCallDialog(
            oneMeetingData: oneMeetingData,
            indexPosition: index,
            from: "schedule",
          );
        });
  }
}
