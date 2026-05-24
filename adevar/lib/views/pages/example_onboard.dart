import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/custom_widget_modules/animated_onboarding_module/on_board_Intro_Widget.dart';
import 'package:highfedilityadevar/custom_widget_modules/animated_onboarding_module/onboard_page_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';

class OnBoardingPage extends StatefulWidget {
  @override
  _OnBoardingPageState createState() => _OnBoardingPageState();
}

class _OnBoardingPageState extends State<OnBoardingPage> with BaseClass {
  final GlobalKey<ScaffoldState> _globalKey = new GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _globalKey,
      body: OnBoardIntroWidget(
        pages: pages,
        showBullets: true,
        skipCallback: () {
          showSuccess(title: "Skip", message: "SKIP");
        },
        finishCallback: () {
          showSuccess(title: "Finish", message: "Finish");
        },
      ),
    );
  }

  final pages = [
    OnBoardPageModel(
        color: AppColors.ON_BOARD_ONE,
        //imageAssetPath: AppImages.onboard_one,
        imageAssetPath: AppImages.RIVE_ONE,
        keys: ObjectKey(AppImages.RIVE_ONE),
        // title: 'Meet People with Similar Interests',
        titleWidget: Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: 'Your ',
                style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
              ),
              TextSpan(
                text: 'Digital Identity',
                style: GoogleFonts.roboto(
                  color: AppColors.BUTTON_COLOR,
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
              ),
              TextSpan(
                text: ' Home',
                style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
        body: 'Connect or Create your identity\nanywhere & anytime',
        doAnimateImage: true),
    OnBoardPageModel(
        color: AppColors.ON_BOARD_TWO,
        //  imageAssetPath: AppImages.onboard_two,
        imageAssetPath: AppImages.RIVE_TWO,
        keys: ObjectKey(AppImages.RIVE_TWO),
        bodyColor: AppColors.ON_BOARD_BUTTON_TWO,
        //   title: 'Earn Coupons with Every Meetup',
        titleWidget: Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: 'Verify ',
                style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
              ),
              TextSpan(
                text: 'Trusted ',
                style: GoogleFonts.roboto(
                  color: AppColors.BUTTON_COLOR,
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
              ),
              TextSpan(
                text: 'People',
                style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
        body: 'Meet trusted people with common\nintentions',
        doAnimateImage: true),
    OnBoardPageModel(
        color: AppColors.ON_BOARD_THREE,
        //    imageAssetPath: AppImages.onboard_three,
        imageAssetPath: AppImages.RIVE_THREE,
        keys: ObjectKey(AppImages.RIVE_THREE),
        bodyColor: AppColors.ON_BOARD_BUTTON_THREE,
        titleWidget: Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: 'Privacy Protection ',
                style: GoogleFonts.roboto(
                  color: AppColors.BUTTON_COLOR,
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                ),
              ),
              TextSpan(
                text: '\nAuthority Authentication',
                style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          textAlign: TextAlign.center,
        ),
        // title: 'Grow Your Social Circle',
        body: 'Your privacy is our priority. You choose what others can see.',
        doAnimateImage: true),
    /* PageModel.withChild(
        child: Padding(
          padding: EdgeInsets.only(bottom: 25.0),
          child: Image.asset(AppImages.PRINT_CIRCLE, width: 300.0, height: 300.0),
        ),
        color: const Color(0xFF5886d6),
        doAnimateChild: true)*/
  ];
}
