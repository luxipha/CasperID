import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/views/dialogs/app_dialogs.dart';
import 'package:highfedilityadevar/views/pages/home/home_page.dart';
import 'package:highfedilityadevar/views/pages/home_base/home_base_page.dart';
import 'package:highfedilityadevar/views/pages/update_pin/update_pin_page.dart';

import '../../../bas_bottom.dart';

class ForgetPinFaceConfirmationPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Container(
        width: double.infinity,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: 52,
            ),
            // Text(
            //   'Face Confirm',
            //   style: GoogleFonts.roboto(
            //       color: Colors.black,
            //       fontSize: 32,
            //       fontWeight: FontWeight.w700),
            // ),
            SizedBox(
              height: 54,
            ),
            Container(
              height: 250,
              width: 250,
              child: Stack(
                children: [
                  Align(
                    child: Image(
                      image: AssetImage(AppImages.dotted_face_confirm),
                      height: 246,
                      width: 246,
                    ),
                  ),
                  Align(
                    alignment: Alignment.center,
                    child: Image(
                      image: AssetImage(AppImages.face_confirm),
                      height: 196,
                      width: 196,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 46,
            ),
            Text(
              'Let\'s confirm your face',
              textAlign: TextAlign.center,
              style: GoogleFonts.roboto(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: AppColors.DARK_GREY),
            ),
            SizedBox(
              height: 60,
            ),
            TextButton(
                onPressed: () {
                  AppDialogs.showFaceConfirmDialog(context);
                  Future.delayed(const Duration(milliseconds: 1000), () {
                    Get.back();
                    Get.to(() => UpdatePinPage());
                    //Get.to(()=>BaseBottom());
                  });
                },
                child: Text(
                  'Skip>',
                  style: GoogleFonts.roboto(
                      color: AppColors.BUTTON_COLOR,
                      fontSize: 16,
                      fontWeight: FontWeight.w400),
                ))
          ],
        ),
      ),
    );
  }
}
