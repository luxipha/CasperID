import 'dart:convert';
import 'dart:developer';

import 'package:carousel_slider/carousel_slider.dart';

import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:highfedilityadevar/controllers/write_something/write_something_controller.dart';
import 'package:highfedilityadevar/micheal_screens/id_card.dart';
import 'package:highfedilityadevar/models/public_qr_portfolio_page/public_qr_portfolio_page_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/bottom_sheets/site_invitation/site_invitation_widget.dart';
import 'package:highfedilityadevar/views/pages/adavar_qr_profile/adavar_qr_other_profile_page.dart';
import 'package:highfedilityadevar/views/pages/public_qr_portfolio/public_invite_controller.dart';
import 'package:http/http.dart' as http;
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/views/bottom_sheets/write_something/write_something_bottom_sheet.dart';
import 'package:highfedilityadevar/views/pages/adavar_qr_profile/adavar_qr_profile_page.dart';
import 'package:highfedilityadevar/views/widgets/expandable_floatin_icon.dart';
import 'package:qr_code_scanner/src/types/barcode.dart';
import 'package:simple_gesture_detector/simple_gesture_detector.dart';
import 'package:web_socket_channel/io.dart';

import '../../bottom_sheets/site_invitation/site_invitation_bottom_sheet.dart';

class PublicQrPortfolioPage extends StatefulWidget {
  // final result1;
  String userId;
  String portfolioUrl;
  final fromUpdateProfile;
  PublicQrPortfolioPage(
      {required this.portfolioUrl,
      required this.userId,
      required this.fromUpdateProfile});

  @override
  _PublicQrPortfolioPageState createState() => _PublicQrPortfolioPageState();
}

