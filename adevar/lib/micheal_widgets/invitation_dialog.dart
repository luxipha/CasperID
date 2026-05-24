import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/micheal_widgets/invitation_call_dialog.dart';
import 'package:highfedilityadevar/models/InvitationModel/GetOneMeetingModel.dart';
import 'package:highfedilityadevar/services/api_service.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/utils/utils.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../controllers/invitation_list_controller/InvitationListController.dart';
import '../controllers/user_data/get_shared_pref.dart';
import '../models/user_data/user_model.dart';
import '../utils/AppDataNotifiier.dart';

class InvitationDialog extends StatefulWidget {
  final GetOneMeetingModel oneMeetingData;
  final int indexPosition;
  final String from;

  const InvitationDialog(
      {Key? key,
      required this.oneMeetingData,
      required this.indexPosition,
      required this.from})
      : super(key: key);

  @override
  _InvitationDialog createState() => _InvitationDialog();
}

class _InvitationDialog extends State<InvitationDialog> with BaseClass {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final InvitationListController _invitationListController =
      Get.isRegistered<InvitationListController>()
          ? Get.find<InvitationListController>()
          : Get.put(InvitationListController());

  GetOneMeetingModel? oneMeetingData;

  @override
  void initState() {
    super.initState();
    oneMeetingData = widget.oneMeetingData;
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 70.0),
          child: Container(
            height: 530,
            width: MediaQuery.of(context).size.width,
            // color: Colors.green,
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Material(
                  borderRadius: BorderRadius.circular(15),
                  child: Container(
                    height: 470,
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
                              Image.asset(
                                oneMeetingData?.gender == "man"
                                    ? AppImages.male
                                    : AppImages.female,
                                height: 20,
                                width: 20,
                              ),
                            ],
                          ),
                        ),
                        SizedBox(
                          height: 20,
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              width: MediaQuery.of(context).size.width * 0.37,
                              child: Row(
                                children: [
                                  SvgPicture.asset('assets/svg/globe.svg'),
                                  SizedBox(
                                    width: 5,
                                  ),
                                  Flexible(
                                    child: Text(
                                      '${oneMeetingData?.city}, ${oneMeetingData?.country}',
                                      style: GoogleFonts.roboto(),
                                      maxLines: 2,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              width: MediaQuery.of(context).size.width * 0.36,
                              child: Row(
                                children: [
                                  SvgPicture.asset('assets/svg/user.svg'),
                                  SizedBox(
                                    width: 5,
                                  ),
                                  Flexible(
                                      child: Text(
                                    oneMeetingData?.position,
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
                          height: 10,
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            InkWell(
                              onTap: () {
                                Navigator.of(context).pop();
                                showDialog(
                                    context: context,
                                    builder: (context) {
                                      return InvitationCallDialog(
                                        oneMeetingData: oneMeetingData!,
                                        showInvitationCancelText: true,
                                        invitationCancelled: true,
                                        indexPosition: widget.indexPosition,
                                        from: widget.from,
                                      );
                                    });
                              },
                              child: Container(
                                height: 50,
                                width: 100,
                                decoration: BoxDecoration(
                                  color: Colors.grey[200],
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Center(
                                  child: Text(
                                    'NO',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            InkWell(
                              onTap: () {
                                consentMeeting(oneMeetingData?.meetingId);
                              },
                              child: Container(
                                height: 50,
                                width: 150,
                                decoration: BoxDecoration(
                                  color: Color(0xFF0078D4),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Center(
                                  child: Text(
                                    'YES',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        )
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
              ClipOval(
                child: Image.network(
                  oneMeetingData!.logo,
                  height: 75,
                  width: 75,
                  fit: BoxFit.cover,
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
                        height: 26,
                        width: 26,
                      ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void consentMeeting(meetingId) async {
    print("Tapped 1 ");
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _invitationListController.consentMeeting(
          userDataModel.authToken.toString(), meetingId);
      if (model.flag) {
        Navigator.of(context).pop();
        Provider.of<AppDataNotifier>(context, listen: false)
            .updateInvitationAt(widget.from);
        Provider.of<AppDataNotifier>(context, listen: false)
            .setInvitationIndex(widget.indexPosition);
        Provider.of<AppDataNotifier>(context, listen: false)
            .setInvitationStatus(2);
        showDialog(
            context: context,
            builder: (context) {
              return InvitationCallDialog(
                oneMeetingData: oneMeetingData!,
                indexPosition: widget.indexPosition,
                from: widget.from,
              );
            });
      } else {
        throw model.message;
      }
    } catch (error) {
      // showError(title: "Error", message: error.toString());
    }
  }
}
