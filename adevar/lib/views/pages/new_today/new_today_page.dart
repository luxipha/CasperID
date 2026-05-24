import 'dart:developer';
import 'dart:ffi';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/home_page_controller/user_profile_controller.dart';
import 'package:highfedilityadevar/models/home/getVisitByWeek_model.dart';
import 'package:highfedilityadevar/models/home/getVisitsByMonth_model.dart';
import 'package:highfedilityadevar/models/home/myPersonView_model.dart';
import 'package:highfedilityadevar/models/home/userDataStaticsView_model.dart';
import 'package:highfedilityadevar/models/home/weekly_status_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:syncfusion_flutter_charts/charts.dart';

class NewTodayPage extends StatefulWidget {
  MyPersonViewModel? myPersonViewModel;
  NewTodayPage({Key? key, this.myPersonViewModel}) : super(key: key);
  @override
  State<NewTodayPage> createState() => _NewTodayPageState();
}

class _NewTodayPageState extends State<NewTodayPage> with BaseClass {
  UserDataStaticsViewModel? userStaticsData;
  WeeklyStatusModel? weeklyStatusModel;
  GetVisitByWeekModel? getVisitByWeekModel;
  GetVisitByMonthModel? getVisitByMonthModel;
  final HomeScreenController controller = Get.put(HomeScreenController());
  int weekNum = 1;
  @override
  void initState() {
    week();
    getStaticsUserData();
    super.initState();
  }

  getStaticsUserData() async {
    try {
      Future.delayed(Duration(microseconds: 2), () {
        showCircularDialog(context);
      });

      userStaticsData = await controller.getDataStatics();
      weeklyStatusModel = await controller.getWeeklyStats();
      getVisitByWeekModel = await controller.getVisitsByWeek(weekNum);
      getVisitByMonthModel = await controller.getVisitsByMonth();
      popToPreviousScreen(context: context);

      // print('\x1b[97m ${weeklyStatusModel!.data!.commentsCount}');
      // print('\x1b[97m ${weeklyStatusModel!.data!.commentsCount}');
      setState(() {});
      if (userStaticsData!.flag!) {
      } else {}
    } catch (e) {
      popToPreviousScreen(context: context);
    }
  }

  Widget getUserAboutWidget(String title, Widget icon) {
    return Row(
      children: [
        icon,
        SizedBox(
          width: 9,
        ),
        Expanded(
          child: Text(
            title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.roboto(
                color: AppColors.NOTIFICATION_GREY,
                fontSize: 12,
                fontWeight: FontWeight.w400),
          ),
        ),
      ],
    );
  }

