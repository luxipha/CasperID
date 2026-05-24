import 'package:flutter/material.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';

class OnBoardPageModel {
  Color? color;
  //String? imageAssetPath;
  String? imageAssetPath;
  final Key keys;
  /*String? title;*/
  String? body;
  Color? bodyColor;

  Widget? child;
  Widget? titleWidget;
  bool doAnimateChild = false;
  bool doAnimateImage = false;

  OnBoardPageModel(
      {this.color,
        required this.keys ,
      @required this.imageAssetPath,
      /*@required this.title,*/
      @required this.titleWidget,
      @required this.body,
      this.bodyColor = AppColors.ON_BOARD_GREY,
      this.doAnimateImage = false});

  OnBoardPageModel.withChild(
      {@required this.child,
      @required this.color,
        required this.keys ,
      this.doAnimateChild = false});
}
