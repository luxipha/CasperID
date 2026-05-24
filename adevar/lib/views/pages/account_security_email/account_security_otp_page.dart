import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:highfedilityadevar/controllers/account_security_email/send_verification_code_to_email_controller.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/account_security/change_email/new_email_set_model.dart';
import 'package:highfedilityadevar/models/account_security/change_email/verify_email_model.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';

import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/views/pages/account_security/account_security_page.dart';
import 'package:highfedilityadevar/views/pages/account_security_email/account_security_email_page.dart';
import 'package:highfedilityadevar/views/pages/pin_success_failure/pin_success_failure_page.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../models/account_security/change_email/account_security_model.dart';

class AccountSecurityOtpPage extends StatefulWidget {
  String? newEmail;
  bool? fromSecurityPage;
  String? certificateCode;
  bool? emailAdded;

  AccountSecurityOtpPage({
    Key? key,
    this.newEmail,
    this.fromSecurityPage = false,
    this.certificateCode,
    this.emailAdded,
  }) : super(key: key);
  @override
  _AccountSecurityOtpPageState createState() => _AccountSecurityOtpPageState();
}

class _AccountSecurityOtpPageState extends State<AccountSecurityOtpPage>
    with BaseClass {
  final accountSecurityEmailPageController =
      Get.put(SendVerificationCodeToEmailController());

  final GetSharedPref getSharedPref = Get.put(GetSharedPref());
  UserDataModel userDataModel = UserDataModel();

  int _selectedIndex = 0;
  TextEditingController? _otpTextController = TextEditingController();
  int codeLength = 0;
  bool _isOtpConfirmed = false;
  bool _isNewNumberAdded = false;
  int confirmButtonCLicked = 0;
  RxInt recaptureTime = 59.obs;

  RxString buttonText = ''.obs;
  Timer? timer;

  @override
  void initState() {
    buttonText.value = 'Recapture (${recaptureTime.value} s)';
    if (widget.fromSecurityPage == true) {
      setEmailData();
    } else {
      startTimer();
    }
    super.initState();
  }

  setEmailData() async {
    startTimer();
    SharedPreferences preferences = await SharedPreferences.getInstance();
    widget.newEmail = preferences.getString('email');

    await sendVerificationCode();
  }

  sendVerificationCode() async {
    try {
      Future.delayed(Duration(microseconds: 11), () {
        showCircularDialog(context);
      });
      AccountSecurityModel model = await accountSecurityEmailPageController
          .sendVerificationCodeToOldEmailApi(
              {'email': widget.newEmail.toString()});
      Get.back();
      if (model.flag!) {
        showSuccess(title: 'Success', message: model.message!);
      } else {
        timer!.cancel();
        recaptureTime.value = 0;
        showError(title: 'Error', message: model.message!);
      }
    } catch (e) {}
  }

  void startTimer() {
    recaptureTime.value = 59;

    const oneSec = const Duration(seconds: 1);
    timer = new Timer.periodic(
      oneSec,
      (Timer timer) {
        if (recaptureTime.value == 0) {
          timer.cancel();

          // Get.back();
          if (mounted) {
            setState(() {});
          }
        } else {
          recaptureTime.value--;

          if (mounted) {
            setState(() {});
          }
        }
      },
    );
  }

  resendOtp() {
    if (widget.fromSecurityPage == true) {
      setEmailData();
    } else {
      sendNewEmailVerificationOTP();
    }
  }

  sendNewEmailVerificationOTP() async {
    startTimer();
    AccountSecurityModel model = await accountSecurityEmailPageController
        .sendVerificationCodeToEmailApi(
            {"newEmail": widget.newEmail.toString()});

    if (model.flag!) {
      popToPreviousScreen(context: context);
      print(model.toJson());

      Get.off(
        AccountSecurityOtpPage(
          newEmail: widget.newEmail.toString(),
          fromSecurityPage: false,
        ),
      );
      showSuccess(title: 'Success', message: model.message!);
    } else {
      throw model.message!;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Email',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            SizedBox(
              height: 40,
            ),
            Container(
              height: 100,
              width: 100,
              child: Stack(
                children: [
                  Image(
                    image: AssetImage(
                      AppImages.BLUE_CIRCLE,
                    ),
                    height: 100,
                    width: 100,
                  ),
                  Align(
                    alignment: Alignment.center,
                    child: Image(
                      image: AssetImage(
                        AppImages.ACCOUNT_SECURITY_EMAIL,
                      ),
                      height: 42,
                      width: 42,
                    ),
                  )
                ],
              ),
            ),
            SizedBox(
              height: 13,
            ),
            Text(
              'Email',
              style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontWeight: FontWeight.w400,
                  fontSize: 18),
            ),
            SizedBox(
              height: 13,
            ),
            Container(
              margin: EdgeInsets.symmetric(horizontal: 34),
              child: Text(
                'We have sent a verification code to your email, please open your email.',
                style: GoogleFonts.roboto(
                    color: Colors.grey,
                    fontWeight: FontWeight.w400,
                    fontSize: 14),
              ),
            ),
            SizedBox(
              height: 22,
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
                controller: _otpTextController,
                onCompleted: (v) {
                  print("Completed");
                },
                onChanged: (value) {
                  setState(() {
                    codeLength = value.length;
                    if (value.length == 6) {
                      buttonText.value = 'Confirm';
                    } else {
                      buttonText.value = 'Recapture (59s)';
                    }
                  });
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
              height: 44,
            ),
            Obx(
              () => RoundedEdgeButton(
                  height: AppSizes.BUTTON_HEIGHT,
                  color: codeLength != 6 && recaptureTime.value != 0
                      ? AppColors.BUTTON_COLOR_WITH_OPACITY
                      : AppColors.BUTTON_COLOR,
                  text: codeLength == 6
                      ? "Confirm"
                      : codeLength != 6 && recaptureTime.value == 0
                          ? "Resend OTP"
                          : 'Resend (${recaptureTime.value})', // buttonText.value,
                  buttonRadius: AppSizes.BUTTON_RADIUS,
                  textColor: AppColors.WHITE,
                  textFontSize: AppSizes.BUTTON_FONT_SIZE,
                  leftMargin: AppSizes.BUTTON_MARGIN,
                  topMargin: AppSizes.BUTTON_MARGIN,
                  rightMargin: AppSizes.BUTTON_MARGIN,
                  onPressed: codeLength == 6
                      ? (value) async {
                          try {
                            setState(() {
                              _isOtpConfirmed = true;
                              confirmButtonCLicked++;
                            });
                            if (widget.fromSecurityPage == true) {
                              checkEmailVerification();
                            } else {
                              changeEmail();
                            }
                          } catch (error) {
                            print(error.toString());
                          }
                          //HelperMethods.pushToNextScreen(ChangeNumberNewPinPage());
                        }
                      : (value) async {
                          if (codeLength != 6 && recaptureTime.value == 0) {
                            resendOtp();
                          } else {
                            try {
                              setState(() {
                                _isOtpConfirmed = false;
                                confirmButtonCLicked = 0;
                                codeLength = 0;
                                // _textEditingController = TextEditingController();
                                // buttonText.value = 'Recapture (59s)';
                                // _phoneNumberController.text = '';
                              });
                            } catch (error) {
                              print(error.toString());
                            }
                          }
                          //HelperMethods.pushToNextScreen(ChangeNumberNewPinPage());
                        },
                  context: context),
            ),
          ],
        ),
      ),
    );
  }

  changeEmail() async {
    try {
      showCircularDialog(context);
      NewEmailSetModel model;
      if (widget.emailAdded == true) {
        model = await accountSecurityEmailPageController.setNewEmail({
          "newEmail": widget.newEmail.toString(),
          "verificationCode": _otpTextController!.text,
          "certificate": widget.certificateCode!
        });
      } else {
        model = await accountSecurityEmailPageController.setNewEmail({
          "newEmail": widget.newEmail.toString(),
          "verificationCode": _otpTextController!.text,
        });
      }
      print(model.toJson());
      popToPreviousScreen(context: context);
      if (model.flag!) {
        print(model.toJson());

        SharedPreferences preferences = await SharedPreferences.getInstance();
        preferences.setString('email', model.data!.newEmail.toString());

        Get.off(PinSuccessFailurePage(
          true,
          () => {Get.back(), Get.back(), Get.off(AccountSecurityPage())},
          message: "Success",
          title: "Email Changed",
        ));
        showSuccess(title: 'Success', message: model.message!);
      } else {
        _otpTextController!.clear();
        recaptureTime.value = 0;
        Get.off(PinSuccessFailurePage(
          false,
          () => Get.back(),
          message: "Failed",
          title: "Email Changed",
        ));

        throw model.message!;
      }
    } catch (e) {
      _otpTextController!.clear();
      recaptureTime.value = 0;
      print(e.toString());
      popToPreviousScreen(context: context);

      // showError(title: 'Error', message: e.toString());
    }
  }

  checkEmailVerification() async {
    try {
      SharedPreferences preferences = await SharedPreferences.getInstance();
      widget.newEmail = preferences.getString('email');
      showCircularDialog(context);
      VerifyEmailOTPModel model = await accountSecurityEmailPageController
          .checkEmailVerificationCodeApi({
        "email": widget.newEmail.toString(),
        "verificationCode": _otpTextController!.text
      });
      print(model.toJson());
      Get.back();
      if (model.flag!) {
        Get.to(() => AccountSecurityEmailPage(
              certificate: model.data!.certificateCode!,
            ));
        showSuccess(title: 'Success', message: model.message!);
      } else {
        showError(title: 'Error', message: model.message.toString());
        // Get.off(PinSuccessFailurePage(
        //   false,
        //   () => Get.back(),
        //   message: "Failed",
        // ));

        // throw model.message!;
      }
    } catch (e) {
      print(e.toString());
      popToPreviousScreen(context: context);

      // showError(title: 'Error', message: e.toString());
    }
  }
}
