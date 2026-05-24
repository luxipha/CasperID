import 'package:email_validator/email_validator.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/account_security_email/send_verification_code_to_email_controller.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/account_security/change_email/account_security_model.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/account_security_email/account_security_otp_page.dart';
import 'package:highfedilityadevar/views/widgets/form_input_with_hint_on_top.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';

class AccountSecurityEmailPage extends StatefulWidget {
  bool? emailAdded;
  String? certificate;
  AccountSecurityEmailPage({Key? key, this.emailAdded = true, this.certificate})
      : super(key: key);
  @override
  State<AccountSecurityEmailPage> createState() =>
      _AccountSecurityEmailPageState();
}

class _AccountSecurityEmailPageState extends State<AccountSecurityEmailPage>
    with BaseClass {
  final accountSecurityEmailPageController =
      Get.put(SendVerificationCodeToEmailController());
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());
  final TextEditingController emailController = TextEditingController();
  UserDataModel model = new UserDataModel();
  bool? isValid = true;

  @override
  void initState() {
    // WidgetsBinding.instance!.addPostFrameCallback((_) {
    //   _getSharedPref.getUserData().then((value) {
    //     print(value.profilePicture);
    //     emailController.text = value.userEmail.toString();

    //     setState(() {});
    //   });
    // });

    // setEmailData();

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Email',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            SizedBox(
              height: 40,
            ),
            Container(
              height: 100,
              width: 100,
              child: Stack(
                children: [
                  Image(
                    image: AssetImage(
                      AppImages.BLUE_CIRCLE,
                    ),
                    height: 100,
                    width: 100,
                  ),
                  Align(
                    alignment: Alignment.center,
                    child: Image(
                      image: AssetImage(
                        AppImages.ACCOUNT_SECURITY_EMAIL,
                      ),
                      height: 42,
                      width: 42,
                    ),
                  )
                ],
              ),
            ),
            SizedBox(
              height: 13,
            ),
            Text(
              'Email',
              style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontWeight: FontWeight.w400,
                  fontSize: 18),
            ),
            SizedBox(
              height: 13,
            ),
            Container(
              margin: EdgeInsets.symmetric(horizontal: 34),
              child: Text(
                'Please fill in your usual email address to help authenticate your account',
                style: GoogleFonts.roboto(
                    color: Colors.grey,
                    fontWeight: FontWeight.w400,
                    fontSize: 14),
              ),
            ),
            SizedBox(
              height: 22,
            ),
            Container(
              margin: EdgeInsets.only(left: 30, right: 30),
              child: FormInputWithHint(
                label: '',
                borderRadius: 15,
                onChanged: (value) {},
                textEditingController: emailController,
                filledColor: Colors.white,
                focusNode: FocusNode(),
                hintText: '',
                borderColor: Colors.blue,
              ),
            ),
            SizedBox(height: 8),
            emailController.text.trim().isNotEmpty
                ? isValid!
                    ? Container()
                    : Text(
                        'Email format is not correct',
                        style: GoogleFonts.roboto(
                            color: AppColors.red,
                            fontWeight: FontWeight.w500,
                            fontSize: 14),
                      )
                : Container(),
            SizedBox(height: 8),
            RoundedEdgeButton(
                height: AppSizes.BUTTON_HEIGHT,
                color: AppColors.BUTTON_COLOR,
                text: 'Confirm',
                buttonRadius: AppSizes.BUTTON_RADIUS,
                textColor: AppColors.WHITE,
                textFontSize: AppSizes.BUTTON_FONT_SIZE,
                leftMargin: AppSizes.BUTTON_MARGIN,
                topMargin: AppSizes.BUTTON_MARGIN,
                rightMargin: AppSizes.BUTTON_MARGIN,
                onPressed: (value) async {
                  isValid =
                      EmailValidator.validate(emailController.text.trim());
                  if (isValid == true) {
                    // if (widget.emailAdded == true) {
                    sendVerificationCode();
                    // } else {
                    //   sendVerificationCodeForSetEmail();
                    // }
                  }
                  setState(() {});
                },
                context: context),
          ],
        ),
      ),
    );
  }

  sendVerificationCode() async {
    try {
      showCircularDialog(context);
      AccountSecurityModel model = await accountSecurityEmailPageController
          .sendVerificationCodeToEmailApi({"newEmail": emailController.text});

      if (model.flag!) {
        popToPreviousScreen(context: context);
        print(model.toJson());

        Get.off(AccountSecurityOtpPage(
          newEmail: emailController.text,
          fromSecurityPage: false,
          certificateCode: widget.certificate,
          emailAdded: widget.emailAdded,
        ));
        showSuccess(title: 'Success', message: model.message!);
      } else {
        popToPreviousScreen(context: context);
        showError(title: 'Error', message: model.message!);
      }
    } catch (e) {
      popToPreviousScreen(context: context);
      // showError(title: 'Error', message: e.toString());
    }
  }
}
