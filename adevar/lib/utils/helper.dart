import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

class HelperMethods {
  static void pushToNextScreen(Widget destination){
    Get.to(()=>destination);
  }
  static void popToPreviousScreen(Widget destination){
    Get.back();
  }
}