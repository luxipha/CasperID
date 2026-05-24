import 'dart:async';
import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/micheal_screens/id_card.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:image_gallery_saver/image_gallery_saver.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:screenshot/screenshot.dart';
import 'package:share_plus/share_plus.dart';
import 'package:web_socket_channel/io.dart';

class PublicQrPage extends StatefulWidget {
  @override
  State<PublicQrPage> createState() => _PublicQrPageState();
}

class _PublicQrPageState extends State<PublicQrPage> {
  bool isVisible = false;
  UserDataModel? userDataModel;

  final GetSharedPref _getSharedPref = Get.put(GetSharedPref());
  var channel;
  Widget? qrcode;
  late Timer timer;
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
          print("connect ===-=-====-=-==>> $message");
          var data = json.decode(message);
          if (data['msg'] == "closeQr") {
            Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => IdCard(pagename: "Public"),
                )
                // PublicAdavarQrProfilePage(data['data'])),
                );
          } else {}
          // channel.sink.add('received!');
        });
        setState(() {
          userDataModel = value;
          qrcode = Image.network(
            'https://mobapis.adevar.app/socialContact/card/QRCard?lang=en_US',
            headers: getTokenHeaders(),
          );
        });
        timer = Timer.periodic(Duration(seconds: 10), (timer) {
          setState(() {
            qrcode = Image.network(
              'https://mobapis.adevar.app/socialContact/card/QRCard?lang=en_US',
              headers: getTokenHeaders(),
            );
          });
        });
      });
    });
  }

  Map<String, String> getTokenHeaders() {
    Map<String, String> headers = new Map();
    headers['Authorization'] = userDataModel!.authToken!;
    headers['content-type'] = 'application/json';
    return headers;
  }

  ScreenshotController screenshotController = ScreenshotController();
  @override
  Widget build(BuildContext context) {
    return userDataModel != null
        ? Screenshot(
            controller: screenshotController,
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Container(
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
                          Positioned(
                            top: 200,
                            left: 0,
                            right: 0,
                            child: Container(
                              width: double.infinity,
                              height: 260,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(15),
                                color: AppColors.BUTTON_COLOR,
                              ),
                            ),
                          ),
                          Align(
                            alignment: Alignment.topCenter,
                            child: Container(
                              margin: EdgeInsets.only(top: 50),
                              child: Image(
                                image:
                                    AssetImage(AppImages.GREY_BACKGROUND_LOGO),
                              ),
                            ),
                          ),
                          Align(
                            alignment: Alignment.topLeft,
                            child: Container(
                              margin: EdgeInsets.only(top: 70, left: 15),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '24',
                                    style: GoogleFonts.roboto(
                                        color: Colors.blue,
                                        decoration: TextDecoration.none,
                                        fontSize: 30,
                                        fontWeight: FontWeight.w700),
                                  ),
                                  Text(
                                    'h',
                                    style: GoogleFonts.roboto(
                                        color: Colors.blue,
                                        decoration: TextDecoration.none,
                                        fontSize: 18,
                                        fontWeight: FontWeight.w700),
                                  ),
                                ],
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
                                      //   // Get.to(()=>PublicQrPortfolioPage());
                                      //   Get.to(() =>
                                      //       ScanningQrCodePage(isPublicQr: true));
                                      // });
                                    },
                                    child: Container(
                                      height: 166,
                                      width: 166,
                                      decoration: BoxDecoration(
                                          color: AppColors.WHITE,
                                          borderRadius:
                                              BorderRadius.circular(15)),
                                      child: Center(
                                          child: Image.network(
                                              'https://mobapis.adevar.app/socialContact/card/QRCard?lang=en_US',
                                              headers: getTokenHeaders())
                                          // child: Text(
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
                                  ),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  Container(
                                    padding:
                                        EdgeInsets.symmetric(horizontal: 30),
                                    child: Text(
                                      '',
                                      /*'Great works are performed not by strength but by perseverance.',*/
                                      textAlign: TextAlign.start,
                                      style: GoogleFonts.roboto(
                                          color: AppColors.WHITE,
                                          decoration: TextDecoration.none,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w400),
                                    ),
                                  ),
                                  SizedBox(
                                    height: 10,
                                  ),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: InkWell(
                                          onTap: () async {
                                            await screenshotController
                                                .capture()
                                                .then((value) async {
                                              setState(() {});
                                              if (value != null) {
                                                final tempDir =
                                                    await getTemporaryDirectory();
                                                File file = await File(
                                                        '${tempDir.path}/image.png')
                                                    .create();
                                                file.writeAsBytesSync(value);
                                                await Share.shareFiles([
                                                  file.path,
                                                ]);
                                              } else {
                                                log("value is null");
                                              }
                                            });
                                            // ShareBottomSheet()
                                            //     .showUploadImageActionSheet(
                                            //         context);
                                          },
                                          child: Container(
                                            width: 30,
                                            height: 45,
                                            child: Image(
                                                image: AssetImage(
                                                    AppImages.SHARE)),
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        child: InkWell(
                                          onTap: () async {
                                            // isVisible = true;
                                            setState(() {});

                                            await screenshotController
                                                .capture()
                                                .then((value) async {
                                              await [Permission.storage]
                                                  .request();
                                              final time = DateTime.now()
                                                  .toIso8601String()
                                                  .replaceAll('.', '-')
                                                  .replaceAll(':', '-');
                                              final result =
                                                  await ImageGallerySaver
                                                      .saveImage(
                                                          value!,
                                                          name:
                                                              'screenshot_$time');
                                              return result['filePath'];
                                            });
                                            isVisible = true;
                                            setState(() {});
                                            Future.delayed(
                                                const Duration(
                                                    milliseconds: 1500), () {
                                              isVisible = false;
                                              setState(() {});
                                            });
                                          },
                                          child: Container(
                                            width: 30,
                                            height: 45,
                                            child: Image(
                                                image:
                                                    AssetImage(AppImages.SAVE)),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
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
                                  // Image(
                                  //   image: AssetImage(AppImages.USER_IMAGE),
                                  //   height: 100,
                                  //   width: 100,
                                  // ),
                                  // Positioned(
                                  //   right: 0,
                                  //   bottom: 0,
                                  //   child: Image(
                                  //     image:
                                  //         AssetImage(AppImages.RATE_CIRCULAR),
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
                  ),
                  isVisible
                      ? Container(
                          height: 45,
                          margin: EdgeInsets.symmetric(
                              vertical: 20, horizontal: 20),
                          decoration: BoxDecoration(
                            color: AppColors.BUTTON_COLOR.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(30),
                          ),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 50,
                              ),
                              Container(
                                height: 25,
                                width: 25,
                                child: Image(
                                    image: AssetImage(AppImages.success_blue)),
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              Text(
                                'Saved to album successfully',
                                style: GoogleFonts.roboto(
                                    color: AppColors.BUTTON_COLOR),
                              )
                            ],
                          ),
                        )
                      : Container(),
                ],
              ),
            ),
          )
        : Container();
  }
}
