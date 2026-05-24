import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/change_pin_password/change_pin_password_controller.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/dialogs/app_dialogs.dart';
import 'package:highfedilityadevar/views/pages/forget_pin_facial_recognition/forget_pin_facial_page.dart';
import 'package:highfedilityadevar/views/pages/home_base/home_base_page.dart';
import 'package:highfedilityadevar/views/pages/pin_success_failure/pin_success_failure_page.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_phone_number/register_phone_number_page.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_user_information/create_account_user_information.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../models/account_security/change_pin/verify_old_pin_model.dart';

class PinSettingsPage extends StatefulWidget {
  bool? pinExist;
  bool? fromRegistration;
  PinSettingsPage({
    Key? key,
    this.pinExist = true,
    this.fromRegistration = false,
  }) : super(key: key);

  @override
  _PinSettingsPageState createState() => _PinSettingsPageState();
}

class _PinSettingsPageState extends State<PinSettingsPage> with BaseClass {
  TextEditingController _textEditingController = TextEditingController();
  ChangePinPasswordController controller = ChangePinPasswordController();
  int codeLength = 0;

  String buttonText = 'Confirm';
  String printPinText = 'Please enter your old pin';
  bool isTextChanged = false;
  String certificateCode = '';
  String newPin = '';
  String confirmNewPin = '';
  String errorText = "";
  int remainingCount = 0;
  @override
  void initState() {
    if (widget.pinExist == false && widget.fromRegistration == false) {
      printPinText = 'Please enter your new PIN';
      isTextChanged = true;
    }
    if (widget.pinExist == false && widget.fromRegistration == true) {
      printPinText =
          'Pin is your only identification, please fill it carefully';
      isTextChanged = true;
    }
    super.initState();
  }

  setPin() async {
    AppDialogs.successDialog(context, title: 'Loading..');
    VerifyOldPinModel model = await controller.setPin(
      {
        "pin": _textEditingController.text.toString(),
      },
    );
    Get.back();
    if (model.flag!) {
      if (widget.fromRegistration == true) {
        SharedPreferences pref = await SharedPreferences.getInstance();
        pref.setString('pin', _textEditingController.text.toString());

        Get.to(() => CreateAccountPage());
      } else {
        Get.off(PinSuccessFailurePage(
          true,
          () => Get.offAll(() => RegisterPhoneNumberPage()),
          message: model.message,
        ));
      }

      setState(() {});
    } else {
      printPinText = 'Please enter your PIN';
      isTextChanged = true;
      _textEditingController = TextEditingController();
      _textEditingController.text = '';
      setState(() {});
      if (widget.fromRegistration != true) {
        Get.off(PinSuccessFailurePage(
          false,
          () => Get.back(),
          message: "Failed",
        ));
      }
      showError(title: 'Error', message: model.message!);
      // if (widget.fromRegistration == true &&
      //     model.message == 'The PIN has been set for the account') {
      //   Get.to(() => HomeBasePage());
      // }
    }
  }

