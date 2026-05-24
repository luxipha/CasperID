import 'dart:developer';
import 'dart:ffi';

import 'package:badges/badges.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/home_page_controller/user_profile_controller.dart';
import 'package:highfedilityadevar/models/home/myPersonView_model.dart';
import 'package:highfedilityadevar/models/me_user_model/LatMeetingModel.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/utils/process_indicator.dart';
import 'package:highfedilityadevar/views/dialogs/welcome_dialog.dart';
import 'package:highfedilityadevar/views/pages/invitation_schedule/invitation_schedule_page.dart';
import 'package:highfedilityadevar/views/pages/new_today/new_today_page.dart';
import 'package:highfedilityadevar/views/pages/notification/notification_page.dart';
import 'package:highfedilityadevar/views/pages/recent_comments/recent_comments_page.dart';
import 'package:highfedilityadevar/views/pages/recent_contacts/recent_contacts_page.dart';
import 'package:highfedilityadevar/views/pages/search/search_page.dart';
import 'package:highfedilityadevar/views/pages/verified_account_badge/verified_account_badge_page.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:syncfusion_flutter_gauges/gauges.dart';
import '../../../controllers/get_user_data/user_profile_controller.dart';
import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/me_user_model/RecentCommentsModel.dart';
import '../../../models/me_user_model/RecentContactsModel.dart';
import '../../../models/user_data/user_model.dart';
import '../../../utils/SessionManager.dart';

class HomePage extends StatefulWidget {
  final from;

  const HomePage({required this.from});

  @override
  HomePageState createState() => HomePageState();
}

class HomePageState extends State<HomePage> with BaseClass {
  UserDataModel? userDataModel;
  MyPersonViewModel? myPersonViewData;
  LastMeetingModel? lastMeetingModel;
  List<RecentContactsData> recentContactsData = [];
  RecentCommentsModel? recentCommentsData;
  static Circle processIndicator = Circle();

  final GetSharedPref _getSharedPref = Get.put(GetSharedPref());
  final HomeScreenController homeScreenController =
      Get.put(HomeScreenController());

  final UserProfileController _userProfileController =
      Get.isRegistered<UserProfileController>()
          ? Get.find<UserProfileController>()
          : Get.put(UserProfileController());

  @override
  void initState() {
    setData();
    super.initState();
    // WidgetsBinding.instance!.addPostFrameCallback((_) {
    //   _getSharedPref.getUserData().then((value) async {
    //     userDataModel = value;
    //     print(userDataModel!.profilePicture);
    //     WelcomeDialog.welcomeDialog(context, myPersonViewData);
    //     setState(() {});
    //     // WelcomeDialog.welcomeDialog(context, myPersonViewData);
    //   });
    // });
  }

  setData() async {
    await callInit();
    await getToken();

    await getRecentContacts();
    await getRecentComments();
    await getLastMeeting();
  }

  String birthDate = "";
  callInit() async {
    await getPersonViewData();
    SharedPreferences pref = await SharedPreferences.getInstance();

    if (pref.getBool('isWelcomeWindowVisible') == true) {
      if (widget.from != "editProfile") {
        pref.setBool('isWelcomeWindowVisible', false);
        WelcomeDialog.welcomeDialog(context, myPersonViewData!);
      }
    }
  }

  getPersonViewData() async {
    SharedPreferences pref = await SharedPreferences.getInstance();
    log('${pref.getString('birthDate')}');
    birthDate =
        pref.getString('birthDate') != "" ? pref.getString('birthDate')! : "";
    try {
      Future.delayed(Duration(microseconds: 2), () async {
        await processIndicator.show(context);
        // showCircularDialog(context);
      });

      myPersonViewData = await homeScreenController.getPersonView();

      processIndicator.hide(context);
      // popToPreviousScreen(context: context);
      if (mounted) {
        setState(() {});
      }

      if (myPersonViewData!.flag!) {
      } else {}
    } catch (e) {
      processIndicator.hide(context);
      // popToPreviousScreen(context: context);
    }
  }

