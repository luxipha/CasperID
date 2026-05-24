import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/controllers/invitation_list_controller/InvitationListController.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/InvitationModel/InvitationListModel.dart';
import 'package:highfedilityadevar/models/InvitationModel/ReceivedInvitationModel.dart';
import 'package:highfedilityadevar/provider/invitation_dialog_provider.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/widgets/form_input_with_hint_on_top.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../consts/app_images.dart';
import '../models/InvitationModel/GetOneMeetingModel.dart';
import '../models/user_data/user_model.dart';
import '../utils/AppDataNotifiier.dart';

class InvitationCallDialog extends StatefulWidget {
  final GetOneMeetingModel oneMeetingData;
  final bool invitationCancelled;
  final bool showInvitationCancelText;
  final int indexPosition;
  final String from;
  final bool removeCancelBtn;

  const InvitationCallDialog(
      {Key? key,
      required this.oneMeetingData,
      this.invitationCancelled = false,
      this.showInvitationCancelText = false,
      this.indexPosition = 0,
      required this.from,
      this.removeCancelBtn = false})
      : super(key: key);

  @override
  State<InvitationCallDialog> createState() => _InvitationCallDialogState();
}

class _InvitationCallDialogState extends State<InvitationCallDialog>
    with BaseClass {
  InvitationListModel? invitationListModel;
  ReceivedInvitationModel? receivedInvitationModel;
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final InvitationListController _invitationListController =
      Get.isRegistered<InvitationListController>()
          ? Get.find<InvitationListController>()
          : Get.put(InvitationListController());

  var cancelReasonTextController = new TextEditingController();

  bool invitationCanceled = false;

  GetOneMeetingModel? oneMeetingData;

  GlobalKey globalKey = GlobalKey();

  bool showMessageView = false;

  bool invitationCancelledReason = false;

  @override
  void initState() {
    super.initState();
    showMessageView = widget.showInvitationCancelText;
    invitationCancelledReason = widget.invitationCancelled;
    oneMeetingData = widget.oneMeetingData;
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 70.0),
          child: Container(
            height: invitationCanceled || invitationCancelledReason ? 520 : 590,
            width: MediaQuery.of(context).size.width,
            // color: Colors.green,
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Material(
                  borderRadius: BorderRadius.circular(15),
                  child: Container(
                    height: invitationCanceled || invitationCancelledReason
                        ? 490
                        : 540,
                    width: MediaQuery.of(context).size.width / 1.2,
                    padding: EdgeInsets.symmetric(vertical: 20, horizontal: 20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(15),
                      image: DecorationImage(
                        scale: 2.5,
                        image: AssetImage('assets/images/card-background.png'),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            InkWell(
                              onTap: () {
                                Navigator.of(context).pop();
                              },
                              child: CircleAvatar(
                                radius: 15,
                                backgroundColor: Colors.grey[200],
                                child: Icon(
                                  Icons.close,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                        Center(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                oneMeetingData?.firstName,
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(
                                width: 2.5,
                              ),
                              oneMeetingData?.gender == 'man'
                                  ? Image(
                                      image: AssetImage(AppImages.male),
                                      width: 11,
                                      height: 15,
                                    )
                                  : Image(
                                      image: AssetImage(AppImages.female),
                                      width: 11,
                                      height: 15,
                                    ),
                            ],
                          ),
                        ),
                        SizedBox(
                          height: 20,
                        ),
                        showMessageView
                            ? invitationSendMessageView()
                            : invitationDialogueData(),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        Positioned(
          top: MediaQuery.of(context).size.height / 20,
          left: MediaQuery.of(context).size.width / 2.4,
          child: Stack(
            children: [
              CircleAvatar(
                radius: 40,
                backgroundImage: NetworkImage(
                  oneMeetingData!.logo,
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: oneMeetingData!.badgeUrl == null ||
                        oneMeetingData!.badgeUrl == ""
                    ? Container()
                    : Image.network(
                        "${oneMeetingData!.badgeUrl}",
                        height: 24,
                        width: 24,
                      ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget invitationSendMessageView() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Text(
            "Reason",
            style: GoogleFonts.roboto(
                fontWeight: FontWeight.w400, fontSize: 18, color: Colors.black),
          ),
          SizedBox(
            height: 15,
          ),
          Container(
            height: MediaQuery.of(context).size.height * 0.25,
            decoration: BoxDecoration(
                color: Colors.grey.withAlpha(70),
                borderRadius: BorderRadius.all(Radius.circular(15))),
            child: TextFormField(
              controller: cancelReasonTextController,
              cursorColor: Colors.black,
              maxLines: 10,
              style: GoogleFonts.roboto(
                  color: Colors.black, fontWeight: FontWeight.w400),
              decoration: InputDecoration(
                fillColor: Colors.grey,
                hintText: "Please enter reason for refusal",
                border: OutlineInputBorder(
                    borderSide: BorderSide.none,
                    borderRadius: BorderRadius.circular(50)),
              ),
            ),
          ),
          SizedBox(
            height: 30,
          ),
          InkWell(
            onTap: () {
              if (widget.invitationCancelled) {
                sendInvitationRefused();
              } else {
                sendCancelledReason();
              }
            },
            child: Center(
                child: Container(
                    height: 50,
                    width: MediaQuery.of(context).size.width * 0.7,
                    decoration: BoxDecoration(
                        color: AppColors.BUTTON_COLOR,
                        borderRadius: BorderRadius.all(Radius.circular(15))),
                    child: Center(
                        child: Text(
                      "Send",
                      style: GoogleFonts.roboto(
                          color: Colors.white,
                          fontWeight: FontWeight.w400,
                          fontSize: 16),
                    )))),
          ),
        ],
      ),
    );
  }

  Widget invitationDialogueData() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Row(
                children: [
                  SvgPicture.asset('assets/svg/globe.svg'),
                  SizedBox(
                    width: 5,
                  ),
                  Flexible(
                    child: Text(
                      '${oneMeetingData?.city}, ${oneMeetingData?.country}',
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.roboto(),
                      maxLines: 2,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Row(
                children: [
                  SvgPicture.asset('assets/svg/user.svg'),
                  SizedBox(
                    width: 5,
                  ),
                  Flexible(
                      child: Text(
                    oneMeetingData?.position,
                    overflow: TextOverflow.ellipsis,
                    maxLines: 2,
                  )),
                ],
              ),
            ),
          ],
        ),
        SizedBox(
          height: 20,
        ),
        Text(
          'Time',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(
          height: 10,
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "${DateFormat('dd MMMM yyyy').format(DateTime.parse(oneMeetingData?.meetingDateTime))}",
              style: GoogleFonts.roboto(
                fontWeight: FontWeight.w400,
                fontSize: 14,
              ),
            ),
            Spacer(),
            Text(
                "${DateFormat('hh:mm').format(DateTime.parse(oneMeetingData?.meetingDateTime))}",
                style: GoogleFonts.roboto(
                  fontWeight: FontWeight.w400,
                  fontSize: 14,
                )),
          ],
        ),
        SizedBox(
          height: 20,
        ),
        Text(
          'Site',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(
          height: 10,
        ),
        Text(oneMeetingData?.meetAddress),
        SizedBox(
          height: 20,
        ),
        Text(
          'Invitation',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(
          height: 10,
        ),
        Container(
          height: 70,
          child: Text(
            oneMeetingData?.inviteText,
            maxLines: 4,
          ),
        ),
        SizedBox(
          height: 20,
        ),
        invitationCancelledReason
            ? Center(
                child: Container(
                  width: MediaQuery.of(context).size.width * 0.8,
                  decoration: BoxDecoration(
                      color: Colors.blue.withAlpha(40),
                      borderRadius: BorderRadius.all(Radius.circular(15))),
                  child: Column(
                    children: [
                      SizedBox(
                        height: 10,
                      ),
                      Text(
                        "Reason",
                        style: GoogleFonts.roboto(
                            color: Colors.blue.withAlpha(140)),
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12.0),
                        child: Text(
                          cancelReasonTextController.text.isNotEmpty
                              ? cancelReasonTextController.text
                              : oneMeetingData!.isMeet == 3 ||
                                      oneMeetingData!.isMeet == 2
                                  ? oneMeetingData?.cancelText ?? ""
                                  : oneMeetingData?.refuseText ?? "",
                          style:
                              GoogleFonts.roboto(color: AppColors.BUTTON_COLOR),
                          maxLines: 2,
                        ),
                      ),
                      SizedBox(
                        height: 10,
                      ),
                    ],
                  ),
                ),
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Visibility(
                    visible: !invitationCanceled,
                    child: InkWell(
                      onTap: () {
                        meetingConcat();
                      },
                      child: Center(
                        child: Container(
                          height: 50,
                          width: 250,
                          decoration: BoxDecoration(
                            color: Color(0xFF26C565),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          margin: EdgeInsets.symmetric(horizontal: 20),
                          padding: EdgeInsets.symmetric(horizontal: 20),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              Icon(
                                Icons.phone,
                                color: Colors.white,
                              ),
                              Text(
                                oneMeetingData?.mobile,
                                style: TextStyle(
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  Align(
                    alignment: Alignment.center,
                    child: Container(
                      height: 50,
                      width: 290,
                      child: Stack(
                        children: [
                          InkWell(
                            onTap: () {
                              setState(() {
                                showMessageView = true;
                              });
                            },
                            child: Center(
                              child: Visibility(
                                visible: invitationCanceled,
                                child: Container(
                                  height: 50,
                                  width: 250,
                                  decoration: BoxDecoration(
                                    color: Color(0xFFDA2E2E),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Center(
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.center,
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          'Invitation cancelled',
                                          style: TextStyle(
                                            color: Colors.white,
                                          ),
                                        ),
                                        SizedBox(
                                          width: 10,
                                        ),
                                        Icon(
                                          Icons.edit,
                                          color: Colors.white,
                                          size: 22,
                                        )
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          widget.removeCancelBtn
                              ? Container()
                              : Center(
                                  child: Visibility(
                                    visible: !invitationCanceled,
                                    child: Container(
                                      height: 50,
                                      width: 250,
                                      decoration: BoxDecoration(
                                        color:
                                            Color(0xFFDA2E2E).withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      margin:
                                          EdgeInsets.symmetric(horizontal: 20),
                                      padding:
                                          EdgeInsets.only(left: 10, right: 15),
                                      child: Center(
                                        child: Stack(
                                          children: [
                                            Consumer<InvitationDialogProvider>(
                                                builder: (context,
                                                    invitationDialogProvider,
                                                    _) {
                                              return Visibility(
                                                visible:
                                                    invitationDialogProvider
                                                        .showCancelText,
                                                child: Positioned(
                                                  right: 1,
                                                  top: 6,
                                                  child: Text(
                                                    'Swipe to cancel invitation',
                                                    style: TextStyle(
                                                      color: Color(0xFFDA2E2E),
                                                    ),
                                                  ),
                                                ),
                                              );
                                            }),
                                            GestureDetector(
                                              onTap: () {
                                                print('Tapped');
                                              },
                                              onHorizontalDragStart: (details) {
                                                print('details');
                                              },
                                              onLongPress: () {
                                                print('Long Press');
                                              },
                                              onHorizontalDragCancel: () {
                                                print('Cancel');
                                              },
                                              onTapDown: (td) {
                                                // setState(() {
                                                Provider.of<InvitationDialogProvider>(
                                                        context,
                                                        listen: false)
                                                    .hideCancelText();
                                                // });
                                                print('td');
                                              },
                                              child: Dismissible(
                                                key: globalKey,
                                                direction:
                                                    DismissDirection.startToEnd,
                                                onDismissed:
                                                    (dismissDirection) {
                                                  setState(() {
                                                    invitationCanceled = true;
                                                  });
                                                  Provider.of<InvitationDialogProvider>(
                                                          context,
                                                          listen: false)
                                                      .showText();
                                                },
                                                child: SizedBox(
                                                  width: 200,
                                                  child: Row(
                                                    children: [
                                                      Container(
                                                        height: 30,
                                                        width: 30,
                                                        decoration:
                                                            BoxDecoration(
                                                          color:
                                                              Color(0xFFDA2E2E),
                                                          borderRadius:
                                                              BorderRadius
                                                                  .circular(8),
                                                        ),
                                                        child: Center(
                                                          child: Icon(
                                                            Icons.close,
                                                            color: Colors.white,
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
      ],
    );
  }

  void sendCancelledReason() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    final Map<String, String> params;
    try {
      if (cancelReasonTextController.text.isEmpty) {
        throw "Please enter the Reason to Cancel";
      } else {
        params = {
          "meetingId": oneMeetingData?.meetingId,
          "cancelText": cancelReasonTextController.text,
        };
      }
      var model = await _invitationListController.cancelMeeting(
          userDataModel.authToken.toString(), params);
      if (model.flag) {
        Provider.of<AppDataNotifier>(context, listen: false)
            .updateInvitationAt(widget.from);
        Provider.of<AppDataNotifier>(context, listen: false)
            .setInvitationIndex(widget.indexPosition);
        Provider.of<AppDataNotifier>(context, listen: false)
            .setInvitationStatus(4);
        showSuccess(title: "Success", message: model.message);

        setState(() {
          invitationCancelledReason = true;
          showMessageView = false;
        });
      } else {
        throw model.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }

  void sendInvitationRefused() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    final Map<String, String> params;
    try {
      params = {
        "meetingId": oneMeetingData?.meetingId,
        "refuseText": cancelReasonTextController.text,
      };
      var model = await _invitationListController.refuseMeeting(
          userDataModel.authToken.toString(), params);
      if (model.flag) {
        Provider.of<AppDataNotifier>(context, listen: false)
            .updateInvitationAt(widget.from);
        Provider.of<AppDataNotifier>(context, listen: false)
            .setInvitationIndex(widget.indexPosition);
        Provider.of<AppDataNotifier>(context, listen: false)
            .setInvitationStatus(3);

        showSuccess(title: "Success", message: model.message);
        setState(() {
          invitationCancelledReason = true;
          showMessageView = false;
        });
      } else {
        throw model.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }

  void meetingConcat() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _invitationListController.meetingConcat(
          userDataModel.authToken.toString(), oneMeetingData!.meetingId);
      if (model.flag) {
        Provider.of<AppDataNotifier>(context, listen: false)
            .updateInvitationAt(widget.from);
        Provider.of<AppDataNotifier>(context, listen: false)
            .setInvitationIndex(widget.indexPosition);
        Provider.of<AppDataNotifier>(context, listen: false)
            .setInvitationStatus(5);
        showSuccess(title: "Success", message: model.message);
        // Navigator.of(context).pop();
      } else {
        throw model.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }
}
