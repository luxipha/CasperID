import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/check_login_controller.dart';
import 'package:highfedilityadevar/main.dart';
import 'package:intl/intl.dart';
import 'package:rive/rive.dart';

import '../example_onboard.dart';

class SplashPage extends StatefulWidget {
  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  final CheckLoginController checkLoginController = Get.put(CheckLoginController());
  @override
  void initState() {
    // dataStorage.write(
    //   'isSplashVisible',
    //   DateFormat('dd/MM/yyyy').format(DateTime.now()),
    // );
    // TODO: implement initState
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              width: Get.width,
              color: Colors.white,
              height: Get.height / 1.4,
              child: Image.asset(
                'assets/gif_files/loading.gif',
                fit: BoxFit.cover,
              ),
              /*child: RiveAnimation.asset(AppImages.SPLASH_SCREEN,
                    fit: BoxFit
                        .cover)*/
            ),
          ),
          Container(
            width: double.infinity,
            child: Column(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    SizedBox(
                      height: 100,
                    ),
                    Container(
                      child: Image.asset(
                        'assets/images/logo.png',
                        // 'assets/gif_files/new_splash_logo.gif',
                        // width: 125, height: 125,
                        width: 170, height: 170,
                        fit: BoxFit.cover,
                      ),
                    ),
                    // SizedBox(
                    //   height: 30,
                    // ),
                    // Text(
                    //   'Adevar',
                    //   style: GoogleFonts.montserrat(color: Colors.black, fontSize: 36, fontWeight: FontWeight.w700),
                    // ),
                    SizedBox(
                      height: 15,
                    ),
                    Text(
                      // 'Your identity\nBulids your future.',
                      'Your Password to the world',
                      textAlign: TextAlign.center,
                      style:
                          GoogleFonts.roboto(color: AppColors.BUTTON_COLOR, fontSize: 18, fontWeight: FontWeight.w400),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
