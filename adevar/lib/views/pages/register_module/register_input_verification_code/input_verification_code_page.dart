import 'dart:async';
import 'dart:developer';
import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/login_with_phone/login_with_phone_controller.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/controllers/verify_otp/verify_otp_controller.dart';
import 'package:highfedilityadevar/models/register/register_model.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/models/verify_otp/verify_otp_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/home_base/home_base_page.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_user_information/create_account_user_information.dart';
import 'package:highfedilityadevar/views/pages/settings_change_pin/settings_change_pin_page.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../controllers/add_login_device/add_login_device_controller.dart';

class VerificationCodePage extends StatefulWidget {
  final String? phoneNumber;

  VerificationCodePage({this.phoneNumber});

  @override
  _VerificationCodePageState createState() => _VerificationCodePageState();
}

class _VerificationCodePageState extends State<VerificationCodePage>
    with BaseClass {
  final TextEditingController _textEditingController = TextEditingController();
  String codeLength = "";
  bool agreePrivacy = false;
  final GetSharedPref getSharedPref = Get.put(GetSharedPref());
  final VerifyOtpController _verifyOtpController =
      Get.isRegistered<VerifyOtpController>()
          ? Get.find<VerifyOtpController>()
          : Get.put(VerifyOtpController());

  final AddLoginDeviceController _addLoginDeviceController =
      Get.isRegistered<AddLoginDeviceController>()
          ? Get.find<AddLoginDeviceController>()
          : Get.put(AddLoginDeviceController());

  final LoginWithPhoneController _loginWithPhoneController =
      Get.isRegistered<LoginWithPhoneController>()
          ? Get.find<LoginWithPhoneController>()
          : Get.put(LoginWithPhoneController());

  RxString buttonText = 'Resend (59s)'.obs;
  String errorText = '';
  AndroidDeviceInfo? androidInfo;

  IosDeviceInfo? iosInfo;
  RxInt resendTime = 59.obs;
  Timer? timer;

  void startTimer() {
    resendTime.value = 59;

    const oneSec = const Duration(seconds: 1);
    timer = new Timer.periodic(
      oneSec,
      (Timer timer) {
        if (resendTime.value == 0) {
          timer.cancel();
          buttonText.value = "Resend";
          if (mounted) {
            setState(() {});
          }
        } else {
          resendTime.value--;
          buttonText.value = "Resend (${resendTime.value}s)";
          if (mounted) {
            setState(() {});
          }
        }
      },
    );
  }

  getDeviceInformation() async {
    DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    if (Platform.isAndroid) {
      androidInfo = await deviceInfo.androidInfo;
      deviceModel = androidInfo!.model!;
      deviceId = androidInfo!.androidId!;
    } else {
      iosInfo = await deviceInfo.iosInfo;
      deviceModel = iosInfo!.name!;

      deviceId = iosInfo!.identifierForVendor!;
    }

    print(deviceModel);
    print(deviceId);
  }

  String deviceModel = "";
  String deviceId = "";

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    startTimer();
    getDeviceInformation();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                child: Text(
                  'Enter\nVerification code',
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
                    activeColor:
                        /* codeLength != "123456" && codeLength.length == 6
                            ? Colors.red
                            :*/
                        AppColors.BUTTON_COLOR,
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
                      codeLength = value;
                      errorText = '';
                      if (value.length == 6) {
                        timer!.cancel();
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
              /*codeLength.length == 6
                  ? codeLength != '123456'
                      ? Align(
                          alignment: Alignment.center,
                          child: Text(
                            "Verification code error",
                            textAlign: TextAlign.center,
                            style: GoogleFonts.roboto(
                                color: Colors.red, fontWeight: FontWeight.w500),
                          ),
                        )
                      : Container()
                  : Container(),
              */
              errorText != ''
                  ? Align(
                      alignment: Alignment.center,
                      child: Text(
                        errorText,
                        textAlign: TextAlign.center,
                        style: GoogleFonts.roboto(
                            color: Colors.red, fontWeight: FontWeight.w500),
                      ),
                    )
                  : Container(),
              SizedBox(
                height: 30,
              ),
              Obx(
                () => RoundedEdgeButton(
                    height: AppSizes.BUTTON_HEIGHT,
                    color: codeLength.length != 6 && resendTime.value != 0
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
                      /*Get.to(() => CreateAccountPage());*/
                      if (codeLength.length == 6) {
                        if (buttonText.value == 'Resend') {
                          try {
                            showCircularDialog(context);
                            RegisterModel model =
                                await _loginWithPhoneController
                                    .hitLoginWithPhoneApi({
                              "mobile": '${widget.phoneNumber}',
                            });

                            if (model.flag!) {
                              popToPreviousScreen(context: context);
                              print(model.toJson());

                              // HelperMethods.pushToNextScreen(
                              //     VerificationCodePage(
                              //   phoneNumber: "$countryCode$text",
                              // ));
                              showSuccess(
                                  title: 'Success', message: model.message!);
                            } else {
                              throw model.message!;
                            }
                          } catch (e) {
                            popToPreviousScreen(context: context);
                            // showError(title: 'Error', message: e.toString());
                          }
                        } else {
                          if (agreePrivacy) {
                            try {
                              showCircularDialog(context);
                              VerifyOtpModel otpModel =
                                  await _verifyOtpController.hitVerifyOtpApi({
                                "mobile": widget.phoneNumber!,
                                "code": codeLength,
                              });
                              popToPreviousScreen(context: context);

                              if (otpModel.flag!) {
                                UserDataModel userDataModel = UserDataModel();
                                print(otpModel.data!.token);

                                userDataModel.authToken = otpModel.data!.token;
                                userDataModel.tokenExpire =
                                    otpModel.data!.tokenExpire.toString();
                                userDataModel.refreshToken =
                                    otpModel.data!.refreshToken.toString();
                                userDataModel.isNewUser = otpModel.data!.theNew;
                                userDataModel.userNumber =
                                    otpModel.data!.userInfoView!.user!.mobile;
                                userDataModel.refreshTokenExpire = otpModel
                                    .data!.refreshTokenExpire
                                    .toString();

                                /*if (otpModel.data!.userInfoView!.user!.email ==
                                null)*/
                                // if (otpModel.data!.theNew == true) {
                                //   userDataModel.profilePicture = otpModel
                                //       .data!.userInfoView!.userLogo!.logoUrl;
                                //   userDataModel.userNumber =
                                //       otpModel.data!.userInfoView!.user!.mobile;
                                //   userDataModel.userEmail =
                                //       otpModel.data!.userInfoView!.user!.email;
                                //   userDataModel.dummyProfilePicture = otpModel
                                //       .data!.userInfoView!.userLogo!.logoUrl;
                                //   userDataModel.userId = otpModel
                                //       .data!.userInfoView!.userLogo!.userId
                                //       .toString();
                                //   userDataModel.isUserRegistered = false;
                                //   userDataModel.isLoggedIn = false;
                                // } else {
                                userDataModel.userEmail =
                                    otpModel.data!.userInfoView!.user!.email;
                                userDataModel.firstName = otpModel
                                    .data!.userInfoView!.userInfo!.firstName;
                                userDataModel.lastName = otpModel
                                    .data!.userInfoView!.userInfo!.lastName;
                                userDataModel.profilePicture = otpModel
                                    .data!.userInfoView!.userLogo!.logoUrl;
                                userDataModel.userNumber =
                                    otpModel.data!.userInfoView!.user!.mobile;
                                userDataModel.dummyProfilePicture = otpModel
                                    .data!.userInfoView!.userLogo!.logoUrl;
                                userDataModel.uniqueId = otpModel
                                    .data!.userInfoView!.userLogo!.uuid
                                    .toString();
                                userDataModel.profileImageFile = otpModel
                                    .data!.userInfoView!.userLogo!.logoUrl!;
                                userDataModel.userId = otpModel
                                    .data!.userInfoView!.userLogo!.userId
                                    .toString();
                                userDataModel.isUserRegistered = true;
                                userDataModel.isLoggedIn = true;
                                SharedPreferences pref =
                                    await SharedPreferences.getInstance();
                                pref.setBool('isLoggedIn', true);
                                pref.setString('pin',
                                    otpModel.data!.userInfoView!.user!.pin!);
                                // }

                                await getSharedPref
                                    .saveSharedPreference(userDataModel);

                                if ((otpModel.data!.userInfoView!.user!.pin
                                            .toString() ==
                                        '' ||
                                    otpModel.data!.userInfoView!.user!.pin
                                            .toString() ==
                                        'null')) {
                                  Get.to(() => PinSettingsPage(
                                        pinExist: false,
                                        fromRegistration: true,
                                      ));
                                } else if (otpModel.data!.userInfoView!
                                            .userInfo!.firstName ==
                                        "" &&
                                    otpModel.data!.userInfoView!.userInfo!
                                            .lastName ==
                                        "" &&
                                    (otpModel.data!.userInfoView!.user!.pin
                                                .toString() !=
                                            '' ||
                                        otpModel.data!.userInfoView!.user!.pin
                                                .toString() !=
                                            'null')) {
                                  Get.to(() => CreateAccountPage());
                                } else {
                                  showCircularDialog(context);
                                  await _addLoginDeviceController
                                      .addLoginDeviceApi({
                                    "userId": otpModel
                                        .data!.userInfoView!.userLogo!.userId
                                        .toString(),
                                    "osType": deviceModel,
                                    "macAddress": "macAddress",
                                    "deviceCode": deviceId
                                  });
                                  popToPreviousScreen(context: context);

                                  SharedPreferences pref =
                                      await SharedPreferences.getInstance();
                                  pref.setBool('isWelcomeWindowVisible', false);
                                  log('${otpModel.data!.userInfoView!.userInfo!.dateOfBirth!}');
                                  pref.setString(
                                      'birthDate',
                                      otpModel.data!.userInfoView!.userInfo!
                                          .dateOfBirth!);
                                  pushReplaceAndClearStack(
                                      context: context,
                                      destination: HomeBasePage());
                                }
                              } else {
                                setState(() {
                                  errorText = otpModel.message!;
                                });
                                // showError(title: 'Error', message: otpModel.message!);
                              }
                            } catch (e) {
                              popToPreviousScreen(context: context);

                              setState(() {
                                errorText = e.toString();
                              });
                              /*showError(title: 'Error', message: e.toString());*/
                            }
                          } else {
                            showError(
                                title: 'Error',
                                message: 'Agree to our privacy-policy');
                          }
                        }
                      }
                    },
                    context: context),
              ),
            ],
          ),
          Container(
            width: double.infinity,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    InkWell(
                      onTap: () {
                        agreePrivacy = !agreePrivacy;
                        setState(() {});
                      },
                      child: Container(
                        height: 16,
                        width: 16,
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: Colors.grey.shade300)
                            // color: Colors.grey,
                            ),
                        child: Icon(
                          Icons.check,
                          color:
                              agreePrivacy ? Colors.blue : Colors.transparent,
                          size: 12,
                        ),
                      ),
                    ),
                    // Image.asset(
                    //   'assets/images/rectangle.png',
                    //   height: 14,
                    //   width: 12,
                    // ),
                    SizedBox(
                      width: 5,
                    ),
                    Text(
                      'Login means that you\n',
                      style: GoogleFonts.roboto(
                          color: AppColors.HINT_GREY,
                          fontWeight: FontWeight.w400,
                          decoration: TextDecoration.none,
                          fontSize: 12),
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('agree to ',
                        style: GoogleFonts.roboto(
                            color: AppColors.HINT_GREY,
                            fontWeight: FontWeight.w400,
                            decoration: TextDecoration.none,
                            fontSize: 12)),
                    Text(
                      'the user agreement',
                      style: GoogleFonts.roboto(
                          color: AppColors.BUTTON_COLOR,
                          fontWeight: FontWeight.w400,
                          decoration: TextDecoration.none,
                          fontSize: 12),
                    ),
                    Text(
                      '  and ',
                      style: GoogleFonts.roboto(
                          color: AppColors.HINT_GREY,
                          fontWeight: FontWeight.w400,
                          decoration: TextDecoration.none,
                          fontSize: 12),
                    ),
                    Text(
                      '  privacy policy ! ',
                      style: GoogleFonts.roboto(
                          color: AppColors.BUTTON_COLOR,
                          fontWeight: FontWeight.w400,
                          decoration: TextDecoration.none,
                          fontSize: 12),
                    ),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}
