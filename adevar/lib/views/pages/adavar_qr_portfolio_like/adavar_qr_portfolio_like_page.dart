import 'dart:convert';
import 'dart:developer';

import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/controllers/write_something/write_something_controller.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';
import 'package:highfedilityadevar/views/bottom_sheets/write_something/write_something_bottom_sheet.dart';
import 'package:highfedilityadevar/views/pages/adavar_qr_profile/adavar_qr_other_profile_page.dart';
import 'package:simple_gesture_detector/simple_gesture_detector.dart';
import 'package:web_socket_channel/io.dart';

class AdavarQrPortfolioLikePage extends StatefulWidget {
  final result1;
  AdavarQrPortfolioLikePage(this.result1);

  @override
  _AdavarQrPortfolioLikePageState createState() =>
      _AdavarQrPortfolioLikePageState();
}

class _AdavarQrPortfolioLikePageState extends State<AdavarQrPortfolioLikePage> {
  int sliderIndex = 0;
  List<Widget> imageSliders = [];
  int _current = 0;
  var privatreqrResponse;
  var likeResponse;
  bool ischeck = false;
  bool isLike = false;
  bool isReal = false;

  var channel;
  final WriteSomethingController _writeSomethingController =
      Get.isRegistered<WriteSomethingController>()
          ? Get.find<WriteSomethingController>()
          : Get.put(WriteSomethingController());

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    // imageSliders.add(Image(image: AssetImage(AppImages.CORNER_ROUND)));
    // imageSliders.add(Image(image: AssetImage(AppImages.CORNER_ROUND)));
    // imageSliders.add(Image(image: AssetImage(AppImages.CORNER_ROUND)));
    // imageSliders.add(Image(image: AssetImage(AppImages.CORNER_ROUND)));
    getPortfolio(widget.result1);
    alreadyLike(widget.result1);
  }

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  void getLikeUser(comment) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    //print("_params  ==>> $_params");
    var response = await ApiService.post(
      "socialContact/comment/addComment?lang=en_US",
      params: ({
        "recUserId": widget.result1['userId'],
        "commentType": 1,
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

  void alreadyLike(like) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    var response = await ApiService.get(
        "/socialContact/card/QRBusinessCard/${widget.result1['userId']}?lang=en_US",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": userDataModel.authToken.toString(),
        });
    print("object ABCDE ---->>> $response");
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

  void getPortfolio(result1) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    var response = await ApiService.get(
      "${result1['data'].substring(1)}?lang=en_US",
      headerMap: {
        "Content-Type": "application/json",
        "Authorization": userDataModel.authToken.toString(),
      },
    );
    print("response-- $response");
    setState(() {
      privatreqrResponse = response;
    });

    if (response['data']['logos'] != null &&
        response['data']['logos'].length > 0) {
      response['data']['logos'].forEach(
        (image) => {
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
            ),
          ))
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Colors.white,
        floatingActionButton: Container(
          padding: EdgeInsets.only(left: 40),
          // margin: EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SimpleGestureDetector(
                onHorizontalSwipe: (value) {
                  _getSharedPref.getUserData().then((value) {
                    channel = IOWebSocketChannel.connect(
                        'wss://mobapis.adevar.app/websocket/infoCar/${value.authToken}');

                    channel.stream.listen((message) {
                      channel.innerWebSocket!.pingInterval =
                          const Duration(seconds: 30);
                      channel.sink.add(
                        json.encode({
                          "type": "4",
                          "recUserId": widget.result1['userId'],
                          "msg": "successfully qr code scan",
                          "data": value.userId
                        }),
                      );
                    });
                  }).then((value) {
                    Get.to(() =>
                        AdavarQrOtherProfilePage(widget.result1['userId'], ''));
                  });
                },
                child: Container(
                  width: 162,
                  height: 60,
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
              GestureDetector(
                  onTap: () {
                    if (isReal != true) {
                      WriteSomethingBottomSheet()
                          .writeSomethingBottomSheet(context, (value) {
                        print('OnSubmit : $value');
                        // if (_writeSomethingController.getSubmittedStatus) {
                        //    _writeSomethingController.changeBackToFalse();
                        //    Get.back();
                        //
                        // } else {
                        getLikeUser(value);
                        // _writeSomethingController.setConfirmed();
                        // }
                      });
                    }
                  },
                  child: isReal == true
                      ? Image(
                          image: AssetImage(AppImages.LIKE_DISABLE),
                          height: 50,
                          width: 50)
                      : isLike == false
                          ? Image(
                              image: AssetImage(AppImages.LIKE_QR),
                              height: 50,
                              width: 50,
                            )
                          : Image(
                              image: AssetImage(AppImages.HEART_CIRCLE),
                              height: 50,
                              width: 50,
                            ))
            ],
          ),
        ),
        appBar: AppBar(
          centerTitle: true,
        ),
        body: privatreqrResponse != null
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
                              image: AssetImage(AppImages.BLUE_LARGE_CIRCLE),
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
                                // enlargeCenterPage: false,
                                // enableInfiniteScroll: false,
                                onPageChanged: (index, reason) {
                                  setState(() {
                                    _current = index;
                                  });
                                },
                              ),
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
                              // shape: BoxShape.rectangle,
                              borderRadius: BorderRadius.circular(12),
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
                        privatreqrResponse['data']['position'] ?? "",
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
                            privatreqrResponse['data']['firstName'] ?? "",
                            //  'Angela Adams',
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
                          privatreqrResponse['data']['badgeUrl'] != null
                              ? Image.network(
                                  '${privatreqrResponse['data']['badgeUrl']}',
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
                        privatreqrResponse['data']['introduction'] ?? "",
                        // 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in.',
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
            : Center(child: CircularProgressIndicator()));
  }
}