  bool isWeek = true;
  bool isMonth = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Container(
          margin: EdgeInsets.only(left: 20, right: 20, bottom: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                child: Column(
                  children: [
                    Container(
                      child: Row(
                        children: [
                          widget.myPersonViewModel!.data!.logo != null
                              ? Container(
                                  decoration:
                                      BoxDecoration(shape: BoxShape.circle),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(50),
                                    child: Image.network(
                                      widget.myPersonViewModel!.data!.logo!,
                                      height: 80,
                                      width: 80,
                                    ),
                                  ),
                                )
                              : Image(
                                  image: AssetImage(
                                    AppImages.face_confirm,
                                  ),
                                  height: 80,
                                  width: 80,
                                ),
                          SizedBox(
                            width: 20,
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  widget.myPersonViewModel != null
                                      ? widget
                                          .myPersonViewModel!.data!.firstName!
                                      : "N/A",
                                  style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                SizedBox(
                                  height: 15,
                                ),
                                if (userStaticsData != null)
                                  Container(
                                    child: Row(
                                      children: [
                                        Expanded(
                                          child: getUserAboutWidget(
                                            userStaticsData != null
                                                ? userStaticsData!
                                                    .data!.position!
                                                : '',
                                            Image(
                                              image: AssetImage(
                                                  AppImages.USER_BLACK),
                                              height: 18,
                                              width: 18,
                                            ),
                                          ),
                                        ),
                                        Expanded(
                                          child: getUserAboutWidget(
                                            userStaticsData != null
                                                ? '${userStaticsData!.data!.city != null ? userStaticsData!.data!.city : ""}.${userStaticsData!.data!.country != null ? userStaticsData!.data!.country : ""}'
                                                : '',
                                            Icon(
                                              Icons.language,
                                              color:
                                                  AppColors.NOTIFICATION_GREY,
                                              size: 18,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(
                height: 22,
              ),
              Text(
                'Weekly Stats',
                style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(
                height: 19,
              ),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 150,
                      decoration: BoxDecoration(
                        color: AppColors.BUTTON_COLOR.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          SizedBox(
                            height: 15,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Image(
                                image: AssetImage(
                                  AppImages.NEW_INVITATION_TODAY,
                                ),
                                height: 40,
                                width: 40,
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              Text(
                                'Invitation',
                                style: GoogleFonts.roboto(
                                  color: AppColors.NOTIFICATION_GREY,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            weeklyStatusModel != null
                                ? weeklyStatusModel!.data!.invitationCount!
                                    .toString()
                                : '',
                            style: GoogleFonts.roboto(
                              color: AppColors.BLACK,
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          if (weeklyStatusModel != null)
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  weeklyStatusModel != null
                                      ? weeklyStatusModel!
                                          .data!.invitationLast7Day
                                          .toString()
                                      : '',
                                  style: GoogleFonts.roboto(
                                    color: weeklyStatusModel!
                                            .data!.invitationCount!
                                            .toString()
                                            .contains("↓")
                                        ? AppColors.red
                                        : AppColors.GREEN_DARK,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Text(
                                  ' vs last 7 days',
                                  style: GoogleFonts.roboto(
                                    color: AppColors.NOTIFICATION_GREY,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ],
                            ),
                          SizedBox(
                            height: 15,
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 15,
                  ),
                  Expanded(
                    child: Container(
                      height: 150,
                      decoration: BoxDecoration(
                        color: AppColors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          SizedBox(
                            height: 15,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Image(
                                image: AssetImage(
                                  AppImages.LIKES,
                                ),
                                height: 40,
                                width: 40,
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              Text(
                                'Likes',
                                style: GoogleFonts.roboto(
                                  color: AppColors.NOTIFICATION_GREY,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            weeklyStatusModel != null
                                ? weeklyStatusModel!.data!.likesCount.toString()
                                : '',
                            style: GoogleFonts.roboto(
                              color: AppColors.BLACK,
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          if (weeklyStatusModel != null)
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  weeklyStatusModel != null
                                      ? weeklyStatusModel!.data!.likesLast7Day
                                          .toString()
                                      : '',
                                  style: GoogleFonts.roboto(
                                    color: weeklyStatusModel!
                                            .data!.likesLast7Day!
                                            .toString()
                                            .contains("↓")
                                        ? AppColors.red
                                        : AppColors.GREEN_DARK,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Text(
                                  ' vs last 7 days',
                                  style: GoogleFonts.roboto(
                                    color: AppColors.NOTIFICATION_GREY,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ],
                            ),
                          SizedBox(
                            height: 15,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(
                height: 10,
              ),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 150,
                      decoration: BoxDecoration(
                        color: AppColors.GREEN_TRANSPARENT.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          SizedBox(
                            height: 15,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Image(
                                image: AssetImage(
                                  AppImages.REACH,
                                ),
                                height: 40,
                                width: 40,
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              Text(
                                'Reach',
                                style: GoogleFonts.roboto(
                                  color: AppColors.NOTIFICATION_GREY,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            weeklyStatusModel != null
                                ? weeklyStatusModel!.data!.reachCount!
                                    .toString()
                                : '',
                            style: GoogleFonts.roboto(
                              color: AppColors.BLACK,
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          if (weeklyStatusModel != null)
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  weeklyStatusModel != null
                                      ? weeklyStatusModel!.data!.reachLast7Day!
                                          .toString()
                                      : '',
                                  style: GoogleFonts.roboto(
                                    color: weeklyStatusModel!
                                            .data!.reachLast7Day!
                                            .toString()
                                            .contains("↓")
                                        ? AppColors.red
                                        : AppColors.greenColor,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Text(
                                  ' vs last 7 days',
                                  style: GoogleFonts.roboto(
                                    color: AppColors.NOTIFICATION_GREY,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ],
                            ),
                          SizedBox(
                            height: 15,
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 15,
                  ),
                  Expanded(
                    child: Container(
                      height: 150,
                      decoration: BoxDecoration(
                        color: AppColors.ON_BOARD_BUTTON_ONE.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          SizedBox(
                            height: 15,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Image(
                                image: AssetImage(
                                  AppImages.NEW_TODAY_COMMENT,
                                ),
                                height: 40,
                                width: 40,
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              Text(
                                'Comments',
                                style: GoogleFonts.roboto(
                                  color: AppColors.NOTIFICATION_GREY,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            weeklyStatusModel != null
                                ? weeklyStatusModel!.data!.commentsCount!
                                    .toString()
                                : '',
                            style: GoogleFonts.roboto(
                              color: AppColors.BLACK,
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          if (weeklyStatusModel != null)
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  weeklyStatusModel != null
                                      ? weeklyStatusModel!
                                          .data!.commentsLast7Day!
                                          .toString()
                                      : '',
                                  style: GoogleFonts.roboto(
                                    color: weeklyStatusModel!
                                            .data!.commentsLast7Day!
                                            .toString()
                                            .contains("↓")
                                        ? AppColors.red
                                        : AppColors.greenColor,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Text(
                                  'vs last 7 days',
                                  style: GoogleFonts.roboto(
                                    color: AppColors.NOTIFICATION_GREY,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ],
                            ),
                          SizedBox(
                            height: 15,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(
                height: 22,
              ),
              Text(
                'Visits',
                style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(
                height: 18,
              ),
              Container(
                margin: EdgeInsets.only(left: 10, right: 10),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          isWeek = true;
                          isMonth = false;
                          setState(() {});
                        },
                        child: Column(
                          children: [
                            Container(
                              height: 40,
                              decoration: BoxDecoration(
                                color: isWeek
                                    ? AppColors.BUTTON_COLOR
                                    : Colors.white,
                                borderRadius: BorderRadius.only(
                                  topLeft: isWeek
                                      ? Radius.circular(15)
                                      : Radius.circular(0),
                                  topRight: isWeek
                                      ? Radius.circular(15)
                                      : Radius.circular(0),
                                ),
                              ),
                              child: Center(
                                child: Container(
                                  margin: EdgeInsets.only(top: 5),
                                  child: Text(
                                    'Week',
                                    style: GoogleFonts.roboto(
                                        color: isWeek
                                            ? Colors.white
                                            : Colors.black,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ),
                            ),
                            Container(
                              height: 5,
                              color: AppColors.BUTTON_COLOR,
                            )
                          ],
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          isWeek = false;
                          isMonth = true;
                          setState(() {});
                        },
                        child: Column(
                          children: [
                            Container(
                              height: 40,
                              decoration: BoxDecoration(
                                color: isMonth
                                    ? AppColors.BUTTON_COLOR
                                    : Colors.white,
                                borderRadius: BorderRadius.only(
                                  topLeft: isMonth
                                      ? Radius.circular(15)
                                      : Radius.circular(0),
                                  topRight: isMonth
                                      ? Radius.circular(15)
                                      : Radius.circular(0),
                                ),
                              ),
                              child: Center(
                                child: Container(
                                  margin: EdgeInsets.only(top: 5),
                                  child: Text(
                                    'Month',
                                    style: GoogleFonts.roboto(
                                        color: isMonth
                                            ? Colors.white
                                            : Colors.black,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ),
                            ),
                            Container(
                              height: 5,
                              color: AppColors.BUTTON_COLOR,
                            )
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
              if (isMonth && getVisitByMonthModel != null)
                Container(
                  height: 200,
                  child: SfCartesianChart(
                      plotAreaBorderWidth: 0,
                      primaryXAxis: CategoryAxis(
                        desiredIntervals: getVisitByMonthModel!.data!.length,
                        interval: 1,
                        autoScrollingMode: AutoScrollingMode.start,
                      ),
                      legend: Legend(isVisible: false),
                      series: <LineSeries<SalesData, String>>[
                        LineSeries<SalesData, String>(
                          dataSource: <SalesData>[
                            for (var i = 0;
                                i < getVisitByMonthModel!.data!.length;
                                i++)
                              SalesData(
                                '${DateTime.now().day - (getVisitByMonthModel!.data!.length - (i + 1))}',
                                double.parse(
                                  getVisitByMonthModel!.data![i].toString(),
                                ),
                              ),
                          ],
                          xValueMapper: (SalesData sales, _) => sales.week,
                          yValueMapper: (SalesData sales, _) => sales.sales,
                          dataLabelSettings: DataLabelSettings(
                            isVisible: true,
                            labelAlignment: ChartDataLabelAlignment.top,
                          ),
                          width: 2,
                          markerSettings: MarkerSettings(
                            isVisible: true,
                            borderColor: Colors.white,
                            color: Colors.blue,
                          ),
                          color: Colors.blue,
                          legendIconType: LegendIconType.circle,
                        )
                      ]),
                ),
              if (!isMonth && getVisitByWeekModel != null)
                Row(
                  children: [
                    if (weekNum > 1)
                      InkWell(
                        onTap: () async {
                          weekNum--;

                          showCircularDialog(context);
                          getVisitByWeekModel =
                              await controller.getVisitsByWeek(weekNum);
                          Get.back();
                          setState(() {});
                        },
                        child: Container(
                          padding: EdgeInsets.fromLTRB(10, 5, 5, 5),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Color(0xff0078D4).withOpacity(0.05),
                          ),
                          child: Center(
                            child: Icon(
                              Icons.arrow_back_ios,
                              color: Colors.blue,
                              size: 15,
                            ),
                          ),
                        ),
                      ),
                    Expanded(
                      child: Container(
                        height: 200,
                        child: SfCartesianChart(
                            plotAreaBorderWidth: 0,
                            primaryXAxis: CategoryAxis(
                              desiredIntervals:
                                  getVisitByWeekModel!.data!.length,
                              interval: 1,
                              autoScrollingMode: AutoScrollingMode.start,
                            ),
                            legend: Legend(isVisible: false),
                            series: <LineSeries<SalesData, String>>[
                              LineSeries<SalesData, String>(
                                dataSource: <SalesData>[
                                  for (var i = 0;
                                      i < getVisitByWeekModel!.data!.length;
                                      i++)
                                    SalesData(
                                      getVisitByWeekModel!.data!.length < 7 &&
                                              weekNum != controller.weekOfMonth
                                          ? weekDayList[i + weekDay]
                                          : weekDayList[i],
                                      double.parse(
                                        getVisitByWeekModel!.data![i]
                                            .toString(),
                                      ),
                                    ),
                                ],
                                xValueMapper: (SalesData sales, _) =>
                                    sales.week,
                                yValueMapper: (SalesData sales, _) =>
                                    sales.sales,
                                dataLabelSettings: DataLabelSettings(
                                  isVisible: true,
                                  labelAlignment: ChartDataLabelAlignment.top,
                                ),
                                width: 2,
                                markerSettings: MarkerSettings(
                                  isVisible: true,
                                  borderColor: Colors.white,
                                  color: Colors.blue,
                                ),
                                color: Colors.blue,
                                legendIconType: LegendIconType.circle,
                              )
                            ]),
                      ),
                    ),
                    if (weekNum != (controller.weekOfMonth!))
                      InkWell(
                        onTap: () async {
                          weekNum++;

                          showCircularDialog(context);
                          getVisitByWeekModel =
                              await controller.getVisitsByWeek(weekNum);
                          Get.back();
                          setState(() {});
                        },
                        child: Container(
                          padding: EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Color(0xff0078D4).withOpacity(0.05),
                          ),
                          child: Center(
                            child: Icon(
                              Icons.arrow_forward_ios,
                              color: Colors.blue,
                              size: 15,
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
    );
  }

  int weekDay = 0;
  week() {
    String date = DateTime.now().toString();

    String firstDay = date.substring(0, 8) + '01' + date.substring(10);

    weekDay = DateTime.parse(firstDay).weekday;

    DateTime testDate = DateTime.now();

    weekDay--;
    controller.weekOfMonth = ((testDate.day + weekDay) / 7).ceil();
    print('\x1b[97m Week of the month: ${controller.weekOfMonth}');
  }

  List weekDayList = [
    "Mon",
    "Tue",
    "Wed",
    "Thur",
    "Fri",
    "Sat",
    "Sun",
  ];
}

class SalesData {
  SalesData(this.week, this.sales);
  final String week;
  final double sales;
}
