import 'package:get/get.dart';

class PublicInviteController extends GetxController {
  bool _isSubmitted = false;
  bool _isFalse = false;
  String _failedMessage = "";
  void changeBackToFalse() {
    _isSubmitted = false;
    _isFalse = false;
  }

  void setConfirmed() {
    _isSubmitted = true;
    _isFalse = false;

    update();
  }

  void setFailed(String message) {
    _isFalse = true;
    _isSubmitted = false;
    _failedMessage = message;

    update();
  }

  bool get getSubmittedStatus => _isSubmitted;
  bool get getFailedStatus => _isFalse;
  String get failedMessage => _failedMessage;
}
