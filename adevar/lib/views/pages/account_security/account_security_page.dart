import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/account_security/account_security_controller.dart';
import 'package:highfedilityadevar/models/account_security/get_current_user_info.dart';
import 'package:highfedilityadevar/models/account_security/get_current_user_info.dart'
    as user;
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/account_security_email/account_security_otp_page.dart';
import 'package:highfedilityadevar/views/pages/added_emergency_contacts/added_emergency_contatcs_page.dart';
import 'package:highfedilityadevar/views/pages/delete_account/delete_account_screen.dart';
import 'package:highfedilityadevar/views/pages/phone_number/phone_number_page.dart';
import 'package:highfedilityadevar/views/pages/settings_change_pin/settings_change_pin_page.dart';

import '../account_security_email/account_security_email_page.dart';

import 'package:highfedilityadevar/views/pages/account_security_email/account_security_email_page.dart';

class AccountSecurityPage extends StatefulWidget {
  @override
  _AccountSecurityPageState createState() => _AccountSecurityPageState();
}

class _AccountSecurityPageState extends State<AccountSecurityPage>
    with BaseClass {
  int _selectedIndex = 0;
  AccountSecurityController controller = AccountSecurityController();
  user.User? userInfo;
  @override
  void initState() {
    getUserInfo();
    super.initState();
  }

  getUserInfo() async {
    try {
      Future.delayed(Duration(microseconds: 1), () {
        showCircularDialog(context);
      });
      GetCurrentUserInfoModel model = await controller.getCurrentUserInfo();
      Get.back();
      if (model.flag!) {
        userInfo = model.data!.user;
        setState(() {});
      } else {}
    } on Exception catch (e) {
      // TODO
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Account Security',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 30),
          child: Column(
            children: [
              // SizedBox(
              //   height: 30,
              // ),
              // _getSettingsWidget(
              //   onTileTap: () {
              //     Get.to(() => LoginDevicesPage());
              //   },
              //   title: 'Login Device',
              //   subTitle: 'We\’ll send some valuable information to you',
              //   leadingImage: AppImages.PHONE_DEVICE,
              //   trailingWidget: Icon(
              //     Icons.arrow_forward_ios_rounded,
              //     color: AppColors.FORWARD_COLOR_LIGHT,
              //   ),
              // ),
              // Divider(
              //   thickness: 1,
              // ),
              _getSettingsWidget(
                onTileTap: () {
                  Get.to(() => AddedEmergencyContactsPage());
                },
                title: 'Emergency Contact',
                subTitle: 'Manage your account security',
                leadingImage: AppImages.EMERGENCY_CONTACT,
                trailingWidget: Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: AppColors.FORWARD_COLOR_LIGHT,
                ),
              ),
              Divider(
                thickness: 1,
              ),
              _getSettingsWidget(
                onTileTap: () {
                  Get.to(() => PhoneNumberPage());
                },
                title: 'Phone Number',
                subTitle: userInfo != null ? '${userInfo!.mobile}' : '',
                leadingImage: AppImages.CALL,
                trailingWidget: Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: AppColors.FORWARD_COLOR_LIGHT,
                ),
              ),
              Divider(
                thickness: 1,
              ),

              _getSettingsWidget(
                onTileTap: () {
                  if (userInfo != null &&
                      (userInfo!.email.toString() == "" ||
                          userInfo!.email.toString() == "null")) {
                    Get.to(() => AccountSecurityEmailPage(
                          emailAdded: false,
                        ));
                  } else {
                    Get.to(
                      () => AccountSecurityOtpPage(
                        fromSecurityPage: true,
                      ),
                    );
                  }

                  //
                },
                title: 'Email',
                subTitle: userInfo != null
                    ? '${(userInfo!.email!.toString() != '' || userInfo!.email.toString() == "null") ? userInfo!.email : "Bind your email"}'
                    : '',
                leadingImage: AppImages.EMAIL,
                trailingWidget: Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: AppColors.FORWARD_COLOR_LIGHT,
                ),
              ),
              Divider(
                thickness: 1,
              ),
              _getSettingsWidget(
                onTileTap: () {
                  Get.to(() => PinSettingsPage(
                        pinExist: (userInfo!.pin!.isNotEmpty) ? true : false,
                      ));
                },
                title: 'Set PIN',
                subTitle:
                    '${userInfo != null && userInfo!.pin!.isNotEmpty ? userInfo!.pin : "Set Pin"}',
                leadingImage: AppImages.PIN,
                trailingWidget: Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: AppColors.FORWARD_COLOR_LIGHT,
                ),
              ),
              Divider(
                thickness: 1,
              ),
              _getSettingsWidget(
                onTileTap: () {
                  Get.to(
                    () => DeleteAccountScreen(
                      mobileNumber:
                          userInfo != null ? '${userInfo!.mobile}' : '',
                    ),
                  );
                },
                title: 'Delete account',
                subTitle: 'Submit application, delete all data',
                leadingImage: AppImages.DELETEACCOUNT,
                trailingWidget: Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: AppColors.FORWARD_COLOR_LIGHT,
                ),
              ),
              Divider(
                thickness: 1,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _getSettingsWidget({
    required String title,
    required Widget trailingWidget,
    required String leadingImage,
    required String subTitle,
    required Function onTileTap,
  }) {
    return ListTile(
        onTap: () {
          onTileTap();
          //Get.to(()=>InviteFriendsPage());
        },
        leading: Image(
          image: AssetImage(leadingImage),
          height: 22,
          width: 22,
          color: Colors.black,
        ),
        subtitle: Text(
          subTitle,
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w400, fontSize: 12, color: Colors.grey),
        ),
        title: Text(
          title,
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w400,
              fontSize: 18,
              color: AppColors.BLACK_SHADE),
        ),
        trailing: trailingWidget);
  }
}