  changePin() async {
    try {
      AppDialogs.successDialog(context, title: 'Loading..');
      VerifyOldPinModel model = await controller.changeNewPin(
        {
          "newPin": _textEditingController.text.toString(),
          "certificateCode": certificateCode.toString(),
        },
      );
      Get.back();
      if (model.flag!) {
        Get.off(PinSuccessFailurePage(
          true,
          () => Get.offAll(() => RegisterPhoneNumberPage()),
          message: model.message,
        ));
        setState(() {});
      } else {
        printPinText = 'Please enter your new PIN';
        isTextChanged = true;
        _textEditingController = TextEditingController();
        _textEditingController.text = '';
        setState(() {});
        Get.off(PinSuccessFailurePage(
          false,
          () => Get.back(),
          message: "Failed",
        ));

        showError(title: 'Error', message: model.message!);
      }
    } catch (e) {
      Get.back();
      // showError(title: 'Error', message: e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Set Pin',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: 10,
            ),
            Column(
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
                  margin:
                      EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
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
                  margin:
                      EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                  child: Text(
                    printPinText,
                    style: GoogleFonts.roboto(
                      color: widget.fromRegistration == true
                          ? Colors.red
                          : isTextChanged
                              ? Colors.green
                              : Colors.blue,
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                    ),
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
                      shape: PinCodeFieldShape.underline,
                      borderRadius: BorderRadius.circular(10),
                      activeColor: AppColors.BLACK,
                      inactiveColor: AppColors.BLACK,
                      selectedFillColor: AppColors.BLACK,
                      selectedColor: AppColors.BLACK,
                    ),
                    cursorColor: AppColors.BLACK,
                    autoFocus: true,
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
                SizedBox(
                  height: 10,
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
                  height: 40,
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
                      if (isTextChanged == false) {
                        try {
                          AppDialogs.showLoader(context);

                          var model = await controller.verifyOldPinApi(
                            {
                              "oldPin": _textEditingController.text.toString(),
                            },
                          );
                          print('=========================');
                          print('$model');
                          print('=========================');
                          Get.back();
                          if (model.flag!) {
                            printPinText = 'Please enter your new PIN';
                            isTextChanged = true;
                            // newPin = _textEditingController.text.toString();

                            _textEditingController.text = '';
                            _textEditingController.clear();
                            // _textEditingController = TextEditingController();

                            certificateCode = model.data!.certificateCode!;
                            setState(() {});
                          } else {
                            errorText = model.message!;
                            remainingCount = model.data!.remainingCount!;
                            log('${model.message!}');
                            setState(() {});
                            log('${model.data!.remainingCount!}');
                            if (model.data!.remainingCount == 0) {
                              errorText = model.message!;
                              setState(() {});
                            }
                            setState(() {});
                            // // Get.back();
                            // showError(title: 'Error', message: model.message!);
                          }
                        } catch (e) {
                          // log('skahduweifhn');
                          // Get.back();
                          // showError(title: 'Error', message: e.toString());
                        }
                      } else if (isTextChanged == true) {
                        if (codeLength == 6) {
                          if (printPinText ==
                              (widget.fromRegistration == true
                                  ? "Please enter it again"
                                  : 'Confirm your new pin')) {
                            confirmNewPin =
                                _textEditingController.text.toString();

                            if (newPin != "" && confirmNewPin != "") {
                              log('===========================');
                              if (newPin != confirmNewPin) {
                                showError(
                                    title: 'Error',
                                    message:
                                        "New PIN and Confirm PIN not matched");
                                _textEditingController.text = '';
                                _textEditingController.clear();
                              } else {
                                if (widget.pinExist == false) {
                                  log('==============dd=============');
                                  setPin();
                                } else {
                                  changePin();
                                }
                              }
                            }
                          } else if (printPinText ==
                              (widget.fromRegistration == true
                                  ? "Pin is your only identification, please fill it carefully"
                                  : 'Please enter your new PIN')) {
                            newPin = _textEditingController.text.toString();

                            printPinText = widget.fromRegistration == true
                                ? "Please enter it again"
                                : 'Confirm your new pin';
                            isTextChanged = true;
                            _textEditingController.text = '';
                            _textEditingController.clear();
                          } else {
                            printPinText = widget.fromRegistration == true
                                ? "Please enter it again"
                                : 'Confirm your new pin';
                            isTextChanged = true;
                            _textEditingController.text = '';
                            _textEditingController.clear();
                          }
                        }
                      }
                      // Future.delayed(const Duration(seconds: 2), () {
                      // Future.delayed(const Duration(milliseconds: 500), () {
                      // Get.back();
                      //   setState(() {
                      //     printPinText = 'Please enter your new PIN';
                      //     isTextChanged = true;
                      // _textEditingController = TextEditingController();
                      // _textEditingController.text = '';
                      //   });

                      //   AppDialogs.successDialog(context, title: 'Loading');
                      //   Future.delayed(const Duration(milliseconds: 500), () {
                      //     Get.back();
                      //     Get.to(
                      //         () => PinSuccessFailurePage(false, (val) {}));
                      //   });
                      // });
                      // });
                    },
                    context: context),
                SizedBox(
                  height: 37,
                ),
                // if (widget.fromRegistration != true)
                //   if (isTextChanged == false)
                //     codeLength == 6
                //         ? Container()
                //         : TextButton(
                //             onPressed: () {
                //               // Get.to(() => ForgetPinFaceConfirmationPage());
                //             },
                //             child: Text(
                //               'Forget your Pin?',
                //               style: GoogleFonts.roboto(
                //                   color: AppColors.BUTTON_COLOR,
                //                   fontSize: 12,
                //                   fontWeight: FontWeight.w400),
                //             ),
                //           ),
              ],
            ),
            Container(
              width: double.infinity,
            ),
          ],
        ),
      ),
    );
  }
}
