import 'dart:async';
import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/micheal_widgets/rating_card.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';
import 'package:highfedilityadevar/views/pages/edit_profile/edit_profile_page.dart';
import 'package:highfedilityadevar/views/pages/home_base/home_base_page.dart';
import 'package:highfedilityadevar/views/pages/recent_comments/recent_comments_page.dart';
import 'package:intl/intl.dart';

// import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/io.dart';

class AdavarQrOtherProfilePage extends StatefulWidget {
  final userId;
  final from;

  AdavarQrOtherProfilePage(this.userId, this.from);

  @override
  State<AdavarQrOtherProfilePage> createState() =>
      _AdavarQrOtherProfilePageState();
}

UserDataModel? userDataModel;

class _AdavarQrOtherProfilePageState extends State<AdavarQrOtherProfilePage> {
  IOWebSocketChannel? channel;

  var education = false;
  var workExperience = false;
  var skills = false;
  var comment = false;
  var score = false;

  late double percentage;
  late Timer timer;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance!.addPostFrameCallback((_) {
      socketConnection();
    });

    if (widget.from == 'updateProfile') {
      getResumeInfoAfterEdit();
    } else
    // if (widget.from == 'search')
    {
      getResumeInfoSearch(widget.userId);
    }
    timer = Timer.periodic(Duration(minutes: 3), (timer) {
      log('\x1b[97m Socket Reconnect');
      // if (channel!.closeCode != null) {
      socketConnection();
      // }
      // channel!.sink.close();
    });
    // getLockAndUnLoackProfile(widget.userId);

