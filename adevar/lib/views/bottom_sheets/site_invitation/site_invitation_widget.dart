import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/views/pages/public_qr_portfolio/public_invite_controller.dart';
import 'package:intl/intl.dart';

import '../../../consts/app_colors.dart';
import '../../../consts/app_images.dart';
import '../../widgets/form_input_with_hint_on_top.dart';

class SiteInvitationWidget extends StatefulWidget {
  SiteInvitationWidget(Function this.onSubmitTap, this.isSucc);
  final onSubmitTap;
  final isSucc;

  @override
  _SiteInvitationWidgetState createState() => _SiteInvitationWidgetState();
}

class _SiteInvitationWidgetState extends State<SiteInvitationWidget> {
  final PublicInviteController _publicInviteController =
      Get.isRegistered<PublicInviteController>()
          ? Get.find<PublicInviteController>()
          : Get.put(PublicInviteController());

  var today = new DateTime(
      DateTime.now().year, DateTime.now().month, DateTime.now().day);
  bool isTimeShow = false;
  String selectedDate =
      DateFormat('dd  MMMM  yyy').format(DateTime.now()).toString();
  String selectedDatebody = DateTime.now().toString();

  TextEditingController writeSomethingEdit = TextEditingController();
  TextEditingController siteEdit = TextEditingController();

  String selectedTime = DateFormat.jm().format(DateTime.now());

  bool isSendButton = false;

