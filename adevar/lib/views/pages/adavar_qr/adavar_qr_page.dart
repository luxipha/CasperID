import 'dart:async';
import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/micheal_screens/id_card.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:web_socket_channel/io.dart';
import 'package:http/http.dart' as http;
import '../../../models/user_data/user_model.dart';

class AdavarQrCodePage extends StatefulWidget {
  @override
  State<AdavarQrCodePage> createState() => _AdavarQrCodePageState();
}

UserDataModel? userDataModel;

class _AdavarQrCodePageState extends State<AdavarQrCodePage> {
  final GetSharedPref _getSharedPref = Get.put(GetSharedPref());
  late IOWebSocketChannel channel;
  late Timer timer;
  @override
  void initState() {
    // TODO: implement initState
    super.initState();

    WidgetsBinding.instance!.addPostFrameCallback((_) {
      _getSharedPref.getUserData().then((value) async {
        print("value-->$value");
        SharedPreferences sharedPreferences =
            await SharedPreferences.getInstance();
        channel = IOWebSocketChannel.connect(
            'wss://mobapis.adevar.app/websocket/infoCar/${value.authToken}');

        channel.stream.listen((message) {
          channel.innerWebSocket!.pingInterval = const Duration(seconds: 30);
          print("connect ===-=-====-=-==>> $message");
          var data = json.decode(message);

          if (data['msg'] == "closeQr") {
            sharedPreferences.setString("otherUserId", "${data['data']}");
            Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => IdCard(
                    pagename: "Private",
                    userId: data['data'],
                  ),
                )
                //AdavarQrProfilePage(data['data'])),
                ).then((value) {
              // getQr();
            });
          } else {
            // getTokenHeaders();
          }
          // channel.sink.add('received!');
        });
        setState(() {
          userDataModel = value;
          qrcode = Image.network(
            'https://mobapis.adevar.app/socialContact/card/randQRCard?lang=en_US',
            headers: getTokenHeaders(),
          );
        });

        timer = Timer.periodic(Duration(seconds: 10), (timer) {
          setState(() {
            qrcode = Image.network(
              'https://mobapis.adevar.app/socialContact/card/randQRCard?lang=en_US',
              headers: getTokenHeaders(),
            );
          });
        });
      });
    });
  }

  Widget? qrcode;

  @override
  void dispose() {
    channel.sink.close();
    timer.cancel();
    super.dispose();
  }

  Map<String, String> getTokenHeaders() {
    Map<String, String> headers = new Map();
    headers['Authorization'] = userDataModel!.authToken!;
    print('token->${userDataModel!.authToken!}');
    headers['content-type'] = 'application/json';

    return headers;
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
        child: userDataModel != null
            ? Container(
                margin: EdgeInsets.only(top: 50),
                child: Container(
                  height: 460,
                  width: 300,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Container(
                        height: 350,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(15),
                          color: AppColors.FORM_GREY,
                        ),
                        margin: EdgeInsets.only(top: 50),
                      ),
                      Align(
                        alignment: Alignment.topCenter,
                        child: Container(
                          margin: EdgeInsets.only(top: 50),
                          child: Image(
                            image: AssetImage(AppImages.GREY_BACKGROUND_LOGO),
                          ),
                        ),
                      ),
                      Align(
                          alignment: Alignment.topCenter,
                          child: Container(
                            margin: EdgeInsets.only(top: 110),
                            child: Column(
                              children: [
                                Text(
                                  userDataModel?.firstName ?? "",
                                  // 'Jason',
                                  style: GoogleFonts.roboto(
                                      color: Colors.black,
                                      decoration: TextDecoration.none,
                                      fontSize: 32,
                                      fontWeight: FontWeight.w700),
                                ),
                                SizedBox(
                                  height: 20,
                                ),
                                GestureDetector(
                                  onTap: () {
                                    // AppDialogs.successDialog(context);
                                    // Future.delayed(
                                    //     const Duration(milliseconds: 1000), () {
                                    //   Get.back();
                                    //   //Get.to(()=>AdavarQrPortfolioLikePage());
                                    //   Get.to(() => ScanningQrCodePage(
                                    //       isPublicQr: false));
                                    // });
                                  },
                                  child: Container(
                                    height: 166,
                                    width: 166,
                                    decoration: BoxDecoration(
                                        color: AppColors.GREY_SCAN,
                                        borderRadius:
                                            BorderRadius.circular(15)),
                                    child: Center(
                                      child: qrcode,
                                      //   child: PrettyQr(
                                      //     image: AssetImage('assets/images/qr.png'),
                                      //     typeNumber: 3,
                                      //     size: 200,
                                      //     data: '${userDataModel?.userId}',
                                      //     errorCorrectLevel: QrErrorCorrectLevel.M,
                                      //     roundEdges: true,
                                      //   ),
                                    ),

                                    // Text(
                                    //   'QR code',
                                    //   textAlign: TextAlign.center,
                                    //   style: GoogleFonts.roboto(
                                    //       color: Colors.black,
                                    //       decoration: TextDecoration.none,
                                    //       fontSize: 14,
                                    //       fontWeight: FontWeight.w400),
                                    // ),
                                  ),
                                ),
                                SizedBox(
                                  height: 20,
                                ),
                                Container(
                                  padding: EdgeInsets.symmetric(horizontal: 30),
                                  child: Text(
                                    '',
                                    /*'“A very friendly person helped me solve many problems that I couldn\'t solve for a long time, and became a good friend.”',*/
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.roboto(
                                        color: AppColors.NOTIFICATION_GREY,
                                        decoration: TextDecoration.none,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w400),
                                  ),
                                ),
                              ],
                            ),
                          )),
                      Align(
                        alignment: Alignment.topCenter,
                        child: Container(
                          height: 100,
                          child: Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(60.0),
                                child: Image.network(
                                  userDataModel?.profilePicture ?? "",
                                  fit: BoxFit.fill,
                                  height: 100,
                                  width: 100,
                                ),
                              ),
                              //       Image(
                              //     image: AssetImage(AppImages.USER_IMAGE),
                              //     height: 100,
                              //     width: 100,
                              //   ),
                              // ),
                              // Positioned(
                              //   right: 0,
                              //   bottom: 0,
                              //   child: Image(
                              //     image: AssetImage(AppImages.RATE_CIRCULAR),
                              //     height: 30,
                              //     width: 30,
                              //   ),
                              // ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  margin: EdgeInsets.only(
                    top: 00,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.transparent,
                  ),
                ),
              )
            : Container());
  }
}
