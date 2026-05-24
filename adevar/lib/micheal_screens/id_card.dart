import 'dart:async';
import 'dart:convert';
import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get/get_instance/get_instance.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/micheal_widgets/education.dart';
import 'package:highfedilityadevar/micheal_widgets/skills.dart';
import 'package:highfedilityadevar/micheal_widgets/slide_to_lock_card.dart';
import 'package:highfedilityadevar/micheal_widgets/work.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:intl/intl.dart';
import 'package:web_socket_channel/io.dart';

import '../consts/app_images.dart';
import '../micheal_widgets/rating_card.dart';
import '../micheal_widgets/recent_comments.dart';
import '../micheal_widgets/slide_to_view_card.dart';
import '../views/pages/adavar_qr/adavar_qr_page.dart';

class IdCard extends StatefulWidget {
  final pagename;
  final userId;

  const IdCard({
    Key? key,
    this.pagename,
    this.userId,
  }) : super(key: key);

  @override
  State<IdCard> createState() => _IdCardState();
}

class _IdCardState extends State<IdCard> with BaseClass {
  bool education = false;
  bool workExperience = false;
  bool skills = false;
  bool comment = false;
  bool rating = false;
  var selectedUser = null;
  var userList = [];
  IOWebSocketChannel? channel;
  late Timer timer;

  @override
  void initState() {
    super.initState();
    log('User ID : ${widget.userId}'); //1542107610894909442
    WidgetsBinding.instance!.addPostFrameCallback((_) {
      socketConnection();
    });

    // if (widget.pagename == "Private") {
    //   getMyOwnResume();
    //   // getLockAndUnLoackProfile(widget.userId);
    // } else {
    getMyOwnResume();
    if (widget.pagename == "Private") {
      getlookingAtMyResumeUser(widget.userId);
    } else {
      getResumeUsers();
    }
    timer = Timer.periodic(Duration(minutes: 3), (timer) {
      // if (channel!.closeCode != null) {
      log('\x1b[97m Socket Reconnect');
      socketConnection();
      // }
    });

    // getresmuseInfo(widget.userId);
    // }
  }

  @override
  void dispose() {
    channel!.sink.close();
    timer.cancel();
    super.dispose();
  }

  socketConnection() {
    _getSharedPref.getUserData().then((value) {
      channel = IOWebSocketChannel.connect(
          'wss://mobapis.adevar.app/websocket/infoCar/${value.authToken}');

      channel!.stream.listen((message) {
        channel!.innerWebSocket!.pingInterval = const Duration(seconds: 30);
        // channel!.innerWebSocket!.pingInterval!.inMinutes;

        var data = json.decode(message);
        // channel!.innerWebSocket!.done
        //     .then((value) => print("DONE============================="));
        if (data['data'] == "update") {
          if (widget.pagename == "Private") {
            getlookingAtMyResumeUser(widget.userId);
            // getMyOwnResume();
          } else {
            getResumeUsers();
            // getresmuseInfo(widget.userId);
          }
        }
        // channel.sink.add('received!');
      });
      setState(() {
        userDataModel = value;
      });
    });
  }

  var lookingAtMyResumeUseResponse;
  var myOwnResumeResponse;
  var resumseInfoResponse;
  var lookingAtMyResume;

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  void getlookingAtMyResumeUser(userId) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    var response = await ApiService.get(
      //"/socialContact/resume/getMyOwnResume?lang=en_US",
      "/socialContact/resume/lookingAtMyResumeUserByUserId?userId=$userId&lang=en_US",
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );

