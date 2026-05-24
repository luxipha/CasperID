import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/help_center/change_phone_number/help_center_change_phone_controller.dart';
import 'package:highfedilityadevar/models/help_center/check_code_get_token_model.dart';
import 'package:highfedilityadevar/models/help_center/send_help_feedback_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/utils/helper.dart';
import 'package:highfedilityadevar/views/pages/change_phone_number_module/change_number_new_pin/change_number_new_pin_page.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

class NewNumberVerificationCodePage extends StatefulWidget {
  @override
  _NewNumberVerificationCodePageState createState() =>
      _NewNumberVerificationCodePageState();
}

class _NewNumberVerificationCodePageState
    extends State<NewNumberVerificationCodePage> with BaseClass {
  final HelpCenterChangePhoneController controller =
      Get.put(HelpCenterChangePhoneController());
  final TextEditingController _textEditingController = TextEditingController();
  int codeLength = 0;

  RxString buttonText = 'NEXT'.obs;
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
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 90,
              ),
              Container(
                margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                child: Text(
                  'Enter\nverification code',
                  style: GoogleFonts.roboto(
                      color: Colors.black,
                      fontSize: 32,
                      fontWeight: FontWeight.w700),
                ),
              ),
              SizedBox(
                height: 44,
              ),
              Container(
                margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
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
                  keyboardType: TextInputType.numberWithOptions(decimal: false),
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
                      codeLength = value.length;
                      if (value.length == 6) {
                        buttonText.value = 'NEXT';
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
                Center(
                  child: RichText(
                    text: TextSpan(
                      text: '$errorText, You have',
                      style: TextStyle(color: Colors.red),
                      children: <TextSpan>[
                        TextSpan(
                            text: ' ${remainingCount.toString()}',
                            style: TextStyle(color: Colors.blue)),
                        TextSpan(
                            text: remainingCount >= 2 ? ' chances' : ' chance',
                            style: TextStyle(color: Colors.red)),
                      ],
                    ),
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
                    color: codeLength != 6
                        ? AppColors.BUTTON_COLOR_WITH_OPACITY
                        : AppColors.BUTTON_COLOR,
                    text: buttonText.value,
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
    );
  }

  verifyCode() async {
    errorText = '';
    remainingCount = 0;
    try {
      showCircularDialog(context);
      var model = await controller
          .checkNewMobile(_textEditingController.text.toString());

      Get.back();
      if (model.flag!) {
        errorText = '';

        setState(() {});
        showSuccess(title: "Success", message: model.message!);
        Get.to(() => ChangeNumberNewPinPage());
      } else {
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
        // showError(title: 'Error', message: model.message!);
      }
    } catch (e) {
      Get.back();
      // showError(title: 'Error', message: e.toString());
    }
  }

  getCode() async {
    try {
      showCircularDialog(context);
      SendHelpAndFeedbackModel model =
          await controller.sendCodeToNewMobile(controller.myNewMobileNumber);
      popToPreviousScreen(context: context);
      if (model.flag!) {
        showSuccess(title: 'Success', message: model.message!);
        remainingCount = 0;
        errorText = '';
        _textEditingController.clear();
        buttonText.value = "NEXT";
        setState(() {});
        // Get.to(NewNumberVerificationCodePage());
      } else {
        showError(title: 'Error', message: model.message!);
      }
    } catch (e) {
      popToPreviousScreen(context: context);
      // showError(title: 'Error', message: e.toString());
    }
  }
}
