import 'dart:developer';

import 'package:country_list_pick/country_list_pick.dart';
import 'package:flutter/material.dart';
import 'package:flutter_native_timezone/flutter_native_timezone.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/login_with_phone/login_with_phone_controller.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/utils/helper.dart';
import 'package:highfedilityadevar/utils/process_indicator.dart';
import 'package:highfedilityadevar/views/dialogs/app_dialogs.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_input_verification_code/input_verification_code_page.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';
import 'package:numeric_keyboard/numeric_keyboard.dart';

import '../../../../app_strings/app_strings.dart';
import '../../../../models/register/register_model.dart';
import 'dart:io' show Platform;

class RegisterPhoneNumberPage extends StatefulWidget {
  @override
  _RegisterPhoneNumberPageState createState() => _RegisterPhoneNumberPageState();
}

class _RegisterPhoneNumberPageState extends State<RegisterPhoneNumberPage> with BaseClass {
  static Circle processIndicator = Circle();
  final LoginWithPhoneController _loginWithPhoneController = Get.isRegistered<LoginWithPhoneController>()
      ? Get.find<LoginWithPhoneController>()
      : Get.put(LoginWithPhoneController());

  String text = '';
  String countryCode = '+48';
  var maskFormatter = new MaskTextInputFormatter(mask: '### #### ####', filter: {"#": RegExp(r'[0-9]')});

  _onKeyboardTap(String value) {
    setState(() {
      if (text.length != 11) {
        text = text + value;
      }
    });
  }

  TextEditingController _controller = TextEditingController();

  @override
  void initState() {
    // processIndicator.hide(context);
    // TODO: implement initState
    super.initState();
  }

  printCountryCode() async {
    final List<Locale> systemLocales = WidgetsBinding.instance!.window.locales;
    String? isoCountryCode = systemLocales.first.countryCode;
    print(isoCountryCode);

    Locale myLocale = Localizations.localeOf(context);
    print(myLocale.countryCode);

    /* String languageCode = Platform.localeName.split('_')[0];
    String countryCode = Platform.localeName.split('_')[1];
    print(languageCode);
    print(countryCode);*/

    final String currentTimeZone = await FlutterNativeTimezone.getLocalTimezone();
    print(currentTimeZone);
  }