class _PublicQrPortfolioPageState extends State<PublicQrPortfolioPage>
    with BaseClass {
  int sliderIndex = 0;
  List<Widget> imageSliders = [];
  int _current = 0;
  var publicqrResponse;
  bool ischeck = false;
  bool isReal = false;
  bool isLike = false;
  bool isSucc = false;
  late PublicInviteController public;

  final WriteSomethingController _writeSomethingController =
      Get.isRegistered<WriteSomethingController>()
          ? Get.find<WriteSomethingController>()
          : Get.put(WriteSomethingController());

  final PublicInviteController _publicInviteController =
      Get.isRegistered<PublicInviteController>()
          ? Get.find<PublicInviteController>()
          : Get.put(PublicInviteController());

  late final SiteInvitationWidget _invitationWidget;
  var channel;
  @override
  void initState() {
    // TODO: implement initState
    super.initState();

    if (widget.fromUpdateProfile == "updateProfile" ||
        widget.fromUpdateProfile == "search") {
      getPortfolio();
    } else {
      getPortfolio();
      alreadyLike();
    }
  }

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  void getLikeUser(comment, {bool fromLike = false}) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    //print("_params  ==>> $_params");
    var response = await ApiService.post(
      "socialContact/comment/addComment?lang=en_US",
      params: ({
        "recUserId": widget.userId,
        "commentType": fromLike ? 1 : 2,
        "likeType": 1,
        "text": comment
      }),
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );

    if (response['flag'] == true) {
      _writeSomethingController.setConfirmed();
      ischeck = true;
      isLike = true;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text("${response['message']}"),
      ));
    } else {
      _writeSomethingController.setFailed();
      ischeck = false;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text("${response['message']}"),
      ));
    }
  }

  void alreadyLike() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    var response = await ApiService.get(
        "/socialContact/card/QRBusinessCard/${widget.userId}?lang=en_US",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": userDataModel.authToken.toString(),
        });

    if (response != null &&
        response['data'] != null &&
        response['data']['isLike'] == true) {
      setState(() {
        isLike = true;
      });
    } else if (response['data']['realPerson'] == null) {
      setState(() {
        isReal = true;
      });
    } else {
      isLike = false;
      isReal = false;
    }
    // setState(() {
    //   likeResponse = response;
    //   print("Like profile ===== >> $likeResponse");
    // });
  }

  void getInviteUser(invitation) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    //print("_params  ==>> $_params");
    var response = await ApiService.post(
      "socialContact/meeting/invite?lang=en_US",
      params: {
        "inviteUserId": widget.userId,
        "meetTime": DateTime.parse('${invitation['date']}')
            .millisecondsSinceEpoch, //int.parse(invitation['date']),

        "meetAddress": invitation['site'],
        "addressLatitude": "42.1",
        "addressLongitude": "27.5",
        "inviteText": invitation['comment']
      },
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );

    print('ABCDE------>>>>${response['flag']}');
    if (response['flag'] == true) {
      _publicInviteController.setConfirmed();
      setState(() {
        isSucc = true;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text("${response['message']}"),
      ));
    } else {
      _publicInviteController.setFailed(response['message']);
      setState(() {
        isSucc = false;
      });
      // showError(title: 'Error', message: response['message']);
      // ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      //   content: Text("${response['message']}"),
      // ));
    }
  }

  void getPortfolio() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    var response;
    var logosResponse;
    if (widget.fromUpdateProfile == "updateProfile") {
      response = await ApiService.get(
        "socialContact/resume/getMyOwnResume?lang=en_US",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": userDataModel.authToken.toString(),
        },
      );

      logosResponse = await ApiService.get(
        "/user/queryUserLogos?lang=en_US",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": userDataModel.authToken.toString(),
        },
      );
    } else {
      print("authorize token  ==>> ${userDataModel.authToken}");
      response = await ApiService.get(
        "${widget.portfolioUrl}?lang=en_US",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": userDataModel.authToken.toString(),
        },
      );
    }
    if (response['flag'] == true) {
      print("response----> $response");

      setState(() {
        publicqrResponse = response;
      });
      if (response['data']['logos'] != null &&
          response['data']['logos'].length > 0 &&
          widget.fromUpdateProfile != "updateProfile") {
        response['data']['logos'].forEach((image) => {
              imageSliders.add(ClipRRect(
                  borderRadius: BorderRadius.circular(30.0),
                  child: Container(
                    width: 250,
                    height: 400,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(30.0),
                    ),
                    child: Image.network(
                      '${image['bigLogoUrl']}',
                      // width: 250,
                      // height: 400,
                      fit: BoxFit.cover,
                    ),
                  )))
            });
      } else if (widget.fromUpdateProfile == "updateProfile") {
        // logosResponse
        if (logosResponse['data'] != null && logosResponse['data'].length > 0) {
          logosResponse['data'].forEach((image) => {
                imageSliders.add(ClipRRect(
                    borderRadius: BorderRadius.circular(30.0),
                    child: Container(
                      width: 250,
                      height: 400,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(30.0),
                      ),
                      child: Image.network(
                        '${image['bigLogoUrl']}',
                        // width: 250,
                        // height: 400,
                        fit: BoxFit.cover,
                        errorBuilder: (context, object, stackTrace) {
                          return Icon(Icons.error);
                        },
                      ),
                    )))
              });
        }
      }
    }
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        centerTitle: true,
      ),
      floatingActionButton: widget.fromUpdateProfile == "updateProfile"
          ? Offstage()
          : ExpendableFab(
              distance: 90.0,
              children: [
                ActionButton(
                  onPressed: () {
                    if (isReal != true) {
                      WriteSomethingBottomSheet()
                          .writeSomethingBottomSheet(context, (value) {
                        print('OnSubmit : $value');
                        // if (_writeSomethingController.getSubmittedStatus) {
                        //   _writeSomethingController.changeBackToFalse();
                        //   Get.back();
                        //
                        // } else {
                        getLikeUser(value);
                        // _writeSomethingController.setConfirmed();
                        // }
                      });
                    }
                  },
                  image: isReal == true
                      ? AppImages.COMMENT_DISABLE
                      : AppImages.DOC_CIRCLE,
                ),
                ActionButton(
                  onPressed: () {
                    if (isReal != true) {
                      SiteInvitationBottomSheet().sitInvitationBottomSheet(
                        context,
                        (value) {
                          getInviteUser(value);
                        },
                        isSucc,
                      );
                    }
                  },
                  image: isReal == true
                      ? AppImages.INVITE_DISABLE
                      : AppImages.PRINT_CIRCLE,
                ),
                ActionButton(
                  onPressed: () {
                    if (isReal != true) {
                      WriteSomethingBottomSheet()
                          .writeSomethingBottomSheet(context, (value) {
                        print('OnSubmit : $value');

                        // if (_writeSomethingController.getSubmittedStatus) {
                        //   _writeSomethingController.changeBackToFalse();
                        //   Get.back();
                        //
                        // } else {
                        getLikeUser(value, fromLike: true);
                        //   _writeSomethingController.setConfirmed();
                        // }
                      });
                    }
                  },
                  image: isReal == true
                      ? AppImages.LIKE_DISABLE
                      : isLike == false
                          ? AppImages.LIKE_QR
                          : AppImages.HEART_CIRCLE,
                ),
              ],
            ),
      body: Column(
        children: [
          Expanded(
            child: publicqrResponse != null
                ? SingleChildScrollView(
                    child: Container(
                      margin: EdgeInsets.only(left: 23, top: 10, right: 23),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Stack(
                            children: [
                              Container(
                                child: Image(
                                  image:
                                      AssetImage(AppImages.BLUE_LARGE_CIRCLE),
                                  width: 300,
                                  height: 300,
                                ),
                              ),
                              Container(
                                margin: EdgeInsets.only(top: 20),
                                child: CarouselSlider(
                                  items: imageSliders,
                                  options: CarouselOptions(
                                      autoPlay: false,
                                      height: 350,
                                      viewportFraction: 1.0,
                                      enlargeCenterPage: false,
                                      enableInfiniteScroll: false,
                                      onPageChanged: (index, reason) {
                                        setState(() {
                                          _current = index;
                                        });
                                      }),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(
                            height: 22,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: imageSliders.map((url) {
                              int index = imageSliders.indexOf(url);
                              return Container(
                                width: _current == index ? 40.0 : 25.0,
                                height: _current == index ? 3.0 : 3.0,
                                margin: EdgeInsets.symmetric(horizontal: 5.0),
                                decoration: BoxDecoration(
                                  shape: BoxShape.rectangle,
                                  //borderRadius: BorderRadius.circular(8),
                                  color: _current == index
                                      ? AppColors.BUTTON_COLOR
                                      : AppColors.FORM_GREY,
                                ),
                              );
                            }).toList(),
                          ),
                          SizedBox(
                            height: 27,
                          ),
                          Text(
                            publicqrResponse['data']['position'] ?? "",
                            // 'Blogger / writer',
                            textAlign: TextAlign.start,
                            style: GoogleFonts.roboto(
                                color: Colors.grey,
                                decoration: TextDecoration.none,
                                fontSize: 14,
                                fontWeight: FontWeight.w400),
                          ),
                          Row(
                            children: [
                              Text(
                                publicqrResponse['data']['firstName'] == null
                                    ? publicqrResponse['data']['name']
                                            ['firstName'] ??
                                        ""
                                    : publicqrResponse['data']['firstName'],
                                // 'Angela Adams',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    decoration: TextDecoration.none,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w400),
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              publicqrResponse['data']['badgeUrl'] != null
                                  ? Image.network(
                                      '${publicqrResponse['data']['badgeUrl']}',
                                      height: 50,
                                      width: 50,
                                    )
                                  : Text(""),
                              // Image(
                              //   image: AssetImage(AppImages.GOLD_BADGE),
                              //   height: 50,
                              //   width: 50,
                              // )
                            ],
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          Text(
                            publicqrResponse['data']['introduction'] == null
                                ? publicqrResponse['data']['intro'] ?? ""
                                : publicqrResponse['data']['introduction'],
                            //   'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ',
                            textAlign: TextAlign.start,
                            style: GoogleFonts.roboto(
                                color: Colors.grey,
                                decoration: TextDecoration.none,
                                fontSize: 14,
                                fontWeight: FontWeight.w400),
                          ),
                          SizedBox(
                            height: 40,
                          ),
                        ],
                      ),
                    ),
                  )
                : Center(
                    child: CircularProgressIndicator(),
                  ),
          ),
          Row(
            children: [
              Expanded(
                child: Container(
                  alignment: Alignment.bottomCenter,
                  child: SimpleGestureDetector(
                    onHorizontalSwipe: (value) async {
                      UserDataModel userDataModel =
                          await _getSharedPref.getUserData();
                      if (widget.fromUpdateProfile == "updateProfile" ||
                          widget.fromUpdateProfile == 'search') {
                        Navigator.of(context).push(
                          new MaterialPageRoute(
                            builder: (context) => AdavarQrOtherProfilePage(
                              widget.userId,
                              widget.fromUpdateProfile,
                            ),
                          ),
                        );
                      } else {
                        _getSharedPref.getUserData().then((value) {
                          channel = IOWebSocketChannel.connect(
                              'wss://mobapis.adevar.app/websocket/infoCar/${value.authToken}');

                          channel.stream.listen((message) {
                            channel.innerWebSocket!.pingInterval =
                                const Duration(seconds: 30);
                            print("connect ===-=-====-=-==>> $message");
                            channel.sink.add(
                              json.encode({
                                "type": "4",
                                "recUserId": widget.userId,
                                "msg": "successfully qr code scan",
                                "data": value.userId
                              }),
                            );
                          });
                        }).then((value) {
                          Get.to(
                            () => AdavarQrOtherProfilePage(widget.userId, ''),
                          );
                        });
                      }

                      // Get.to(() => AdavarQrOtherProfilePage(widget.result1['userId']));
                    },
                    child: Container(
                      width: 162,
                      height: 60,
                      margin: EdgeInsets.only(bottom: 20),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(30),
                        color: AppColors.BUTTON_COLOR,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Slide to view',
                            style: GoogleFonts.roboto(
                                color: Colors.white,
                                decoration: TextDecoration.none,
                                fontSize: 14,
                                fontWeight: FontWeight.w400),
                          ),
                          Image(
                            image: AssetImage(AppImages.RIGHT_ARROW),
                            height: 10,
                            width: 50,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Container(
                  //margin: EdgeInsets.only(bottom: 30,right: 20),
                  child: Align(
                    alignment: Alignment.centerRight,
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}
