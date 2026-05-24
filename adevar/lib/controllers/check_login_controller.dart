// ignore_for_file: import_of_legacy_library_into_null_safe

import 'dart:convert';
import 'dart:developer';
import 'package:get/get.dart';

import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/views/pages/example_onboard.dart';
import 'package:highfedilityadevar/views/pages/home_base/home_base_page.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_phone_number/register_phone_number_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CheckLoginController extends GetxController {
  checkLogin() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    String? prefData = prefs.getString("userData");

    if (prefData != null) {
      // var response = json.decode(prefData);
      var result = UserDataModel.fromJson(json.decode(prefs.getString("userData")!));

      print(result.isLoggedIn);
      if (prefs.getBool('isLoggedIn') == null || prefs.getBool('isLoggedIn') == false) {
        Get.offAll(() => OnBoardingPage());
      } else if (result.firstName == "" && result.lastName == "") {
        Get.offAll(() => RegisterPhoneNumberPage());
      } else {
        Get.offAll(() => HomeBasePage());
      }
    } else {
      Get.offAll(() => OnBoardingPage());
    }
  }

  @override
  void onInit() {
    super.onInit();
    Future.delayed(Duration(seconds: 5), () {
      // checkLogin();
    });
  }
}
//  seconds: dataStorage.read('isSplashVisible') !=
//                     DateFormat('dd/MM/yyyy').format(DateTime.now())
//                 ? 4
//                 : 1
