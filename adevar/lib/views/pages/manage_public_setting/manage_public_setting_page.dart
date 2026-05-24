import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_switch/flutter_switch.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_global_data.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';

import '../../../controllers/manageAccessSettingsConroller/ManageAccessSettingsController.dart';
import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';

class ManagePublicAccessSettingPage extends StatefulWidget {
  @override
  State<ManagePublicAccessSettingPage> createState() =>
      _ManagePublicAccessSettingPageState();
}

class _ManagePublicAccessSettingPageState
    extends State<ManagePublicAccessSettingPage> with BaseClass {
  final GetSharedPref _getSharedPref = Get.put(GetSharedPref());
  var showSettings = false;
  final ManageAccessSettingsController _manageAccessSettingsController =
      Get.isRegistered<ManageAccessSettingsController>()
          ? Get.find<ManageAccessSettingsController>()
          : Get.put(ManageAccessSettingsController());

  @override
  void initState() {
    super.initState();
    getSetManageAccessSettings();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Manage Access Settings',
          style: GoogleFonts.roboto(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: Colors.black,
          ),
        ),
        centerTitle: true,
      ),
      body: showSettings
          ? Container(
              margin: EdgeInsets.symmetric(horizontal: 30, vertical: 26),
              child: GridView.builder(
                  itemCount: AppData.managePublicAccessList.length,
                  physics: NeverScrollableScrollPhysics(),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 20,
                      childAspectRatio: 0.95,
                      mainAxisSpacing: 20),
                  shrinkWrap: true,
                  scrollDirection: Axis.vertical,
                  itemBuilder: (BuildContext context, int index) {
                    return GestureDetector(
                      onTap: () {},
                      child: Container(
                        decoration: BoxDecoration(
                            color: AppColors.FORM_GREY,
                            borderRadius: BorderRadius.circular(15)),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  height: 28,
                                  width: 28,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                  ),
                                  child: Image(
                                      image: AssetImage(AppData
                                          .managePublicAccessList
                                          .elementAt(index)['image'])),
                                ),
                                SizedBox(
                                  width: 5,
                                ),
                                Text(
                                  AppData.managePublicAccessList
                                      .elementAt(index)['name'],
                                  style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 14,
                                    color: Colors.grey,
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(
                              height: 14,
                            ),
                            FlutterSwitch(
                              width: 50.0,
                              height: 30.0,
                              value: AppData.managePublicAccessList
                                  .elementAt(index)['isSelected'],
                              borderRadius: 30.0,
                              showOnOff: false,
                              onToggle: (val) {
                                AppData.managePublicAccessList
                                    .elementAt(index)['isSelected'] = val;
                                setState(() {});
                                setManageSettings();
                              },
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
            )
          : Container(),
    );
  }

  void getSetManageAccessSettings() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    showCircularDialog(context);
    try {
      var model = await _manageAccessSettingsController
          .getManageAccessSettings(userDataModel.authToken!);
      if (model.flag) {
        setState(() {
          AppData.managePublicAccessList.elementAt(0)['isSelected'] =
              model.Email == "0" ? false : true;
          AppData.managePublicAccessList.elementAt(1)['isSelected'] =
              model.Work == "0" ? false : true;
          AppData.managePublicAccessList.elementAt(2)['isSelected'] =
              model.Edu == "0" ? false : true;
          AppData.managePublicAccessList.elementAt(3)['isSelected'] =
              model.Name == "0" ? false : true;
          AppData.managePublicAccessList.elementAt(4)['isSelected'] =
              model.Phone == "0" ? false : true;
          AppData.managePublicAccessList.elementAt(5)['isSelected'] =
              model.Skills == "0" ? false : true;
          AppData.managePublicAccessList.elementAt(6)['isSelected'] =
              model.Place == "0" ? false : true;
          AppData.managePublicAccessList.elementAt(7)['isSelected'] =
              model.Rating == "0" ? false : true;
          AppData.managePublicAccessList.elementAt(8)['isSelected'] =
              model.Intro == "0" ? false : true;
          AppData.managePublicAccessList.elementAt(9)['isSelected'] =
              model.Comment == "0" ? false : true;
          showSettings = true;
        });
        Navigator.pop(context);
        // showSuccess(title: 'Success', message: model.message);
      } else {
        Navigator.pop(context);
        throw model.message;
      }
    } catch (e) {
      Navigator.pop(context);
      // showError(title: 'Error', message: e.toString());
    }
  }

  setManageSettings() async {
    final Map<String, String> managePublicSettingsData = {
      'Email':
          AppData.managePublicAccessList.elementAt(0)['isSelected'] == false
              ? "0"
              : "1",
      'Work': AppData.managePublicAccessList.elementAt(1)['isSelected'] == false
          ? "0"
          : "1",
      'Edu': AppData.managePublicAccessList.elementAt(2)['isSelected'] == false
          ? "0"
          : "1",
      'Name': AppData.managePublicAccessList.elementAt(3)['isSelected'] == false
          ? "0"
          : "1",
      'Phone':
          AppData.managePublicAccessList.elementAt(4)['isSelected'] == false
              ? "0"
              : "1",
      'Skills':
          AppData.managePublicAccessList.elementAt(5)['isSelected'] == false
              ? "0"
              : "1",
      'Place':
          AppData.managePublicAccessList.elementAt(6)['isSelected'] == false
              ? "0"
              : "1",
      'Rating':
          AppData.managePublicAccessList.elementAt(7)['isSelected'] == false
              ? "0"
              : "1",
      'Intro':
          AppData.managePublicAccessList.elementAt(8)['isSelected'] == false
              ? "0"
              : "1",
      'Comment':
          AppData.managePublicAccessList.elementAt(9)['isSelected'] == false
              ? "0"
              : "1",
    };

    print("managePublicSettings $managePublicSettingsData");
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    showCircularDialog(context);
    try {
      var model = await _manageAccessSettingsController.setManageAccessSettings(
          userDataModel.authToken!, managePublicSettingsData);

      if (model.flag) {
        Navigator.pop(context);
        showSuccess(title: 'Success', message: model.message);
      } else {
        throw model.message;
      }
    } catch (e) {
      print(e);
      // showError(title: 'Error', message: e.toString());
    }
  }
}
