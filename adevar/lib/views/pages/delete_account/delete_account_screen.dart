import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/micheal_code/widgets/colors..dart';
import 'package:highfedilityadevar/views/pages/delete_account/delete_account_pin_set.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';

class DeleteAccountScreen extends StatefulWidget {
  String mobileNumber;
  DeleteAccountScreen({Key? key, required this.mobileNumber}) : super(key: key);

  @override
  State<DeleteAccountScreen> createState() => _DeleteAccountScreenState();
}

class _DeleteAccountScreenState extends State<DeleteAccountScreen> {
  bool agreePrivacy = false;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Delete account',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 15,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: blueColor,
                  ),
                ),
                child: Image.asset(
                  AppImages.DELETEACCOUNT,
                ),
              ),
              SizedBox(
                height: 12,
              ),
              Text(
                'Delete your account',
                style: GoogleFonts.roboto(
                  fontWeight: FontWeight.w400,
                  fontSize: 20,
                  color: AppColors.TEXTBLACK,
                ),
              ),
              SizedBox(
                height: 12,
              ),
              Text(
                'Deleting your account will permanently remove all your information from our server within the next 30 days. All deleted data cannot be retrieved. Logging back into your account will cancel the deletion process. ',
                style: GoogleFonts.roboto(
                  fontWeight: FontWeight.w400,
                  fontSize: 14,
                  color: AppColors.DARK_GREY,
                  wordSpacing: 1.5,
                ),
              ),
              SizedBox(
                height: 12,
              ),
              listWidget(
                title: "Personal information",
              ),
              listWidget(
                title: "Resume",
              ),
              listWidget(
                title: "Recent contacts",
              ),
              listWidget(
                title: "Emergency contact",
              ),
              listWidget(
                title: "Comments",
              ),
              listWidget(
                title: "Rankings",
              ),
              listWidget(
                title: "Tokens",
              ),
              SizedBox(
                height: 50,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  InkWell(
                    onTap: () {
                      agreePrivacy = !agreePrivacy;
                      setState(() {});
                    },
                    child: Container(
                      height: 14,
                      width: 14,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(4),
                        color: agreePrivacy ? Colors.blue : Colors.transparent,
                        border: Border.all(
                          color:
                              agreePrivacy ? Colors.blue : Colors.grey.shade300,
                          width: 1.5,
                        ),
                      ),
                      // child: Icon(
                      //   Icons.check,
                      //   color: agreePrivacy ? Colors.blue : Colors.transparent,
                      //   size: 12,
                      // ),
                    ),
                  ),
                  Text(
                    ' I have known and agreed to the above information',
                    style: GoogleFonts.roboto(
                      fontWeight: FontWeight.w400,
                      fontSize: 14,
                      color: AppColors.DARK_GREY,
                      wordSpacing: 1.5,
                    ),
                  ),
                ],
              ),
              SizedBox(
                height: 15,
              ),
              RoundedEdgeButton(
                height: AppSizes.BUTTON_HEIGHT,
                color: !agreePrivacy
                    ? AppColors.BUTTON_COLOR_WITH_OPACITY
                    : AppColors.BUTTON_COLOR,
                text: "Delete account",
                buttonRadius: AppSizes.BUTTON_RADIUS,
                textColor: AppColors.WHITE,
                textFontSize: AppSizes.BUTTON_FONT_SIZE,
                // leftMargin: AppSizes.BUTTON_MARGIN,
                // topMargin: AppSizes.BUTTON_MARGIN,
                // rightMargin: AppSizes.BUTTON_MARGIN,
                onPressed: (value) {
                  if (agreePrivacy) {
                    Get.to(
                      () => DeleteAccountPinSet(),
                    );
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

  Widget listWidget({required String title}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(10, 0, 0, 8),
      child: Row(
        children: [
          Container(
            height: 4,
            width: 4,
            decoration: BoxDecoration(
              color: AppColors.DARK_GREY,
              shape: BoxShape.circle,
            ),
          ),
          SizedBox(
            width: 4,
          ),
          Text(
            ' $title',
            style: GoogleFonts.roboto(
              fontWeight: FontWeight.w400,
              fontSize: 14,
              color: AppColors.DARK_GREY,
              wordSpacing: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
