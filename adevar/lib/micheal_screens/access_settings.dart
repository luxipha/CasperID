import 'dart:math' as math;
import 'package:another_xlider/another_xlider.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:highfedilityadevar/controllers/accessTimeController/AccessTimeController.dart';
import 'package:highfedilityadevar/models/accessTimeModel/GetAccessTimeModel.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:numberpicker/numberpicker.dart';
import 'package:provider/provider.dart';

import '../controllers/user_data/get_shared_pref.dart';
import '../micheal_widgets/custom_water.dart';
import '../micheal_widgets/dial_painter.dart';
import '../provider/time_provider.dart';

class AccessSettings extends StatefulWidget {
  const AccessSettings({Key? key}) : super(key: key);

  @override
  _AccessSettingsState createState() => _AccessSettingsState();
}

class _AccessSettingsState extends State<AccessSettings> with BaseClass {
  bool measureVisible = false;
  double lab = 2;
  int _currentDaysValue = 1;
  double _currentMonthsValue = 1;

  final GetSharedPref _getSharedPref = Get.put(GetSharedPref());

  final AccessTimeController _accessTimeController =
      Get.isRegistered<AccessTimeController>()
          ? Get.find<AccessTimeController>()
          : Get.put(AccessTimeController());

  bool showMonthWater = true;

  double _lowerValue = 1;

  String timeMeasure = 'Hours';

  double waterHeight = 80;

  bool showView = false;
  Color monthMeasureColor = Color(0xFF007AFF);

  // TimeOfDay selectedTime = TimeOfDay.now();
  TimeOfDay selectedTimeOfDay = TimeOfDay(hour: 00, minute: 00);
  int selectedHours = 1;
  int selectedMinutes = 1;

  @override
  void initState() {
    super.initState();
    getAccessTimeSettings();
  }

  void showTimeMeasurementDialog(BuildContext context) {
    if (_lowerValue == 1 && measureVisible == false) {
      measureVisible = true;
    } else if (_lowerValue == 1 && measureVisible == true) {
      measureVisible = false;
      // changeLab();
    } else if (_lowerValue == 2 && measureVisible == false) {
      measureVisible = true;
    } else if (_lowerValue == 2 && measureVisible == true) {
      measureVisible = false;
      // changeLab();
    } else if (_lowerValue == 3 && measureVisible == false) {
      measureVisible = true;
    } else if (_lowerValue == 3 && measureVisible == true) {
      measureVisible = false;
    }
  }

  void changeLab() {
    if (_lowerValue == 1) {
      _lowerValue = 2;
      changeTimeMeasure(_lowerValue);
    } else if (_lowerValue == 2) {
      _lowerValue = 3;
    } else if (_lowerValue == 3) {
      _lowerValue = 4;
      waterHeight = 170;
    }
    changeTimeMeasure(_lowerValue);
  }

  void changeTimeMeasure(double newValue) {
    if (newValue == 1) {
      timeMeasure = 'Hours';
    } else if (newValue == 2) {
      timeMeasure = 'Day';
    } else if (newValue == 3) {
      timeMeasure = 'Month';
    } else {
      timeMeasure = 'Never';
    }
  }

  String getTimeValue() {
    if (timeMeasure == 'Hours') {
      return '${selectedTimeOfDay.hour == 0 ? 12 : selectedTimeOfDay.hour}Hours';
    } else if (timeMeasure == 'Day') {
      return '${_currentDaysValue}Days';
    } else if (timeMeasure == 'Month') {
      return '${_currentMonthsValue.toInt()}Month';
    } else {
      return 'Never';
    }
  }

