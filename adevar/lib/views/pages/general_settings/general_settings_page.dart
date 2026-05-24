import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_switch/flutter_switch.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/global_singleton.dart';
import 'package:highfedilityadevar/controllers/about_software/about_software.dart';
import 'package:highfedilityadevar/micheal_screens/about_soft.dart';
import 'package:highfedilityadevar/micheal_screens/language_screen.dart';
import 'package:highfedilityadevar/micheal_screens/theme_screen.dart';
import 'package:highfedilityadevar/models/setting/about_software_model.dart';
import 'package:highfedilityadevar/models/setting/about_software_model.dart'
    as softInfo;
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/account_security/account_security_page.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../controllers/user_data/get_shared_pref.dart';
import '../register_module/register_phone_number/register_phone_number_page.dart';

class GeneralSettingsPage extends StatefulWidget {
  @override
  _GeneralSettingsPageState createState() => _GeneralSettingsPageState();
}

class _GeneralSettingsPageState extends State<GeneralSettingsPage>
    with BaseClass {
  bool status = true;
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());
  AboutSoftwareController controller = AboutSoftwareController();
  softInfo.Data? softwareInfo;

  UserDataModel? token;
  @override
  void initState() {
    getSoftwareInfo();
    super.initState();
  }

  getSoftwareInfo() async {
    await _getSharedPref.getUserData();

    UserDataModel token = await _getSharedPref.getUserData();
    try {
      final response = await ApiService.get(
        "setting/userPersonSetting/querySettingsView?lang=en_US",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print("Notification Response=============$response===============");
      if (response != null &&
          response['data'] != null &&
          response['data']['notificationSwitch'] != null) {
        response['data']['notificationSwitch'].toString() == "0"
            ? status = false
            : status = true;
      } else {
        status = false;
      }

      setState(() {});
    } catch (error) {
      print("===============");
      print(error);
      // throw error.toString();
    }
    try {
      AboutSoftwareModel model = await controller.getSoftwareInfo();
      if (model.flag!) {
        softwareInfo = model.data;
        setState(() {});
      }
    } catch (e) {
      // showError(title: 'Error', message: e.toString());
    }
  }

  Future notificationChange(bool val) async {
    UserDataModel token = await _getSharedPref.getUserData();
    print(token.authToken);
    try {
      print(val);
      final response = await ApiService.put(
        status == false
            ? "setting/userPersonSetting/closeNotification?lang=en_US"
            : "setting/userPersonSetting/openNotification?lang=en_US",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": "${token.authToken}",
        },
      );
      print(response);
      return response;
    } catch (error) {
      print("===============");
      print(error);
      throw error.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
        child: Container(
      padding: EdgeInsets.symmetric(horizontal: 30),
      child: Column(
        children: [
          _getSettingsWidget(
            onTileTap: () {},
            title: 'Notifications',
            subTitle: 'We\’ll send some valuable information to you',
            leadingImage: AppImages.NOTIFICATION,
            trailingWidget: Container(
              width: 50,
              child: FlutterSwitch(
                width: 50.0,
                height: 30.0,
                /*  valueFontSize: 20.0,
                toggleSize: 15.0,*/
                value: status,
                borderRadius: 30.0,
                showOnOff: false,
                onToggle: (val) {
                  // print(token.authToken);
                  notificationChange(val);
                  setState(() {
                    status = val;
                  });
                },
              ),
            ),
          ),
          Divider(
            thickness: 1,
          ),
          _getSettingsWidget(
            onTileTap: () {
              Get.to(() => AccountSecurityPage());
            },
            title: 'Account Security',
            subTitle: 'Manage your account security',
            leadingImage: AppImages.ACCOUNT_SECURITY,
            trailingWidget: Icon(
              Icons.arrow_forward_ios_rounded,
              color: AppColors.FORWARD_COLOR_LIGHT,
            ),
          ),
          Divider(
            thickness: 1,
          ),
          // _getSettingsWidget(
          //   onTileTap: () {
          //     Get.to(() => ThemeScreen());
          //   },
          //   title: 'Theme',
          //   subTitle: 'Set the interface you like',
          //   leadingImage: AppImages.THEME,
          //   trailingWidget: Icon(
          //     Icons.arrow_forward_ios_rounded,
          //     color: AppColors.FORWARD_COLOR_LIGHT,
          //   ),
          // ),
          // Divider(
          //   thickness: 1,
          // ),
          // _getSettingsWidget(
          //   onTileTap: () {
          //     Get.to(() => LanguageScreen());
          //   },
          //   title: 'Language',
          //   subTitle: 'Current - English',
          //   leadingImage: AppImages.LANGUAGE,
          //   trailingWidget: Icon(
          //     Icons.arrow_forward_ios_rounded,
          //     color: AppColors.FORWARD_COLOR_LIGHT,
          //   ),
          // ),
          // Divider(
          //   thickness: 1,
          // ),
          // _getSettingsWidget(
          //   onTileTap: () {
          //     Get.to(() => HelpCenter());
          //   },
          //   title: 'Help & Feedback',
          //   subTitle: 'What\'s the problem?',
          //   leadingImage: AppImages.HELP_FEEDBACK,
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
              showDialog(
                  context: context,
                  builder: (BuildContext context) => CupertinoAlertDialog(
                        title: new Text(""),
                        content: new Text(
                          softwareInfo != null &&
                                  softwareInfo!.officialPhone.toString() !=
                                      'null'
                              ? softwareInfo!.officialPhone!
                              : "(629) 555-0129",
                          style: TextStyle(color: Colors.black, fontSize: 20),
                        ),
                        actions: <Widget>[
                          CupertinoDialogAction(
                            isDefaultAction: true,
                            child: Text(
                              'Call',
                              style: TextStyle(color: Colors.blue),
                            ),
                            onPressed: () {
                              launch(
                                  'tel:${softwareInfo!.officialPhone.toString() != 'null' ? softwareInfo!.officialPhone! : "(629) 555-0129"}'
                                      .toString()
                                      .trim());
                            },
                          ),
                          CupertinoDialogAction(
                            child: Text(
                              'No',
                              style: TextStyle(color: Colors.red),
                            ),
                            onPressed: () {
                              Get.back();
                            },
                          )
                        ],
                      ));
            },
            title: 'Contact Us',
            subTitle: 'Welcome to contact us',
            leadingImage: AppImages.CONTACT_US,
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
              Get.to(() => AboutSoft(
                    version: softwareInfo != null
                        ? softwareInfo!.latestVersion!
                        : "1.0",
                  ));
            },
            title: 'About Software',
            subTitle: softwareInfo != null
                ? 'Adavar V${softwareInfo!.latestVersion!}'
                : 'Adavar V1.0.',
            leadingImage: AppImages.ABOUT_SOFT,
            trailingWidget: Icon(
              Icons.arrow_forward_ios_rounded,
              color: AppColors.FORWARD_COLOR_LIGHT,
            ),
          ),
          Divider(
            thickness: 1,
          ),
          GestureDetector(
            onTap: () {
              showDialog(
                  context: context,
                  builder: (BuildContext context) => CupertinoAlertDialog(
                        title: new Text("Alert"),
                        content: new Text(
                          "Are you sure to log out of this account?",
                          style: TextStyle(color: Colors.black),
                        ),
                        actions: <Widget>[
                          CupertinoDialogAction(
                            onPressed: () {
                              Get.back();
                            },
                            isDefaultAction: true,
                            child: Text(
                              'Cancel',
                              style: TextStyle(color: Colors.blue),
                            ),
                          ),
                          CupertinoDialogAction(
                            child: Text(
                              'Yes',
                              style: TextStyle(color: Colors.red),
                            ),
                            onPressed: () async {
                              GlobalSingleton().recentSearchResultList.clear();
                              Get.back();
                              await _getSharedPref.clearPreference();

                              pushReplaceAndClearStack(
                                  context: context,
                                  destination: RegisterPhoneNumberPage());
                              pushReplaceAndClearStack(
                                  context: context,
                                  destination: RegisterPhoneNumberPage());
                            },
                          )
                        ],
                      ));
            },
            child: Container(
              width: double.infinity,
              margin: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              padding: EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: AppColors.FORM_GREY,
                borderRadius: BorderRadius.circular(15),
              ),
              child: Center(
                child: Text(
                  'Log out',
                  style: GoogleFonts.roboto(
                      fontWeight: FontWeight.w400,
                      fontSize: 18,
                      color: Colors.red),
                ),
              ),
            ),
          )
        ],
      ),
    ));
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
