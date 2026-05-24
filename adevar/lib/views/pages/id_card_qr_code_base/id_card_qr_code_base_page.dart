import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/micheal_screens/id_card.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/views/pages/adavar_qr/adavar_qr_page.dart';
import 'package:highfedilityadevar/views/pages/public_qr/public_qr_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class IdCardQrCodeBasePage extends StatefulWidget {
  @override
  _IdCardQrCodeBasePageState createState() => _IdCardQrCodeBasePageState();
}

class _IdCardQrCodeBasePageState extends State<IdCardQrCodeBasePage> {
  int _selectedIndex = 0;
  UserDataModel? userDataModel;
  final GetSharedPref _getSharedPref = Get.put(GetSharedPref());

  @override
  void initState() {
    _getSharedPref.getUserData().then((value) async {
      userDataModel = value;
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          'ID Card',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
        actions: [
          GestureDetector(
            onTap: () async {
              SharedPreferences sharedPreferences =
                  await SharedPreferences.getInstance();
              log('=================================');
              Get.to(() => _selectedIndex == 0
                  ? IdCard(
                      pagename: "Private",
                      userId: sharedPreferences.getString("otherUserId") != null
                          ? sharedPreferences.getString("otherUserId")
                          : userDataModel!.userId,
                    )
                  : IdCard(
                      pagename: "Public",
                      userId: userDataModel!.userId,
                    ));
              // Get.to(() => IdCard());
            },
            child: Image(
              image: AssetImage(
                AppImages.QR_ICON,
              ),
              height: 20,
              width: 20,
            ),
          ),
          SizedBox(
            width: 20,
          )
        ],
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
                              Text(
                                'Adavar QR',
                                style: GoogleFonts.roboto(
                                    color: _selectedIndex == 0
                                        ? Colors.blue
                                        : Colors.grey,
                                    fontWeight: FontWeight.w400,
                                    fontSize: 16),
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
                              Text(
                                'Public QR',
                                style: GoogleFonts.roboto(
                                    color: _selectedIndex == 1
                                        ? Colors.blue
                                        : Colors.grey,
                                    fontWeight: FontWeight.w400,
                                    fontSize: 16),
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
          Expanded(
            child: Container(
              child: _selectedIndex == 0 ? AdavarQrCodePage() : PublicQrPage(),
            ),
          )
        ],
      ),
    );
  }
}