    //  getlookingAtMyResumeUser(widget.userId);
    //  getMyOwnResume(widget.userId);
  }

  socketConnection() {
    _getSharedPref.getUserData().then((value) {
      channel = IOWebSocketChannel.connect(
          'wss://mobapis.adevar.app/websocket/infoCar/${value.authToken}');
      channel!.stream.listen((message) {
        channel!.innerWebSocket!.pingInterval = const Duration(seconds: 30);

        // channel!.innerWebSocket!.pingInterval!.inMinutes;
        var data = json.decode(message);
        log('Socket Data  $data');
        // channel!.innerWebSocket!.done
        //     .then((value) => print("DONE=====Profile========================"));
        if (data['type'].toString() == "6") {
          setState(() {
            score = data['data'].containsKey('rating') &&
                    data['data']['rating'].toString() != '0' &&
                    data['data'].containsKey('score') &&
                    data['data']['score'] != null &&
                    data['data']['score'].length > 0
                ? true
                : false;
            education = data['data'].containsKey('edu') &&
                    data['data']['edu'] != null &&
                    data['data']['edu'].length > 0
                ? true
                : false;
            skills = data['data'].containsKey('skills') &&
                    data['data']['skills'] != null &&
                    data['data']['skills'].length > 0
                ? true
                : false;
            comment = data['data'].containsKey('comment') &&
                    data['data']['comment'] != null &&
                    data['data']['comment'].length > 0
                ? true
                : false;
            workExperience = data['data'].containsKey('work') &&
                    data['data']['work'] != null &&
                    data['data']['work'].length > 0
                ? true
                : false;
            resumseInfoResponse = data;
          });
        }
      });

      setState(() {
        userDataModel = value;
      });
    });
  }

  @override
  void dispose() {
    channel!.sink.close();
    timer.cancel();
    super.dispose();
  }

  var lookingAtMyResumeUseResponse;
  var myOwnResumeResponse = null;
  var resumseInfoResponse = null;
  var lookingAtMyResume = null;

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  void getResumeInfoSearch(userId) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    //  print("url ==>> ${/socialContact/resume/getMyOwnResume?lang=en_U");

    var response = await ApiService.get(
      // "/socialContact/resume/getMyOwnResume?lang=en_US",
      "/socialContact/resume/getResumeInfo?infoOwnerUserId=$userId&lang=en_US",
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );

    if (response['data'] != null) {
      setState(() {
        resumseInfoResponse = response;
        score = resumseInfoResponse['data'].containsKey('rating') &&
                resumseInfoResponse['data']['rating'].toString() != '0' &&
                resumseInfoResponse['data'].containsKey('score') &&
                resumseInfoResponse['data']['score'] != null &&
                resumseInfoResponse['data']['score'].length > 0
            ? true
            : false;
        education = resumseInfoResponse['data'].containsKey('edu') &&
                resumseInfoResponse['data']['edu'] != null &&
                resumseInfoResponse['data']['edu'].length > 0
            ? true
            : false;
        skills = resumseInfoResponse['data'].containsKey('skills') &&
                resumseInfoResponse['data']['skills'] != null &&
                resumseInfoResponse['data']['skills'].length > 0
            ? true
            : false;
        comment = resumseInfoResponse['data'].containsKey('comment') &&
                resumseInfoResponse['data']['comment'] != null &&
                resumseInfoResponse['data']['comment'].length > 0
            ? true
            : false;
        workExperience = resumseInfoResponse['data'].containsKey('work') &&
                resumseInfoResponse['data']['work'] != null &&
                resumseInfoResponse['data']['work'].length > 0
            ? true
            : false;
      });
    }
    setState(() {});
  }

  void getLockAndUnLoackProfile(userId) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    var response = await ApiService.get(
      // "/socialContact/resume/getMyLookAtPermission?userId=$userId",
      "/socialContact/resume/lookingAtMyResumeUserByUserId?userId=$userId&lang=en_US",
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );

    if (response['data'] != null && response['data']['authJson'] != null) {
      setState(() {
        score = response['data']['authJson'].containsKey('Rating')
            ? response['data']['authJson']['Rating'].toString() == '1'
            : false;
        comment = response['data']['authJson'].containsKey('Comment')
            ? response['data']['authJson']['Comment'].toString() == '1'
            : false;
        education = response['data']['authJson'].containsKey('Edu')
            ? response['data']['authJson']['Edu'].toString() == '1'
            : false;
        workExperience = response['data']['authJson'].containsKey('Work')
            ? response['data']['authJson']['Work'].toString() == '1'
            : false;
        skills = response['data']['authJson'].containsKey('Skills')
            ? response['data']['authJson']['Skills'].toString() == '1'
            : false;
      });
    }
  }

  void getResumeInfoAfterEdit() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    //  print("url ==>> ${/socialContact/resume/getMyOwnResume?lang=en_U");

    var response = await ApiService.get(
      "/socialContact/resume/getMyOwnResume?lang=en_US",
      // "/socialContact/resume/getResumeInfo?infoOwnerUserId=$userId&lang=en_US",
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );

    if (response['data'] != null) {
      setState(() {
        resumseInfoResponse = response;
        score = resumseInfoResponse['data'].containsKey('rating') &&
                resumseInfoResponse['data']['rating'].toString() != '0' &&
                resumseInfoResponse['data'].containsKey('score') &&
                resumseInfoResponse['data']['score'] != null &&
                resumseInfoResponse['data']['score'].length > 0
            ? true
            : false;
        education = resumseInfoResponse['data'].containsKey('edu') &&
                resumseInfoResponse['data']['edu'] != null &&
                resumseInfoResponse['data']['edu'].length > 0
            ? true
            : false;
        skills = resumseInfoResponse['data'].containsKey('skills') &&
                resumseInfoResponse['data']['skills'] != null &&
                resumseInfoResponse['data']['skills'].length > 0
            ? true
            : false;
        comment = resumseInfoResponse['data'].containsKey('comment') &&
                resumseInfoResponse['data']['comment'] != null &&
                resumseInfoResponse['data']['comment'].length > 0
            ? true
            : false;
        workExperience = resumseInfoResponse['data'].containsKey('work') &&
                resumseInfoResponse['data']['work'] != null &&
                resumseInfoResponse['data']['work'].length > 0
            ? true
            : false;
      });
    }
    setState(() {});
  }

  // final _channel = IOWebSocketChannel.connect(
  //     'wss://mobapis.adevar.app/websocket/infoCar/${userDataModel?.authToken.toString()}');
  @override
  Widget build(BuildContext context) {
    var cindex = 0;
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '',
          style: GoogleFonts.roboto(color: Colors.black),
        ),
        centerTitle: true,
        actions: [
          widget.from == "updateProfile"
              ? InkWell(
                  onTap: () {
                    Navigator.of(context).pushReplacement(
                      new MaterialPageRoute(
                        builder: (context) => HomeBasePage(
                          selectedIndex: 1,
                        ),
                      ),
                    );
                  },
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.0),
                    child: Icon(
                      Icons.check,
                      color: Colors.blue,
                      size: 30,
                    ),
                  ))
              : Container()
        ],
      ),
      body: resumseInfoResponse != null
          ? SingleChildScrollView(
              child: Column(
                children: [
                  Container(
                    height: 194,
                    width: MediaQuery.of(context).size.width,
                    margin: EdgeInsets.symmetric(horizontal: 20),
                    decoration: BoxDecoration(
                      color: AppColors.FORM_GREY,
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Stack(
                      children: [
                        Align(
                          alignment: Alignment.centerRight,
                          child: GestureDetector(
                            onTap: () {},
                            child: Container(
                              margin: EdgeInsets.only(right: 20),
                              child: Image(
                                image: AssetImage(AppImages.ME_BACKGROUND),
                              ),
                            ),
                          ),
                        ),
                        if (resumseInfoResponse != null)
                          Container(
                            margin: EdgeInsets.only(
                                left: 20, right: 20, top: 20, bottom: 20),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(50),
                                      child: resumseInfoResponse['data']
                                                  ['logo'] !=
                                              null
                                          ? Image.network(
                                              "${resumseInfoResponse['data']['logo']}",
                                              height: 70,
                                              fit: BoxFit.fill,
                                              width: 70,
                                            )
                                          : Image.asset(
                                              AppImages.PERSONAL_INFORMATION),
                                    ),
                                    SizedBox(
                                      width: 12,
                                    ),
                                    Column(
                                      children: [
                                        Text(
                                          // 'Marry',
                                          "${resumseInfoResponse['data']['name'] != null ? resumseInfoResponse['data']['name']['firstName'] : ""}",
                                          style: GoogleFonts.roboto(
                                            color: Colors.black,
                                            fontSize: 28,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        SizedBox(
                                          height: 11,
                                        ),
                                        if (widget.from == 'updateProfile')
                                          Text(
                                            //   "id",
                                            'ID：${resumseInfoResponse['data']['userId']}',
                                            style: GoogleFonts.roboto(
                                              color:
                                                  AppColors.NOTIFICATION_GREY,
                                              fontSize: 12,
                                              fontWeight: FontWeight.w400,
                                            ),
                                          ),
                                        if (widget.from != 'updateProfile')
                                          Row(
                                            children: [
                                              Text(
                                                'ID: ',
                                                style: GoogleFonts.roboto(
                                                    color: AppColors
                                                        .NOTIFICATION_GREY,
                                                    fontSize: 12,
                                                    fontWeight:
                                                        FontWeight.w400),
                                              ),
                                              for (int i = 0;
                                                  i <
                                                      resumseInfoResponse[
                                                              'data']['userId']
                                                          .toString()
                                                          .length;
                                                  i++)
                                                Text(
                                                  '*',
                                                  style: GoogleFonts.roboto(
                                                      color: AppColors
                                                          .NOTIFICATION_GREY,
                                                      fontSize: 12,
                                                      fontWeight:
                                                          FontWeight.w400),
                                                ),
                                            ],
                                          ),
                                      ],
                                    ),
                                    Expanded(
                                      child: Align(
                                        alignment: Alignment.topRight,
                                        child: Container(
                                          child: Column(
                                            children: [
                                              Container(
                                                width: 66,
                                                height: 29,
                                                decoration: BoxDecoration(
                                                  borderRadius:
                                                      BorderRadius.circular(7),
                                                  gradient: LinearGradient(
                                                      colors: [
                                                        AppColors.LIGHT_ORANGE,
                                                        AppColors.DARK_ORANGE
                                                      ],
                                                      begin:
                                                          const FractionalOffset(
                                                              0.0, 0.0),
                                                      end:
                                                          const FractionalOffset(
                                                              0.5, 0.0),
                                                      stops: [0.0, 1.0],
                                                      tileMode: TileMode.clamp),
                                                ),
                                                child: Center(
                                                  child: Text(
                                                    resumseInfoResponse['data']
                                                                ['vipLv'] ==
                                                            1
                                                        ? "Vip"
                                                        : "Personal",
                                                    style: GoogleFonts.roboto(
                                                      color: AppColors
                                                          .NOTIFICATION_GREY,
                                                      fontSize: 10,
                                                      fontWeight:
                                                          FontWeight.w400,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                              // SizedBox(
                                              //   height: 25,
                                              // ),
                                              // Text(
                                              //   "注册日期：${resumseInfoResponse['data']['registerDate']}",
                                              //   style: GoogleFonts.roboto(
                                              //     color: AppColors
                                              //         .NOTIFICATION_GREY,
                                              //     fontSize: 10,
                                              //     fontWeight: FontWeight.w400,
                                              //   ),
                                              // ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    )
                                  ],
                                ),
                                SizedBox(
                                  height: 25,
                                ),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: getUserAboutWidget(
                                        '${resumseInfoResponse['data']['position']}',
                                        Image(
                                          image: AssetImage(AppImages.USER),
                                          height: 18,
                                          width: 18,
                                          color: AppColors.BLACK_SHADE,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: getUserAboutWidget(
                                          //'Henan.China',
                                          "${resumseInfoResponse['data']['place']['state']}.${resumseInfoResponse['data']['place']['country']}",
                                          Icon(
                                            Icons.language,
                                            color: AppColors.BLACK_SHADE,
                                            size: 18,
                                          )),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  // resumseInfoResponse['data'].containsKey('rating') &&
                  //         resumseInfoResponse['data']['rating'] != 0 &&
                  //         resumseInfoResponse['data'].containsKey('score') &&
                  //         resumseInfoResponse['data']['score'] != null &&
                  //         resumseInfoResponse['data']['score'].length > 0
                  score
                      ? Padding(
                          padding: EdgeInsets.symmetric(horizontal: 20),
                          child: RatingCard(
                            height: 100,
                            resumseInfoResponse: resumseInfoResponse,
                          ),
                        ) //getProgressWidget()
                      : Container(),
                  SizedBox(
                    height: 10,
                  ),
                  // resumseInfoResponse['data'].containsKey('comment') &&
                  //         resumseInfoResponse['data']['comment'] != null &&
                  //         resumseInfoResponse['data']['comment'].length > 0
                  comment ? _getRecentCommentsWidget() : Container(),
                  SizedBox(
                    height: 10,
                  ),
                  // resumseInfoResponse['data'].containsKey('edu') &&
                  //         resumseInfoResponse['data']['edu'] != null &&
                  //         resumseInfoResponse['data']['edu'].length > 0
                  education ? _getEducationWidget() : Container(),
                  SizedBox(
                    height: 10,
                  ),
                  // resumseInfoResponse['data'].containsKey('work') &&
                  //         resumseInfoResponse['data']['work'] != null &&
                  //         resumseInfoResponse['data']['work'].length > 0
                  workExperience ? _getWorkExperienceWidget() : Container(),
                  SizedBox(
                    height: 10,
                  ),
                  // resumseInfoResponse['data'].containsKey('skills') &&
                  //         resumseInfoResponse['data']['skills'] != null &&
                  //         resumseInfoResponse['data']['skills'].length > 0
                  skills
                      ? Container(
                          padding: EdgeInsets.all(15),
                          margin: EdgeInsets.symmetric(horizontal: 20),
                          decoration: BoxDecoration(
                            color: AppColors.FORM_GREY,
                            borderRadius: BorderRadius.circular(15),
                          ),
                          width: double.infinity,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Image(
                                    image: AssetImage(AppImages.SKILLS),
                                    height: 25,
                                    width: 22,
                                    color: Colors.black,
                                  ),
                                  SizedBox(
                                    width: 10,
                                  ),
                                  Text(
                                    'Skills',
                                    style: GoogleFonts.roboto(
                                        color: Colors.black,
                                        fontSize: 18,
                                        fontWeight: FontWeight.w400),
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 20,
                              ),
                              resumseInfoResponse['data']['skills'] != null
                                  ? Container(
                                      height: 120,
                                      child: ListView.builder(
                                          itemCount: resumseInfoResponse['data']
                                                  ['skills']
                                              .length,
                                          scrollDirection: Axis.horizontal,
                                          itemBuilder: (BuildContext context,
                                              int index) {
                                            var colors = [
                                              Colors.green,
                                              Colors.purple,
                                              Colors.orange,
                                              Colors.blue
                                            ];
                                            var color = colors[cindex];
                                            if (cindex == colors.length - 1) {
                                              cindex = 0;
                                            } else {
                                              cindex = cindex + 1;
                                            }
                                            return Container(
                                              height: 116,
                                              width: 94,
                                              margin:
                                                  EdgeInsets.only(right: 20),
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                                border:
                                                    Border.all(color: color),
                                              ),
                                              child: Column(
                                                children: [
                                                  Container(
                                                    height: 48,
                                                    width: 48,
                                                    margin: EdgeInsets.only(
                                                        top: 15),
                                                    decoration: BoxDecoration(
                                                      color: color,
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              15),
                                                    ),
                                                    child: Center(
                                                      child: Text(
                                                        "${resumseInfoResponse['data']['skills'][index]['chooseSkills'][0]}",
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                        style:
                                                            GoogleFonts.roboto(
                                                          color: Colors.white,
                                                          fontSize: 30,
                                                          fontWeight:
                                                              FontWeight.w400,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                  SizedBox(
                                                    height: 12,
                                                  ),
                                                  Text(
                                                    "${resumseInfoResponse['data']['skills'][index]['chooseSkills']}",
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                    style: GoogleFonts.roboto(
                                                        color: Colors.black,
                                                        fontSize: 14,
                                                        fontWeight:
                                                            FontWeight.w400),
                                                  ),
                                                  SizedBox(
                                                    height: 4,
                                                  ),
                                                  Text(
                                                    '${resumseInfoResponse['data']['skills'][index]['skillExperience']}',
                                                    style: GoogleFonts.roboto(
                                                        color:
                                                            AppColors.DARK_GREY,
                                                        fontSize: 10,
                                                        fontWeight:
                                                            FontWeight.w400),
                                                  ),
                                                ],
                                              ),
                                            );
                                          }),
                                    )
                                  : Container(),
                            ],
                          ),
                        )
                      : Container(),
                ],
              ),
            )
          : Center(
              child: CircularProgressIndicator(),
            ),
      bottomNavigationBar: widget.from == "updateProfile"
          ? InkWell(
              onTap: () {
                Navigator.of(context).pushReplacement(new MaterialPageRoute(
                    builder: (context) => EditProfilePage()));
              },
              child: Container(
                margin: EdgeInsets.symmetric(horizontal: 15, vertical: 15),
                width: MediaQuery.of(context).size.width,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Image.asset(AppImages.EDIT_PROFILE),
                    SizedBox(
                      width: 10,
                    ),
                    Text(
                      'Edit',
                      style: GoogleFonts.roboto(
                          fontWeight: FontWeight.w600,
                          fontSize: 18,
                          color: Colors.white),
                    ),
                  ],
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15),
                  color: AppColors.BUTTON_COLOR,
                ),
                height: 50,
              ),
            )
          : Container(
              height: 10,
            ),
    );
  }

  Widget _getEducationWidget() {
    var now = new DateTime.now();
    var formatter = new DateFormat('yyyy-MM');
    String formatted = formatter.format(now);
    return Container(
      padding: EdgeInsets.all(15),
      margin: EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: AppColors.FORM_GREY,
        borderRadius: BorderRadius.circular(15),
      ),
      width: MediaQuery.of(context).size.width,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Image(
                image: AssetImage(AppImages.EDU),
                height: 20,
                width: 20,
              ),
              SizedBox(
                width: 10,
              ),
              Text(
                'Education',
                style: GoogleFonts.roboto(
                    color: Colors.black,
                    fontSize: 18,
                    fontWeight: FontWeight.w400),
              ),
            ],
          ),
          SizedBox(
            height: 10,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${resumseInfoResponse['data']['edu'] != null ? resumseInfoResponse['data']['edu'][0]['school'] : null}',
                //'Harvard University',
                style: GoogleFonts.roboto(
                    fontWeight: FontWeight.w400,
                    fontSize: 12,
                    color: AppColors.DARK_GREY),
              ),
              Expanded(
                child: Row(
                  // crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      '${resumseInfoResponse['data']['edu'] != null && resumseInfoResponse['data']['edu'].length > 0 ? resumseInfoResponse['data']['edu'][0]['timePeriodStar'].runtimeType == String ? formatter.format(DateTime.parse(resumseInfoResponse['data']['edu'][0]['timePeriodStar'])) : formatter.format(DateTime(resumseInfoResponse['data']['edu'][0]['timePeriodStar'])) : ""}',
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.roboto(
                          fontWeight: FontWeight.w400,
                          fontSize: 12,
                          color: AppColors.DARK_GREY),
                    ),
                    SizedBox(
                      width: 5,
                    ),
                    Text(
                      '${resumseInfoResponse['data']['edu'] != null && resumseInfoResponse['data']['edu'].length > 0 ? resumseInfoResponse['data']['edu'][0]['timePeriodEnd'].runtimeType == String ? formatter.format(DateTime.parse(resumseInfoResponse['data']['edu'][0]['timePeriodEnd'])) : formatter.format(DateTime(resumseInfoResponse['data']['edu'][0]['timePeriodEnd'])) : ""}',
                      style: GoogleFonts.roboto(
                          fontWeight: FontWeight.w400,
                          fontSize: 12,
                          color: AppColors.DARK_GREY),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _getWorkExperienceWidget() {
    var now = new DateTime.now();
    var formatter = new DateFormat('yyyy-MM');
    String formatted = formatter.format(now);

    return Container(
      padding: EdgeInsets.all(15),
      margin: EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: AppColors.FORM_GREY,
        borderRadius: BorderRadius.circular(15),
      ),
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.work_outline,
                size: 20,
              ),
              SizedBox(
                width: 10,
              ),
              Text(
                'Work Experience',
                style: GoogleFonts.roboto(
                    color: Colors.black,
                    fontSize: 18,
                    fontWeight: FontWeight.w400),
              ),
            ],
          ),
          SizedBox(
            height: 11,
          ),
          Row(
            children: [
              Text(
                '${resumseInfoResponse['data']['work'] != null ? resumseInfoResponse['data']['work'][0]['companyName'] : ""}',
                // 'linyi shengming timber co.ltd',
                style: GoogleFonts.roboto(
                    fontWeight: FontWeight.w400,
                    fontSize: 12,
                    color: AppColors.DARK_GREY),
              ),
              Expanded(
                child: Align(
                  alignment: Alignment.centerRight,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        // '${resumseInfoResponse['data']['work'] != null ?  formatter.format(DateTime.parse(resumseInfoResponse['data']['work'][0]
                        // ['workDataEnd'])) : null}',
                        '${resumseInfoResponse['data']['work'] != null && resumseInfoResponse['data']['work'].length > 0 ? formatter.format(DateTime.parse(resumseInfoResponse['data']['work'][0]['workDataStart'])) : null}',
                        // ${resumseInfoResponse['data']['edu'] != null && resumseInfoResponse['data']['edu'].length > 0 &&
                        // resumseInfoResponse['data']['edu'][0]['timePeriodEnd'].runtimeType == String
                        // ? formatter.format(DateTime.parse(resumseInfoResponse['data']['edu'][0]['timePeriodEnd'])) : null}
                        style: GoogleFonts.roboto(
                            fontWeight: FontWeight.w400,
                            fontSize: 12,
                            color: AppColors.DARK_GREY),
                      ),
                      SizedBox(
                        width: 5,
                      ),
                      Text(
                        '${resumseInfoResponse['data']['work'] != null && resumseInfoResponse['data']['work'].length > 0 ? formatter.format(DateTime.parse(resumseInfoResponse['data']['work'][0]['workDataEnd'])) : null}',
                        style: GoogleFonts.roboto(
                            fontWeight: FontWeight.w400,
                            fontSize: 12,
                            color: AppColors.DARK_GREY),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          SizedBox(
            height: 5,
          ),
          Text(
            '${resumseInfoResponse['data']['work'] != null ? resumseInfoResponse['data']['work'][0]['workPosition'] : ""}',
            //'UX designer',
            style: GoogleFonts.roboto(
              color: AppColors.BLACK_SHADE,
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
          ),
          SizedBox(
            height: 10,
          ),
          Text(
            '${resumseInfoResponse['data']['work'] != null ? resumseInfoResponse['data']['work'][0]['workDescription'] : ""}',
            // '1. Be responsible for the product interface design, analyze the user\'s operating habits and preferences, and propose the product interaction design and interface design scheme from the perspective of user experience;',
            style: GoogleFonts.roboto(
              color: Colors.grey,
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }

  Widget _getRecentCommentsWidget() {
    var now = new DateTime.now();
    var formatter = new DateFormat('yyyy-MM-dd');
    String formatted = formatter.format(now);
    // var _key;
    // return SlideAction(
    //     key: _key,
    //     onSubmit: () {
    //       Future.delayed(
    //         Duration(seconds: 1),
    //         () => _key.currentState.reset(),
    //       );

    return resumseInfoResponse['data']['comment'] != null
        ? Container(
            padding: EdgeInsets.all(15),
            margin: EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(
              color: AppColors.FORM_GREY,
              borderRadius: BorderRadius.circular(15),
            ),
            width: double.infinity,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.message_outlined,
                          size: 20,
                        ),
                        SizedBox(
                          width: 10,
                        ),
                        Text(
                          'Recent Comments',
                          style: TextStyle(
                            fontSize: 18,
                            // fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    InkWell(
                      onTap: () {
                        log('Received Comment qr other profile');
                        Get.to(() => RecentCommentsPage(
                              fromScannedQr: true,
                              userId: widget.userId,
                            ));
                      },
                      child: Text(
                        'More>',
                        style: TextStyle(
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(
                  height: 10,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Row(
                      children: [
                        Container(
                          // decoration: BoxDecoration(
                          //   border: Border.all(
                          //     width: 1,
                          //   ),
                          //   borderRadius: BorderRadius.circular(50),
                          // ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(50),
                            child: resumseInfoResponse['data'] != null &&
                                    resumseInfoResponse['data']['comment'] !=
                                        null &&
                                    resumseInfoResponse['data']['comment']
                                            ['logo'] !=
                                        null
                                ? Image.network(
                                    "${resumseInfoResponse['data']['comment']['logo']}",
                                    height: 25,
                                    width: 25,
                                    fit: BoxFit.fill,
                                  )
                                : Image.asset(
                                    AppImages.PERSONAL_INFORMATION,
                                  ),
                          ),
                        ),
                        // ClipRRect(
                        //   borderRadius: BorderRadius.circular(50),
                        //   child: Image.network(
                        //     "${resumseInfoResponse['data']['comment']['logo']}",
                        //     height: 25,
                        //     width: 25,
                        //   ),
                        // ),
                        SizedBox(
                          width: 10,
                        ),
                        Text(
                          resumseInfoResponse['data']['comment']['firstName'] !=
                                  null
                              ? '${resumseInfoResponse['data']['comment']['firstName']}'
                              : "",
                          style: TextStyle(
                            fontSize: 18,
                            // fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      // ${resumseInfoResponse['data']['edu'] != null && resumseInfoResponse['data']['edu'].length > 0 && resumseInfoResponse['data']['edu'][0]['timePeriodEnd'] != null ? resumseInfoResponse['data']['edu'][0]['timePeriodEnd'].runtimeType == String ? formatter.format(DateTime.parse(resumseInfoResponse['data']['edu'][0]['timePeriodEnd'])): formatter.format(DateTime.fromMicrosecondsSinceEpoch(resumseInfoResponse['data']['edu'][0]['timePeriodEnd'])): null}
                      '${resumseInfoResponse['data']['comment'] != null && resumseInfoResponse['data']['comment'].length > 0 && resumseInfoResponse['data']['comment']['commentDateTime'] != null ? resumseInfoResponse['data']['comment']['commentDateTime'].runtimeType == String ? formatter.format(DateTime.parse(resumseInfoResponse['data']['comment']['commentDateTime'])) : formatter.format(DateTime.fromMillisecondsSinceEpoch(resumseInfoResponse['data']['comment']['commentDateTime'])) : null}',
                      // '${resumseInfoResponse['data']['comment'] != null && resumseInfoResponse['data']['comment'].length > 0 && resumseInfoResponse['data']['comment']['commentDateTime'] != null ? resumseInfoResponse['data']['comment']['commentDateTime'].runtimeType == String ? DateTime.parse(resumseInfoResponse['data']['comment']['commentDateTime'].toString()).toLocal() : DateTime.fromMicrosecondsSinceEpoch(resumseInfoResponse['data']['comment']['commentDateTime']).toLocal() : null}',
                      //  '${DateTime.parse(resumseInfoResponse['data']['comment']['commentDateTime']).toLocal()}',
                      //'2021/12/14 16:02:44',
                      style: TextStyle(
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
                SizedBox(
                  height: 10,
                ),
                Container(
                  height: 50,
                  child: Text(
                    resumseInfoResponse['data']['comment']['commentText'] !=
                            null
                        ? "${resumseInfoResponse['data']['comment']['commentText']}"
                        : "",
                    //  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
                    style: TextStyle(
                      color: Colors.grey,
                    ),
                  ),
                ),
              ],
            ),
          )
        : Container();
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
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.roboto(
                color: AppColors.BLACK_SHADE,
                fontSize: 14,
                fontWeight: FontWeight.w400),
          ),
        ),
      ],
    );
  }
}
