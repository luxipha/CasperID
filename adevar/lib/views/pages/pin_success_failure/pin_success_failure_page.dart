import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';

class PinSuccessFailurePage extends StatefulWidget {
  final bool isSuccess;
  final String? message;
  final String? title;
  final VoidCallback onPress;

  PinSuccessFailurePage(this.isSuccess, this.onPress,
      {this.message, this.title});

  @override
  State<PinSuccessFailurePage> createState() => _PinSuccessFailurePageState();
}

class _PinSuccessFailurePageState extends State<PinSuccessFailurePage> {
  @override
  void initState() {
    super.initState();

    widget.isSuccess ? startTime() : null;
  }

  startTime() async {
    return Timer(const Duration(seconds: 3), widget.onPress);
  }

  // void navigationPage() async {
  //   widget.onPress.isBlank != null ? redirectMethod() : Get.back();
  // }

  // redirectMethod() {
  //   return widget.onPress();
  // }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.title ?? 'Set Pin',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            height: 80,
          ),
          Image.asset(
            widget.isSuccess ? AppImages.SUCCESS : AppImages.FAILURE,
            height: 70,
            width: 70,
          ),
          SizedBox(
            height: 20,
          ),
          Text(
            widget.message != null
                ? widget.message.toString()
                : widget.isSuccess
                    ? 'A new pin code has been successfully set up,\nwhich is your only identification'
                    : 'Something went wrong.\nPlease try again later',
            textAlign: TextAlign.center,
            style: GoogleFonts.roboto(
                color: Colors.black,
                decoration: TextDecoration.none,
                fontSize: 18,
                fontWeight: FontWeight.w400),
          ),
          widget.isSuccess
              ? Container()
              : RoundedEdgeButton(
                  height: AppSizes.BUTTON_HEIGHT,
                  color: AppColors.BUTTON_COLOR,
                  text: 'Retry',
                  buttonRadius: AppSizes.BUTTON_RADIUS,
                  textColor: AppColors.WHITE,
                  textFontSize: AppSizes.BUTTON_FONT_SIZE,
                  leftMargin: AppSizes.BUTTON_MARGIN,
                  topMargin: AppSizes.BUTTON_MARGIN,
                  rightMargin: AppSizes.BUTTON_MARGIN,
                  onPressed: widget.onPress,
                  context: context),
        ],
      ),
    );
  }
}
