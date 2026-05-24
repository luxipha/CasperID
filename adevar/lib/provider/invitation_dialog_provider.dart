import 'package:flutter/foundation.dart';

class InvitationDialogProvider extends ChangeNotifier {
  bool showCancelText = true;

  void hideCancelText() {
    showCancelText = false;
    notifyListeners();
  }

  void showText() {
    showCancelText = true;
    notifyListeners();
  }
}
