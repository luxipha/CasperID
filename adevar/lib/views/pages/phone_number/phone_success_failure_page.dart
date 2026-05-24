import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/views/pages/account_security/account_security_page.dart';

class PhoneSuccessFailurePage extends StatefulWidget {
  final bool isSuccess;
  final String? message;
  final String? title;

  PhoneSuccessFailurePage(this.isSuccess, {this.message, this.title});

  @override
  State<PhoneSuccessFailurePage> createState() =>
      _PhoneSuccessFailurePageState();
}

class _PhoneSuccessFailurePageState extends State<PhoneSuccessFailurePage> {
  @override
  void initState() {
    super.initState();

    widget.isSuccess ? startTime() : null;
  }

  startTime() async {
    return Timer(const Duration(seconds: 2), navigationPage);
  }

  void navigationPage() async {
    Get.back();
    Get.back();
    Get.off(AccountSecurityPage());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Phone Number',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            height: 80,
          ),
          Image.asset(
            widget.isSuccess ? AppImages.SUCCESS : AppImages.FAILURE,
            height: 70,
            width: 70,
          ),
          SizedBox(
            height: 20,
          ),
          Text(
            widget.message.toString(),
            textAlign: TextAlign.center,
            style: GoogleFonts.roboto(
                color: Colors.black,
                decoration: TextDecoration.none,
                fontSize: 18,
                fontWeight: FontWeight.w400),
          ),
        ],
      ),
    );
  }
}