  @override
  Widget build(BuildContext context) {
    printCountryCode();
    return Scaffold(
      appBar: AppBar(),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: 8,
            ),
            Container(
              margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
              child: Text(
                'Enter your phone number',
                style: GoogleFonts.roboto(color: Colors.black, fontSize: 32, fontWeight: FontWeight.w700),
              ),
            ),
            SizedBox(
              height: 15,
            ),
            Container(
              margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
              alignment: Alignment.centerLeft,
              child: Text(
                'We\'ll send you a verification code in the next step.',
                textAlign: TextAlign.start,
                style: GoogleFonts.roboto(color: Colors.black, fontSize: 14, fontWeight: FontWeight.w400),
              ),
            ),
            SizedBox(
              height: 8,
            ),
            CountryListPick(
              useUiOverlay: true,
              appBar: AppBar(
                backgroundColor: AppColors.BUTTON_COLOR,
                centerTitle: true,
                iconTheme: IconThemeData(color: Colors.white),
                title: Text('Pick your country'),
              ),
              pickerBuilder: (context, CountryCode? countryCode) {
                return Container(
                  margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        '(${countryCode!.dialCode!})',
                        style: GoogleFonts.roboto(color: Colors.black, fontSize: 28, fontWeight: FontWeight.w400),
                      ),
                      SizedBox(
                        width: 15,
                      ),
                      Expanded(
                        child: Container(
                          margin: EdgeInsets.only(top: 8),
                          child: TextField(
                            style: TextStyle(color: AppColors.BUTTON_COLOR),
                            textAlignVertical: TextAlignVertical.center,
                            enabled: false,
                            cursorColor: AppColors.BUTTON_COLOR,
                            obscureText: false,
                            maxLength: 11,
                            maxLines: 1,
                            decoration: InputDecoration(
                              border: InputBorder.none,
                              counter: Container(),
                              labelText: text,
                              contentPadding: EdgeInsets.zero,
                              labelStyle: GoogleFonts.roboto(
                                  color: AppColors.BUTTON_COLOR, fontSize: 28, fontWeight: FontWeight.w400),
                              hintText: '0000000000',
                              /*hintStyle: GoogleFonts.roboto(
                              color: AppColors.HINT_GREY,
                              fontSize: 28,
                              fontWeight: FontWeight.w400),*/
                            ),
                          ),
                        ),
                      ),
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
              initialSelection: '+48',
              // or
              // initialSelection: 'US'
              onChanged: (CountryCode? code) {
                print(code!.name);
                countryCode = code.dialCode!;
                print(code.code);
                print(code.dialCode);
                print(code.flagUri);
              },
            ),
            /*Container(
              margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    '(+48)',
                    style: GoogleFonts.roboto(
                        color: Colors.black,
                        fontSize: 28,
                        fontWeight: FontWeight.w400),
                  ),
                  SizedBox(
                    width: 15,
                  ),
                  Expanded(
                    child: Container(
                      margin: EdgeInsets.only(top: 8),
                      child: TextField(
                        style: TextStyle(color: AppColors.BUTTON_COLOR),
                        textAlignVertical: TextAlignVertical.center,
                        enabled: false,
                        cursorColor: AppColors.BUTTON_COLOR,
                        obscureText: false,
                        maxLength: 11,
                        maxLines: 1,
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          counter: Container(),
                          labelText: text,
                          contentPadding: EdgeInsets.zero,
                          labelStyle: GoogleFonts.roboto(
                              color: AppColors.BUTTON_COLOR,
                              fontSize: 28,
                              fontWeight: FontWeight.w400),
                          hintText: '0000000000',
                          */ /*hintStyle: GoogleFonts.roboto(
                              color: AppColors.HINT_GREY,
                              fontSize: 28,
                              fontWeight: FontWeight.w400),*/ /*
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),*/
            SizedBox(
              height: 10,
            ),
            NumericKeyboard(
                onKeyboardTap: _onKeyboardTap,
                textColor: Colors.black,
                rightButtonFn: () {
                  setState(() {
                    text = text.substring(0, text.length - 1);
                  });
                },
                rightIcon: Icon(
                  Icons.arrow_back_ios_sharp,
                  color: Colors.black,
                ),
                leftButtonFn: () {
                  print('left button clicked');
                },
                mainAxisAlignment: MainAxisAlignment.spaceBetween),
            RoundedEdgeButton(
                height: AppSizes.BUTTON_HEIGHT,
                color:
                    text.length > 6 && text.length < 16 ? AppColors.BUTTON_COLOR : AppColors.BUTTON_COLOR_WITH_OPACITY,
                text: 'Get verification code',
                buttonRadius: AppSizes.BUTTON_RADIUS,
                textColor: AppColors.WHITE,
                textFontSize: AppSizes.BUTTON_FONT_SIZE,
                leftMargin: AppSizes.BUTTON_MARGIN,
                topMargin: AppSizes.BUTTON_MARGIN,
                rightMargin: AppSizes.BUTTON_MARGIN,
                onPressed: (value) async {
                  /*  if (text.length == 0) {
                    showError(
                        title: AppStrings.enPhoneNumber,
                        message: 'Phone number cannot be empty');
                  } else if (text.length != 11) {
                    showError(
                        title: AppStrings.enPhoneNumber,
                        message: AppStrings.enPhoneLength);
                  } else*/
                  if (text.length > 6 && text.length < 16) {
                    /*HelperMethods.pushToNextScreen(
                        VerificationCodePage(
                      phoneNumber: text,
                    ));*/
                    try {
                      showCircularDialog(context);
                      RegisterModel model = await _loginWithPhoneController.hitLoginWithPhoneApi({
                        "mobile": "$countryCode$text",
                      });

                      if (model.flag!) {
                        popToPreviousScreen(context: context);
                        print(model.toJson());

                        HelperMethods.pushToNextScreen(VerificationCodePage(
                          phoneNumber: "$countryCode$text",
                        ));
                        showSuccess(title: 'Success', message: model.message!);
                      } else {
                        throw model.message!;
                      }
                    } catch (e) {
                      popToPreviousScreen(context: context);
                      // showError(title: 'Error', message: e.toString());
                    }
                  }
                },
                context: context),
            TextButton(
                onPressed: () {
                  AppDialogs.showHelpCenterOptionDialog(context);
                },
                child: Text(
                  'Help Center',
                  style: GoogleFonts.roboto(color: AppColors.BUTTON_COLOR, fontSize: 12, fontWeight: FontWeight.w400),
                ))
          ],
        ),
      ),
    );
  }
}
