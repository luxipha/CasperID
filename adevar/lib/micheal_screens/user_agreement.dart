import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:highfedilityadevar/controllers/user_agreement/user_agreement_controller.dart';

import 'package:syncfusion_flutter_sliders/sliders.dart';

import '../consts/app_colors.dart';
import '../micheal_config/strings.dart';

class UserAgreement extends StatefulWidget {
  String? version;
  UserAgreement({Key? key, this.version}) : super(key: key);
  @override
  _UserAgreementState createState() => _UserAgreementState();
}

class _UserAgreementState extends State<UserAgreement> {
  final UserAgreementController _userAgreementController =
      Get.isRegistered<UserAgreementController>()
          ? Get.find<UserAgreementController>()
          : Get.put(UserAgreementController());
  @override
  Widget build(BuildContext context) {
    _userAgreementController.getUserAgreement();
    double _currentSliderValue = 20;
    var val = 5;
    double width = MediaQuery.of(context).size.width;
    double height = MediaQuery.of(context).size.height;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        title: Text(
          userAgrementText,
          style: TextStyle(fontSize: 20, color: Colors.white),
        ),
      ),
      body: GetBuilder<UserAgreementController>(
          init: _userAgreementController,
          builder: (value) {
            return value.userAgreeementModel == null
                ? Center(
                    child: CircularProgressIndicator(
                    valueColor: new AlwaysStoppedAnimation<Color>(
                      AppColors.red,
                    ),
                  ))
                : SingleChildScrollView(
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      width: double.infinity,
                      child: Column(
                        children: [
                          SizedBox(
                            height: height / 15,
                          ),
                          Column(
                            children: [
                              Container(
                                height: height / 7,
                                width: 100,
                                decoration: BoxDecoration(
                                  image: DecorationImage(
                                    fit: BoxFit.contain,
                                    image: AssetImage(
                                        'assets/images/adevar_logo.png'),
                                  ),
                                ),
                              ),
                              Padding(
                                padding:
                                    const EdgeInsets.only(top: 10, bottom: 5),
                                child: Text(
                                  adevarText,
                                  style: TextStyle(
                                      color: Colors.black87, fontSize: 17),
                                ),
                              ),
                              Text(
                                widget.version!,
                                style: TextStyle(color: Colors.black26),
                              ),
                              SizedBox(
                                height: 10,
                              ),
                              Text(
                                userAgrementText,
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 25,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(
                                height: height / 15,
                              ),
                              Text(
                                value.userAgreeementModel!.data!,
                                style: TextStyle(
                                    // color: Colors.grey.withOpacity(0.5),
                                    ),
                              )
                              /*Container(
                            width: width / 1.3,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                    height: height / 2.5,
                                    width: width / 1.5,
                                    child: Text(
                                      descText,
                                      style: TextStyle(
                                          // color: Colors.grey.withOpacity(0.5),
                                          ),
                                    )),
                                Container(
                                  decoration: BoxDecoration(),
                                  child: Column(
                                    children: [
                                      Container(
                                        color: Colors.blue,
                                        width: width / 120,
                                        height: height / 22,
                                      ),
                                      Container(
                                        height: height / 30,
                                        width: width / 20,
                                        decoration: BoxDecoration(
                                            color: Colors.blue,
                                            borderRadius: BorderRadius.circular(10)),
                                      ),
                                      Container(
                                        color: Colors.grey,
                                        width: width / 120,
                                        height: height / 3.1,
                                      ),
                                    ],
                                  ),
                                )
                              ],
                            ),
                          )*/
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
          }),
    );
  }
}
