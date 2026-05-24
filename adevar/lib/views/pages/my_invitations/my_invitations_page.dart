import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/micheal_widgets/invitation_call_dialog.dart';
import 'package:highfedilityadevar/micheal_widgets/invitation_dialog.dart';
import 'package:highfedilityadevar/models/InvitationModel/GetOneMeetingModel.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:provider/provider.dart';

import '../../../controllers/invitation_list_controller/InvitationListController.dart';
import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/InvitationModel/InvitationListModel.dart';
import '../../../models/user_data/user_model.dart';
import '../../../utils/AppDataNotifiier.dart';

class MyInvitationsPage extends StatefulWidget {
  final InvitationListModel invitationListModel;

  const MyInvitationsPage({Key? key, required this.invitationListModel})
      : super(key: key);

  @override
  _MyInvitationsPage createState() => _MyInvitationsPage();
}

class _MyInvitationsPage extends State<MyInvitationsPage> with BaseClass {
  bool invitationListLoaded = false;

  List<MyInvitationData> myInvitationData = [];

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final InvitationListController _invitationListController =
      Get.isRegistered<InvitationListController>()
          ? Get.find<InvitationListController>()
          : Get.put(InvitationListController());

  int pageNo = 0;

  var size = 20;

  bool isLoading = false;

  bool noMoreItems = false;

  ScrollController _scrollController = new ScrollController();

  @override
  void initState() {
    super.initState();
    myInvitationData = widget.invitationListModel.myInvitationData;
    setScrollListener();
  }

