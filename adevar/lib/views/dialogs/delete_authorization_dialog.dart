import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_phone_number/register_phone_number_page.dart';


class DeleteAuthorizationDialog {
  static void authorizationDialog(BuildContext context,
      {String title = 'Delete Dribble',
        String subTitle = "After deletion, you need to authenticate when logging in to the device."}) {
    showDialog(
        context: context,
        builder: (BuildContext context) => CupertinoAlertDialog(
          title: new Text(title),
          content: new Text(
            subTitle,
            style: TextStyle(color: Colors.grey,fontSize: 12),
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
