import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/views/pages/change_phone_number_module/emergency_contacts_list/enter_phone_number_page.dart';
import 'package:highfedilityadevar/views/pages/freeze_appeal_module/freeze_appeal_phone_numer/free_appeal_phone_number_page.dart';
import 'package:highfedilityadevar/views/pages/helpcenter_module/help_center_page.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_phone_number/register_phone_number_page.dart';
import 'package:rive/rive.dart';

class AppDialogs {
  static void showHelpCenterOptionDialog(BuildContext context) {
    showGeneralDialog(
      barrierLabel: "Barrier",
      barrierDismissible: true,
      barrierColor: Colors.black.withOpacity(0.5),
      transitionDuration: Duration(milliseconds: 300),
      context: context,
      pageBuilder: (_, __, ___) {
        return Align(
          alignment: Alignment.bottomCenter,
          child: Container(
            height: 200,
            width: 304,
            child: SizedBox.expand(
              child: Column(
                children: [
                  GestureDetector(
                    onTap: () {
                      Get.back();
                      Get.to(() => EnterPhoneNumberPage());
                    },
                    child: Container(
                      height: 50,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Container(
                            child: Image(
                              image: AssetImage(AppImages.phone),
                              height: 30,
                              width: 25,
                            ),
                          ),
                          SizedBox(
                            width: 15,
                          ),
                          Text(
                            'Change phone number',
                            style: GoogleFonts.roboto(
                                decoration: TextDecoration.none,
                                fontSize: 16,
                                color: Colors.black,
                                fontWeight: FontWeight.w400),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Divider(),
                  GestureDetector(
                    onTap: () {
                      Get.back();
                      Get.to(() => FreezeAppealPhoneNumberPage());
                    },
                    child: Container(
                      height: 50,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Container(
                            child: Image(
                              image: AssetImage(AppImages.lock),
                              height: 32,
                              width: 24,
                            ),
                          ),
                          SizedBox(
                            width: 15,
                          ),
                          Text(
                            'Freeze account',
                            style: GoogleFonts.roboto(
                                decoration: TextDecoration.none,
                                fontSize: 16,
                                color: Colors.black,
                                fontWeight: FontWeight.w400),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Divider(),
                  GestureDetector(
                    onTap: () {
                      Get.back();
                      Get.to(() => HelpCenterPage());
                    },
                    child: Container(
                      height: 50,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Container(
                            child: Image(
                              image: AssetImage(AppImages.help),
                              height: 24,
                              width: 24,
                            ),
                          ),
                          SizedBox(
                            width: 15,
                          ),
                          Text(
                            'Help center',
                            style: GoogleFonts.roboto(
                                decoration: TextDecoration.none,
                                fontSize: 16,
                                color: Colors.black,
                                fontWeight: FontWeight.w400),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            margin: EdgeInsets.only(
              bottom: 40,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(15),
            ),
          ),
        );
      },
      transitionBuilder: (_, anim, __, child) {
        return SlideTransition(
          position: Tween(begin: Offset(0, 1), end: Offset(0, 0)).animate(anim),
          child: child,
        );
      },
    );
  }

  static void showHelpCenterDialog(BuildContext context) {
    showGeneralDialog(
      barrierLabel: "Barrier",
      barrierDismissible: true,
      barrierColor: Colors.black.withOpacity(0.5),
      transitionDuration: Duration(milliseconds: 300),
      context: context,
      pageBuilder: (_, __, ___) {
        return Align(
          alignment: Alignment.center,
          child: Container(
            height: 280,
            width: 304,
            child: SizedBox.expand(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    height: 120,
                    width: 150,
                    child: RiveAnimation.asset('assets/rive_items/check.riv'),
                  ),
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 15),
                    child: Text(
                      'Your request is our priority, please wait while',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.roboto(
                          decoration: TextDecoration.none,
                          fontSize: 16,
                          color: Colors.black,
                          fontWeight: FontWeight.w400),
                    ),
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  GestureDetector(
                    onTap: () {
                      Get.offAll(() => RegisterPhoneNumberPage());
                    },
                    child: Container(
                      width: 100,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.BUTTON_COLOR,
                        borderRadius: BorderRadius.circular(52),
                      ),
                      child: Center(
                        child: Text(
                          'Ok',
                          style: GoogleFonts.roboto(
                              color: Colors.white,
                              decoration: TextDecoration.none,
                              fontSize: 18,
                              fontWeight: FontWeight.w400),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                ],
              ),
            ),
            margin: EdgeInsets.only(
              bottom: 40,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey,
                  blurRadius: 5.0,
                ),
              ],
              borderRadius: BorderRadius.circular(15),
            ),
          ),
        );
      },
      transitionBuilder: (_, anim, __, child) {
        return SlideTransition(
          position: Tween(begin: Offset(0, 1), end: Offset(0, 0)).animate(anim),
          child: child,
        );
      },
    );
  }

  static void showFreezeDialog(BuildContext context, String text) {
    showGeneralDialog(
      barrierLabel: "Barrier",
      barrierDismissible: true,
      barrierColor: Colors.black.withOpacity(0.5),
      transitionDuration: Duration(milliseconds: 300),
      context: context,
      pageBuilder: (_, __, ___) {
        return Align(
          alignment: Alignment.center,
          child: Container(
            height: 192,
            width: 164,
            child: SizedBox.expand(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    height: 120,
                    width: 150,
                    child: RiveAnimation.asset('assets/rive_items/check.riv'),
                  ),
                  Center(
                    child: Text(
                      text,
                      style: GoogleFonts.roboto(
                          color: Colors.black,
                          decoration: TextDecoration.none,
                          fontSize: 18,
                          fontWeight: FontWeight.w400),
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                ],
              ),
            ),
            margin: EdgeInsets.only(
              bottom: 40,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey,
                  blurRadius: 5.0,
                ),
              ],
              borderRadius: BorderRadius.circular(15),
            ),
          ),
        );
      },
      transitionBuilder: (_, anim, __, child) {
        return SlideTransition(
          position: Tween(begin: Offset(0, 1), end: Offset(0, 0)).animate(anim),
          child: child,
        );
      },
    );
  }

  static void showLoader(BuildContext context) {
    showDialog(
      barrierDismissible: true,
      context: context,
      builder: (BuildContext context) => Center(
        child: Container(
            height: 96,
            width: 96,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.5),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Image.asset(
                //'assets/gif_files/loader.gif',
                'assets/gif_files/loader_transparent.gif',
                height: 72,
                width: 68,
              ),
            )),
      ),
    );
  }

  static void showFaceConfirmDialog(BuildContext context) {
    showDialog(
      barrierDismissible: true,
      context: context,
      builder: (BuildContext context) => Center(
        child: Container(
            height: 96,
            width: 96,
            margin: EdgeInsets.only(top: Get.height * 0.25),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.5),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Image.asset(
                //'assets/gif_files/loader.gif',
                'assets/gif_files/loader_transparent.gif',
                height: 72,
                width: 68,
              ),
            )),
      ),
    );
  }

  static void successDialog(BuildContext context, {String title = 'Success'}) {
    showDialog(
      barrierDismissible: true,
      context: context,
      builder: (BuildContext context) => Center(
        child: Container(
            height: 166,
            width: 166,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(15),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Image.asset(
                  AppImages.SUCCESS,
                  height: 70,
                  width: 70,
                ),
                SizedBox(
                  height: 14,
                ),
                Text(
                  title,
                  style: GoogleFonts.roboto(
                      color: Colors.black,
                      decoration: TextDecoration.none,
                      fontSize: 18,
                      fontWeight: FontWeight.w400),
                ),
              ],
            )),
      ),
    );
  }

  static void failDialog(BuildContext context) {
    showDialog(
      barrierDismissible: true,
      context: context,
      builder: (BuildContext context) => Center(
        child: Container(
            height: 166,
            width: 166,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(15),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Image.asset(
                  AppImages.DIALOG_CLOSE,
                  height: 70,
                  width: 70,
                ),
                SizedBox(
                  height: 14,
                ),
                Text(
                  "Failed",
                  style: GoogleFonts.roboto(
                      color: Colors.black,
                      decoration: TextDecoration.none,
                      fontSize: 18,
                      fontWeight: FontWeight.w400),
                ),
              ],
            )),
      ),
    );
  }
}
