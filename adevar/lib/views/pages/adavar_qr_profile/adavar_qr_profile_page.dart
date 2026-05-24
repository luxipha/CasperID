import 'dart:convert';
import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';

import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';
import 'package:highfedilityadevar/views/pages/recent_comments/recent_comments_page.dart';

import 'package:slider_button/slider_button.dart';

import 'package:web_socket_channel/io.dart';

import 'package:blur/blur.dart';

class AdavarQrProfilePage extends StatefulWidget {
  final userId;

  AdavarQrProfilePage(
    this.userId,
  );

  @override
  State<AdavarQrProfilePage> createState() => _AdavarQrProfilePageState();
}

UserDataModel? userDataModel;

class _AdavarQrProfilePageState extends State<AdavarQrProfilePage> {
  bool education = false;
  bool workExperience = false;
  bool skills = false;
  bool rating = false;
  var channel;
  var edu;
  var Skills;
  var work;
  var Rating;
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    WidgetsBinding.instance!.addPostFrameCallback((_) {
      _getSharedPref.getUserData().then((value) {
        print("value-->$value");

        channel = IOWebSocketChannel.connect(
            'wss://mobapis.adevar.app/websocket/infoCar/${value.authToken}');

        channel.stream.listen((message) {
          channel.innerWebSocket!.pingInterval = const Duration(seconds: 30);
          var data = json.decode(message);
          // channel.sink.add('received!');
        });
        setState(() {
          userDataModel = value;
        });
        print("id-->${userDataModel!.authToken!}");
        print('token->${userDataModel!.authToken!}');
        print("user-${userDataModel!.userId}");
      });
    });

