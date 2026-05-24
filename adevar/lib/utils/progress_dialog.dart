
import 'package:flutter/material.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';



class ProgressDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Card(
        elevation: 5,
        color: Colors.white,
        child: Container(
            padding: EdgeInsets.all(10),
            child: CircularProgressIndicator(
              valueColor: new AlwaysStoppedAnimation<Color>(
                AppColors.red,
              ),
            ),),
      ),
    );
  }
}
