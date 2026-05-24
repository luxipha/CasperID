import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/help_center/freeze_appeal/help_center_freeze_appeal_controller.dart';
import 'package:highfedilityadevar/models/help_center/send_help_feedback_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';

import 'package:highfedilityadevar/views/dialogs/app_dialogs.dart';
import 'package:highfedilityadevar/views/pages/forget_pin_facial_recognition/forget_pin_facial_page.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_phone_number/register_phone_number_page.dart';

import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

class FreezeAppealVerificationCodePage extends StatefulWidget {
  @override
  _FreezeAppealVerificationCodePageState createState() =>
      _FreezeAppealVerificationCodePageState();
}

class _FreezeAppealVerificationCodePageState
    extends State<FreezeAppealVerificationCodePage> with BaseClass {
  final TextEditingController _textEditingController = TextEditingController();
  final HelpCenterFreezeAppealController controller =
      Get.put(HelpCenterFreezeAppealController());
  int codeLength = 0;

  String buttonText = 'Confirm';
  String errorText = '';
  int remainingCount = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              height: 100,
              width: 65,
              child: Image(image: AssetImage(AppImages.custom_lock)),
            ),
            SizedBox(
              height: 30,
            ),
            Container(
              margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
              child: Text(
                'PIN',
                style: GoogleFonts.roboto(
                    color: Colors.black,
                    fontSize: 32,
                    fontWeight: FontWeight.w700),
              ),
            ),
            SizedBox(
              height: 9,
            ),
            Container(
              margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
              child: Text(
                controller.isAccountLocked == 0
                    ? 'Enter your data security pin to lock your account.'
                    : 'Enter your data security pin to Unlock your account.',
                style: GoogleFonts.roboto(
                    color: Colors.black,
                    fontSize: 12,
                    fontWeight: FontWeight.w400),
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
                  shape: PinCodeFieldShape.underline,
                  borderRadius: BorderRadius.circular(10),
                  activeColor: AppColors.BLACK,
                  inactiveColor: AppColors.BLACK,
                  selectedFillColor: AppColors.BLACK,
                  selectedColor: AppColors.BLACK,
                ),
                cursorColor: AppColors.BLACK,
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
                      buttonText = 'Next';
                    } else {
                      buttonText = 'Confirm';
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
            RoundedEdgeButton(
                height: AppSizes.BUTTON_HEIGHT,
                color: codeLength != 6
                    ? AppColors.BUTTON_COLOR_WITH_OPACITY
                    : AppColors.BUTTON_COLOR,
                text: buttonText,
                buttonRadius: AppSizes.BUTTON_RADIUS,
                textColor: AppColors.WHITE,
                textFontSize: AppSizes.BUTTON_FONT_SIZE,
                leftMargin: AppSizes.BUTTON_MARGIN,
                topMargin: AppSizes.BUTTON_MARGIN,
                rightMargin: AppSizes.BUTTON_MARGIN,
                onPressed: (value) async {
                  if (buttonText == "Ok") {
                    Get.offAll(RegisterPhoneNumberPage());
                  } else {
                    try {
                      var model;
                      showCircularDialog(context);
                      if (controller.isAccountLocked == 0) {
                        model = await controller.lockAccount(
                          _textEditingController.text..toString(),
                        );
                      } else {
                        model = await controller.unLockAccount(
                          _textEditingController.text..toString(),
                        );
                      }
                      Get.back();
                      if (model.flag!) {
                        // showSuccess(title: 'Success', message: model.message!);
                        if (controller.isAccountLocked == 0) {
                          AppDialogs.showFreezeDialog(context, "Locked");
                        } else {
                          AppDialogs.showFreezeDialog(context, "Unlocked");
                        }
                        Future.delayed(Duration(seconds: 2), () {
                          Get.back();
                          Get.offAll(() => RegisterPhoneNumberPage());
                        });
                      } else {
                        errorText = '';
                        remainingCount = 0;
                        errorText = model.message;
                        remainingCount = model.data.remainingCount;
                        if (remainingCount == 0) {
                          buttonText = "Ok";
                        } else {
                          buttonText = "Retry";
                        }
                        setState(() {});

                        // showError(title: 'Error', message: model.message!);
                      }
                    } catch (e) {
                      Get.back();
                      // showError(title: 'Error', message: e.toString());
                    }
                  }
                },
                context: context),
            SizedBox(
              height: 37,
            ),
            // TextButton(
            //   onPressed: () {
            //     // Get.to(() => ForgetPinFaceConfirmationPage());
            //     //AppDialogs.showDialog(context);
            //   },
            //   child: Text(
            //     'Forget your PIN?',
            //     style: GoogleFonts.roboto(
            //         color: AppColors.BUTTON_COLOR,
            //         fontSize: 12,
            //         fontWeight: FontWeight.w400),
            //   ),
            // ),
          ],
        ),
      ),
    );
  }
}