    getlookingAtMyResumeUser();
    getMyOwnResume();
    // getresmuseInfo(widget.result1);
  }

  var lookingAtMyResumeUseResponse;
  var myOwnResumeResponse;
  var resumseInfoResponse;
  var lookingAtMyResume;

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  void getlookingAtMyResumeUser() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    //  print("url ==>> ${/socialContact/resume/getMyOwnResume?lang=en_U");

    var response = await ApiService.get(
      //"/socialContact/resume/getMyOwnResume?lang=en_US",
      "/socialContact/resume/lookingAtMyResumeUser?page=1&size=10&lang=en_US",
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );
    print("lookingAtMyResumeUseResponse-- $response");
    setState(() {
      lookingAtMyResumeUseResponse = response;
      edu = response['items'][0]['authJson']['Edu'];
      Skills = response['items'][0]['authJson']['Skills'];
      work = response['items'][0]['authJson']['Work'];

      print("Eduction-->> $edu");
      print("skills-->> $Skills");
      print("works-->> $work");

      // print("userId-->>${lookingAtMyResumeUseResponse['items'][0]['userId']}");
      // print("logo-->> ${lookingAtMyResumeUseResponse['items'][0]['logo']}");
      // print("name-->> ${lookingAtMyResumeUseResponse['items'][0]['firstName']}");
    });
  }

  void getMyOwnResume() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    //  print("url ==>> ${/socialContact/resume/getMyOwnResume?lang=en_U");

    var response = await ApiService.get(
      "/socialContact/resume/getMyOwnResume?lang=en_US",
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );
    print("MyOwnResumeResponse-- $response");
    setState(() {
      resumseInfoResponse = response;
      print("username -- ${resumseInfoResponse['data']['name']['firstName']}");
    });
  }

  void getUpdateResumePrivate(_params) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    var response = await ApiService.put(
      "socialContact/resume/updateResumePrivateAuth?lang=en_US&guestUserId=${widget.userId}",
      body: jsonEncode(_params),
      headerMap: {
        // "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );
    // channel.sink.add(json.encode({
    //   "type": "5",
    //   "recUserId": widget.userId,
    //   "msg": "successfully qr code scan",
    //   "data": "update"
    // }));
    print("updateResumePrivateAuth-- $response");
  }

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
        ),
        body: resumseInfoResponse != null
            ? SingleChildScrollView(
                child: Column(
                children: [
                  Container(
                    height: 194,
                    width: double.infinity,
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
                        Container(
                          margin: EdgeInsets.only(
                              left: 20, right: 20, top: 20, bottom: 20),
                          child: Column(
                            children: [
                              Container(
                                child: Row(
                                  children: [
                                    // Image(
                                    //   image: AssetImage(
                                    //     AppImages.face_confirm,
                                    //   ),
                                    //   height: 70,
                                    //   width: 70,
                                    // ),
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(20),
                                      child: Image.network(
                                        "${resumseInfoResponse['data']['logo'] != null ? resumseInfoResponse['data']['logo'] : ""}",
                                        height: 70,
                                        width: 70,
                                      ),
                                    ),
                                    SizedBox(
                                      width: 14,
                                    ),
                                    Column(
                                      children: [
                                        Text(
                                          // 'Marry',

                                          "${resumseInfoResponse['data']['name']['firstName'] != null ? resumseInfoResponse['data']['name']['firstName'] : ""}",
                                          style: GoogleFonts.roboto(
                                            color: Colors.black,
                                            fontSize: 28,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        SizedBox(
                                          height: 11,
                                        ),
                                        Text(
                                          //   "id",
                                          'ID：${resumseInfoResponse['data']['userId'] != null ? resumseInfoResponse['data']['userId'] : ""}',
                                          style: GoogleFonts.roboto(
                                            color: AppColors.NOTIFICATION_GREY,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w400,
                                          ),
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
                                                    "${resumseInfoResponse['data']['vipLv'] != null ? resumseInfoResponse['data']['vipLv'] : ''}",
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
                                              SizedBox(
                                                height: 25,
                                              ),
                                              Text(
                                                "注册日期：${resumseInfoResponse['data']['registerDate'] != null ? resumseInfoResponse['data']['registerDate'] : ""}",
                                                style: GoogleFonts.roboto(
                                                  color: AppColors
                                                      .NOTIFICATION_GREY,
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.w400,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    )
                                  ],
                                ),
                              ),
                              SizedBox(
                                height: 25,
                              ),
                              Container(
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: getUserAboutWidget(
                                        //  'UX Designer',
                                        '${resumseInfoResponse['data']['position'] != null ? resumseInfoResponse['data']['position'] : ""}',
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
                                          "${resumseInfoResponse['data']['place']['state'] != null ? resumseInfoResponse['data']['place']['state'] : ""}.${resumseInfoResponse['data']['place']['country'] ?? ""}",
                                          Icon(
                                            Icons.language,
                                            color: AppColors.BLACK_SHADE,
                                            size: 18,
                                          )),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  // getProgressWidget(),
                  // SizedBox(
                  //   height: 10,
                  // ),

                  SizedBox(
                    height: 10,
                  ),

                  resumseInfoResponse['data']['edu'].length > 0
                      ? GestureDetector(
                          onTap: () {
                            setState(() {
                              education = !education;
                            });
                            getUpdateResumePrivate({
                              "Email": 1,
                              "Work": workExperience ? 1 : 0,
                              "Score": 1,
                              "Edu": education ? 1 : 0,
                              "Name": 1,
                              "Phone": 1,
                              "Skills": skills ? 1 : 0,
                              "Place": 1,
                              "Rating": 1,
                              "Intro": 1,
                              "Comment": 1

                              // "Skills": Skills,
                              // "Work": work
                            });
                            // channel.sink.add(json.encode({
                            //   "type": "5",
                            //   "recUserId": widget.userId,
                            //   "msg": "successfully qr code scan",
                            //   "data": "update"
                            // }));
                          },
                          child: Container(
                            margin: EdgeInsets.symmetric(horizontal: 20),
                            child: education
                                ? _getEducationWidget()
                                : Blur(
                                    blur: 5.5,
                                    blurColor: Colors.green,
                                    borderRadius: BorderRadius.circular(15),
                                    child: _getEducationWidget(),
                                  ),
                          ),
                        )
                      : Container(),
                  SizedBox(
                    height: 10,
                  ),
                  resumseInfoResponse['data']['work'].length > 0
                      ? GestureDetector(
                          onTap: () {
                            setState(() {
                              workExperience = !workExperience;
                            });
                            getUpdateResumePrivate(
                              {
                                "Work": workExperience ? 1 : 0,
                                "Email": 1,
                                "Score": 1,
                                "Edu": education ? 1 : 0,
                                "Name": 1,
                                "Phone": 1,
                                "Skills": skills ? 1 : 0,
                                "Place": 1,
                                "Rating": 1,
                                "Intro": 1,
                                "Comment": 1
                                // "Skills": Skills,
                                // "edu": edu
                              },
                            );
                          },
                          child: Container(
                              margin: EdgeInsets.symmetric(horizontal: 20),
                              child: workExperience
                                  ? _getWorkExperienceWidget()
                                  : Blur(
                                      blur: 5.5,
                                      blurColor: Colors.green,
                                      borderRadius: BorderRadius.circular(15),
                                      child: _getWorkExperienceWidget(),
                                    )))
                      : Container(),
                  SizedBox(
                    height: 10,
                  ),
                  resumseInfoResponse['data']['skills'].length > 0
                      ? GestureDetector(
                          onTap: () {
                            setState(() {
                              skills = !skills;
                            });

                            getUpdateResumePrivate({
                              "Skills": skills ? 1 : 0,
                              "Work": workExperience ? 1 : 0,
                              "Email": 1,
                              "Score": 1,
                              "Edu": education ? 1 : 0,
                              "Name": 1,
                              "Phone": 1,
                              "Place": 1,
                              "Rating": 1,
                              "Intro": 1,
                              "Comment": 1
                              // "work": work,
                              // "edu": edu
                            });
                            // channel.sink.add(json.encode({
                            //   "type": "5",
                            //   "recUserId": widget.userId,
                            //   "msg": "successfully qr code scan",
                            //   "data": "update"
                            // }));
                          },
                          child: Container(
                              margin: EdgeInsets.symmetric(horizontal: 20),
                              child: skills
                                  ? _getSkillWidget()
                                  : Blur(
                                      blur: 5.5,
                                      blurColor: Colors.green,
                                      borderRadius: BorderRadius.circular(15),
                                      child: _getSkillWidget(),
                                    )))
                      : Container(),

                  resumseInfoResponse['data']['edu'].length > 0
                      ? GestureDetector(
                          onTap: () {
                            setState(() {
                              education = !education;
                            });
                            getUpdateResumePrivate({
                              "Email": 1,
                              "Work": workExperience ? 1 : 0,
                              // "Score": 1,
                              "Edu": education ? 1 : 0,
                              "Name": 1,
                              "Phone": 1,
                              "Skills": skills ? 1 : 0,
                              "Place": 1,
                              "Rating": 1,
                              "Intro": 1,
                              "Comment": 1

                              // "Skills": Skills,
                              // "Work": work
                            });
                            // channel.sink.add(json.encode({
                            //   "type": "5",
                            //   "recUserId": widget.userId,
                            //   "msg": "successfully qr code scan",
                            //   "data": "update"
                            // }));
                          },
                          child: Container(
                            margin: EdgeInsets.symmetric(horizontal: 20),
                            child: education
                                ? _getEducationWidget()
                                : Blur(
                                    blur: 5.5,
                                    blurColor: Colors.green,
                                    borderRadius: BorderRadius.circular(15),
                                    child: _getEducationWidget(),
                                  ),
                          ),
                        )
                      : Container(),
                  SizedBox(
                    height: 10,
                  ),
                  resumseInfoResponse['data']['work'].length > 0
                      ? GestureDetector(
                          onTap: () {
                            setState(() {
                              workExperience = !workExperience;
                            });
                            getUpdateResumePrivate(
                              {
                                "Work": workExperience ? 1 : 0,
                                "Email": 1,
                                "Score": 1,
                                "Edu": education ? 1 : 0,
                                "Name": 1,
                                "Phone": 1,
                                "Skills": skills ? 1 : 0,
                                "Place": 1,
                                "Rating": 1,
                                "Intro": 1,
                                "Comment": 1
                                // "Skills": Skills,
                                // "edu": edu
                              },
                            );
                          },
                          child: Container(
                              margin: EdgeInsets.symmetric(horizontal: 20),
                              child: workExperience
                                  ? _getWorkExperienceWidget()
                                  : Blur(
                                      blur: 5.5,
                                      blurColor: Colors.green,
                                      borderRadius: BorderRadius.circular(15),
                                      child: _getWorkExperienceWidget(),
                                    )))
                      : Container(),
                  SizedBox(
                    height: 10,
                  ),
                  resumseInfoResponse['data']['skills'].length > 0
                      ? GestureDetector(
                          onTap: () {
                            setState(() {
                              skills = !skills;
                            });

                            getUpdateResumePrivate({
                              "Skills": skills ? 1 : 0,
                              "Work": workExperience ? 1 : 0,
                              "Email": 1,
                              "Score": 1,
                              "Edu": education ? 1 : 0,
                              "Name": 1,
                              "Phone": 1,
                              "Place": 1,
                              "Rating": 1,
                              "Intro": 1,
                              "Comment": 1
                              // "work": work,
                              // "edu": edu
                            });
                            // channel.sink.add(json.encode({
                            //   "type": "5",
                            //   "recUserId": widget.userId,
                            //   "msg": "successfully qr code scan",
                            //   "data": "update"
                            // }));
                          },
                          child: Container(
                              margin: EdgeInsets.symmetric(horizontal: 20),
                              child: skills
                                  ? _getSkillWidget()
                                  : Blur(
                                      blur: 5.5,
                                      blurColor: Colors.green,
                                      borderRadius: BorderRadius.circular(15),
                                      child: _getSkillWidget(),
                                    )))
                      : Container(),

                  SizedBox(
                    height: 40,
                  ),
                ],
              ))
            : Center(child: CircularProgressIndicator()));
  }

  Widget _getEducationWidget() {
    return Container(
      padding: EdgeInsets.all(15),
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
            height: 11,
          ),
          Row(
            children: [
              Text(
                '${resumseInfoResponse['data']['edu'].length > 0 && resumseInfoResponse['data']['edu'][0]['school'] != null ? resumseInfoResponse['data']['edu'][0]['school'] : ' '}',
                //'Harvard University',
                style: GoogleFonts.roboto(
                    fontWeight: FontWeight.w400,
                    fontSize: 12,
                    color: AppColors.DARK_GREY),
              ),
              Expanded(
                child: Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    '${resumseInfoResponse['data']['edu'].length > 0 ? DateTime.parse(resumseInfoResponse['data']['edu'][0]['timePeriodEnd'] != null ? resumseInfoResponse['data']['edu'][0]['timePeriodEnd'] : '').toLocal() : ''}',
                    style: GoogleFonts.roboto(
                        fontWeight: FontWeight.w400,
                        fontSize: 12,
                        color: AppColors.DARK_GREY),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget getProgressWidget() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 20),
      height: 100,
      decoration: BoxDecoration(
        color: AppColors.FORM_GREY,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              child: Row(
                children: [
                  SizedBox(
                    width: 11,
                  ),
                  Expanded(
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Align(
                          alignment: Alignment.topCenter,
                          child: Container(
                            margin: EdgeInsets.only(top: 20),
                            child: Stack(
                              children: [
                                Container(
                                  child: Image(
                                      image: AssetImage(AppImages.FULL_ARC)),
                                ),
                                Container(
                                  child: Image(
                                      image: AssetImage(AppImages.SEMI_ARC)),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Center(
                          child: Container(
                            margin: EdgeInsets.only(top: 20),
                            child: Image(
                              image: AssetImage(AppImages.SMILEY),
                              height: 47,
                              width: 47,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    width: 11,
                  ),
                  Expanded(
                    child: Text(
                      '2.5',
                      style: GoogleFonts.roboto(
                          fontWeight: FontWeight.w700,
                          fontSize: 28,
                          color: Colors.black),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: Container(
              child: Stack(
                children: [
                  Align(
                    alignment: Alignment.bottomLeft,
                    child: Container(
                      margin:
                          EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text(
                                '5',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Expanded(
                                child: Container(
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: Colors.blue,
                                  ),
                                ),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                '5',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                '4',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Expanded(
                                child: Container(
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: Colors.blue.withOpacity(0.8),
                                  ),
                                ),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                '10',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 20,
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                '3',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Expanded(
                                child: Container(
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: Colors.blue.withOpacity(0.7),
                                  ),
                                ),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                '14',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 10,
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                '2',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Expanded(
                                child: Container(
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: Colors.blue.withOpacity(0.5),
                                  ),
                                ),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                '14',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                '1',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Expanded(
                                child: Container(
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: Colors.blue.withOpacity(0.4),
                                  ),
                                ),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                '14',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 20,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _getSkillWidget() {
    var cindex = 0;
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
                      itemCount: resumseInfoResponse['data']['skills'].length,
                      scrollDirection: Axis.horizontal,
                      itemBuilder: (BuildContext context, int index) {
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
                          margin: EdgeInsets.only(right: 20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: color),
                          ),
                          child: Column(
                            children: [
                              Container(
                                height: 48,
                                width: 48,
                                margin: EdgeInsets.only(top: 15),
                                decoration: BoxDecoration(
                                  color: color,
                                  borderRadius: BorderRadius.circular(15),
                                ),
                                child: Center(
                                  child: Text(
                                    "${resumseInfoResponse['data']['skills'][index]['chooseSkills'] != null ? resumseInfoResponse['data']['skills'][index]['chooseSkills'] : ""}",
                                    style: GoogleFonts.roboto(
                                        color: Colors.white,
                                        fontSize: 9,
                                        fontWeight: FontWeight.w400),
                                  ),
                                ),
                              ),
                              SizedBox(
                                height: 12,
                              ),
                              Text(
                                "${resumseInfoResponse['data']['skills'][index]['chooseSkills'] != null ? resumseInfoResponse['data']['skills'][index]['chooseSkills'] : ""}",
                                style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w400),
                              ),
                              SizedBox(
                                height: 4,
                              ),
                              Text(
                                '${resumseInfoResponse['data']['skills'][index]['skillExperience']}',
                                style: GoogleFonts.roboto(
                                    color: AppColors.DARK_GREY,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w400),
                              ),
                            ],
                          ),
                        );
                      }),
                )
              : Container(),
        ],
      ),
    );
  }

  Widget _getWorkExperienceWidget() {
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
                '${resumseInfoResponse['data']['work'].length > 0 && resumseInfoResponse['data']['work'][0]['companyName'] != null ? resumseInfoResponse['data']['work'][0]['companyName'] : ""}',
                // 'linyi shengming timber co.ltd',
                style: GoogleFonts.roboto(
                    fontWeight: FontWeight.w400,
                    fontSize: 12,
                    color: AppColors.DARK_GREY),
              ),
              Expanded(
                child: Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    '${resumseInfoResponse['data']['work'].length > 0 ? DateTime.parse(resumseInfoResponse['data']['work'][0]['workDataEnd'] != null ? resumseInfoResponse['data']['work'][0]['workDataEnd'] : "").toLocal() : ''}',
                    style: GoogleFonts.roboto(
                        fontWeight: FontWeight.w400,
                        fontSize: 12,
                        color: AppColors.DARK_GREY),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(
            height: 5,
          ),
          Text(
            '${resumseInfoResponse['data']['work'].length > 0 && resumseInfoResponse['data']['work'][0]['workPosition'] != null ? resumseInfoResponse['data']['work'][0]['workPosition'] : ""}',
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
            '${resumseInfoResponse['data']['work'][0]['workDescription']}',
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
    // var _key;
    // return SlideAction(
    //     key: _key,
    //     onSubmit: () {
    //       Future.delayed(
    //         Duration(seconds: 1),
    //         () => _key.currentState.reset(),
    //       );

    return SliderButton(
      action: () {
        Container(
          padding: EdgeInsets.all(15),
          margin: EdgeInsets.symmetric(horizontal: 20),
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
                  Row(
                    children: [
                      Image(
                        image: AssetImage(AppImages.BLACK_COMMENTS),
                        height: 20,
                        width: 20,
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Text(
                        'Recent comments',
                        style: GoogleFonts.roboto(
                            color: Colors.black,
                            fontSize: 18,
                            fontWeight: FontWeight.w400),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () {
                      log('Received Comment qr profile');
                      Get.to(() => RecentCommentsPage(
                            fromScannedQr: true,
                            userId: widget.userId,
                          ));
                      //Get.to(() => RecentCommentsPage());
                    },
                    child: Row(
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
                ],
              ),
              SizedBox(
                height: 11,
              ),
              Row(
                children: [
                  Image(
                    image: AssetImage(
                      AppImages.face_confirm,
                    ),
                    height: 30,
                    width: 30,
                  ),
                  SizedBox(
                    width: 11,
                  ),
                  Text(
                    'Jason',
                    style: GoogleFonts.roboto(
                        fontWeight: FontWeight.w400,
                        fontSize: 16,
                        color: Colors.black),
                  ),
                  Expanded(
                    child: Align(
                      alignment: Alignment.centerRight,
                      child: Text(
                        '2020/11/30 12:35:24',
                        style: GoogleFonts.roboto(
                            fontWeight: FontWeight.w400,
                            fontSize: 14,
                            color: AppColors.DARK_GREY),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(
                height: 10,
              ),
              Text(
                "${resumseInfoResponse['data']['comment']}",
                //'A very friendly person helped me solve many problems that I couldn\'t solve for a long time, and became a good friend.',
                style: GoogleFonts.roboto(
                  color: Colors.grey,
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        );
      },
      label: Text(
        "Slide to Unlock",
        style: TextStyle(
            color: Color(0xff4a4a4a),
            fontWeight: FontWeight.w500,
            fontSize: 17),
      ),
      // child: Container(
      //   padding: EdgeInsets.all(15),
      //   margin: EdgeInsets.symmetric(horizontal: 20),
      //   decoration: BoxDecoration(
      //     color: AppColors.FORM_GREY,
      //     borderRadius: BorderRadius.circular(15),
      //   ),
      //   width: double.infinity,
      //   child: Column(
      //     children: [
      //       Row(
      //         mainAxisAlignment: MainAxisAlignment.spaceBetween,
      //         children: [
      //           Row(
      //             children: [
      //               Image(
      //                 image: AssetImage(AppImages.BLACK_COMMENTS),
      //                 height: 20,
      //                 width: 20,
      //               ),
      //               SizedBox(
      //                 width: 10,
      //               ),
      //               Text(
      //                 'Recent comments',
      //                 style: GoogleFonts.roboto(
      //                     color: Colors.black,
      //                     fontSize: 18,
      //                     fontWeight: FontWeight.w400),
      //               ),
      //             ],
      //           ),
      //           TextButton(
      //             onPressed: () {
      //               Get.to(() => RecentCommentsPage());
      //               //Get.to(() => RecentCommentsPage());
      //             },
      //             child: Row(
      //               children: [
      //                 Text(
      //                   'More ',
      //                   style: GoogleFonts.roboto(
      //                       color: AppColors.LIGHT_GREY,
      //                       fontSize: 12,
      //                       fontWeight: FontWeight.w400),
      //                 ),
      //                 Icon(
      //                   Icons.arrow_forward_ios_rounded,
      //                   size: 18,
      //                   color: AppColors.LIGHT_GREY,
      //                 ),
      //               ],
      //             ),
      //           ),
      //         ],
      //       ),
      //       SizedBox(
      //         height: 11,
      //       ),
      //       Row(
      //         children: [
      //           Image(
      //             image: AssetImage(
      //               AppImages.face_confirm,
      //             ),
      //             height: 30,
      //             width: 30,
      //           ),
      //           SizedBox(
      //             width: 11,
      //           ),
      //           Text(
      //             'Jason',
      //             style: GoogleFonts.roboto(
      //                 fontWeight: FontWeight.w400,
      //                 fontSize: 16,
      //                 color: Colors.black),
      //           ),
      //           Expanded(
      //             child: Align(
      //               alignment: Alignment.centerRight,
      //               child: Text(
      //                 '2020/11/30 12:35:24',
      //                 style: GoogleFonts.roboto(
      //                     fontWeight: FontWeight.w400,
      //                     fontSize: 14,
      //                     color: AppColors.DARK_GREY),
      //               ),
      //             ),
      //           ),
      //         ],
      //       ),
      //       SizedBox(
      //         height: 10,
      //       ),
      //       Text(
      //         "${resumseInfoResponse['data']['comment']}",
      //         //'A very friendly person helped me solve many problems that I couldn\'t solve for a long time, and became a good friend.',
      //         style: GoogleFonts.roboto(
      //           color: Colors.grey,
      //           fontSize: 14,
      //           fontWeight: FontWeight.w400,
      //         ),
      //       ),
      //     ],
      //   ),
      // ),
    );
  }

  Widget getUserAboutWidget(String title, Widget icon) {
    return Row(
      children: [
        icon,
        SizedBox(
          width: 9,
        ),
        Text(
          title,
          style: GoogleFonts.roboto(
              color: AppColors.BLACK_SHADE,
              fontSize: 14,
              fontWeight: FontWeight.w400),
        ),
      ],
    );
  }
}
