import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';
import 'package:highfedilityadevar/views/dialogs/app_dialogs.dart';
import 'package:highfedilityadevar/views/pages/adavar_qr/adavar_qr_page.dart';
import 'package:highfedilityadevar/views/pages/adavar_qr_portfolio_like/adavar_qr_portfolio_like_page.dart';
import 'package:highfedilityadevar/views/pages/public_qr_portfolio/public_qr_portfolio_page.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'dart:developer';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../bottom_sheets/write_something/write_something_bottom_sheet.dart';
import '../adavar_qr_profile/adavar_qr_profile_page.dart';
import 'package:web_socket_channel/io.dart';

class ScanningQrCodePage extends StatefulWidget {
  final bool isPublicQr;

  ScanningQrCodePage({
    required this.isPublicQr,
  });

  @override
  State<ScanningQrCodePage> createState() => _ScanningQrCodePageState();
}

class _ScanningQrCodePageState extends State<ScanningQrCodePage> {
  Barcode? result;

  final GetSharedPref _getSharedPref = Get.put(GetSharedPref());
  QRViewController? controller;
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  var Result;
  var scanCode;
  UserDataModel? userDataModel;
  var channel;
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    WidgetsBinding.instance!.addPostFrameCallback((_) {
      _getSharedPref.getUserData().then((value) {
        print("value------>>>>>>>${value.authToken}");
        channel = IOWebSocketChannel.connect(
            'wss://mobapis.adevar.app/websocket/infoCar/${value.authToken}');

        channel.stream.listen((message) {
          channel.innerWebSocket!.pingInterval = const Duration(seconds: 30);
          print("connect ===-=-====-=-==>> $message");
        });
        setState(() {
          userDataModel = value;
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          backgroundColor: AppColors.BUTTON_COLOR,
          title: Text(
            'Scanning',
            style: GoogleFonts.roboto(
              color: Colors.white,
            ),
          ),
          centerTitle: true,
          iconTheme: IconThemeData(color: Colors.white),
        ),
        body: Container(
            //width: Get.width,
            child: GestureDetector(
                // onTap: () {
                //   if (widget.isPublicQr) {
                //     //    Get.to(() => PublicQrPortfolioPage());
                //   } else {
                //     Get.to(() => AdavarQrPortfolioLikePage());
                //   }
                // },
                child: _buildQrView(context))));
  }

  Widget _buildQrView(BuildContext context) {
    // For this example we check how width or tall the device is and change the scanArea and overlay accordingly.
    var scanArea = (MediaQuery.of(context).size.width < 400 ||
            MediaQuery.of(context).size.height < 400)
        ? 200.0
        : 350.0;
    // To ensure the Scanner view is properly sizes after rotation
    // we need to listen for Flutter SizeChanged notification and update controller
    return QRView(
      key: qrKey,
      onQRViewCreated: _onQRViewCreated,
      overlay: QrScannerOverlayShape(
          borderColor: Colors.white,
          borderRadius: 10,
          borderLength: 30,
          borderWidth: 10,
          cutOutSize: scanArea),
      onPermissionSet: (ctrl, p) => _onPermissionSet(context, ctrl, p),
    );
  }

  _getUserDetails(result1) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    try {
      var response = await ApiService.get(
        "${result1['data'].substring(1)}?lang=en_US",
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": userDataModel.authToken.toString(),
        },
      );
      log("scan response  $response");
      log("$result1");

      if (response['flag']) {
        if (result1['type'] == 2) {
          AppDialogs.successDialog(context);
          Future.delayed(Duration(seconds: 2), () {
            setState(() {
              scanCode = false;
            });
            // channel.sink.add(json.encode({
            //   "type": "4",
            //   "recUserId": result1['userId'],
            //   "msg": "successfully qr code scan",
            //   "data": userDataModel.userId
            // }));
            Navigator.pop(context);
            qrKey.currentState!.dispose();
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => PublicQrPortfolioPage(
                  portfolioUrl: '${result1['data'].substring(1)}',
                  userId: result1['userId'].toString(),
                  fromUpdateProfile: '',
                ),
              ),
            );
          });
          // Timer(
          //   Duration(seconds: 2),
          //   () {
          //     setState(() {
          //       scanCode = false;
          //     });
          //     // channel.sink.add(json.encode({
          //     //   "type": "4",
          //     //   "recUserId": result1['userId'],
          //     //   "msg": "successfully qr code scan",
          //     //   "data": userDataModel.userId
          //     // }));
          //     Navigator.pop(context);
          //     qrKey.currentState!.dispose();
          //     Navigator.push(
          //       context,
          //       MaterialPageRoute(
          //         builder: (context) => PublicQrPortfolioPage(
          //           portfolioUrl: '${result1['data'].substring(1)}',
          //           userId: result1['userId'].toString(),
          //           fromUpdateProfile: '',
          //         ),
          //       ),
          //     );
          //   },
          // );
        }

        if (result1['type'] == 1) {
          AppDialogs.successDialog(context);
          Future.delayed(Duration(seconds: 2), () {
            setState(() {
              scanCode = false;
            });
            // channel.sink.add(json.encode({
            //   "type": "4",
            //   "recUserId": result1['userId'],
            //   "msg": "successfully qr code scan",
            //   "data": userDataModel.userId
            // }));
            Navigator.pop(context);
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => AdavarQrPortfolioLikePage(result1)),
            );
          });
        }
      } else {
        setState(() {
          scanCode = true;
        });
        print("hello it is error");
        Timer(Duration(seconds: 5), () {
          setState(() {
            scanCode = false;
          });
        });
        AppDialogs.failDialog(context);
      }
    } catch (e) {
      setState(() {
        scanCode = true;
      });
      Timer(Duration(seconds: 5), () {
        setState(() {
          scanCode = false;
        });
      });
      AppDialogs.failDialog(context);
    }

    // return response;
  }

  void _onQRViewCreated(QRViewController controller) {
    setState(() {
      this.controller = controller;
    });
    setState(() {
      scanCode = false;
    });

    controller.scannedDataStream.listen((scanData) {
      // setState(() {
      //   result = scanData;
      //   print("Result-->$result");
      //   //print("Resultcode-->>${result!.code}");
      // });

      var code = scanData.code;
      var result1 = json.decode(code.toString());
      print("\x1b[97m Qr Code Scanned-->>$result1");
      // setState(() {
      //   Result = result1;
      //   print("Result-->$Result");
      // });

      if (result1.runtimeType != String &&
          result1['userId'] != null &&
          result1['type'] == 2 &&
          scanCode == false) {
        _getUserDetails(result1);
        setState(() {
          scanCode = true;
        });
      } else if (result1.runtimeType != String &&
          result1['userId'] != null &&
          result1['type'] == 1 &&
          scanCode == false) {
        setState(() {
          scanCode = true;
        });
        // AppDialogs.successDialog(context);

        _getUserDetails(result1);
      }
    });
  }

  void _onPermissionSet(BuildContext context, QRViewController ctrl, bool p) {
    log('${DateTime.now().toIso8601String()}_onPermissionSet $p');
    if (!p) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('no Permission')),
      );
    }
  }

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }
}
