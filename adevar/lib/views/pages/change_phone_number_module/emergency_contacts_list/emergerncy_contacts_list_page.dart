import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/help_center/change_phone_number/help_center_change_phone_controller.dart';
import 'package:highfedilityadevar/models/help_center/send_help_feedback_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/change_phone_number_module/verification_code_from_friend/verification_code_from_friend_page.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';

class EmergencyContactsListPage extends StatefulWidget {
  @override
  _EmergencyContactsListPageState createState() =>
      _EmergencyContactsListPageState();
}

class _EmergencyContactsListPageState extends State<EmergencyContactsListPage>
    with BaseClass {
  int oldSelectedIndex = -1;
  final HelpCenterChangePhoneController controller =
      Get.put(HelpCenterChangePhoneController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Container(
        width: double.infinity,
        child: SingleChildScrollView(
          child: Column(
            children: [
              Container(
                margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                child: Text(
                  'Select your emergency contact',
                  style: GoogleFonts.roboto(
                      color: Colors.black,
                      fontSize: 32,
                      fontWeight: FontWeight.w700),
                ),
              ),
              SizedBox(
                height: 15,
              ),
              Container(
                margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                child: Text(
                  'Please select your emergency contact from the contacts below.',
                  style: GoogleFonts.roboto(
                      color: Colors.black,
                      fontSize: 14,
                      fontWeight: FontWeight.w400),
                ),
              ),
              Container(
                margin: EdgeInsets.symmetric(horizontal: 30, vertical: 26),
                child: GridView.builder(
                    itemCount: controller.emergencyContactData.length,
                    physics: NeverScrollableScrollPhysics(),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 22,
                      mainAxisSpacing: 20,
                    ),
                    shrinkWrap: true,
                    scrollDirection: Axis.vertical,
                    itemBuilder: (BuildContext context, int index) {
                      return GestureDetector(
                        onTap: () {
                          oldSelectedIndex = index;
                          controller.emergencyContactId = controller
                              .emergencyContactData[index].ecuserId
                              .toString();
                          controller.emergencyContactLogo = controller
                              .emergencyContactData[index].logo
                              .toString();
                          controller.emergencyContactName =
                              "${controller.emergencyContactData[index].firstName}${controller.emergencyContactData[index].lastName}"
                                  .toString();
                          setState(() {});
                        },
                        child: Stack(
                          children: [
                            Container(
                              height: 90,
                              width: 90,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(50),
                                child: Image.network(
                                  controller.emergencyContactData[index].logo
                                      .toString(),
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                            Container(
                              height: 90,
                              width: 90,
                              decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: oldSelectedIndex == index
                                      ? Colors.blue.withOpacity(0.5)
                                      : Colors.transparent),
                              child: oldSelectedIndex == index
                                  ? Icon(
                                      Icons.check,
                                      color: Colors.white,
                                      size: 40,
                                    )
                                  : Container(),
                            ),
                          ],
                        ),
                      );
                    }),
              ),
              RoundedEdgeButton(
                  height: AppSizes.BUTTON_HEIGHT,
                  color: AppColors.BUTTON_COLOR,
                  text: 'Next',
                  buttonRadius: AppSizes.BUTTON_RADIUS,
                  textColor: AppColors.WHITE,
                  textFontSize: AppSizes.BUTTON_FONT_SIZE,
                  leftMargin: AppSizes.BUTTON_MARGIN,
                  topMargin: AppSizes.BUTTON_MARGIN,
                  rightMargin: AppSizes.BUTTON_MARGIN,
                  onPressed: (value) async {
                    showCircularDialog(context);
                    SendHelpAndFeedbackModel model =
                        await controller.sendCodeToFriend({
                      "myMobile": controller.myMobileNumber.toString(),
                      "emergencyContactId": controller.emergencyContactId
                    });
                    Get.back();
                    if (model.flag!) {
                      showSuccess(title: 'Success', message: model.message!);
                      Get.to(() => VerificationCodeFromFriendPage());
                    } else {
                      showError(title: 'Error', message: model.message!);
                    }
                  },
                  context: context),
            ],
          ),
        ),
      ),
    );
  }
}
