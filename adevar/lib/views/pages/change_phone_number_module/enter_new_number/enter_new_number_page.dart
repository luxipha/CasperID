import 'package:country_list_pick/country_list_pick.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/help_center/change_phone_number/help_center_change_phone_controller.dart';
import 'package:highfedilityadevar/models/help_center/send_help_feedback_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/utils/helper.dart';
import 'package:highfedilityadevar/views/pages/change_phone_number_module/new_number_verification_code/input_new_number_verification_code_page.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:numeric_keyboard/numeric_keyboard.dart';

class EnterNewNumberPage extends StatefulWidget {
  @override
  _EnterNewNumberPageState createState() => _EnterNewNumberPageState();
}

class _EnterNewNumberPageState extends State<EnterNewNumberPage>
    with BaseClass {
  final HelpCenterChangePhoneController controller =
      Get.put(HelpCenterChangePhoneController());
  String text = '';
  String countryCode = '+48';

  _onKeyboardTap(String value) {
    setState(() {
      if (text.length != 11) {
        text = text + value;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 8,
            ),
            Container(
              margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
              child: Text(
                'Please fill in the new\nphone number',
                style: GoogleFonts.roboto(
                    color: Colors.black,
                    fontSize: 32,
                    fontWeight: FontWeight.w700),
              ),
            ),
            // SizedBox(
            //   height: 15,
            // ),
            // Container(
            //   margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
            //   alignment: Alignment.centerLeft,
            //   child: Text(
            //     'We\'ll send you confirmation code in the next step.',
            //     textAlign: TextAlign.start,
            //     style: GoogleFonts.roboto(
            //         color: Colors.black,
            //         fontSize: 14,
            //         fontWeight: FontWeight.w400),
            //   ),
            // ),
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
                  margin:
                      EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        '(${countryCode!.dialCode!})',
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
                countryCode = code!.dialCode!;
                print(code.name);
                print(code.code);
                print(code.dialCode);
                print(code.flagUri);
              },
            ),
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
                color: text.length > 6 && text.length < 16
                    ? AppColors.BUTTON_COLOR
                    : AppColors.BUTTON_COLOR_WITH_OPACITY,
                text: 'Next',
                buttonRadius: AppSizes.BUTTON_RADIUS,
                textColor: AppColors.WHITE,
                textFontSize: AppSizes.BUTTON_FONT_SIZE,
                leftMargin: AppSizes.BUTTON_MARGIN,
                topMargin: AppSizes.BUTTON_MARGIN,
                rightMargin: AppSizes.BUTTON_MARGIN,
                onPressed: (value) async {
                  if (text.length > 6 && text.length < 16) {
                    try {
                      showCircularDialog(context);
                      SendHelpAndFeedbackModel model = await controller
                          .sendCodeToNewMobile('$countryCode$text');
                      popToPreviousScreen(context: context);
                      if (model.flag!) {
                        showSuccess(title: 'Success', message: model.message!);
                        Get.to(NewNumberVerificationCodePage());
                      } else {
                        showError(title: 'Error', message: model.message!);
                      }
                    } catch (e) {
                      popToPreviousScreen(context: context);
                      // showError(title: 'Error', message: e.toString());
                    }
                  }
                },
                context: context),
          ],
        ),
      ),
    );
  }
}