  bool isEyeOpen = false;
  Color progressBarColor(int value) {
    if (value >= 0 && value <= 149) {
      return Color(0xffAF0606);
    } else if (value >= 150 && value <= 349) {
      return Color(0xffD33429);
    } else if (value >= 350 && value <= 549) {
      return Color(0xffF1D022);
    } else if (value >= 550 && value <= 1099) {
      return Color(0xff3FD027);
    } else if (value >= 1100 && value <= 3299) {
      return Color(0xff04D2AD);
    } else if (value >= 3300 && value <= 13199) {
      return Color(0xff0085FF);
    } else if (value >= 13200 && value <= 65999) {
      return Color(0xff001AFF);
    } else if (value >= 66000 && value <= 395999) {
      return Color(0xffAD00FF);
    } else if (value >= 396000 && value <= 2771999) {
      return Color(0xffFF00A8);
    } else if (value >= 2772000 && value <= 22175999) {
      return Color(0xffF94B01);
    } else {
      return Color(0xffF94B01);
    }
  }

  String progressBarEmoji(int value) {
    if (value >= 0 && value <= 149) {
      return AppImages.EXP1;
    } else if (value >= 150 && value <= 349) {
      return AppImages.EXP2;
    } else if (value >= 350 && value <= 549) {
      return AppImages.EXP3;
    } else if (value >= 550 && value <= 1099) {
      return AppImages.EXP4;
    } else if (value >= 1100 && value <= 3299) {
      return AppImages.EXP5;
    } else if (value >= 3300 && value <= 13199) {
      return AppImages.EXP6;
    } else if (value >= 13200 && value <= 65999) {
      return AppImages.EXP7;
    } else if (value >= 66000 && value <= 395999) {
      return AppImages.EXP8;
    } else if (value >= 396000 && value <= 2771999) {
      return AppImages.EXP9;
    } else if (value >= 2772000 && value <= 22175999) {
      return AppImages.EXP10;
    } else {
      return AppImages.EXP10;
    }
  }

  double progressMinimumValue(int value) {
    if (value >= 0 && value <= 149) {
      return 0;
    } else if (value >= 150 && value <= 349) {
      return 150;
    } else if (value >= 350 && value <= 549) {
      return 350;
    } else if (value >= 550 && value <= 1099) {
      return 550;
    } else if (value >= 1100 && value <= 3299) {
      return 1100;
    } else if (value >= 3300 && value <= 13199) {
      return 3300;
    } else if (value >= 13200 && value <= 65999) {
      return 13200;
    } else if (value >= 66000 && value <= 395999) {
      return 66000;
    } else if (value >= 396000 && value <= 2771999) {
      return 39600;
      // return ((value * 90) / 2771999);
    } else if (value >= 2772000 && value <= 22175999) {
      return 2772000;
    } else {
      return 2772000;
    }
  }

  double progressMaximumValue(int value) {
    if (value >= 0 && value <= 149) {
      return 149;
    } else if (value >= 150 && value <= 349) {
      return 349;
    } else if (value >= 350 && value <= 549) {
      return 549;
    } else if (value >= 550 && value <= 1099) {
      return 1099;
    } else if (value >= 1100 && value <= 3299) {
      return 3299;
    } else if (value >= 3300 && value <= 13199) {
      return 13199.0;
    } else if (value >= 13200 && value <= 65999) {
      return 65999;
    } else if (value >= 66000 && value <= 395999) {
      return 395999;
    } else if (value >= 396000 && value <= 2771999) {
      return 2771999;
    } else if (value >= 2772000 && value <= 22175999) {
      return 22175999;
    } else {
      return 22175999;
    }
  }

