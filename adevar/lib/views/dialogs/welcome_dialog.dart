import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/views/pages/verified_account_badge/verified_account_badge_page.dart';
import '../../models/home/myPersonView_model.dart';

class WelcomeDialog {
  static void welcomeDialog(
      BuildContext context, MyPersonViewModel myPersonViewData) {
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
            height: 400,
            width: 274,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Container(
                  height: 340,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    color: Colors.white,
                  ),
                  margin: EdgeInsets.only(top: 50),
                ),
                Align(
                  alignment: Alignment.topCenter,
                  child: Container(
                    margin: EdgeInsets.only(top: 30),
                    child: Image(
                      image: AssetImage(AppImages.DIALOG_BACKGROUND),
                    ),
                  ),
                ),
                Align(
                  alignment: Alignment.topRight,
                  child: GestureDetector(
                    onTap: () {
                      Get.back();
                    },
                    child: Container(
                      margin: EdgeInsets.only(top: 65, right: 15),
                      child: Image(
                        image: AssetImage(AppImages.DIALOG_CLOSE),
                        height: 30,
                        width: 30,
                      ),
                    ),
                  ),
                ),
                Align(
                    alignment: Alignment.topCenter,
                    child: Container(
                      margin: EdgeInsets.only(top: 125),
                      child: Column(
                        children: [
                          Text(
                            'Welcome',
                            style: GoogleFonts.roboto(
                                color: Colors.black,
                                decoration: TextDecoration.none,
                                fontSize: 32,
                                fontWeight: FontWeight.w700),
                          ),
                          SizedBox(
                            height: 31,
                          ),
                          Text(
                            'Welcome to adevar\nwhich has more functions after\nreal name authentication',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.roboto(
                                color: Colors.black,
                                decoration: TextDecoration.none,
                                fontSize: 14,
                                fontWeight: FontWeight.w400),
                          ),
                          SizedBox(
                            height: 8,
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  children: [
                                    Container(
                                      height: 50,
                                      width: 50,
                                      child: Image(
                                        image:
                                            AssetImage(AppImages.DIALOG_MEET),
                                        height: 50,
                                        width: 50,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                    Text(
                                      'Meet offline',
                                      style: GoogleFonts.roboto(
                                          color: Colors.black,
                                          fontSize: 12,
                                          decoration: TextDecoration.none,
                                          fontWeight: FontWeight.w400),
                                    )
                                  ],
                                ),
                              ),
                              Expanded(
                                child: Column(
                                  children: [
                                    Container(
                                      height: 50,
                                      width: 50,
                                      child: Image(
                                        image:
                                            AssetImage(AppImages.DIALOG_LIKE),
                                        height: 50,
                                        width: 50,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                    Text(
                                      'Rating',
                                      style: GoogleFonts.roboto(
                                          color: Colors.black,
                                          fontSize: 12,
                                          decoration: TextDecoration.none,
                                          fontWeight: FontWeight.w400),
                                    )
                                  ],
                                ),
                              ),
                            ],
                          ),
                          SizedBox(
                            height: 15,
                          ),
                          GestureDetector(
                            onTap: () {
                              Get.back();
                              Get.to(() => VerifiedAccountPage(
                                    userDataModel: myPersonViewData,
                                  ));
                            },
                            child: Image(
                              image: AssetImage(AppImages.DIALOG_CERTIFY_NOW),
                              width: 204,
                              height: 50,
                            ),
                          ),
                        ],
                      ),
                    )),
                Align(
                  alignment: Alignment.topCenter,
                  child: myPersonViewData != null
                      ? Container(
                          width: 100,
                          height: 100,
                          decoration: new BoxDecoration(
                            shape: BoxShape.circle,
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(75.0),
                            child: Image.network(
                              myPersonViewData.data!.logo!,
                              fit: BoxFit.fill,
                              height: 100,
                              width: 100,
                              loadingBuilder: (BuildContext context,
                                  Widget child,
                                  ImageChunkEvent? loadingProgress) {
                                if (loadingProgress == null) return child;
                                return Center(
                                  child: CircularProgressIndicator(
                                    value: loadingProgress.expectedTotalBytes !=
                                            null
                                        ? loadingProgress
                                                .cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                        : null,
                                  ),
                                );
                              },
                            ),
                          ),
                        )
                      : Container(
                          height: 100,
                          width: 100,
                        ),
                ),
              ],
            ),
            margin: EdgeInsets.only(
              bottom: 40,
            ),
            decoration: BoxDecoration(
              color: Colors.transparent,
            ),
          ),
        );
      },
    );
  }
}
