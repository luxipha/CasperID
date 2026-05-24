import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class DeleteLoginDeviceDialog {
  static void loginDeviceDialog(BuildContext context,
      {String title = 'Delete Dribble',
      String subTitle =
          "After deletion, you need to authenticate when logging in to the device.",
      String ?deviceName,required Function onDelete , required Function onCancel}) {
    showDialog(
        context: context,
        builder: (BuildContext context) => CupertinoAlertDialog(
              title: new Text('Delete ${deviceName!}'),
              content: new Text(
                subTitle,
                style: TextStyle(color: Colors.grey, fontSize: 12),
              ),
              actions: <Widget>[
                CupertinoDialogAction(
                  isDefaultAction: true,
                  onPressed: () {
                    onCancel();
                  },
                  child: Text(
                    'Cancel',
                    style: TextStyle(color: Colors.blue),
                  ),
                ),
                CupertinoDialogAction(
                  onPressed: () {
                    onDelete();
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