  bool zodicSignCondition(
      int beaforeMonth, int beforeDate, int afterMonth, int afterDate) {
    if (birthDate != "" &&
        DateTime.parse(birthDate).isBefore(DateTime(
            DateTime.parse(birthDate).year, beaforeMonth, beforeDate)) &&
        DateTime.parse(birthDate).isAfter(
            DateTime(DateTime.parse(birthDate).year, afterMonth, afterDate))) {
      return true;
    } else {
      return false;
    }
  }

  String zodicSigns() {
    if (zodicSignCondition(DateTime.april, 19, DateTime.march, 21)) {
      return AppImages.ARIES;
    } else if (zodicSignCondition(DateTime.may, 20, DateTime.april, 20)) {
      return AppImages.TAURUS;
    } else if (zodicSignCondition(DateTime.june, 21, DateTime.may, 21)) {
      return AppImages.GEMINI;
    } else if (zodicSignCondition(DateTime.july, 22, DateTime.june, 22)) {
      return AppImages.CANCER;
    } else if (zodicSignCondition(DateTime.august, 22, DateTime.july, 23)) {
      return AppImages.LEO;
    } else if (zodicSignCondition(
        DateTime.september, 22, DateTime.august, 23)) {
      return AppImages.VIRGO;
    } else if (zodicSignCondition(
        DateTime.october, 23, DateTime.september, 23)) {
      return AppImages.LIBRA;
    } else if (zodicSignCondition(
        DateTime.november, 22, DateTime.october, 24)) {
      return AppImages.SCORPIO;
    } else if (zodicSignCondition(
        DateTime.december, 21, DateTime.november, 23)) {
      return AppImages.SAGITTARIUS;
    } else if (zodicSignCondition(
        DateTime.january, 19, DateTime.december, 22)) {
      return AppImages.CAPRICORN;
    } else if (zodicSignCondition(
        DateTime.february, 18, DateTime.january, 20)) {
      return AppImages.AQUARIUS;
    } else if (zodicSignCondition(DateTime.march, 20, DateTime.february, 19)) {
      return AppImages.PISCES;
    }
    return AppImages.PISCES;
  }