  @override
  Widget build(BuildContext context) {
    return GetBuilder<PublicInviteController>(
        init: _publicInviteController,
        builder: (value) {
          return Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24.0),
                  topRight: Radius.circular(24.0)),
              color: Colors.white,
            ),
            padding: EdgeInsets.only(top: 20.0),
            child: Padding(
              padding: EdgeInsets.only(
                  bottom: MediaQuery.of(context).viewInsets.bottom),
              child: new Wrap(
                children: <Widget>[
                  Center(
                    child: Container(
                      height: 6,
                      width: 100,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(30),
                        color: AppColors.ICON_GREY,
                      ),
                    ),
                  ),
                  !isSendButton
                      ? Container(
                          margin: EdgeInsets.only(left: 36, right: 36, top: 10),
                          child: Text(
                            'Time',
                            style: TextStyle(
                                color: Colors.black,
                                fontSize: 24,
                                fontWeight: FontWeight.w400),
                          ),
                        )
                      : Container(),
                  !isSendButton
                      ? Container(
                          margin: EdgeInsets.only(left: 36, right: 36),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Flexible(
                                flex: 2,
                                child: Text(
                                  selectedDate,
                                  style: TextStyle(
                                      color: Colors.black,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w400),
                                ),
                              ),
                              Flexible(
                                flex: 1,
                                child: Text(
                                  selectedTime,
                                  style: TextStyle(
                                      color: Colors.black,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w400),
                                ),
                              ),
                              Flexible(
                                flex: 1,
                                child: GestureDetector(
                                  onTap: () {
                                    if (isTimeShow) {
                                      isTimeShow = false;
                                    } else {
                                      isTimeShow = true;
                                    }
                                    setState(() {});
                                  },
                                  child: Icon(
                                    Icons.arrow_drop_down_sharp,
                                    color: Colors.grey,
                                    size: 40,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )
                      : Container(),
                  !isSendButton
                      ? isTimeShow
                          ? Container(
                              height: 200,
                              width: double.infinity,
                              child: CupertinoDatePicker(
                                minimumDate: today,
                                minuteInterval: 1,
                                mode: CupertinoDatePickerMode.dateAndTime,
                                onDateTimeChanged: (DateTime dateTime) {
                                  print("dateTime: ${dateTime}");
                                  selectedDate = DateFormat('dd  MMMM  yyy')
                                      .format(dateTime)
                                      .toString();

                                  selectedDatebody = dateTime.toString();

                                  selectedTime =
                                      DateFormat.jm().format(dateTime);
                                  setState(() {});
                                },
                              ),
                            )
                          : Container()
                      : Container(),
                  !isSendButton
                      ? Container(
                          margin: EdgeInsets.only(
                              left: 36, right: 36, bottom: 11, top: 11),
                          child: Text(
                            'Site',
                            style: TextStyle(
                                color: Colors.black,
                                fontSize: 24,
                                fontWeight: FontWeight.w400),
                          ),
                        )
                      : Container(),
                  !isSendButton
                      ? Container(
                          decoration: BoxDecoration(
                              color: AppColors.TEXTFIELD_GREY,
                              boxShadow: [
                                BoxShadow(
                                  color: Color.fromRGBO(0, 1, 8, 0),
                                  blurRadius: 5.0,
                                  offset: Offset(0.0, 1),
                                ),
                              ],
                              borderRadius: BorderRadius.circular(15)),
                          margin: EdgeInsets.only(left: 36, right: 36),
                          padding: EdgeInsets.only(
                            left: 19,
                          ),
                          child: TextField(
                            style: TextStyle(color: Colors.black, fontSize: 16),
                            maxLines: 1,
                            textAlign: TextAlign.left,
                            controller: siteEdit,
                            cursorColor: Colors.black.withOpacity(0.1),

                            //   obscureText: isObscure,
                            decoration: InputDecoration(
                              border: InputBorder.none,
                              hintText: "Enter the site",
                              /*  prefixIcon: Icon(
                          Icons.edit,
                          color: Colors.black,
                        ),*/
                              hintStyle: TextStyle(
                                  color: AppColors.HINT_GREY, fontSize: 14),
                            ),
                          ),
                          // child: FormInputWithHint(
                          //   label: 'Site',
                          //   labelFontSize: 24,
                          //   labelFontWeight: FontWeight.w400,
                          //   // prefixIcon: Icon(
                          //   //   Icons.search,
                          //   //   color: Colors.grey,
                          //   // ),
                          //   hintText: 'Enter the site',
                          //   onChanged: () {},
                          //   focusNode: FocusNode(),
                          // ),
                        )
                      : Container(),
                  !isSendButton
                      ? Container(
                          margin: EdgeInsets.only(
                              left: 36, right: 36, bottom: 11, top: 11),
                          child: Text(
                            'Invitation',
                            style: TextStyle(
                                color: Colors.black,
                                fontSize: 24,
                                fontWeight: FontWeight.w400),
                          ),
                        )
                      : Container(),
                  !isSendButton
                      ? Container(
                          decoration: BoxDecoration(
                              color: AppColors.TEXTFIELD_GREY,
                              boxShadow: [
                                BoxShadow(
                                  color: Color.fromRGBO(0, 1, 8, 0),
                                  blurRadius: 5.0,
                                  offset: Offset(0.0, 1),
                                ),
                              ],
                              borderRadius: BorderRadius.circular(15)),
                          height: 150,
                          margin: EdgeInsets.only(left: 36, right: 36),
                          padding: EdgeInsets.only(
                            left: 19,
                          ),
                          child: TextField(
                            style: TextStyle(color: Colors.black, fontSize: 16),
                            maxLines: 10,
                            textAlign: TextAlign.left,
                            controller: writeSomethingEdit,
                            cursorColor: Colors.black.withOpacity(0.1),

                            //   obscureText: isObscure,
                            decoration: InputDecoration(
                              border: InputBorder.none,
                              hintText: "Write Something...",
                              /*  prefixIcon: Icon(
                          Icons.edit,
                          color: Colors.black,
                        ),*/
                              hintStyle: TextStyle(
                                  color: AppColors.HINT_GREY, fontSize: 14),
                            ),
                          ),
                        )
                      : Container(),
                  isSendButton && _publicInviteController.getSubmittedStatus
                      ? Align(
                          alignment: Alignment.center,
                          child: Column(
                            children: [
                              SizedBox(
                                height: 40,
                              ),
                              Image.asset(
                                AppImages.SUCCESS,
                                height: 70,
                                width: 70,
                              ),
                              SizedBox(
                                height: 14,
                              ),
                              Text(
                                'Success',
                                style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    decoration: TextDecoration.none,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w400),
                              ),
                              SizedBox(
                                height: 40,
                              ),
                            ],
                          ),
                        )
                      : Container(),
                  isSendButton && _publicInviteController.getFailedStatus
                      ? Align(
                          alignment: Alignment.center,
                          child: Column(
                            children: [
                              SizedBox(
                                height: 40,
                              ),
                              Image.asset(
                                AppImages.FAILURE,
                                height: 70,
                                width: 70,
                              ),
                              SizedBox(
                                height: 14,
                              ),
                              Text(
                                _publicInviteController.failedMessage,
                                style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    decoration: TextDecoration.none,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w400),
                              ),
                              SizedBox(
                                height: 40,
                              ),
                            ],
                          ),
                        )
                      : Container(),
                  GestureDetector(
                    onTap: () {
                      if (!isSendButton) {
                        isSendButton = true;
                        log('${writeSomethingEdit.text}');
                        log('${siteEdit.text}');
                        log('$selectedDatebody');
                        log('$selectedTime');
                        widget.onSubmitTap({
                          "comment": writeSomethingEdit.text,
                          "site": siteEdit.text,
                          "date": selectedDatebody,
                          "time": selectedTime
                        });
                        print("date-->>${selectedDate.toString()}");
                      } else {
                        Get.back();
                      }
                      // setState(() {

                      // });
                    },
                    child: Container(
                        height: 50,
                        decoration: BoxDecoration(
                          color: AppColors.BUTTON_COLOR,
                          borderRadius: BorderRadius.circular(15),
                        ),
                        margin: EdgeInsets.only(
                            left: 36, right: 36, top: 20, bottom: 35),
                        child: Center(
                            child: Text(
                          isSendButton &&
                                  _publicInviteController.getFailedStatus
                              ? "Ok"
                              : isSendButton &&
                                      _publicInviteController.getSubmittedStatus
                                  ? 'Confirm'
                                  : 'Send',
                          style: GoogleFonts.roboto(color: Colors.white),
                        ))),
                  ),
                ],
              ),
            ),
          ); /////
        });
  }
}
