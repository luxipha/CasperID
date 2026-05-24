import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/views/pages/forget_pin_facial_recognition/forget_pin_facial_page.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

class UpdatePinPage extends StatefulWidget {
  @override
  State<UpdatePinPage> createState() => _UpdatePinPageState();
}

class _UpdatePinPageState extends State<UpdatePinPage> {
  final TextEditingController _textEditingController = TextEditingController();
  int codeLength = 0;

  String buttonText = 'Confirm';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
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
                  'Enter your data security pin.',
                  style: GoogleFonts.roboto(
                      color: Colors.red,
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
                  onPressed: (value) {
                    //HelperMethods.pushToNextScreen(FaceConfirmationPage());
                  },
                  context: context),
              SizedBox(
                height: 37,
              ),
            ],
          ),
          Container(
            width: double.infinity,
          ),
        ],
      ),
    );
  }
}
