import 'dart:async';

import 'package:country_list_pick/country_list_pick.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/change_phone_number/change_phone_number_controller.dart';
import 'package:highfedilityadevar/models/account_security/change_phone_number/send_verification_code_model.dart';
import 'package:highfedilityadevar/models/account_security/change_phone_number/verify_otp_sent_to_phone_model.dart';
import 'package:highfedilityadevar/views/pages/phone_number/phone_success_failure_page.dart';
import 'package:highfedilityadevar/views/widgets/form_input_with_hint_on_top.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:highfedilityadevar/utils/baseClass.dart';

class PhoneNumberPage extends StatefulWidget {
  @override
  PhoneNumberPageState createState() => PhoneNumberPageState();
}

class PhoneNumberPageState extends State<PhoneNumberPage> with BaseClass {
  int _selectedIndex = 0;
  TextEditingController _textEditingController = TextEditingController();
  TextEditingController _phoneNumberController = TextEditingController();
  final ChangePhoneNumberController controller = ChangePhoneNumberController();
  int codeLength = 0;
  String otpCode = '';
  bool _isOtpConfirmed = false;
  bool _isNewNumberAdded = false;
  int confirmButtonCLicked = 0;
  String? phoneNumber;
  String countryCode = '+86';
  Timer? timer;
  RxInt recaptureTime = 59.obs;

