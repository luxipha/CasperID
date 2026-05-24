import 'package:get/get.dart';

class WriteSomethingController extends GetxController {
  bool _isSubmitted =false ;
  bool _isFalse = false;

  void changeBackToFalse(){
    _isSubmitted =false ;
    _isFalse = false;
  }
  void setConfirmed(){
    _isSubmitted =true ;
    _isFalse = false;

    update();
  }

  void setFailed(){
    _isFalse =true;
    _isSubmitted =false;
    update();
  }
  bool get getSubmittedStatus =>_isSubmitted ;
  bool get getFailedStatus => _isFalse;
}