    setState(() {
      rating = response['data']['authJson']['Rating'].toString() == '1';
      comment = response['data']['authJson']['Comment'].toString() == '1';
      education = response['data']['authJson']['Edu'].toString() == '1';
      workExperience = response['data']['authJson']['Work'].toString() == '1';
      skills = response['data']['authJson']['Skills'].toString() == '1';
      // lookingAtMyResumeUseResponse = response;
    });
  }

  void getMyOwnResume() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    var response = await ApiService.get(
      "/socialContact/resume/getMyOwnResume?lang=en_US",
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );

    setState(() {
      resumseInfoResponse = response;
    });
    print("\x1b[97m Id card resume response $resumseInfoResponse");
  }

  // /socialContact/resume/lookingAtMyResumeUser?page=1&size=10&lang={{lang}}
  void getResumeUsers() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    var response = await ApiService.get(
      "socialContact/resume/lookingAtMyResumeUser?page=1&size=10&lang=en_US",
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );

    print("\x1b[97m Get Resume User Id $response");
    if (response['items'] != null) {
      setState(() {
        userList = response['items'];
        selectedUser = response['items'][0]['userId'];
        print("\x1b[97m Auth json${response['items'][0]['authJson']}");
      });
      // for (int i = 0; i < response['items'].length; i++) {
      //   log('Resume data $i  \x1b[97m${response['items'][i]}');
      // }
      if (response['items'][0] != null &&
          response['items'][0]['authJson'] != null) {
        setState(() {
          rating = response['items'][0]['authJson']['Rating'].toString() == '1';
          comment =
              response['items'][0]['authJson']['Comment'].toString() == '1';
          education = response['items'][0]['authJson']['Edu'].toString() == '1';
          workExperience =
              response['items'][0]['authJson']['Work'].toString() == '1';
          skills = response['items'][0]['authJson']['Skills'].toString() == '1';
        });
      }
    }
  }

  void getUpdateResumePrivate(_params) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    print("_params  ==>> $_params");
    var response = await ApiService.put(
      "socialContact/resume/updateResumePrivateAuth?lang=en_US&guestUserId=${widget.pagename == "Private" ? widget.userId : selectedUser}&lang=en_US",
      body: jsonEncode(_params),
      headerMap: {
        // "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );
    if (response['flag'] == false) {
      showError(title: 'Error', message: response['msg'].toString());
    }
    log('---$response');
    // channel.sink.add(json.encode({
    //   "type": "5",
    //   "recUserId": widget.pagename == "Private" ? widget.userId : selectedUser,
    //   "msg": "successfully qr code scan",
    //   "data": "update"
    // }));
  }

  // void getLockAndUnLoackProfile(userId) async {
  //   UserDataModel userDataModel = await _getSharedPref.getUserData();

  //   var response = await ApiService.get(
  //     "/socialContact/resume/getMyLookAtPermission?userId=$userId",
  //     headerMap: {
  //       "Content-Type": "application/json",
  //       "Authorization": userDataModel.authToken.toString(),
  //     },
  //   );
  //   print("\x1b[97m ID Card $response");

  //   if (response['data'] != null && response['data']['authJson'] != null) {
  //     // getresmuseInfo(userId);
  //     setState(() {
  //       rating = response['data']['authJson'].containsKey('Rating')
  //           ? response['data']['authJson']['Rating'] == 1
  //           : false;
  //       comment = response['data']['authJson'].containsKey('Comment')
  //           ? response['data']['authJson']['Comment'] == 1
  //           : false;
  //       education = response['data']['authJson'].containsKey('Edu')
  //           ? response['data']['authJson']['Edu'] == 1
  //           : false;
  //       workExperience = response['data']['authJson'].containsKey('Work')
  //           ? response['data']['authJson']['Work'] == 1
  //           : false;
  //       skills = response['data']['authJson'].containsKey('Skills')
  //           ? response['data']['authJson']['Skills'] == 1
  //           : false;
  //     });
  //   }
  // }

  void getresmuseInfo(userId) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    var response = await ApiService.get(
      // "/socialContact/resume/getMyOwnResume?lang=en_US",
      "/socialContact/resume/getResumeInfo?infoOwnerUserId=$userId&lang=en_US",
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );
    print("resumseInfoResponse-- $response");
    if (response['data'] != null) {
      setState(() {
        resumseInfoResponse = response;
      });
    }
  }

  //int selectedProfile = 0;

  @override
  Widget build(BuildContext context) {
    var now = new DateTime.now();
    var formatter = new DateFormat('yyyy-MM-dd');
    String formatted = formatter.format(now);
    return Scaffold(
      //backgroundColor: Color(0xFF4ACE7F).withOpacity(0.5),
      appBar: AppBar(
        title: Text('ID Card'),
        backgroundColor: Color(0xFF0078D4),
        iconTheme: IconThemeData(
          color: Colors.white,
        ),
      ),
      body: resumseInfoResponse != null
          ? SingleChildScrollView(
              child: Container(
                color: Colors.white,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      height: 20,
                    ),

                    /// Story Profiles
                    widget.pagename == "Public"
                        ? Container(
                            // color: Colors.blue,
                            padding: EdgeInsets.symmetric(horizontal: 20),
                            height: 140,

                            // decoration: BoxDecoration(
                            //   color: AppColors.FORM_GREY,
                            //   borderRadius: BorderRadius.circular(15),
                            // ),
                            child: Stack(
                              children: [
                                // Align(
                                //   alignment: Alignment.centerRight,
                                //   child: GestureDetector(
                                //     onTap: () {},
                                //     child: Container(
                                //       margin: EdgeInsets.only(right: 20),
                                //       child: Image(
                                //         image: AssetImage(
                                //             AppImages.ME_BACKGROUND),
                                //       ),
                                //     ),
                                //   ),
                                // ),
                                Container(
                                  margin: EdgeInsets.only(top: 5, left: 5),
                                  child: ListView.builder(
                                    itemCount: userList.length,
                                    shrinkWrap: true,
                                    padding: EdgeInsets.all(10),
                                    scrollDirection: Axis.horizontal,
                                    itemBuilder: (context, index) {
                                      return InkWell(
                                        onTap: () {
                                          setState(() {
                                            //  selectedProfile = index;
                                            selectedUser =
                                                userList[index]['userId'];

                                            rating = userList[index]['authJson']
                                                        ['Rating']
                                                    .toString() ==
                                                '1';
                                            comment = userList[index]
                                                        ['authJson']['Comment']
                                                    .toString() ==
                                                '1';
                                            education = userList[index]
                                                        ['authJson']['Edu']
                                                    .toString() ==
                                                '1';
                                            workExperience = userList[index]
                                                        ['authJson']['Work']
                                                    .toString() ==
                                                '1';
                                            skills = workExperience =
                                                userList[index]['authJson']
                                                            ['Skills']
                                                        .toString() ==
                                                    '1';
                                          });

                                          // showDialog(
                                          //   context: context,
                                          //   builder: (context) {
                                          //     return InvitationCallDialog();
                                          //   },
                                          // );
                                        },
                                        child: Column(
                                          children: [
                                            userList[index]['logo'] != null
                                                ? CircleAvatar(
                                                    radius: selectedUser ==
                                                            userList[index]
                                                                ['userId']
                                                        ? 40
                                                        : 33,
                                                    backgroundColor:
                                                        selectedUser ==
                                                                userList[index]
                                                                    ['userId']
                                                            ? Colors.green
                                                            : Colors
                                                                .transparent,
                                                    child: CircleAvatar(
                                                      radius: selectedUser ==
                                                              userList[index]
                                                                  ['userId']
                                                          ? 36
                                                          : 30,
                                                      backgroundImage:
                                                          NetworkImage(
                                                        userList[index]['logo'],
                                                      ),
                                                      //NetworkImage(
                                                      //  'https://picsum.photos/200/200?random=2',
                                                      //  ),
                                                    ),
                                                  )
                                                : Container(
                                                    height: 60,
                                                    width: 60,
                                                    alignment: Alignment.center,
                                                    decoration: BoxDecoration(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              50),
                                                      border: Border.all(
                                                          color: Colors.blue),
                                                    ),
                                                    child: Padding(
                                                      padding:
                                                          const EdgeInsets.all(
                                                              8.0),
                                                      child: Text("No Image"),
                                                    ),
                                                  ),
                                            SizedBox(
                                              height: 5,
                                            ),
                                            selectedUser ==
                                                    userList[index]['userId']
                                                ? Text(
                                                    "${userList[index].containsKey('firstName') ? userList[index]['firstName'] : ""}",
                                                    style: TextStyle(
                                                      fontSize: 18,
                                                      // fontWeight: FontWeight.bold,
                                                    ),
                                                  )
                                                : Column(
                                                    children: [
                                                      Text(
                                                        "${userList[index].containsKey('firstName') ? userList[index]['firstName'] : ""}",
                                                        style: TextStyle(
                                                          fontSize: 14,
                                                          // fontWeight: FontWeight.bold,
                                                        ),
                                                      ),
                                                      // Text(
                                                      //   'ID: ${userList[index]['userId']}',
                                                      //   style: TextStyle(
                                                      //     fontSize: 12,
                                                      //   ),
                                                      // ),
                                                      userList[index]['online'] !=
                                                                  null &&
                                                              userList[index][
                                                                      'online'] !=
                                                                  "unknown"
                                                          ? Text(
                                                              userList[index][
                                                                          'online'] !=
                                                                      null
                                                                  ? '${userList[index]['online']}'
                                                                  : "",
                                                              style: TextStyle(
                                                                fontSize: 12,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w500,
                                                              ),
                                                            )
                                                          : Container(),
                                                    ],
                                                  ),
                                          ],
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          )
                        : Container(
                            height: 200,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: AppColors.FORM_GREY,
                              borderRadius: BorderRadius.circular(15),
                            ),
                            margin: EdgeInsets.only(left: 20, right: 20),
                            child: Stack(
                              children: [
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: GestureDetector(
                                    onTap: () {},
                                    child: Container(
                                      margin: EdgeInsets.only(right: 20),
                                      child: Image(
                                        image:
                                            AssetImage(AppImages.ME_BACKGROUND),
                                      ),
                                    ),
                                  ),
                                ),
                                Container(
                                  height: 194,
                                  // decoration: BoxDecoration(
                                  //   color: AppColors.FORM_GREY,
                                  //   borderRadius: BorderRadius.circular(15),
                                  // ),
                                  padding: EdgeInsets.all(15),
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
                                              borderRadius:
                                                  BorderRadius.circular(50),
                                              child: Image.network(
                                                "${resumseInfoResponse['data']['logo']}",
                                                height: 70,
                                                width: 70,
                                                fit: BoxFit.fill,
                                              ),
                                            ),
                                            // ClipRRect(
                                            //   borderRadius:
                                            //   BorderRadius.circular(50),
                                            //   child: Image.network(
                                            //     "${resumseInfoResponse['data']['logo']}",
                                            //     height: 70,
                                            //     width: 70,
                                            //   ),
                                            // ),
                                            SizedBox(
                                              width: 14,
                                            ),
                                            Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  "${resumseInfoResponse['data']['name'] != null && resumseInfoResponse['data']['name'].containsKey('firstName') ? resumseInfoResponse['data']['name']['firstName'] : ""}",
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
                                                  'ID：${resumseInfoResponse['data']['userId']}',
                                                  style: GoogleFonts.roboto(
                                                    color: AppColors
                                                        .NOTIFICATION_GREY,
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
                                                        decoration:
                                                            BoxDecoration(
                                                          borderRadius:
                                                              BorderRadius
                                                                  .circular(7),
                                                          gradient: LinearGradient(
                                                              colors: [
                                                                AppColors
                                                                    .LIGHT_ORANGE,
                                                                AppColors
                                                                    .DARK_ORANGE
                                                              ],
                                                              begin:
                                                                  const FractionalOffset(
                                                                      0.0, 0.0),
                                                              end:
                                                                  const FractionalOffset(
                                                                      0.5, 0.0),
                                                              stops: [0.0, 1.0],
                                                              tileMode: TileMode
                                                                  .clamp),
                                                        ),
                                                        child: Center(
                                                          child: Text(
                                                            'Personal', // "${resumseInfoResponse['data']['vipLv']}",
                                                            style: GoogleFonts
                                                                .roboto(
                                                              color: AppColors
                                                                  .NOTIFICATION_GREY,
                                                              fontSize: 10,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w400,
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                      SizedBox(
                                                        height: 25,
                                                      ),
                                                      // Text(
                                                      //   "注册日期：${formatter.format(DateTime.parse(resumseInfoResponse['data']['registerDate']))}",
                                                      //   style: GoogleFonts.roboto(
                                                      //     color: AppColors
                                                      //         .NOTIFICATION_GREY,
                                                      //     fontSize: 10,
                                                      //     fontWeight:
                                                      //         FontWeight.w400,
                                                      //   ),
                                                      // ),
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
                                      Expanded(
                                        child: Container(
                                          child: Row(
                                            children: [
                                              Expanded(
                                                flex: 2,
                                                child: getUserAboutWidget(
                                                  //  'UX Designer',
                                                  '${resumseInfoResponse['data']['position']}',
                                                  Image(
                                                    image: AssetImage(
                                                        AppImages.USER),
                                                    height: 18,
                                                    width: 18,
                                                    color:
                                                        AppColors.BLACK_SHADE,
                                                  ),
                                                ),
                                              ),
                                              Expanded(
                                                child: getUserAboutWidget(
                                                    //'Henan.China',
                                                    "${resumseInfoResponse['data']['place']['state']}.${resumseInfoResponse['data']['place']['country']}",
                                                    Icon(
                                                      Icons.language,
                                                      color:
                                                          AppColors.BLACK_SHADE,
                                                      size: 18,
                                                    )),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),

                    SizedBox(
                      height: 20,
                    ),

                    /// Profile Information
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      decoration: BoxDecoration(
                        //color: Colors.white,
                        color: Color(0xFF4ACE7F).withOpacity(0.5),
                        borderRadius: BorderRadius.only(
                            // topLeft: Radius.circular(5),
                            // topRight: Radius.circular(16),
                            ),
                      ),
                      child: Column(
                        children: [
                          Container(
                            height: 5,
                          ),
                          rating
                              ? SlideToLock(
                                  height: 100,
                                  dismis: () {
                                    setState(() {
                                      rating = !rating;
                                    });
                                    updatePermission();
                                  },
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    // padding: EdgeInsets.symmetric(
                                    //     horizontal: 4, vertical: 4),
                                    child: RatingCard(
                                      height: 100,
                                      resumseInfoResponse: resumseInfoResponse,
                                    ),
                                  ),
                                )
                              : SlideToViewCard(
                                  height: 100,
                                  dismis: () {
                                    setState(() {
                                      rating = !rating;
                                    });
                                    updatePermission();
                                  },
                                  child: RatingCard(
                                    height: 100,
                                    resumseInfoResponse: resumseInfoResponse,
                                  ),
                                ),
                          Container(
                            height: 5,
                          ),
                          comment
                              ? SlideToLock(
                                  height: 140,
                                  dismis: () {
                                    setState(() {
                                      comment = !comment;
                                    });
                                    updatePermission();
                                  },
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    // padding: EdgeInsets.symmetric(
                                    //     horizontal: 4, vertical: 4),
                                    child: RecentComments(
                                      height: 140,
                                      resumseInfoResponse: resumseInfoResponse,
                                    ),
                                  ),
                                )
                              : SlideToViewCard(
                                  height: 140,
                                  dismis: () {
                                    setState(() {
                                      comment = !comment;
                                    });
                                    updatePermission();
                                  },
                                  child: RecentComments(
                                    resumseInfoResponse: resumseInfoResponse,
                                    height: 140,
                                  ),
                                ),
                          Container(
                            height: 5,
                          ),
                          education
                              ? SlideToLock(
                                  height: 90,
                                  dismis: () {
                                    setState(() {
                                      education = !education;
                                    });
                                    updatePermission();
                                  },
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    // padding: EdgeInsets.symmetric(
                                    //     horizontal: 4, vertical: 4),
                                    child: Education(
                                      height: 90,
                                      resumseInfoResponse: resumseInfoResponse,
                                    ),
                                  ),
                                )
                              : SlideToViewCard(
                                  height: 90,
                                  dismis: () {
                                    setState(() {
                                      education = !education;
                                    });
                                    updatePermission();
                                  },
                                  child: Education(
                                    resumseInfoResponse: resumseInfoResponse,
                                    height: 90,
                                  ),
                                ),
                          Container(
                            height: 5,
                          ),
                          workExperience
                              ? SlideToLock(
                                  height: 140,
                                  dismis: () {
                                    setState(() {
                                      workExperience = !workExperience;
                                    });
                                    updatePermission();
                                  },
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    // padding: EdgeInsets.symmetric(
                                    //     horizontal: 4, vertical: 4),
                                    child: Work(
                                      height: 140,
                                      resumseInfoResponse: resumseInfoResponse,
                                    ),
                                  ),
                                )
                              : SlideToViewCard(
                                  height: 140,
                                  dismis: () {
                                    setState(() {
                                      workExperience = !workExperience;
                                    });
                                    updatePermission();
                                  },
                                  child: Work(
                                    resumseInfoResponse: resumseInfoResponse,
                                    height: 140,
                                  ),
                                ),
                          Container(
                            height: 5,
                          ),
                          skills
                              ? SlideToLock(
                                  height: 200,
                                  dismis: () {
                                    setState(() {
                                      skills = !skills;
                                    });
                                    updatePermission();
                                  },
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    // padding: EdgeInsets.symmetric(
                                    //     horizontal: 4, vertical: 4),
                                    child: Skills(
                                      height: 200,
                                      resumseInfoResponse: resumseInfoResponse,
                                    ),
                                  ),
                                )
                              : SlideToViewCard(
                                  height: 200,
                                  dismis: () {
                                    setState(() {
                                      skills = !skills;
                                    });
                                    updatePermission();
                                  },
                                  child: Skills(
                                    resumseInfoResponse: resumseInfoResponse,
                                    height: 200,
                                  ),
                                ),
                          Container(
                            height: 50,
                          ),
                        ],
                      ),
                    )
                  ],
                ),
              ),
            )
          : Center(child: CircularProgressIndicator()),
    );
  }

  updatePermission() {
    getUpdateResumePrivate({
      "Email": 1,
      "Work": workExperience ? 1 : 0,
      // "Score": score ? 1 : 0,
      "Edu": education ? 1 : 0,
      "Name": 1,
      "Phone": 1,
      "Skills": skills ? 1 : 0,
      "Place": 1,
      "Rating": rating ? 1 : 0,
      "Intro": 1,
      "Comment": comment ? 1 : 0,

      // "Skills": Skills,
      // "Work": work
    });
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