  @override
  Widget build(BuildContext context) {
    final notifier = context.watch<AppDataNotifier>();

    if (notifier.updateInvitationOf == "my" && notifier.invitationStatus > 0) {
      print("my ${notifier.invitationIndex}");
      if (notifier.invitationStatus == 1) {
        //isRead
        print("isRead ${notifier.invitationIndex}");
        myInvitationData[notifier.invitationIndex].setReadStatus(1);
      } else if (notifier.invitationStatus == 2) {
        print("isRefused ${notifier.invitationIndex}");
        // isConsent
        myInvitationData[notifier.invitationIndex].setReadStatus(1);
        myInvitationData[notifier.invitationIndex].setConsentStatus(1);
      } else if (notifier.invitationStatus == 3) {
        print("isRefused ${notifier.invitationIndex}");
        // isRefused
        myInvitationData[notifier.invitationIndex].setReadStatus(1);
        myInvitationData[notifier.invitationIndex].setConsentStatus(2);
      } else if (notifier.invitationStatus == 4) {
        print("isCancelled ${notifier.invitationIndex}");

        //isCancelled
        myInvitationData[notifier.invitationIndex].setReadStatus(1);
        myInvitationData[notifier.invitationIndex].setMeetingStatus(3);
      } else if (notifier.invitationStatus == 5) {
        //isContacted
        print("isContacted ${notifier.invitationIndex}");
        myInvitationData[notifier.invitationIndex].setReadStatus(1);
        myInvitationData[notifier.invitationIndex].setMeetingStatus(1);
        myInvitationData[notifier.invitationIndex].setConsentStatus(1);
        myInvitationData[notifier.invitationIndex].setCallStatus(1);
      }
    }
    return ListView.builder(
        physics: NeverScrollableScrollPhysics(),
        controller: _scrollController,
        shrinkWrap: true,
        itemCount: myInvitationData.length,
        itemBuilder: (BuildContext context, int index) {
          return Container(
            margin: EdgeInsets.symmetric(vertical: 5, horizontal: 20),
            child: Container(
              decoration: BoxDecoration(
                color: setBlockColor(myInvitationData[index]),
                borderRadius: BorderRadius.circular(15),
              ),
              child: InkWell(
                onTap: () {
                  getOneMeeting(myInvitationData[index], index);
                },
                child: Container(
                  padding: EdgeInsets.symmetric(vertical: 15, horizontal: 20),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Stack(
                        children: [
                          ClipOval(
                              child: Image.network(
                            myInvitationData[index].logo,
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
                                child: Image.network(
                                  myInvitationData[index].badgeUrl ?? "",
                                  height: 25,
                                  width: 25,
                                ),
                              ))
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
                                  "${myInvitationData[index].firstName}",
                                  style: GoogleFonts.roboto(
                                      fontWeight: FontWeight.w400,
                                      fontSize: 18,
                                      color: Colors.black),
                                ),
                                SizedBox(
                                  width: 10,
                                ),
                                Image(
                                  image: AssetImage(AppImages.male),
                                  width: 11,
                                  height: 15,
                                ),
                                Spacer(),
                                endIconsWidget(myInvitationData[index])
                              ],
                            ),
                            SizedBox(
                              height: 7,
                            ),
                            Text(
                              '${myInvitationData[index].position} · ${myInvitationData[index].city}',
                              style: GoogleFonts.roboto(
                                  fontWeight: FontWeight.w400,
                                  fontSize: 12,
                                  color: AppColors.DARK_GREY),
                            ),
                            SizedBox(
                              height: 5,
                            ),
                            Text(
                              '${myInvitationData[index].introduction}',
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
            addMoreInvitationList();
            isLoading = true;
          } else {
            isLoading = false;
          }
          setState(() {});
        }
      }
    });
  }

  void addMoreInvitationList() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      pageNo = pageNo + 1;
      var model = await _invitationListController.getInvitationList(
          userDataModel.authToken.toString(), pageNo.toString(), "20");

      if (model.flag) {
        noMoreItems = model.myInvitationData.isEmpty;
        isLoading = false;
        if (!noMoreItems) {
          myInvitationData.addAll(model.myInvitationData);
        }
        setState(() {});
      } else {
        isLoading = false;
        noMoreItems = model.myInvitationData.isEmpty;
        setState(() {});
        throw model.message;
      }
    } catch (error) {}
  }

  Widget endIconsWidget(MyInvitationData myInvitationData) {
    if (myInvitationData.isRead == 0) {
      return Container(
        height: 8,
        width: 8,
        decoration: new BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.red,
        ),
      );
    }

    if (myInvitationData.isRead == 1 &&
            myInvitationData.isConsent == 1 &&
            myInvitationData.isMeet <= 1 &&
            myInvitationData.isContact == 0 ||
        myInvitationData.isContact == null ||
        myInvitationData.isContact == "") {
      return SvgPicture.asset(
        AppImages.CALL_END,
        height: 9,
        width: 9,
      );
    }

    if (myInvitationData.isRead == 1 &&
        myInvitationData.isContact == 0 &&
        myInvitationData.isConsent == 0 &&
        myInvitationData.isMeet == 0) {
      return Container();
    }

    if (myInvitationData.isMeet == 3 || myInvitationData.isMeet == 2) {
      return Icon(
        Icons.cancel_rounded,
        color: AppColors.red.withAlpha(80),
        size: 18,
      );
    }

    if (myInvitationData.isConsent == 2) {
      return Container(
        child: SvgPicture.asset(
          AppImages.REFUSE_ICON,
          height: 14,
          width: 14,
        ),
      );
    }
    if (myInvitationData.isContact == 1 &&
        myInvitationData.isConsent == 1 &&
        myInvitationData.isMeet <= 1) {
      return Icon(
        Icons.call,
        color: AppColors.greenColor,
        size: 20,
      );
    }

    if (myInvitationData.isRead == 0) {
      return Container();
    }
    return Container();
  }

  setBlockColor(MyInvitationData myInvitationData) {
    if (myInvitationData.isRead == 0) {
      return AppColors.FORM_GREY;
    }

    if (myInvitationData.isRead == 1 &&
            myInvitationData.isConsent == 1 &&
            myInvitationData.isMeet <= 1 &&
            myInvitationData.isContact == 0 ||
        myInvitationData.isContact == null ||
        myInvitationData.isContact == "") {
      return AppColors.YELLOW_TRANSPARENT;
    }

    if (myInvitationData.isRead == 1 &&
        myInvitationData.isContact == 0 &&
        myInvitationData.isConsent == 0 &&
        myInvitationData.isMeet == 0) {
      return AppColors.FORM_GREY;
    }

    if (myInvitationData.isMeet == 3 || myInvitationData.isMeet == 2) {
      return Colors.grey.withAlpha(7);
    }

    if (myInvitationData.isConsent == 2) {
      return Colors.grey.withAlpha(7);
    }

    if (myInvitationData.isContact == 1 &&
        myInvitationData.isConsent == 1 &&
        myInvitationData.isMeet <= 1) {
      return AppColors.GREEN_TRANSPARENT;
    }

    return AppColors.FORM_GREY;
  }

  void showDialogForInvitation(
      MyInvitationData myInvitationData,
      GetOneMeetingModel oneMeetingData,
      int index,
      GetOneMeetingModel oneMeetData) {
    if (myInvitationData.isRead == 0) {
      print("1");
      /*  showDialog(
          context: context,
          builder: (context) {
            return InvitationDialog(
              oneMeetingData: oneMeetingData,
              indexPosition: index,
              from: "my",
            );
          });*/
      return;
    }
    if (oneMeetData.isConsent == 1 && oneMeetData.isMeet < 2 ||
        oneMeetingData.isContact == 1) {
      print("2654");
      showDialog(
          context: context,
          builder: (context) {
            return InvitationCallDialog(
              oneMeetingData: oneMeetingData,
              indexPosition: index,
              from: "my",
              removeCancelBtn: oneMeetingData.isMeet == 1,
            );
          });
      return;
    }

    if (oneMeetData.isConsent == 0 && oneMeetData.isMeet == 0) {
      print("3");
      /*showDialog(
          context: context,
          builder: (context) {
            return InvitationDialog(
                oneMeetingData: oneMeetingData,
                indexPosition: index,
                from: "my"
            );
          });*/
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
              from: "my",
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
                from: "my",
                removeCancelBtn: oneMeetingData.isMeet == 1);
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
              from: "my",
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
              from: "my",
              removeCancelBtn: oneMeetingData.isMeet == 1,
            );
          });
      return;
    }
  }

  void getOneMeeting(MyInvitationData myInvitationData, int index) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _invitationListController.getOneMeeting(
          userDataModel.authToken.toString(), myInvitationData.meetingId);
      if (model.flag) {
        // Provider.of<AppDataNotifier>(context,listen: false).setInvitationStatus(4);
        // Provider.of<AppDataNotifier>(context,listen: false).setInvitationIndex(index);
        // Provider.of<AppDataNotifier>(context,listen: false).updateInvitationAt("my");
        showDialogForInvitation(myInvitationData, model, index, model);
      } else {
        throw model.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }
}
