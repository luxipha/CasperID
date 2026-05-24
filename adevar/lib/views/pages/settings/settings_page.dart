import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/views/pages/general_settings/general_settings_page.dart';
import 'package:highfedilityadevar/views/pages/privacy_settings/privacy_settings_page.dart';

class SettingsPage extends StatefulWidget {
  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Settings',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            height: 49,
            color: AppColors.BOTTOM_NAV_COLOR,
            child: Row(
              children: [
                InkWell(
                  onTap: () {
                    if (_selectedIndex == 0) return;
                    setState(() {
                      _selectedIndex = 0;
                    });
                  },
                  child: Container(
                    width: Get.width * 0.5,
                    height: 49,
                    child: Stack(
                      children: [
                        Align(
                          alignment: Alignment.center,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image(
                                image: AssetImage(AppImages.SETTINGS),
                                height: /* _selectedIndex == 0 ? 25 :*/ 20,
                                width: /* _selectedIndex == 0 ? 25 :*/ 20,
                                color: _selectedIndex == 0
                                    ? Colors.blue
                                    : Colors.grey,
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              Text(
                                'General',
                                style: GoogleFonts.roboto(
                                    color: _selectedIndex == 0
                                        ? Colors.blue
                                        : Colors.grey,
                                    fontWeight: FontWeight.w400,
                                    fontSize: /*_selectedIndex == 0 ? 18 :*/ 16),
                              ),
                            ],
                          ),
                        ),
                        _selectedIndex == 0
                            ? Align(
                                alignment: Alignment.bottomCenter,
                                child: Container(
                                  width: Get.width * 0.4,
                                  margin: EdgeInsets.only(left: 20),
                                  color: Colors.blue,
                                  height: 2,
                                ),
                              )
                            : Container()
                      ],
                    ),
                  ),
                ),
                InkWell(
                  onTap: () {
                    if (_selectedIndex == 1) return;
                    setState(() {
                      _selectedIndex = 1;
                    });
                  },
                  child: Stack(
                    children: [
                      Align(
                        alignment: Alignment.center,
                        child: Container(
                          width: Get.width * 0.5,
                          height: 49,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image(
                                image: AssetImage(AppImages.PRIVACY),
                                height: /*_selectedIndex == 1 ? 25 :*/ 20,
                                width: /*_selectedIndex == 1 ? 25 :*/ 20,
                                color: _selectedIndex == 1
                                    ? Colors.blue
                                    : Colors.grey,
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              Text(
                                'Privacy',
                                style: GoogleFonts.roboto(
                                    color: _selectedIndex == 1
                                        ? Colors.blue
                                        : Colors.grey,
                                    fontWeight: FontWeight.w400,
                                    fontSize: /*_selectedIndex == 1 ? 18 :*/ 16),
                              ),
                            ],
                          ),
                        ),
                      ),
                      _selectedIndex == 1
                          ? Align(
                              alignment: Alignment.bottomCenter,
                              child: Container(
                                width: Get.width * 0.4,
                                margin: EdgeInsets.only(left: 20),
                                color: Colors.blue,
                                height: 2,
                              ),
                            )
                          : Container()
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            height: 20,
          ),
          Container(
            child: _selectedIndex == 0
                ? Expanded(child: GeneralSettingsPage())
                : Expanded(child: PrivacySettingsPage()),
          )
        ],
      ),
    );
  }
}
