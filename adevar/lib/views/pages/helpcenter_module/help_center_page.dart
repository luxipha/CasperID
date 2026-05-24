import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/help_center/helpCenter/help_center_controller.dart';
import 'package:highfedilityadevar/models/help_center/send_help_feedback_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/dialogs/app_dialogs.dart';
import 'package:highfedilityadevar/views/widgets/form_input_with_hint_on_top.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';

class HelpCenterPage extends StatelessWidget with BaseClass {
  final HelpCenterController controller = Get.put(HelpCenterController());
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: GetBuilder<HelpCenterController>(initState: (state) {
        controller.getDeviceInformation();
      }, builder: (controller) {
        return Container(
          width: double.infinity,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(
                  height: 30,
                ),
                Image(
                  image: AssetImage(AppImages.help_center),
                  width: 124,
                  height: 72,
                ),
                SizedBox(
                  height: 12,
                ),
                Container(
                  margin:
                      EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                  child: Text(
                    'Help Center',
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
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    'Please briefly describe your problem, we will have a staff memeber to contact you within 24 hours.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.roboto(
                        color: Colors.black,
                        fontSize: 14,
                        fontWeight: FontWeight.w400),
                  ),
                ),
                SizedBox(
                  height: 25,
                ),
                Container(
                  margin:
                      EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                  child: FormInputWithHint(
                    textEditingController: controller.emailController,
                    label: 'Email',
                    onChanged: () {},
                    isMandatory: true,
                    hintText: 'Enter your Email',
                    focusNode: FocusNode(),
                  ),
                ),
                SizedBox(
                  height: 20,
                ),
                Container(
                  margin:
                      EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                  child: FormInputWithHint(
                    textEditingController: controller.subjectController,
                    label: 'Subject',
                    onChanged: () {},
                    isMandatory: true,
                    hintText: 'Enter your Message Subject',
                    focusNode: FocusNode(),
                  ),
                ),
                SizedBox(
                  height: 20,
                ),
                Container(
                  margin:
                      EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                  child: FormInputWithHint(
                    textEditingController: controller.messageController,
                    label: 'Message',
                    hintText: 'Enter your Message',
                    onChanged: () {},
                    inputHeight: 304,
                    maxLine: 10,
                    textFieldHeight: 20,
                    horizontalPadding: 20,
                    isMandatory: true,
                    focusNode: FocusNode(),
                  ),
                ),
                RoundedEdgeButton(
                    height: AppSizes.BUTTON_HEIGHT,
                    color: AppColors.BUTTON_COLOR,
                    text: 'Submit',
                    buttonRadius: AppSizes.BUTTON_RADIUS,
                    textColor: AppColors.WHITE,
                    textFontSize: AppSizes.BUTTON_FONT_SIZE,
                    leftMargin: AppSizes.BUTTON_MARGIN,
                    bottomMargin: 30,
                    topMargin: 0,
                    rightMargin: AppSizes.BUTTON_MARGIN,
                    onPressed: (value) async {
                      if (controller.subjectController.text.isNotEmpty &&
                          controller.messageController.text.isNotEmpty &&
                          controller.emailController.text.isNotEmpty) {
                        showCircularDialog(context);
                        SendHelpAndFeedbackModel model =
                            await controller.sendHelpAndFeedBack({
                          "subject":
                              controller.subjectController.text.toString(),
                          "message":
                              controller.messageController.text.toString(),
                          "email": controller.emailController.text.toString(),
                          "deviceId": controller.deviceId.toString(),
                        });
                        Get.back();
                        if (model.flag!) {
                          AppDialogs.showHelpCenterDialog(context);
                        } else {
                          showError(title: "Error", message: model.message!);
                        }
                      } else {
                        showError(
                            title: 'Validation',
                            message: 'Please enter all the details');
                      }
                    },
                    context: context),
              ],
            ),
          ),
        );
      }),
    );
  }
}