  RxString buttonText = ''.obs;
  @override
  void initState() {
    getPhoneData();
    buttonText.value = 'Recapture (${recaptureTime.value} s)';

    sendVerificationcode();
    super.initState();
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

  sendVerificationcode() async {
    startTimer();
    try {
      SendVerificationCodeToPhoneModel model =
          await controller.sendVerificationCodeToPhoneApi();

      if (model.flag!) {
        print(model.toJson());

        showSuccess(title: 'Success', message: model.message!);
      } else {
        throw model.message!;
      }
    } catch (e) {
      // showError(title: 'Error', message: e.toString());
    }

    setState(() {});
  }

  newNumberOtpVerification() async {
    startTimer();
    try {
      SendVerificationCodeToPhoneModel model =
          await controller.sendVerificationCodeToNewPhoneApi({
        "newMobile": '$countryCode${_phoneNumberController.text.toString()}',
      });
      if (model.flag!) {
        _isOtpConfirmed = false;
        confirmButtonCLicked++;
        codeLength = 0;
        _textEditingController = TextEditingController();
        buttonText.value = 'Confirm';
        timer!.cancel();
        setState(() {});

        showSuccess(title: 'Success', message: model.message!);
      } else {
        throw model.message!;
      }
    } catch (e) {
      // showError(title: 'Error', message: e.toString());
    }
  }

  resendOtp() {
    timer!.cancel();
    print('\x1b[97m Resend OTP : $confirmButtonCLicked');
    if (confirmButtonCLicked == 2) {
      newNumberOtpVerification();
    } else if (confirmButtonCLicked == 0) {
      sendVerificationcode();
    }
  }

  getPhoneData() async {
    SharedPreferences preferences = await SharedPreferences.getInstance();
    phoneNumber = preferences.getString('phoneNumber');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Phone number',
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
                          AppImages.BLUE_PHONE,
                        ),
                        height: 42,
                        width: 42,
                      ),
                    )
                  ],
                )),
            SizedBox(
              height: 13,
            ),
            SizedBox(
              height: 13,
            ),
            Container(
              margin: EdgeInsets.symmetric(horizontal: 34),
              child: Text(
                _isOtpConfirmed
                    ? 'Please fill in the new phone number'
                    : 'We sent a verification code to your original mobile phone, please open your message.',
                style: GoogleFonts.roboto(
                    color: Colors.grey,
                    fontWeight: FontWeight.w400,
                    fontSize: 14),
              ),
            ),
            SizedBox(
              height: 22,
            ),
            _isOtpConfirmed
                ? Container(
                    margin: EdgeInsets.symmetric(horizontal: 30),
                    child: Container(
                      width: double.infinity,
                      height: 50,
                      child: TextFormField(
                        controller: _phoneNumberController,
                        // focusNode: FocusNode(),

                        maxLength: 11,
                        decoration: InputDecoration(
                          counterText: "",
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(15),
                            borderSide:
                                BorderSide(width: 1, style: BorderStyle.none),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(
                              15,
                            ),
                            borderSide:
                                BorderSide(width: 1, color: Colors.blue),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(
                              15,
                            ),
                            borderSide:
                                BorderSide(width: 1, color: Colors.blue),
                          ),
                          prefixIcon: Container(
                            width: 85,
                            padding: EdgeInsets.symmetric(horizontal: 0),
                            child: Row(
                              children: [
                                CountryListPick(
                                  useUiOverlay: true,
                                  appBar: AppBar(
                                    backgroundColor: AppColors.BUTTON_COLOR,
                                    centerTitle: true,
                                    iconTheme:
                                        IconThemeData(color: Colors.white),
                                    title: Text('Pick your country'),
                                  ),

                                  pickerBuilder:
                                      (context, CountryCode? countryCode) {
                                    return Container(
                                      child: Row(
                                        children: [
                                          SizedBox(
                                            width: 5,
                                          ),
                                          Text(
                                            '${countryCode!.dialCode}',
                                            style: GoogleFonts.roboto(
                                                color: Colors.black,
                                                fontWeight: FontWeight.w400,
                                                fontSize: 12),
                                          ),
                                          /*  SizedBox(
                                      width: 3,
                                    ),*/
                                        ],
                                      ),
                                    );
                                  },
                                  theme: CountryTheme(
                                    isShowFlag: true,
                                    isShowTitle: true,
                                    isShowCode: true,
                                    isDownIcon: true,
                                    showEnglishName: true,
                                    labelColor: Colors.blueAccent,
                                  ),
                                  initialSelection: '+86',
                                  // or
                                  // initialSelection: 'US'
                                  onChanged: (CountryCode? code) {
                                    countryCode = code!.dialCode!;
                                    print(code.name);
                                    print(code.code);
                                    print(code.dialCode);
                                    print(code.flagUri);
                                  },
                                ),
                                SizedBox(
                                  width: 5,
                                ),
                                Container(
                                  height: 20,
                                  width: 2,
                                  color: AppColors.ICON_GREY,
                                )
                              ],
                            ),
                          ),
                          hintText: 'Phone Number',
                          hintStyle: TextStyle(
                            color: AppColors.HINT_GREY,
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                        style: TextStyle(fontSize: 16, letterSpacing: 0),

                        keyboardType: TextInputType.number,

                        // initialValue: initialValue,
                      ),
                    )
                    // Container(
                    //     margin: EdgeInsets.only(left: 30, right: 30),
                    //     child: FormInputWithHint(
                    //       label: '',
                    //       borderRadius: 15,
                    //       onChanged: (value) {
                    //         print('object');
                    //       },
                    //       textEditingController: _phoneNumberController,
                    //       filledColor: Colors.white,
                    //       focusNode: FocusNode(),
                    //       keyboardType: TextInputType.number,
                    //       hintText: 'Phone number',
                    //       maxLength: 11,
                    //       borderColor: Colors.blue,

                    )
                : Container(
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
                          otpCode = value;
                          codeLength = value.length;
                          if (value.length == 6) {
                            buttonText.value = 'Confirm';
                          } else {
                            buttonText.value =
                                'Recapture (${recaptureTime.value}s)';
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
              height: 45,
            ),
            Obx(
              () => RoundedEdgeButton(
                  height: AppSizes.BUTTON_HEIGHT,
                  color: codeLength != 6 && recaptureTime.value != 0
                      ? AppColors.BUTTON_COLOR_WITH_OPACITY
                      : AppColors.BUTTON_COLOR,
                  text: codeLength != 6
                      ? codeLength != 6 && recaptureTime.value == 0
                          ? "Resend OTP"
                          : 'Resend (${recaptureTime.value} s)'
                      : "Confirm", // buttonText.value,
                  buttonRadius: AppSizes.BUTTON_RADIUS,
                  textColor: AppColors.WHITE,
                  textFontSize: AppSizes.BUTTON_FONT_SIZE,
                  leftMargin: AppSizes.BUTTON_MARGIN,
                  topMargin: AppSizes.BUTTON_MARGIN,
                  rightMargin: AppSizes.BUTTON_MARGIN,
                  onPressed: (value) {
                    try {
                      print(value);
                      setState(() async {
                        if (codeLength == 6) {
                          if (confirmButtonCLicked == 0) {
                            try {
                              VerifyOTPSentToPhoneModel model = await controller
                                  .verifyCodeForChangeMobile({
                                "mobile": "${phoneNumber.toString()}",
                                "code": otpCode.toString()
                              });
                              if (model.flag!) {
                                print(model.toJson());

                                showSuccess(
                                    title: 'Success', message: model.message!);
                                _isOtpConfirmed = true;
                                confirmButtonCLicked++;

                                SharedPreferences preferences =
                                    await SharedPreferences.getInstance();
                                preferences.setString(
                                    'certificate', model.data!.certificate!);
                                setState(() {});
                              } else {
                                throw model.message!;
                              }
                            } catch (e) {
                              // showError(title: 'Error', message: e.toString());
                            }
                          } else if (confirmButtonCLicked == 1) {
                            newNumberOtpVerification();
                          } else if (confirmButtonCLicked == 2) {
                            try {
                              SharedPreferences preferences =
                                  await SharedPreferences.getInstance();
                              SendVerificationCodeToPhoneModel model =
                                  await controller
                                      .verifyCodeForChangeNewMobile({
                                "newMobile":
                                    '$countryCode${_phoneNumberController.text.toString()}',
                                "newMobileCode": otpCode.toString(),
                                "certificate": preferences
                                    .getString('certificate')
                                    .toString()
                                  ..toString()
                              });
                              if (model.flag!) {
                                print(model.toJson());

                                showSuccess(
                                    title: 'Success', message: model.message!);
                                Get.off(PhoneSuccessFailurePage(
                                  true,
                                  title: "Phone Number",
                                  message: model.message,
                                ));
                                // popToPreviousScreen(context: context);
                              } else {
                                throw model.message!;
                              }
                            } catch (e) {
                              // showError(title: 'Error', message: e.toString());
                            }
                          }
                        } else if (codeLength != 6 &&
                            recaptureTime.value == 0) {
                          resendOtp();
                        }
                      });
                    } catch (error) {
                      print(error.toString());
                    }
                  },
                  context: context),
            ),
          ],
        ),
      ),
    );
  }
}
