import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/delete_account_controller/delete_account_controller.dart';
import 'package:highfedilityadevar/micheal_code/widgets/colors..dart';
import 'package:highfedilityadevar/models/register/register_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/dialogs/app_dialogs.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_phone_number/register_phone_number_page.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

class DeleteAccountPinSet extends StatefulWidget {
  const DeleteAccountPinSet({Key? key}) : super(key: key);

  @override
  State<DeleteAccountPinSet> createState() => _DeleteAccountPinSetState();
}

class _DeleteAccountPinSetState extends State<DeleteAccountPinSet>
    with BaseClass {
  TextEditingController _textEditingController = TextEditingController();
  final controller = Get.put(DeleteAccountController());
  String errorText = "";
  int remainingCount = 0;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: 25,
            vertical: 15,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
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
              Text(
                "Pin is your only identification, please fill in carefully",
                style: GoogleFonts.roboto(
                  color: black,
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
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
                  autoFocus: true,
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
                    setState(() {});
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
                        style: TextStyle(
                          color: Colors.red,
                        ),
                      ),
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
                color: _textEditingController.text.length == 6
                    ? AppColors.BUTTON_COLOR
                    : AppColors.BUTTON_COLOR_WITH_OPACITY,
                text: "Confirm",
                buttonRadius: AppSizes.BUTTON_RADIUS,
                textColor: AppColors.WHITE,
                textFontSize: AppSizes.BUTTON_FONT_SIZE,
                // leftMargin: AppSizes.BUTTON_MARGIN,
                // topMargin: AppSizes.BUTTON_MARGIN,
                // rightMargin: AppSizes.BUTTON_MARGIN,
                onPressed: (value) async {
                  if (_textEditingController.text.length == 6) {
                    AppDialogs.showLoader(context);

                    var model = await controller.deleteAccount(
                      pin: _textEditingController.text.toString(),
                    );
                    if (model.flag) {
                      Get.back();
                      Get.offAll(
                        () => RegisterPhoneNumberPage(),
                      );
                    } else {
                      Get.back();
                      errorText = model.message!;
                      remainingCount = model.data!.remainingCount!;

                      setState(() {});

                      if (model.data!.remainingCount == 0) {
                        errorText = model.message!;
                        setState(() {});
                      }
                      setState(() {});
                      errorText = model.message!;
                    }
                  }
                },
                context: context,
              )
            ],
          ),
        ),
      ),
    );
  }
}
