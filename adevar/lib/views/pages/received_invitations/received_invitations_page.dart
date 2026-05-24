import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/micheal_widgets/invitation_call_dialog.dart';
import 'package:highfedilityadevar/micheal_widgets/invitation_dialog.dart';
import 'package:highfedilityadevar/models/InvitationModel/InvitationListModel.dart';
import 'package:highfedilityadevar/models/InvitationModel/ReceivedInvitationModel.dart';
import 'package:highfedilityadevar/utils/AppDataNotifiier.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:provider/provider.dart';

import '../../../controllers/invitation_list_controller/InvitationListController.dart';
import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/InvitationModel/GetOneMeetingModel.dart';
import '../../../models/user_data/user_model.dart';

class ReceivedInvitationPage extends StatefulWidget {
  final ReceivedInvitationModel receivedInvitationModel;

  const ReceivedInvitationPage(
      {Key? key, required this.receivedInvitationModel})
      : super(key: key);

  @override
  _ReceivedInvitationPage createState() => _ReceivedInvitationPage();
}

class _ReceivedInvitationPage extends State<ReceivedInvitationPage>
    with BaseClass {
  int pageNo = 1;
  var size = 20;
  List<ReceivedInvitationData> receivedInvitationData = [];
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final InvitationListController _invitationListController =
      Get.isRegistered<InvitationListController>()
          ? Get.find<InvitationListController>()
          : Get.put(InvitationListController());

  bool isLoading = false;

  bool noMoreItems = false;

  ScrollController _scrollController = new ScrollController();

  @override
  void initState() {
    super.initState();
    setScrollListener();
    receivedInvitationData =
        widget.receivedInvitationModel.receivedInvitationData;
  }

  @override
  Widget build(BuildContext context) {
    final notifier = context.watch<AppDataNotifier>();
    if (notifier.updateInvitationOf == "received" &&
        notifier.invitationStatus > 0) {
      if (notifier.invitationStatus == 1) {
        //isRead
        receivedInvitationData[notifier.invitationIndex].setReadStatus(1);
        print("isRead");
      } else if (notifier.invitationStatus == 2) {
        // isConsent
        print("isConsent");
        receivedInvitationData[notifier.invitationIndex].setReadStatus(1);
        receivedInvitationData[notifier.invitationIndex].setConsentStatus(1);
      } else if (notifier.invitationStatus == 3) {
        // isRefused
        print("isRefused");
        receivedInvitationData[notifier.invitationIndex].setReadStatus(1);
        receivedInvitationData[notifier.invitationIndex].setConsentStatus(2);
      } else if (notifier.invitationStatus == 4) {
        //isCancelled
        print("isCancelled ${notifier.invitationIndex}");

        receivedInvitationData[notifier.invitationIndex].setReadStatus(1);
        receivedInvitationData[notifier.invitationIndex].setMeetingStatus(3);
      } else if (notifier.invitationStatus == 5) {
        //isContacted
        print("isContacted ${notifier.invitationIndex}");
        receivedInvitationData[notifier.invitationIndex].setReadStatus(1);
        receivedInvitationData[notifier.invitationIndex].setMeetingStatus(1);
        receivedInvitationData[notifier.invitationIndex].setConsentStatus(1);
        receivedInvitationData[notifier.invitationIndex].setCallStatus(1);
      }
    }
    return ListView.builder(
        shrinkWrap: true,
        controller: _scrollController,
        itemCount: receivedInvitationData.length,
        itemBuilder: (BuildContext context, int index) {
          return Container(
            margin: EdgeInsets.symmetric(vertical: 5, horizontal: 20),
            child: Container(
              padding: EdgeInsets.symmetric(vertical: 15, horizontal: 20),
              decoration: BoxDecoration(
                color: setBlockColor(receivedInvitationData[index]),
                borderRadius: BorderRadius.circular(15),
              ),
              child: InkWell(
                onTap: () {
                  getOneMeeting(receivedInvitationData[index], index);
                },
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Stack(
                      children: [
                        ClipOval(
                            child: Image.network(
                          receivedInvitationData[index].logo,
                          height: 70,
                          width: 70,
                          fit: BoxFit.cover,
                        )),
                        Positioned(
                          right: 0,
                          bottom: 1,
                          child: Container(
                            height: 25,
                            width: 25,
                            child: receivedInvitationData[index].badgeUrl ==
                                    null
                                ? Container()
                                : Image.network(
                                    receivedInvitationData[index].badgeUrl ??
                                        "",
                                    height: 25,
                                    width: 25,
                                  ),
                          ),
                        )
                      ],
                    ),
                    SizedBox(
                      width: 21,
                    ),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                "${receivedInvitationData[index].firstName} ${receivedInvitationData[index].lastName}",
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 18,
                                    color: Colors.black),
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              receivedInvitationData[index].gender == "man"
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
                              Spacer(),
                              endIconsWidget(receivedInvitationData[index])
                            ],
                          ),
                          SizedBox(
                            height: 7,
                          ),
                          Text(
                            '${receivedInvitationData[index].position} · ${receivedInvitationData[index].city}',
                            style: GoogleFonts.roboto(
                                fontWeight: FontWeight.w400,
                                fontSize: 12,
                                color: AppColors.DARK_GREY),
                          ),
                          SizedBox(
                            height: 5,
                          ),
                          Text(
                            '${receivedInvitationData[index].introduction}',
                            style: GoogleFonts.roboto(
                                fontWeight: FontWeight.w400,
                                fontSize: 9,
                                color: AppColors.DARK_GREY),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        });
  }

  void setScrollListener() {
    _scrollController.addListener(() {
      if (_scrollController.position.userScrollDirection ==
          ScrollDirection.reverse) {
        if (_scrollController.position.pixels ==
            _scrollController.position.maxScrollExtent) {
          if (!noMoreItems) {
            addMoreReceivedInvitations();
            isLoading = true;
          } else {
            isLoading = false;
          }
          setState(() {});
        }
      }
    });
  }

  void addMoreReceivedInvitations() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      pageNo = pageNo + 1;
      var model = await _invitationListController.getReceivedList(
          userDataModel.authToken.toString(), pageNo.toString(), "20");
      if (model.flag) {
        noMoreItems = model.receivedInvitationData.isEmpty;
        if (!noMoreItems) {
          receivedInvitationData.addAll(model.receivedInvitationData);
        }
        isLoading = false;

        setState(() {});
      } else {
        isLoading = false;
        setState(() {});
        throw model.message;
      }
    } catch (error) {}
  }

  Widget endIconsWidget(ReceivedInvitationData receivedInvitationData) {
    if (receivedInvitationData.isRead == 0) {
      return Container(
        height: 8,
        width: 8,
        decoration: new BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.red,
        ),
      );
    }

    if (receivedInvitationData.isRead == 1 &&
        receivedInvitationData.isConsent == 1 &&
        receivedInvitationData.isMeet <= 1 &&
        receivedInvitationData.isContact == 0) {
      return SvgPicture.asset(
        AppImages.CALL_END,
        height: 9,
        width: 9,
      );
    }

    if (receivedInvitationData.isRead == 1 &&
        receivedInvitationData.isContact == 0 &&
        receivedInvitationData.isConsent == 0 &&
        receivedInvitationData.isMeet == 0) {
      return Container();
    }

    if (receivedInvitationData.isMeet == 3 ||
        receivedInvitationData.isMeet == 2) {
      return Icon(
        Icons.cancel_rounded,
        color: AppColors.red.withAlpha(80),
        size: 18,
      );
    }

    if (receivedInvitationData.isConsent == 2) {
      return Container(
        child: SvgPicture.asset(
          AppImages.REFUSE_ICON,
          height: 14,
          width: 14,
        ),
      );
    }
    if (receivedInvitationData.isContact == 1 &&
        receivedInvitationData.isConsent == 1) {
      return Icon(
        Icons.call,
        color: AppColors.greenColor,
        size: 20,
      );
    }

    if (receivedInvitationData.isRead == 0) {
      return Container();
    }
    return Container();
  }

  setBlockColor(ReceivedInvitationData receivedInvitationData) {
    if (receivedInvitationData.isRead == 0) {
      return AppColors.FORM_GREY;
    }

    if (receivedInvitationData.isRead == 1 &&
        receivedInvitationData.isConsent == 1 &&
        receivedInvitationData.isMeet <= 1 &&
        receivedInvitationData.isContact == 0) {
      return AppColors.YELLOW_TRANSPARENT;
    }

    if (receivedInvitationData.isRead == 1 &&
        receivedInvitationData.isContact == 0 &&
        receivedInvitationData.isConsent == 0 &&
        receivedInvitationData.isMeet == 0) {
      return AppColors.FORM_GREY;
    }

    if (receivedInvitationData.isMeet == 3 ||
        receivedInvitationData.isMeet == 2) {
      return Colors.grey.withAlpha(7);
    }
    if (receivedInvitationData.isConsent == 2) {
      return Colors.grey.withAlpha(7);
    }

    if (receivedInvitationData.isContact == 1 &&
        receivedInvitationData.isConsent == 1) {
      return AppColors.GREEN_TRANSPARENT;
    }

    return AppColors.FORM_GREY;
  }

  void showDialogForInvitation(
      ReceivedInvitationData receivedInvitationData,
      GetOneMeetingModel oneMeetingData,
      int index,
      GetOneMeetingModel oneMeetData) {
    if (receivedInvitationData.isRead == 0) {
      print("1");
      showDialog(
          context: context,
          builder: (context) {
            return InvitationDialog(
              oneMeetingData: oneMeetingData,
              indexPosition: index,
              from: "received",
            );
          });
      return;
    }

    if (oneMeetData.isConsent == 1 && oneMeetData.isMeet < 2) {
      print("2");
      showDialog(
          context: context,
          builder: (context) {
            return InvitationCallDialog(
              oneMeetingData: oneMeetingData,
              indexPosition: index,
              from: "received",
              removeCancelBtn: oneMeetingData.isMeet == 1,
            );
          });
      return;
    }

    if (oneMeetData.isConsent == 0 && oneMeetData.isMeet == 0 ||
        oneMeetData.isMeet == 1) {
      print("3");
      showDialog(
          context: context,
          builder: (context) {
            return InvitationDialog(
                oneMeetingData: oneMeetingData,
                indexPosition: index,
                from: "received");
          });
      return;
    }

    if (oneMeetData.isConsent == 2 ||
        oneMeetData.isConsent == 1 && oneMeetData.isMeet == 3 ||
        oneMeetData.isMeet == 2) {
      print("4");
      showDialog(
          context: context,
          builder: (context) {
            return InvitationCallDialog(
              oneMeetingData: oneMeetingData,
              invitationCancelled: true,
              indexPosition: index,
              from: "received",
              removeCancelBtn: oneMeetingData.isMeet == 1,
            );
          });
      return;
    }

    if (oneMeetData.isMeet == 2 || oneMeetData.isMeet == 3) {
      print("5");
      showDialog(
          context: context,
          builder: (context) {
            return InvitationCallDialog(
              oneMeetingData: oneMeetingData,
              invitationCancelled: true,
              indexPosition: index,
              from: "received",
              removeCancelBtn: oneMeetingData.isMeet == 1,
            );
          });
      return;
    }
    if (oneMeetData.isConsent == 2) {
      print("6");
      showDialog(
          context: context,
          builder: (context) {
            return InvitationCallDialog(
              oneMeetingData: oneMeetingData,
              invitationCancelled: true,
              indexPosition: index,
              from: "received",
              removeCancelBtn: oneMeetingData.isMeet == 1,
            );
          });
      return;
    }
    if (oneMeetData.isContact == 1 &&
        oneMeetData.isConsent == 1 &&
        oneMeetData.isMeet == 1) {
      print("7");
      showDialog(
          context: context,
          builder: (context) {
            return InvitationCallDialog(
              oneMeetingData: oneMeetingData,
              invitationCancelled: false,
              indexPosition: index,
              from: "received",
              removeCancelBtn: oneMeetingData.isMeet == 1,
            );
          });
      return;
    }
  }

  void getOneMeeting(
      ReceivedInvitationData receivedInvitationData, int index) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _invitationListController.getOneMeeting(
          userDataModel.authToken.toString(), receivedInvitationData.meetingId);
      if (model.flag) {
        Provider.of<AppDataNotifier>(context, listen: false)
            .updateInvitationAt("received");
        Provider.of<AppDataNotifier>(context, listen: false)
            .setInvitationIndex(index);
        Provider.of<AppDataNotifier>(context, listen: false)
            .setInvitationStatus(1);
        showDialogForInvitation(receivedInvitationData, model, index, model);
      } else {
        throw model.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }
}
