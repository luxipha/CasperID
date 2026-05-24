import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/write_something/write_something_controller.dart';

class WriteSomethingBottomSheet {
  final WriteSomethingController _writeSomethingController =
      Get.isRegistered<WriteSomethingController>()
          ? Get.find<WriteSomethingController>()
          : Get.put(WriteSomethingController());

  TextEditingController writeSomethingEdit = TextEditingController();

  void writeSomethingBottomSheet(BuildContext context, Function onSubmitTap) {

    showModalBottomSheet<dynamic>(
        barrierColor: AppColors.BLACK.withOpacity(0.8),
        backgroundColor: Colors.transparent,
        isScrollControlled: true,
        isDismissible: true,
        context: context,
        elevation: 15,
        builder: (BuildContext bc) {
          return GetBuilder<WriteSomethingController>(
              init: _writeSomethingController,
              builder: (value) {
                return Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(24.0),
                        topRight: Radius.circular(24.0)),
                    color: Colors.white,
                  ),
                  padding: EdgeInsets.only(top: 20.0),
                  child: Padding(
                    padding: EdgeInsets.only(
                        bottom: MediaQuery.of(context).viewInsets.bottom),
                    child: new Wrap(
                      children: <Widget>[
                        Center(
                          child: Container(
                            height: 6,
                            width: 100,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(30),
                              color: AppColors.ICON_GREY,
                            ),
                          ),
                        ),
                        /*     Container(
                        alignment: Alignment.center,
                        width: double.infinity,
                        margin: EdgeInsets.only(bottom: 19, top: 10),
                        child: Text(
                          "Report listing",
                          style: TextStyle(
                              fontSize: 18.0,
                              fontWeight: FontWeight.w900,
                              fontStyle: FontStyle.normal,
                              color: Colors.black),
                        ),
                      ),*/
                        SizedBox(
                          height: 20,
                        ),
                        _writeSomethingController.getFailedStatus
                        ? Align(
                          alignment: Alignment.center,
                          child: Column(
                            children: [
                              SizedBox(
                                height: 40,
                              ),
                              Image.asset(
                                AppImages.FAILURE,
                                height: 70,
                                width: 70,
                              ),
                              SizedBox(
                                height: 14,
                              ),
                              Text(
                                'Failed',
                                style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    decoration: TextDecoration.none,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w400),
                              ),
                              SizedBox(
                                height: 40,
                              ),
                            ],
                          ),
                        ):
                        _writeSomethingController.getSubmittedStatus
                            ? Align(
                                alignment: Alignment.center,
                                child: Column(
                                  children: [
                                    SizedBox(
                                      height: 40,
                                    ),
                                    Image.asset(
                                      AppImages.SUCCESS,
                                      height: 70,
                                      width: 70,
                                    ),
                                    SizedBox(
                                      height: 14,
                                    ),
                                    Text(
                                      'Success',
                                      style: GoogleFonts.roboto(
                                          color: Colors.black,
                                          decoration: TextDecoration.none,
                                          fontSize: 18,
                                          fontWeight: FontWeight.w400),
                                    ),
                                    SizedBox(
                                      height: 40,
                                    ),
                                  ],
                                ),
                              )
                            : Container(
                                decoration: BoxDecoration(
                                    color: AppColors.TEXTFIELD_GREY,
                                    boxShadow: [
                                      BoxShadow(
                                        color: Color.fromRGBO(0, 1, 8, 0),
                                        blurRadius: 5.0,
                                        offset: Offset(0.0, 1),
                                      ),
                                    ],
                                    borderRadius: BorderRadius.circular(15)),
                                height: 150,
                                margin: EdgeInsets.only(
                                    top: 30.0, left: 36, right: 36),
                                padding: EdgeInsets.only(
                                  left: 19,
                                ),
                                child: TextField(
                                  controller: writeSomethingEdit,
                                  style: TextStyle(
                                      color: Colors.black, fontSize: 16),
                                  maxLines: 10,
                                  textAlign: TextAlign.left,
                                  //   controller: textEditingController,
                                  cursorColor: Colors.black.withOpacity(0.1),
                                  //   obscureText: isObscure,
                                  decoration: InputDecoration(
                                    border: InputBorder.none,
                                    hintText: "write something",
                                    hintStyle: TextStyle(
                                        color: AppColors.HINT_GREY,
                                        fontSize: 14),
                                  ),
                                ),
                              ),
                        GestureDetector(
                          onTap: () {
                            if(value.getFailedStatus){
                              _writeSomethingController.changeBackToFalse();
                              Get.back();
                              //  ));
                            }else if( value.getSubmittedStatus){
                              _writeSomethingController.changeBackToFalse();
                              Get.back();
                            }
                            else{
                              onSubmitTap(writeSomethingEdit.text);
                            }
                            // if (value.getSubmittedStatus) {
                            //   // _writeSomethingController.changeBackToFalse();
                            //   // Get.back();
                            //
                            // } else {
                            //   value.setConfirmed();
                            // }
                          },
                          child: Container(
                              height: 50,
                              decoration: BoxDecoration(
                                color: AppColors.BUTTON_COLOR,
                                borderRadius: BorderRadius.circular(15),
                              ),
                              margin: EdgeInsets.only(
                                  left: 36, right: 36, top: 20, bottom: 35),
                              child: Center(
                                  child: Text(
                                value.getFailedStatus   ? 'Retry' :  value.getSubmittedStatus  ? 'Confirm' : 'Submit',
                                style: GoogleFonts.roboto(color: Colors.white),
                            )))
                        ),
                      ],
                    ),
                  ),
                );
              });
        });/*.whenComplete(() {
      _writeSomethingController.changeBackToFalse();
    });*/
  }
}
