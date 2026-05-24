import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/badges_controller/BadgesController.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/badgesModel/GetBadgesModel.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/utils/common_widgets.dart';
import 'package:highfedilityadevar/views/pages/available_badges/available_badges_page.dart';
import 'package:highfedilityadevar/views/pages/earned_bades/earned_bades_page.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../models/user_data/user_model.dart';
import '../../../utils/AppDataNotifiier.dart';
import '../../../utils/SessionManager.dart';

class MyBadgesPage extends StatefulWidget {
  @override
  _MyBadgesPageState createState() => _MyBadgesPageState();
}

class _MyBadgesPageState extends State<MyBadgesPage> with BaseClass {
  int _selectedIndex = 0;

  UserDataModel? userDataModel;

  bool earnedBadgesLoaded = false;
  bool allBadgesLoaded = false;

  List<BadgesData>? allBadgesData;
  List<BadgesData>? earnedBadgesData;

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final BadgesController _badgesController =
      Get.isRegistered<BadgesController>()
          ? Get.find<BadgesController>()
          : Get.put(BadgesController());

  @override
  void initState() {
    super.initState();
    getAllAvailableBadges();
    getEarnedBadges();
  }

  @override
  Widget build(BuildContext context) {
    final notifier = context.watch<AppDataNotifier>();
    if (notifier.badgeUrlUpdated == 1) {
      setState(() {});
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'My Badge',
          style: GoogleFonts.roboto(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: Colors.black,
          ),
        ),
        centerTitle: true,
      ),
      body: allBadgesData != null && earnedBadgesData != null
          ? Container(
              width: double.infinity,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    SizedBox(
                      height: 30,
                    ),
                    Container(
                      height: 85,
                      width: 90,
                      child: Stack(
                        children: [
                          ClipOval(
                            child: userDataModel?.profilePicture != null
                                ? Image.network(
                                    userDataModel!.profilePicture!,
                                    height: 80,
                                    width: 80,
                                    fit: BoxFit.cover,
                                  )
                                : Image(
                                    image: AssetImage(AppImages.MY_BADGE_USER),
                                    height: 80,
                                    width: 80,
                                  ),
                          ),
                          UserPref.getBadgeUrl() == ""
                              ? Container(
                                  height: 45,
                                  width: 45,
                                )
                              : Positioned(
                                  bottom: -5,
                                  right: 0,
                                  child: Image.network(
                                    UserPref.getBadgeUrl(),
                                    height: 40,
                                    width: 40,
                                  ),
                                ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: 12,
                    ),
                    Text(
                      "${userDataModel?.firstName} ${userDataModel?.lastName}",
                      style: GoogleFonts.roboto(
                        fontWeight: FontWeight.w400,
                        fontSize: 24,
                        color: Colors.black,
                      ),
                    ),
                    SizedBox(
                      height: 24,
                    ),
                    Container(
                      width: double.infinity,
                      height: 49,
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
                                    child: Text(
                                      'Earned badges',
                                      style: GoogleFonts.roboto(
                                          color: _selectedIndex == 0
                                              ? Colors.blue.shade700
                                              : Colors.grey,
                                          fontWeight: _selectedIndex == 0
                                              ? FontWeight.w700
                                              : FontWeight.w400,
                                          fontSize:
                                              _selectedIndex == 0 ? 18 : 16),
                                    ),
                                  ),
                                  _selectedIndex == 0
                                      ? Align(
                                          alignment: Alignment.bottomCenter,
                                          child: Container(
                                            width: Get.width * 0.2,
                                            decoration: BoxDecoration(
                                                color: Colors.blue.shade700,
                                                borderRadius:
                                                    BorderRadius.circular(15)),
                                            margin: EdgeInsets.only(left: 0),
                                            height: 6,
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
                            child: Container(
                              width: Get.width * 0.5,
                              height: 49,
                              child: Stack(
                                children: [
                                  Align(
                                    alignment: Alignment.center,
                                    child: Text(
                                      'Available badges',
                                      style: GoogleFonts.roboto(
                                          color: _selectedIndex == 1
                                              ? Colors.blue
                                              : Colors.grey,
                                          fontWeight: _selectedIndex == 1
                                              ? FontWeight.w700
                                              : FontWeight.w400,
                                          fontSize:
                                              _selectedIndex == 1 ? 18 : 16),
                                    ),
                                  ),
                                  _selectedIndex == 1
                                      ? Align(
                                          alignment: Alignment.bottomCenter,
                                          child: Container(
                                            width: Get.width * 0.2,
                                            decoration: BoxDecoration(
                                                color: Colors.blue.shade700,
                                                borderRadius:
                                                    BorderRadius.circular(15)),
                                            margin: EdgeInsets.only(left: 0),
                                            height: 6,
                                          ),
                                        )
                                      : Container()
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: 10,
                    ),
                    _selectedIndex == 0
                        ? EarnedBadgesPage(
                            badgeData: earnedBadgesData!,
                          )
                        : AvailableBadgesPage(
                            badgeData: allBadgesData!,
                          )
                  ],
                ),
              ),
            )
          : circularProgressView(),
    );
  }

  void getAllAvailableBadges() async {
    UserPref.userPref = await SharedPreferences.getInstance();
    Provider.of<AppDataNotifier>(context, listen: false).updateBadgeUrl(0);

    userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _badgesController.getAllBadges(
          userDataModel!.authToken.toString(), "1", "20");
      if (model.flag!) {
        allBadgesData = model.badgesData;

        // showSuccess(title: "Success", message: model.message!);
      } else {
        throw model.message!;
      }
    } catch (error) {
      // showError(title: "Error", message: error.toString());
    }

    setState(() {});
  }

  void getEarnedBadges() async {
    userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _badgesController.getEarnedBadges(
          userDataModel!.authToken.toString(), "1", "20");
      if (model.flag!) {
        earnedBadgesData = model.badgesData;

        // showSuccess(title: "Success", message: model.message!);
      } else {
        showError(title: "Error", message: model.message!);
        // throw model.message!;
      }
    } catch (error) {}
    setState(() {});
  }
}
