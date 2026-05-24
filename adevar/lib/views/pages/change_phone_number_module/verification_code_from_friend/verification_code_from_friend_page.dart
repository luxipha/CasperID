import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/help_center/change_phone_number/help_center_change_phone_controller.dart';
import 'package:highfedilityadevar/models/help_center/send_help_feedback_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/change_phone_number_module/enter_new_number/enter_new_number_page.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

class VerificationCodeFromFriendPage extends StatefulWidget {
  @override
  _VerificationCodeFromFriendPageState createState() =>
      _VerificationCodeFromFriendPageState();
}

class _VerificationCodeFromFriendPageState
    extends State<VerificationCodeFromFriendPage> with BaseClass {
  final TextEditingController _textEditingController = TextEditingController();
  final HelpCenterChangePhoneController controller =
      Get.put(HelpCenterChangePhoneController());
  String codeLength = "";

  RxString buttonText = 'Get verification code'.obs;
  String errorText = '';
  int remainingCount = 0;
  Timer? timer;
  RxInt retryTimer = 0.obs;

  void startTimer() {
    retryTimer.value = 59;

    const oneSec = const Duration(seconds: 1);
    timer = new Timer.periodic(
      oneSec,
      (Timer timer) {
        if (retryTimer.value == 0) {
          timer.cancel();
          buttonText.value = "Resend";
          if (mounted) {
            setState(() {});
          }
        } else {
          retryTimer.value--;
          buttonText.value = "Resend ${retryTimer.value}s";
          if (mounted) {
            setState(() {});
          }
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: SingleChildScrollView(
        child: Column(
          //mainAxisAlignment: MainAxisAlignment.spaceAround,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(
                  height: 60,
                ),
                Container(
                  height: 90,
                  width: 90,
                  decoration: BoxDecoration(shape: BoxShape.circle),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(50),
                    child: Image(
                      image: NetworkImage(controller.emergencyContactLogo),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                Container(
                  margin:
                      EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                  child: Text(
                    controller.emergencyContactName.toString() != 'nullnull'
                        ? "${controller.emergencyContactName.toString()}"
                        : "",
                    style: GoogleFonts.roboto(
                        color: Colors.black,
                        fontSize: 32,
                        fontWeight: FontWeight.w700),
                  ),
                ),
                SizedBox(
                  height: 33,
                ),
                Container(
                  margin: EdgeInsets.symmetric(horizontal: 50),
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: 'Please input the ',
                          style: GoogleFonts.roboto(
                            color: Colors.black,
                            fontSize: 18,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                        TextSpan(
                          text: 'verification code from your friend',
                          style: GoogleFonts.roboto(
                            color: AppColors.BUTTON_COLOR,
                            fontSize: 18,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                SizedBox(
                  height: 44,
                ),
                Container(
                  margin:
                      EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                  child: PinCodeTextField(
                    length: 6,

                    obscureText: false,
                    animationType: AnimationType.fade,
                    pinTheme: PinTheme(
                      shape: PinCodeFieldShape.box,
                      borderRadius: BorderRadius.circular(10),
                      activeColor: AppColors.BUTTON_COLOR,
                      inactiveColor: AppColors.BUTTON_COLOR,
                      selectedFillColor: AppColors.BUTTON_COLOR,
                      selectedColor: AppColors.BUTTON_COLOR,
                    ),
                    cursorColor: AppColors.BUTTON_COLOR,
                    keyboardType:
                        TextInputType.numberWithOptions(decimal: false),
                    animationDuration: Duration(milliseconds: 200),
                    //backgroundColor: Colors.blue.shade50,
                    //enableActiveFill: true,
                    //errorAnimationController: errorController,
                    controller: _textEditingController,
                    onCompleted: (v) {
                      print("Completed");
                    },
                    onChanged: (value) {
                      setState(() {
                        codeLength = value;
                        if (value.length == 6) {
                          buttonText.value = 'NEXT';
                        } else {
                          // buttonText = 'Required (60s)';
                        }
                      });
                      /*setState(() {
                                          currentText = value;
                                        });*/
                    },
                    beforeTextPaste: (text) {
                      print("Allowing to paste $text");
                      //if you return true then it will show the paste confirmation dialog. Otherwise if false, then nothing will happen.
                      //but you can show anything you want here, like your pop up saying wrong paste format or etc
                      return true;
                    },
                    appContext: context,
                  ),
                ),
                if (errorText != '' && remainingCount != 0)
                  RichText(
                    text: TextSpan(
                      text: '$errorText, You have',
                      style: TextStyle(color: Colors.red),
                      children: <TextSpan>[
                        TextSpan(
                            text: ' ${remainingCount.toString()}',
                            style: TextStyle(color: Colors.blue)),
                        TextSpan(
                            text: remainingCount >= 2
                                ? ' chances left'
                                : ' chance left',
                            style: TextStyle(color: Colors.red)),
                      ],
                    ),
                  ),
                if (remainingCount == 0)
                  Text(
                    '$errorText',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.red),
                  ),
                SizedBox(
                  height: 44,
                ),
                Obx(
                  () => RoundedEdgeButton(
                      height: AppSizes.BUTTON_HEIGHT,
                      color: codeLength.length != 6
                          ? AppColors.BUTTON_COLOR_WITH_OPACITY
                          : AppColors.BUTTON_COLOR,
                      text: buttonText.value,
                      // codeLength.length == 6 && errorText == ''
                      //     ? "NEXT"
                      //     : errorText != '' && retryTimer.value != 0
                      //         ? "Retry ${retryTimer.value}s"
                      //         : retryTimer.value == 0 && remainingCount != 0
                      //             ? "Retry"
                      //             : remainingCount == 0 && retryTimer.value == 0
                      //                 ? "Get"
                      //                 : "Get",
                      buttonRadius: AppSizes.BUTTON_RADIUS,
                      textColor: AppColors.WHITE,
                      textFontSize: AppSizes.BUTTON_FONT_SIZE,
                      leftMargin: AppSizes.BUTTON_MARGIN,
                      topMargin: AppSizes.BUTTON_MARGIN,
                      rightMargin: AppSizes.BUTTON_MARGIN,
                      onPressed: (value) async {
                        if (buttonText.value == 'Resend' &&
                            retryTimer.value == 0 &&
                            remainingCount == 0) {
                          getCode();
                        } else {
                          verifyCode();
                        }
                      },
                      context: context),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  verifyCode() async {
    errorText = '';
    remainingCount = 0;
    try {
      showCircularDialog(context);
      var model = await controller.checkCodeAndGetToken({
        'myMobile': controller.myMobileNumber.toString(),
        'code': _textEditingController.text.toString(),
      });

      Get.back();
      if (model.flag!) {
        errorText = '';
        buttonText.value = 'Get verification code';
        setState(() {});
        controller.safeToken = model.data;
        showSuccess(title: 'Success', message: model.message!);
        Get.to(() => EnterNewNumberPage());
      } else {
        // startTimer();
        errorText = model.message;
        remainingCount = model.data.remainingCount;
        if (remainingCount == 0) {
          errorText = '';
          buttonText.value = "Resend";
          startTimer();
        } else {
          buttonText.value = "Retry";
          setState(() {});
        }

        setState(() {});
        // showError(title: 'Error', message: model.message!);
      }
    } on Exception catch (e) {
      Get.back();
      // showError(title: 'Error', message: e.toString());

    }
  }

  getCode() async {
    showCircularDialog(context);
    SendHelpAndFeedbackModel model = await controller.sendCodeToFriend({
      "myMobile": controller.myMobileNumber.toString(),
      "emergencyContactId": controller.emergencyContactId
    });
    Get.back();
    if (model.flag!) {
      remainingCount = 0;
      errorText = '';
      _textEditingController.clear();
      buttonText.value = "Get verification code";
      setState(() {});
      showSuccess(title: 'Success', message: model.message!);
      // Get.to(() => VerificationCodeFromFriendPage());
    } else {
      showError(title: 'Error', message: model.message!);
    }
  }
}