  Widget showTimeMeasure(
      {required BuildContext context, required String timeMeasure}) {
    if (timeMeasure == 'Day') {
      return buildDayPicker();
    } else if (timeMeasure == 'Hours') {
      // Future.delayed(const Duration(milliseconds: 1), () {
      //   _selectTime(context);
      // });
      return Container(
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: const [
            BoxShadow(blurRadius: 10, color: Colors.grey, spreadRadius: 0)
          ],
        ),
        child: CircleAvatar(
          backgroundColor: Colors.white,
          radius: 125,
          child: Container(
            width: 250,
            height: 250,
            // decoration: BoxDecoration(
            //   color: Colors.green,
            // ),
            child: Dial(
              selectedTime: selectedTimeOfDay,
              onChanged: (newTime) {
                setState(() {
                  print(newTime);
                  selectedTimeOfDay = newTime;
                  print(selectedTimeOfDay);
                  if (_lowerValue == 1) {
                    waterHeight = ((selectedTimeOfDay.hour == 0
                                ? 12
                                : selectedTimeOfDay.hour) /
                            12) *
                        170;
                  }
                });
                // print('===NewTime===> $newTime');
              },
              use24HourDials: false,
              mode: TimePickerMode.hour,
              onHourSelected: () {
                setState(() {});
                print('===HourSelected===>');
              },
            ),
          ),
        ),
      );
    } else if (timeMeasure == 'Month') {
      // Month Slider
      return Container(
        width: 500,
        height: 300,
        // color: Colors.blueGrey,
        // child: HumiditySlider(),
        // child: SliderHandle(9),
        child: Stack(
          children: [
            // Text('Helloworld'),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  height: 50,
                  width: 200,
                  // color: Colors.blue,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Color(0xFF0078D4).withOpacity(0.05),
                        Color(0xFF0078D4).withOpacity(0.2),
                        Color(0xFF0078D4).withOpacity(0.2),
                        Color(0xFF0078D4).withOpacity(0.05),
                      ],
                    ),
                  ),
                  child: Center(
                    child: Text(
                      '${_currentMonthsValue.round()}',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                Container(
                  width: 80,
                  // color: Colors.green,
                  child: Stack(
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 21, left: 13.0),
                        child: Container(
                          width: 10,
                          height: 260,
                          // color: Colors.green,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                              Container(
                                  height: 1,
                                  width: 10,
                                  color: monthMeasureColor),
                            ],
                          ),

                          // ListView.builder(
                          //   itemCount: 12,
                          //   itemBuilder: (context, index) {
                          //     return Column(
                          //       children: [
                          //         Container(
                          //           height: 1,
                          //           width: 10,
                          //           color: Colors.red,
                          //         ),
                          //         SizedBox(
                          //           height: 22.59,
                          //         ),
                          //       ],
                          //     );
                          //   },
                          // ),
                        ),
                      ),
                      FlutterSlider(
                        values: [_currentMonthsValue],
                        axis: Axis.vertical,
                        min: 1,
                        max: 12,
                        trackBar: FlutterSliderTrackBar(
                          activeTrackBarHeight: 35,
                          activeTrackBar: BoxDecoration(
                            color: Color(0xFF0078D4),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          activeDisabledTrackBarColor: Colors.grey,
                          inactiveTrackBarHeight: 35,
                          inactiveDisabledTrackBarColor: Colors.grey,
                          inactiveTrackBar: BoxDecoration(
                            color: Color(0xFF0078D4),
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        jump: true,
                        handlerWidth: 80,
                        handlerHeight: 40,
                        onDragging: (handlerIndex, monthsValue, upperValue) {
                          _currentMonthsValue = monthsValue;
                          if (_lowerValue == 3) {
                            waterHeight = (_currentMonthsValue / 12) * 170;
                          }
                          // changeTimeMeasure(monthsValue);
                          setState(() {});
                        },
                        handlerAnimation: FlutterSliderHandlerAnimation(
                          duration: Duration(milliseconds: 1),
                          curve: Curves.easeOut,
                          scale: 1,
                        ),
                        decoration: BoxDecoration(
                            // color: Colors.grey,
                            ),
                        tooltip: FlutterSliderTooltip(
                          disabled: true,
                        ),
                        handler: FlutterSliderHandler(
                          decoration: BoxDecoration(),
                          child: Padding(
                            padding: const EdgeInsets.only(right: 20.0),
                            child: Material(
                              type: MaterialType.canvas,
                              color: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                              ),
                              elevation: 1,
                              child: CircleAvatar(
                                backgroundColor: Colors.white,
                                child: CircleAvatar(
                                  radius: 19,
                                  child: Center(
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 4.0),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceEvenly,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.center,
                                        children: [
                                          Padding(
                                            padding: const EdgeInsets.only(
                                                bottom: 10.0),
                                            child: Text(
                                              '-',
                                              style: TextStyle(
                                                fontSize: 30,
                                              ),
                                            ),
                                          ),
                                          // Icon(
                                          //   Icons.add,
                                          //   size: 20,
                                          // ),
                                          SvgPicture.asset(
                                            'assets/svg/up_down.svg',
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        right: 30,
                        child: Padding(
                          padding: const EdgeInsets.only(top: 21, left: 15.0),
                          child: Container(
                            width: 20,
                            height: 260,
                            // color: Colors.green,
                            padding: const EdgeInsets.symmetric(vertical: 5),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '1',
                                  style: TextStyle(
                                    color: _currentMonthsValue > 2
                                        ? Colors.white
                                        : Colors.transparent,
                                  ),
                                ),
                                Text(
                                  '12',
                                  style: TextStyle(
                                    color: _currentMonthsValue < 11
                                        ? Colors.white
                                        : Colors.transparent,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    } else {
      return Container();
    }
  }

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked_s = await showTimePicker(
      context: context,
      initialTime:
          Provider.of<TimeProvider>(context, listen: false).selectedTime,
      // hourLabelText: 'Hello',
      builder: (BuildContext context, Widget? child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
          child: child!,
        );
      },
    );

    if (picked_s == TimeOfDay.now()) {
      // selectedTime = picked_s!;
      // selectedHours = picked_s!.hour;
      Provider.of<TimeProvider>(context, listen: false)
          .changeTime(picked_s!.hour, picked_s.minute);
      // Provider.of<TimeProvider>(context).changeHour(selectedTime.hour);
      // Provider.of<TimeProvider>(context).changeMinute(selectedTime.minute);
      // selectedMinutes = picked_s.minute;
      // print('====Pick====> $picked_s');
      // print('====Sel====> ${picked_s.hour}:${picked_s.minute}');
    } else {}

    // Provider.of<TimeProvider>(context, listen: false)
    //     .changeTime(picked_s!.hour, picked_s.minute);
  }

  @override
  Widget build(BuildContext context) {
    if (measureVisible == true && _lowerValue == 3) {
      showMonthWater = false;
    } else if (measureVisible == true && _lowerValue == 1) {
      showMonthWater = false;
    } else {
      showMonthWater = true;
    }
    // localizations = MaterialLocalizations.of(context);
    // media = MediaQuery.of(context);

    return WillPopScope(
      onWillPop: () async {
        onBackPress();
        return false;
      },
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          title: Text(
            'Access Settings',
            style: TextStyle(color: Colors.black),
          ),
          iconTheme: IconThemeData(
            color: Colors.black,
          ),
          backgroundColor: Colors.white,
        ),
        backgroundColor: Colors.white,
        body: showView
            ? Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // WaveProgress(
                      //   borderSize: 3.0,
                      //   size: 180,
                      //   borderColor: Colors.redAccent,
                      //   foregroundWaveColor: Colors.greenAccent,
                      //   backgroundWaveColor: Colors.blueAccent,
                      //   progress: 10, // [0-100]
                      //   innerPadding: 10, // padding between border and waves
                      // ),
                      SizedBox(
                        height: 50,
                      ),
                      Visibility(
                        visible: showMonthWater,
                        child: Container(
                          height: 170,
                          width: 100,
                          decoration: BoxDecoration(
                            // color: Colors.green,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: (timeMeasure == 'Never' || waterHeight == 170)
                              ? Container(
                                  height: 170,
                                  width: 100,
                                  decoration: BoxDecoration(
                                    color: Color(0xFF0078D4),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                )
                              : MyCustomWaveWidget(
                                  height: 170,
                                  width: 100,
                                  borderSize: 3.0,
                                  borderColor: Colors.redAccent,
                                  foregroundWaveColor: Color(0xFF0078D4),
                                  backgroundWaveColor: Colors.blueAccent,
                                  progress: waterHeight, // [0-100]
                                  innerPadding: 10, //
                                ),
                        ),
                      ),
                      SizedBox(
                        height: 10,
                      ),
                      Visibility(
                        visible:
                            timeMeasure == 'Never' || measureVisible == false,
                        child: SizedBox(
                          child: Column(
                            children: [
                              Text(
                                getTimeValue(),
                                style: TextStyle(
                                  fontSize: 60,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                'There is still room for card failure',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF666666),
                                ),
                              ),
                              SizedBox(
                                height: 20,
                              ),
                            ],
                          ),
                        ),
                      ),
                      Visibility(
                        visible: measureVisible,
                        child: showTimeMeasure(
                          context: context,
                          timeMeasure: timeMeasure,
                        ),
                      ),
                      SizedBox(
                        height: 40,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Lock time',
                            style: TextStyle(
                              fontSize: 18,
                            ),
                          ),
                          InkWell(
                            onTap: () {
                              print('==> Change Lab');
                              setState(() {
                                // changeLab();
                                showTimeMeasurementDialog(context);
                              });
                            },
                            child: Row(
                              children: [
                                Text(
                                  getTimeValue(),
                                  style: TextStyle(
                                    fontSize: 18,
                                    color: Color(0xFF0078D4),
                                  ),
                                ),
                                SizedBox(
                                  width: 10,
                                ),
                                measureVisible
                                    ? SvgPicture.asset('assets/svg/correct.svg')
                                    : Icon(
                                        CupertinoIcons.forward,
                                        color: Colors.grey[400],
                                      ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: 10,
                      ),
                      Divider(
                        color: Colors.grey,
                      ),
                      SizedBox(
                        height: 30,
                      ),
                      Container(
                        height: 25,
                        width: MediaQuery.of(context).size.width,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(7),
                        ),
                        child: Stack(
                          children: [
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 15.0),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: const [
                                  VerticalDivider(
                                    indent: 10,
                                    endIndent: 10,
                                    color: Colors.grey,
                                  ),
                                  VerticalDivider(
                                    indent: 10,
                                    endIndent: 10,
                                    color: Colors.grey,
                                  ),
                                  VerticalDivider(
                                    indent: 10,
                                    endIndent: 10,
                                    color: Colors.grey,
                                  ),
                                  VerticalDivider(
                                    indent: 10,
                                    endIndent: 10,
                                    color: Colors.grey,
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              height: 25,
                              width: 60,
                              decoration: BoxDecoration(
                                color: Color(0xFF0078D4),
                                borderRadius: BorderRadius.circular(7),
                              ),
                            ),
                            FlutterSlider(
                              values: [_lowerValue],
                              min: 1,
                              max: 4,
                              trackBar: FlutterSliderTrackBar(
                                activeTrackBarHeight: 25,
                                activeTrackBar: BoxDecoration(
                                  color: Color(0xFF0078D4),
                                  borderRadius: BorderRadius.circular(7),
                                ),
                                activeDisabledTrackBarColor: Colors.grey,
                                inactiveTrackBarHeight: 25,
                                inactiveDisabledTrackBarColor: Colors.grey,
                                inactiveTrackBar: BoxDecoration(
                                  color: Colors.transparent,
                                  borderRadius: BorderRadius.circular(7),
                                ),
                              ),
                              jump: true,
                              handlerWidth: 60,
                              handlerHeight: 25,
                              onDragging:
                                  (handlerIndex, lowerValue, upperValue) {
                                _lowerValue = lowerValue;
                                changeTimeMeasure(lowerValue);
                                if (_lowerValue == 1) {
                                  waterHeight = ((selectedTimeOfDay.hour == 0
                                              ? 12
                                              : selectedTimeOfDay.hour) /
                                          12) *
                                      170;
                                } else if (_lowerValue == 2) {
                                  waterHeight = (_currentDaysValue / 30) * 170;
                                } else if (_lowerValue == 3) {
                                  waterHeight =
                                      (_currentMonthsValue / 12) * 170;
                                } else if (_lowerValue == 4) {
                                  waterHeight = 170;
                                }

                                setState(() {});
                              },
                              handlerAnimation: FlutterSliderHandlerAnimation(
                                duration: Duration(milliseconds: 1),
                                curve: Curves.easeOut,
                                scale: 1,
                              ),
                              decoration: BoxDecoration(
                                  // color: Colors.grey,
                                  ),
                              tooltip: FlutterSliderTooltip(
                                disabled: true,
                              ),
                              handler: FlutterSliderHandler(
                                decoration: BoxDecoration(),
                                child: Material(
                                  type: MaterialType.canvas,
                                  color: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(7),
                                  ),
                                  elevation: 1,
                                  child: Container(
                                    height: 25,
                                    width: 60,
                                    child: Center(
                                      child: Text('Lab'),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: const [
                            Text('Hours'),
                            Text('Day'),
                            Text('Month'),
                            Text('Never'),
                          ],
                        ),
                      ),
                      // buildDayPicker(),
                    ],
                  ),
                ),
              )
            : Container(),
      ),
    );
  }

  Container buildDayPicker() {
    return Container(
      height: 55,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
      ),
      child: Stack(
        children: [
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Center(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(
                      color: Color(0xFFE3F3FF),
                    ),
                    color: Color(0xFFE3F3FF),
                  ),
                  child: NumberPicker(
                    value: _currentDaysValue,
                    minValue: 1,
                    maxValue: 30,
                    textStyle: TextStyle(
                      color: Colors.grey,
                    ),
                    // step: 2,
                    // itemHeight: 50,
                    // itemCount: 5,
                    itemWidth: 45,
                    itemHeight: 40,
                    itemCount: 7,
                    axis: Axis.horizontal,
                    onChanged: (value) {
                      setState(() => _currentDaysValue = value);
                      if (_lowerValue == 2) {
                        waterHeight = (_currentDaysValue / 30) * 170;
                      }
                      print("==== $_currentDaysValue");
                    },
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(
                        color: Color(0xFF0078D4),
                      ),
                      // color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
          Center(
            child: CircleAvatar(
              radius: 30,
              backgroundColor: Color(0xFF0078D4),
              child: CircleAvatar(
                radius: 25,
                backgroundColor: Colors.white,
                // foregroundColor: Colors.white,
                child: Text(
                  '$_currentDaysValue',
                  style: TextStyle(
                    color: Color(0xFF0078D4),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void onBackPress() async {
    Map<String, String> accessTimeData = Map<String, String>();
    if (timeMeasure == "Hours") {
      accessTimeData = {
        'isNever': "0",
        'years': "0",
        'months': "0",
        'days': "0",
        'hours': '${selectedTimeOfDay.hour == 0 ? 12 : selectedTimeOfDay.hour}'
      };
    } else if (timeMeasure == "Day") {
      accessTimeData = {
        'isNever': "0",
        'years': "0",
        'months': "0",
        'days': '$_currentDaysValue',
        'hours': "0"
      };
    } else if (timeMeasure == "Month") {
      accessTimeData = {
        'isNever': "0",
        'years': "0",
        'months': '${_currentMonthsValue.toInt()}',
        'days': "0",
        'hours': "0"
      };
    } else if (timeMeasure == "Never") {
      accessTimeData = {
        'isNever': "1",
        'years': "0",
        'months': "0",
        'days': "0",
        'hours': "0"
      };
    }

    print("managePublicSettings $accessTimeData");

    UserDataModel userDataModel = await _getSharedPref.getUserData();
    showCircularDialog(context);
    try {
      var model = await _accessTimeController.setAccessTime(
          userDataModel.authToken!, accessTimeData);

      if (model.flag) {
        Navigator.pop(context);
        Navigator.pop(context);
        showSuccess(title: 'Success', message: model.message);
      } else {
        throw model.message;
      }
    } catch (e) {
      print(e);
      Navigator.pop(context);
    }
  }

  void getAccessTimeSettings() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    showCircularDialog(context);
    try {
      var model =
          await _accessTimeController.getAccessTime(userDataModel.authToken!);

      if (model.flag) {
        Navigator.pop(context);
        showSuccess(title: 'Success', message: model.message);
        setAccessTimeData(model, context);
      } else {
        throw model.message;
      }
    } catch (e) {
      print(e);
      Navigator.pop(context);
    }
  }

  void setAccessTimeData(GetAccessTimeModel model, BuildContext context) {
    setState(() {
      if (model.hours > 0) {
        _lowerValue = 1;

        if (model.hours.toInt() == 12) {
          selectedTimeOfDay = TimeOfDay(hour: 00, minute: 00);
        } else if (model.hours.toInt() > 9) {
          selectedTimeOfDay = TimeOfDay(
              hour: model.hours.toInt() == 0 ? 1 : model.hours.toInt(),
              minute: 0);
        } else {
          var newTime = int.parse("0${model.hours}");
          selectedTimeOfDay = TimeOfDay(
              hour: model.hours.toInt() == 0 ? 1 : newTime, minute: 0);
        }

        waterHeight =
            ((selectedTimeOfDay.hour == 0 ? 12 : selectedTimeOfDay.hour) / 12) *
                170;
      } else if (model.days > 0) {
        _lowerValue = 2;
        _currentDaysValue = model.days == 0 ? 1 : model.days.toInt();
        waterHeight = (_currentDaysValue / 30) * 170;
      } else if (model.months > 0) {
        _lowerValue = 3;
        var newMonth = model.months == 0 ? 1 : model.months;
        _currentMonthsValue = double.parse(newMonth.toString());
        waterHeight = (_currentMonthsValue / 12) * 170;
      } else if (model.isNever == 0) {
        _lowerValue = 1;
        timeMeasure = model.isNever == "1" ? "Never" : "Day";
      } else {
        _lowerValue = 4;
        waterHeight = 170;
      }
      changeTimeMeasure(_lowerValue);
      showView = true;
    });
  }

  // Container buildMonthPicker() {
  //   return Container(
  //     height: 55,
  //     decoration: BoxDecoration(
  //       borderRadius: BorderRadius.circular(30),
  //     ),
  //     child: Stack(
  //       children: [
  //         Column(
  //           mainAxisAlignment: MainAxisAlignment.center,
  //           children: [
  //             Center(
  //               child: Container(
  //                 decoration: BoxDecoration(
  //                   borderRadius: BorderRadius.circular(30),
  //                   border: Border.all(
  //                     color: Color(0xFFE3F3FF),
  //                   ),
  //                   color: Color(0xFFE3F3FF),
  //                 ),
  //                 child: NumberPicker(
  //                   value: _currentMonthsValue,
  //                   minValue: 1,
  //                   maxValue: 12,
  //                   textStyle: TextStyle(
  //                     color: Colors.grey,
  //                   ),
  //                   // step: 2,
  //                   // itemHeight: 50,
  //                   // itemCount: 5,
  //                   itemWidth: 45,
  //                   itemHeight: 40,
  //                   itemCount: 7,
  //                   axis: Axis.horizontal,
  //                   onChanged: (value) {
  //                     setState(() => _currentMonthsValue = value);
  //                     if (_lowerValue == 3) {
  //                       waterHeight = (_currentMonthsValue / 12) * 170;
  //                     }
  //                   },
  //                   decoration: BoxDecoration(
  //                     borderRadius: BorderRadius.circular(30),
  //                     border: Border.all(
  //                       color: Color(0xFF0078D4),
  //                     ),
  //                     // color: Colors.white,
  //                   ),
  //                 ),
  //               ),
  //             ),
  //           ],
  //         ),
  //         Center(
  //           child: CircleAvatar(
  //             radius: 30,
  //             backgroundColor: Color(0xFF0078D4),
  //             child: CircleAvatar(
  //               radius: 25,
  //               backgroundColor: Colors.white,
  //               // foregroundColor: Colors.white,
  //               child: Text(
  //                 '$_currentMonthsValue',
  //                 style: TextStyle(
  //                   color: Color(0xFF0078D4),
  //                 ),
  //               ),
  //             ),
  //           ),
  //         ),
  //       ],
  //     ),
  //   );
  // }
}

class CustomSliderThumbCircle extends SliderComponentShape {
  final double thumbRadius;
  final int min;
  final int max;

  const CustomSliderThumbCircle({
    required this.thumbRadius,
    this.min = 0,
    this.max = 10,
  });

  @override
  Size getPreferredSize(bool isEnabled, bool isDiscrete) {
    return Size.fromRadius(thumbRadius);
  }

  @override
  void paint(
    PaintingContext context,
    Offset center, {
    Animation<double>? activationAnimation,
    Animation<double>? enableAnimation,
    bool? isDiscrete,
    TextPainter? labelPainter,
    RenderBox? parentBox,
    SliderThemeData? sliderTheme,
    TextDirection? textDirection,
    double? value,
    double? textScaleFactor,
    Size? sizeWithOverflow,
  }) {
    final Canvas canvas = context.canvas;

    final paint = Paint()
      ..color = Colors.white //Thumb Background Color
      ..style = PaintingStyle.fill;

    TextSpan span = new TextSpan(
      style: new TextStyle(
        fontSize: thumbRadius * .8,
        fontWeight: FontWeight.w700,
        color: sliderTheme!.thumbColor ??
            Colors.black, //Text Color of Value on Thumb
      ),
      text: getValue(value!),
    );

    TextPainter tp = new TextPainter(
        text: span,
        textAlign: TextAlign.center,
        textDirection: TextDirection.ltr);
    tp.layout();
    Offset textCenter =
        Offset(center.dx - (tp.width / 2), center.dy - (tp.height / 2));

    canvas.drawCircle(center, thumbRadius * .9, paint);
    tp.paint(canvas, textCenter);
  }

  String getValue(double value) {
    return (min + (max - min) * value).round().toString();
  }
}

class CurveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    // print(size.toString());
    // final size = Size(500, 10);

    Path path = Path();
    path.lineTo(0, size.height - 15);

    Offset firstStart = Offset(size.width / 9, size.height - 3);
    // First point of quadratic bezier curve
    Offset firstEnd = Offset(size.width / 2.25, size.height - 10.0);
    // Second point of quadratic bezier curve
    path.quadraticBezierTo(
        firstStart.dx, firstStart.dy, firstEnd.dx, firstEnd.dy);

    Offset secondStart =
        Offset(size.width - (size.width / 5.24), size.height - 25);
    // Third point of quadratic bezier curve
    Offset secondEnd = Offset(size.width, size.height - 10);
    // Forth point of quadratic bezier curve
    path.quadraticBezierTo(
        secondStart.dx, secondStart.dy, secondEnd.dx, secondEnd.dy);
    path.lineTo(size.width, 0);

    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}

class WaveProgressPainter extends CustomPainter {
  Animation<double>? _animation;
  Color backgroundWaveColor, foregroundWaveColor;
  double _progress;

  WaveProgressPainter(
    this._animation,
    this.backgroundWaveColor,
    this.foregroundWaveColor,
    this._progress,
  ) : super(repaint: _animation);

  @override
  void paint(Canvas canvas, Size size) {
    // draw small wave
    Paint wave2Paint = Paint()..color = backgroundWaveColor;
    double p = _progress / 100.0;
    double n = 4.3;
    double amp = 1.0;
    double baseHeight = (1 - p) * size.height;

    Path path = Path();
    path.moveTo(0.0, baseHeight);
    for (double i = 0.0; i < size.width; i++) {
      path.lineTo(
          i,
          baseHeight +
              math.sin((i / size.width * 2 * math.pi * n) +
                      (_animation!.value * 2 * math.pi) +
                      math.pi * 1) *
                  amp);
    }

    path.lineTo(size.width, size.height);
    path.lineTo(0.0, size.height);
    path.close();
    canvas.drawPath(path, wave2Paint);

    // draw big wave
    Paint wave1Paint = Paint()..color = foregroundWaveColor;
    n = 2.2;
    amp = 10.0 * size.height / 180;

    path = Path();
    path.moveTo(0.0, baseHeight);
    for (double i = 0.0; i < size.width; i++) {
      path.lineTo(
          i,
          baseHeight +
              math.sin((i / size.width * 2 * math.pi * n) +
                      (_animation!.value * 2 * math.pi)) *
                  amp);
    }

    path.lineTo(size.width, size.height);
    path.lineTo(0.0, size.height);
    path.close();
    canvas.drawPath(path, wave1Paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}

// Unused Code
//
//
// FlutterSlider(
//   values: [_lowerValue],
//   min: 1,
//   max: 4,
//   trackBar: FlutterSliderTrackBar(
//     activeTrackBarHeight: 25,
//     activeTrackBar: BoxDecoration(
//       color: Color(0xFF0078D4),
//       borderRadius: BorderRadius.circular(7),
//     ),
//     inactiveDisabledTrackBarColor:
//         Colors.grey[300] ?? Colors.grey,
//   ),
//   jump: true,
//   handlerWidth: 60,
//   handlerHeight: 25,
//   onDragging: (handlerIndex, lowerValue, upperValue) {
//     _lowerValue = lowerValue;
//     _upperValue = upperValue;
//     setState(() {});
//   },
//   handlerAnimation: FlutterSliderHandlerAnimation(
//     duration: Duration(milliseconds: 1),
//     curve: Curves.easeOut,
//     scale: 1,
//   ),
//   decoration: BoxDecoration(
//       // color: Colors.grey,
//       ),
//   tooltip: FlutterSliderTooltip(
//     disabled: true,
//   ),
//   handler: FlutterSliderHandler(
//     decoration: BoxDecoration(),
//     child: Material(
//       type: MaterialType.canvas,
//       color: Colors.white,
//       shape: RoundedRectangleBorder(
//         borderRadius: BorderRadius.circular(7),
//       ),
//       elevation: 1,
//       child: Container(
//         height: 25,
//         width: 60,
//         child: Center(
//           child: Text('Lab'),
//         ),
//       ),
//     ),
//   ),
// ),

//
// static const List<TimeOfDay> _amHours = <TimeOfDay>[
//   TimeOfDay(hour: 12, minute: 0),
//   TimeOfDay(hour: 1, minute: 0),
//   TimeOfDay(hour: 2, minute: 0),
//   TimeOfDay(hour: 3, minute: 0),
//   TimeOfDay(hour: 4, minute: 0),
//   TimeOfDay(hour: 5, minute: 0),
//   TimeOfDay(hour: 6, minute: 0),
//   TimeOfDay(hour: 7, minute: 0),
//   TimeOfDay(hour: 8, minute: 0),
//   TimeOfDay(hour: 9, minute: 0),
//   TimeOfDay(hour: 10, minute: 0),
//   TimeOfDay(hour: 11, minute: 0),
// ];
//
// static const List<TimeOfDay> _twentyFourHours = <TimeOfDay>[
//   TimeOfDay(hour: 0, minute: 0),
//   TimeOfDay(hour: 2, minute: 0),
//   TimeOfDay(hour: 4, minute: 0),
//   TimeOfDay(hour: 6, minute: 0),
//   TimeOfDay(hour: 8, minute: 0),
//   TimeOfDay(hour: 10, minute: 0),
//   TimeOfDay(hour: 12, minute: 0),
//   TimeOfDay(hour: 14, minute: 0),
//   TimeOfDay(hour: 16, minute: 0),
//   TimeOfDay(hour: 18, minute: 0),
//   TimeOfDay(hour: 20, minute: 0),
//   TimeOfDay(hour: 22, minute: 0),
// ];
//
// TappableLabel _buildTappableLabel(TextTheme textTheme, Color color, int value,
//     String label, VoidCallback onTap) {
//   final TextStyle style = textTheme.bodyText1!.copyWith(color: color);
//   final double labelScaleFactor =
//   math.min(MediaQuery.of(context).textScaleFactor, 2.0);
//   return TappableLabel(
//     value: value,
//     painter: TextPainter(
//       text: TextSpan(style: style, text: label),
//       textDirection: TextDirection.ltr,
//       textScaleFactor: labelScaleFactor,
//     )..layout(),
//     onTap: onTap,
//   );
// }
//
// late MaterialLocalizations localizations;
// late MediaQueryData media;
//
// List<TappableLabel> _build12HourRing(TextTheme textTheme, Color color) =>
//     <TappableLabel>[
//       for (final TimeOfDay timeOfDay in _amHours)
//         _buildTappableLabel(
//           textTheme,
//           color,
//           timeOfDay.hour,
//           localizations.formatHour(timeOfDay,
//               alwaysUse24HourFormat: media.alwaysUse24HourFormat),
//               () {
//             // _selectHour(timeOfDay.hour);
//           },
//         ),
//     ];
//
// List<TappableLabel> _build24HourRing(TextTheme textTheme, Color color) =>
//     <TappableLabel>[
//       for (final TimeOfDay timeOfDay in _twentyFourHours)
//         _buildTappableLabel(
//           textTheme,
//           color,
//           timeOfDay.hour,
//           localizations.formatHour(timeOfDay,
//               alwaysUse24HourFormat: media.alwaysUse24HourFormat),
//               () {
//             print('Select Hour');
//             // _selectHour(timeOfDay.hour);
//           },
//         ),
//     ];