  Future<void> onRefresh() {
    return Future.delayed(Duration(seconds: 1), () {
      getPersonViewData();
      getToken();

      getLastMeeting();
      getRecentContacts();
      getRecentComments();
    });
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: Text(
            'Welcome',
            style: GoogleFonts.roboto(
              color: Colors.black,
              fontSize: 36,
              letterSpacing: 2,
              fontWeight: FontWeight.w700,
            ),
          ),
          actions: [
            if (myPersonViewData != null)
              GestureDetector(
                onTap: () {
                  Get.to(() => NotificationPage());
                },
                child: Badge(
                  padding: EdgeInsets.all(2),
                  showBadge: myPersonViewData!.data!.newNotificationCount! != 0
                      ? true
                      : false,
                  badgeContent: Text(
                    myPersonViewData!.data!.newNotificationCount!.toString(),
                    style: TextStyle(color: Colors.white, fontSize: 10),
                  ),
                  position: BadgePosition.topEnd(top: 12, end: 1),
                  child: Image(
                    image: AssetImage(AppImages.NOTIFICATION),
                    height: 23,
                    width: 21,
                  ),
                ),
              ),
            SizedBox(
              width: 17,
            ),
            GestureDetector(
              onTap: () {
                Get.to(() => SearchPage());
              },
              child: Image(
                image: AssetImage(AppImages.SEARCH),
                height: 25,
                width: 25,
              ),
            ),
            SizedBox(
              width: 20,
            ),
          ],
        ),
        body: SingleChildScrollView(
          child: Container(
            margin: EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              children: [
                if (myPersonViewData != null)
                  Row(
                    children: [
                      Container(
                        height: 85,
                        width: 90,
                        child: Stack(
                          children: [
                            ClipOval(
                              child: userDataModel?.profilePicture != null
                                  ? Image.network(
                                      myPersonViewData!.data!.logo.toString(),
                                      fit: BoxFit.fill,
                                      height: 80,
                                      width: 80,
                                      loadingBuilder: (BuildContext context,
                                          Widget child,
                                          ImageChunkEvent? loadingProgress) {
                                        if (loadingProgress == null)
                                          return child;
                                        return Center(
                                          child: CircularProgressIndicator(
                                            value: loadingProgress
                                                        .expectedTotalBytes !=
                                                    null
                                                ? loadingProgress
                                                        .cumulativeBytesLoaded /
                                                    loadingProgress
                                                        .expectedTotalBytes!
                                                : null,
                                          ),
                                        );
                                      },
                                    )
                                  : Image(
                                      image:
                                          AssetImage(AppImages.MY_BADGE_USER),
                                      height: 80,
                                      width: 80,
                                    ),
                            ),
                            myPersonViewData != null &&
                                    myPersonViewData!.data!.badgeUrl == ""
                                ? Container(
                                    height: 45,
                                    width: 45,
                                  )
                                : Positioned(
                                    bottom: -5,
                                    right: 0,
                                    child: Image.network(
                                      '${myPersonViewData!.data!.badgeUrl}',
                                      height: 40,
                                      width: 40,
                                    ),
                                  ),
                          ],
                        ),
                      ),
                      SizedBox(
                        width: 8,
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  myPersonViewData!.data!.firstName!,
                                  style: GoogleFonts.ropaSans(
                                      color: Colors.black,
                                      fontSize: 24,
                                      fontWeight: FontWeight.w700),
                                ),
                                SizedBox(
                                  width: 5,
                                ),
                                if (birthDate != '')
                                  Image.asset(
                                    zodicSigns(),
                                    height: 16,
                                    width: 16,
                                  ),
                              ],
                            ),
                            Row(
                              children: [
                                if (myPersonViewData != null)
                                  if (isEyeOpen)
                                    Text(
                                      'ID：${myPersonViewData!.data!.userId}',
                                      style: GoogleFonts.roboto(
                                          color: AppColors.DARK_GREY,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400),
                                    ),
                                if (myPersonViewData != null)
                                  if (!isEyeOpen)
                                    Row(
                                      children: [
                                        Text(
                                          'ID: ',
                                          style: GoogleFonts.roboto(
                                              color: AppColors.DARK_GREY,
                                              fontSize: 14,
                                              fontWeight: FontWeight.w400),
                                        ),
                                        for (int i = 0;
                                            i <
                                                myPersonViewData!.data!.userId
                                                    .toString()
                                                    .length;
                                            i++)
                                          Text(
                                            '*',
                                            style: GoogleFonts.roboto(
                                                color: AppColors.DARK_GREY,
                                                fontSize: 14,
                                                fontWeight: FontWeight.w400),
                                          ),
                                      ],
                                    ),
                                GestureDetector(
                                  onTap: () {
                                    if (isEyeOpen) {
                                      isEyeOpen = false;
                                    } else {
                                      isEyeOpen = true;
                                    }
                                    setState(() {});
                                  },
                                  child: Padding(
                                    padding: const EdgeInsets.all(10.0),
                                    child: Image(
                                      image: isEyeOpen
                                          ? AssetImage(AppImages.HOME_OPEN_EYE)
                                          : AssetImage(
                                              AppImages.HOME_CLOSE_EYE),
                                      height: 22,
                                      width: 22,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      )
                    ],
                  ),
                SizedBox(
                  height: 10,
                ),
                if (myPersonViewData != null &&
                    myPersonViewData!.data!.completenessOfInfo!.proportion !=
                        '100%')
                  GestureDetector(
                    onTap: () {
                      Get.to(() => VerifiedAccountPage(
                                userDataModel: myPersonViewData,
                              ))!
                          .then((value) {
                        callInit();
                        getToken();

                        getLastMeeting();
                        getRecentContacts();
                        getRecentComments();
                      });
                    },
                    child: Container(
                      padding: EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        color: AppColors.FORM_GREY,
                        borderRadius: BorderRadius.circular(15),
                      ),
                      width: double.infinity,
                      child: Row(
                        children: [
                          Flexible(
                              child: Text.rich(
                            TextSpan(
                              children: [
                                TextSpan(
                                  text:
                                      'Your account is not completed yet. Please fill all the account details to get your ',
                                  style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                                TextSpan(
                                  text: 'Verified Account Badge',
                                  style: GoogleFonts.roboto(
                                    color: AppColors.BUTTON_COLOR,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ],
                            ),
                          )),
                          SizedBox(
                            width: 10,
                          ),
                          Icon(
                            Icons.arrow_forward_ios_rounded,
                            size: 18,
                            color: AppColors.FORWARD_COLOR,
                          )
                        ],
                      ),
                    ),
                  ),
                SizedBox(
                  height: 12,
                ),
                Container(
                  padding: EdgeInsets.only(left: 15, top: 10, bottom: 18),
                  decoration: BoxDecoration(
                    color: AppColors.FORM_GREY,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  width: double.infinity,
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Next invitation：',
                            style: GoogleFonts.roboto(
                                color: AppColors.NOTIFICATION_GREY,
                                fontSize: 14,
                                fontWeight: FontWeight.w400),
                          ),
                          InkWell(
                            onTap: () {
                              Get.to(() => InvitationSchedulePage())!
                                  .then((value) {
                                callInit();
                                getToken();

                                getLastMeeting();
                                getRecentContacts();
                                getRecentComments();
                              });
                            },
                            child: Container(
                              height: 40,
                              width: 80,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'More ',
                                    style: GoogleFonts.roboto(
                                        color: AppColors.LIGHT_GREY,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w400),
                                  ),
                                  Icon(
                                    Icons.arrow_forward_ios_rounded,
                                    size: 18,
                                    color: AppColors.LIGHT_GREY,
                                  ),
                                ],
                              ),
                            ),
                          )
                        ],
                      ),
                      SizedBox(
                        height: 10,
                      ),
                      lastMeetingModel?.data == null
                          ? Container(
                              child: Container(
                                width: MediaQuery.of(context).size.width * 0.8,
                                child: Row(
                                  children: [
                                    Image.asset(
                                      AppImages.NEW_INVITATION_TODAY,
                                      height: 40,
                                      width: 40,
                                      color: Colors.blue,
                                    ),
                                    Flexible(
                                      child: Padding(
                                        padding:
                                            EdgeInsets.symmetric(horizontal: 5),
                                        child: Text(
                                          "Hello, you haven't invited, go search for interested people ~",
                                          style: GoogleFonts.roboto(
                                              color: Colors.blue),
                                        ),
                                      ),
                                    )
                                  ],
                                ),
                              ),
                            )
                          : Row(
                              children: [
                                ClipOval(
                                  child: Image.network(
                                    lastMeetingModel?.logo,
                                    height: 35,
                                    width: 35,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                SizedBox(
                                  width: 11,
                                ),
                                Expanded(
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Text(
                                        '${lastMeetingModel?.firstName} ${lastMeetingModel?.lastName}',
                                        style: GoogleFonts.roboto(
                                            fontWeight: FontWeight.w400,
                                            fontSize: 18,
                                            color: Colors.black),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Image(
                                        image: AssetImage(AppImages.female),
                                        width: 11,
                                        height: 15,
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${DateFormat('hh:mm').format(DateTime.parse(lastMeetingModel?.meetingTime))}',
                                      style: GoogleFonts.roboto(
                                          fontWeight: FontWeight.w900,
                                          fontSize: 22,
                                          color: Colors.black),
                                    ),
                                    Text(
                                      '${DateFormat('MMMM dd, yyyy').format(DateTime.parse(lastMeetingModel?.meetingTime))}',
                                      style: GoogleFonts.roboto(
                                          fontWeight: FontWeight.w400,
                                          fontSize: 10,
                                          color: Colors.grey),
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  width: 15,
                                ),
                              ],
                            ),
                    ],
                  ),
                ),
                SizedBox(
                  height: 12,
                ),
                Row(
                  children: [
                    if (myPersonViewData != null)
                      Container(
                        alignment: Alignment.center,
                        height: 115,
                        width: 120,
                        padding: EdgeInsets.only(top: 15),
                        decoration: BoxDecoration(
                          color: AppColors.FORM_GREY,
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Center(
                          child: SfRadialGauge(
                            animationDuration: 100,
                            axes: <RadialAxis>[
                              RadialAxis(
                                minimum: progressMinimumValue(
                                    myPersonViewData!.data!.exp!),
                                maximum: progressMaximumValue(
                                    myPersonViewData!.data!.exp!),
                                showLabels: false,
                                showTicks: false,
                                startAngle: 180,
                                endAngle: 0,
                                radiusFactor: 1,
                                ranges: [
                                  GaugeRange(
                                    startValue: 0,
                                    endValue: double.parse(myPersonViewData!
                                        .data!.exp!
                                        .toString()),
                                    startWidth: 8,
                                    endWidth: 8,
                                    color: progressBarColor(
                                      myPersonViewData!.data!.exp!,
                                    ),
                                  ),
                                ],
                                axisLineStyle: AxisLineStyle(
                                  thickness: 8,
                                  color: Color(0xffDFEBF4),
                                  cornerStyle: CornerStyle.bothCurve,
                                ),
                                annotations: <GaugeAnnotation>[
                                  GaugeAnnotation(
                                    positionFactor: 0.10,
                                    horizontalAlignment: GaugeAlignment.center,
                                    verticalAlignment: GaugeAlignment.center,
                                    widget: Center(
                                      child: Container(
                                        child: Image(
                                          image: AssetImage(
                                            progressBarEmoji(
                                              myPersonViewData!.data!.exp!,
                                            ),
                                          ),
                                          height: 60,
                                          width: 60,
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    SizedBox(
                      width: 20,
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          Get.to(() => NewTodayPage(
                                myPersonViewModel: myPersonViewData,
                              ));
                        },
                        child: Container(
                          height: 115,
                          width: 120,
                          decoration: BoxDecoration(
                            color: AppColors.FORM_GREY,
                            borderRadius: BorderRadius.circular(15),
                          ),
                          child: Stack(
                            children: [
                              Align(
                                alignment: Alignment.topLeft,
                                child: Container(
                                  margin: EdgeInsets.symmetric(
                                      horizontal: 20, vertical: 8),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'New today',
                                        style: GoogleFonts.roboto(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 14,
                                            color: Colors.grey),
                                      ),
                                      if (myPersonViewData != null)
                                        Text(
                                          '+ ${myPersonViewData!.data!.todayVisit}',
                                          style: GoogleFonts.roboto(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 14,
                                              color: Colors.black),
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                              Align(
                                alignment: Alignment.topRight,
                                child: Container(
                                  child: Container(
                                    height: 40,
                                    width: 80,
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          'More ',
                                          style: GoogleFonts.roboto(
                                              color: AppColors.LIGHT_GREY,
                                              fontSize: 12,
                                              fontWeight: FontWeight.w400),
                                        ),
                                        Icon(
                                          Icons.arrow_forward_ios_rounded,
                                          size: 18,
                                          color: AppColors.LIGHT_GREY,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              Align(
                                alignment: Alignment.bottomLeft,
                                child: Container(
                                  margin: EdgeInsets.symmetric(
                                      horizontal: 15, vertical: 10),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        height: 30,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        height: 35,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        height: 15,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        height: 13,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        height: 45,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        height: 35,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        height: 40,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        height: 30,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        height: 35,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        height: 20,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        height: 35,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        height: 43,
                                        width: 5,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius:
                                                BorderRadius.circular(10)),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            ],
                          ),
                        ),
                      ),
                    )
                  ],
                ),
                SizedBox(
                  height: 12,
                ),
                Container(
                  padding: EdgeInsets.only(left: 15, top: 15, bottom: 15),
                  decoration: BoxDecoration(
                    color: AppColors.FORM_GREY,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  width: double.infinity,
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Recent contacts',
                            style: GoogleFonts.roboto(
                                color: Colors.black,
                                fontSize: 18,
                                fontWeight: FontWeight.w700),
                          ),
                          InkWell(
                            onTap: () {
                              Get.to(() => RecentContactsPage())!.then((value) {
                                callInit();
                                getToken();

                                getLastMeeting();
                                getRecentContacts();
                                getRecentComments();
                              });
                            },
                            child: Container(
                              height: 40,
                              width: 80,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'More ',
                                    style: GoogleFonts.roboto(
                                        color: AppColors.LIGHT_GREY,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w400),
                                  ),
                                  Icon(
                                    Icons.arrow_forward_ios_rounded,
                                    size: 18,
                                    color: AppColors.LIGHT_GREY,
                                  ),
                                ],
                              ),
                            ),
                          )
                        ],
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      Container(
                        height: 100,
                        alignment: Alignment.centerLeft,
                        child: ListView.builder(
                            itemCount: recentContactsData.length,
                            shrinkWrap: true,
                            scrollDirection: Axis.horizontal,
                            itemBuilder: (BuildContext context, int index) {
                              return Container(
                                margin: EdgeInsets.symmetric(horizontal: 15),
                                child: Column(
                                  children: [
                                    Container(
                                      height: 54,
                                      width: 54,
                                      child: ClipOval(
                                        child: Image.network(
                                          recentContactsData[index].logo,
                                          height: 54,
                                          width: 54,
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                    ),
                                    SizedBox(
                                      height: 12,
                                    ),
                                    Text(
                                      recentContactsData[index].firstName,
                                      style: GoogleFonts.roboto(
                                          color: AppColors.NOTIFICATION_GREY,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700),
                                    )
                                  ],
                                ),
                              );
                            }),
                      )
                    ],
                  ),
                ),
                SizedBox(
                  height: 12,
                ),
                Container(
                  padding: EdgeInsets.only(left: 15, top: 15, bottom: 15),
                  decoration: BoxDecoration(
                    color: AppColors.FORM_GREY,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  width: double.infinity,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Recent comments',
                            style: GoogleFonts.roboto(
                                color: Colors.black,
                                fontSize: 18,
                                fontWeight: FontWeight.w700),
                          ),
                          InkWell(
                            onTap: () {
                              Get.to(() => RecentCommentsPage(
                                        userId: '',
                                      ))!
                                  .then((value) {
                                callInit();
                                getToken();

                                getLastMeeting();
                                getRecentContacts();
                                getRecentComments();
                              });
                            },
                            child: Container(
                              height: 40,
                              width: 80,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'More ',
                                    style: GoogleFonts.roboto(
                                        color: AppColors.LIGHT_GREY,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w400),
                                  ),
                                  Icon(
                                    Icons.arrow_forward_ios_rounded,
                                    size: 18,
                                    color: AppColors.LIGHT_GREY,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: 11,
                      ),
                      recentCommentsData == null ||
                              recentCommentsData?.data == null
                          ? Container()
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                ClipOval(
                                  child: Image.network(
                                    recentCommentsData!.logo,
                                    height: 24,
                                    width: 24,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                SizedBox(
                                  width: 11,
                                ),
                                Text(
                                  recentCommentsData?.firstName,
                                  style: GoogleFonts.roboto(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 12,
                                      color: Colors.black),
                                ),
                                Expanded(
                                  child: Align(
                                    alignment: Alignment.centerRight,
                                    child: Text(
                                      recentCommentsData?.sendDate,
                                      style: GoogleFonts.roboto(
                                          fontWeight: FontWeight.w400,
                                          fontSize: 14,
                                          color: AppColors.DARK_GREY),
                                    ),
                                  ),
                                ),
                                SizedBox(
                                  width: 15,
                                ),
                              ],
                            ),
                      SizedBox(
                        height: 10,
                      ),
                      Text(
                        recentCommentsData != null
                            ? ""
                            : recentCommentsData?.text ?? "",
                        style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      SizedBox(
                        width: 15,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<BarChartGroupData> showingGroups() => List.generate(7, (i) {
        switch (i) {
          case 0:
            return makeGroupData(0, 5);
          case 1:
            return makeGroupData(1, 6.5);
          case 2:
            return makeGroupData(2, 5);
          case 3:
            return makeGroupData(3, 7.5);
          case 4:
            return makeGroupData(4, 9);
          case 5:
            return makeGroupData(5, 11.5);
          case 6:
            return makeGroupData(6, 6.5);
          default:
            return throw Error();
        }
      });

  BarChartGroupData makeGroupData(
    int x,
    double y, {
    bool isTouched = false,
    Color barColor = Colors.blue,
    double width = 10,
    List<int> showTooltips = const [],
  }) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          y: isTouched ? y + 1 : y,
          colors: isTouched ? [Colors.yellow] : [barColor],
          width: width,
          backDrawRodData: BackgroundBarChartRodData(
            show: true,
            y: 20,
            colors: [Colors.blue],
          ),
        ),
      ],
      showingTooltipIndicators: showTooltips,
    );
  }

  getToken() async {
    try {
      UserPref.userPref = await SharedPreferences.getInstance();
      userDataModel = await _getSharedPref.getUserData();
      UserPref.setUserProfileUpdateStatus(false);
      print("token: ${userDataModel?.authToken}");
    } catch (error) {
      throw error.toString();
    }
  }

  getHomeScreenData() async {
    userDataModel = await _getSharedPref.getUserData();
    try {
      myPersonViewData = await _userProfileController
          .getMyPersonView(userDataModel!.authToken.toString());
      if (myPersonViewData!.flag!) {
        if (widget.from != "editProfile") {
          WelcomeDialog.welcomeDialog(context, myPersonViewData!);
        }
        if (myPersonViewData?.data != null) {
          setState(() {});
        }
      } else {
        throw myPersonViewData!.message.toString();
      }
    } catch (e) {
      print("Error myView ${e.toString()}");
      // showError(title: 'Error', message: e.toString());
    }
  }

  getLastMeeting() async {
    userDataModel = await _getSharedPref.getUserData();
    try {
      lastMeetingModel = await _userProfileController
          .getLastMeeting(userDataModel!.authToken.toString());

      if (lastMeetingModel?.flag) {
        // showSuccess(title: 'Success', message: lastMeetingModel?.message);
        if (lastMeetingModel?.data != null) {
          setState(() {});
        }
      } else {
        throw lastMeetingModel!.message.toString();
      }
    } catch (e) {
      print("Error Last meet ${e.toString()}");
      // showError(title: 'Error', message: e.toString());
    }
  }

  getRecentContacts() async {
    userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _userProfileController
          .getRecentContacts(userDataModel!.authToken.toString());
      if (model.flag) {
        // showSuccess(title: 'Success', message: lastMeetingModel?.message);
        recentContactsData = model.recentContacts;
        log('recentContactsData $recentContactsData');
        setState(() {});
      } else {
        throw model.message.toString();
      }
    } catch (e) {
      setState(() {});
      // showError(title: 'Error', message: e.toString());
    }
  }

  getRecentComments() async {
    userDataModel = await _getSharedPref.getUserData();
    try {
      recentCommentsData = await _userProfileController
          .getRecentComments(userDataModel!.authToken.toString());

      if (recentCommentsData?.flag) {
        setState(() {});
      } else {
        throw recentCommentsData!.message.toString();
      }
    } catch (e) {
      setState(() {});
      // showError(title: 'Error', message: e.toString());
    }
  }
}
