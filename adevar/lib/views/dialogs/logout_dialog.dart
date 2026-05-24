import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_phone_number/register_phone_number_page.dart';


class LogoutDialog {
 static void logoutDialog(BuildContext context,
      {String title = 'Alert',
      String subTitle = "Are you sure to log out of this account?"}) {
    showDialog(
        context: context,
        builder: (BuildContext context) => CupertinoAlertDialog(
              title: new Text(title),
              content: new Text(
                subTitle,
                style: TextStyle(color: Colors.black),
              ),
              actions: <Widget>[
                CupertinoDialogAction(
                  isDefaultAction: true,
                  onPressed: (){
                    Get.back();
                  },
                  child: Text(
                    'Cancel',
                    style: TextStyle(color: Colors.blue),
                  ),
                ),
                CupertinoDialogAction(
                  onPressed: (){
                    Get.back();
                    Get.offAll(()=>RegisterPhoneNumberPage());
                  },
                  child: Text(
                    'Yes',
                    style: TextStyle(color: Colors.blue),
                  ),
                )
              ],
            ));
  }
}
