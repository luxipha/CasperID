import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class TimeProvider extends ChangeNotifier {
  TimeOfDay selectedTime = TimeOfDay.now();

  int selectedHour = 15;
  int selectedMinute = 30;

  void changeTime(int newHour, int newMinute) {
    selectedTime = TimeOfDay(hour: newHour, minute: newMinute);

    selectedHour = newHour;
    selectedMinute = newMinute;

    print('===NewHour===> $newHour');
    notifyListeners();
  }

  void changeHour(int newHour) {
    selectedHour = newHour;
    notifyListeners();
  }

  void changeMinute(int newMinute) {
    selectedMinute = newMinute;
    notifyListeners();
  }

  void changeNotifiers() {
    notifyListeners();
  }
}
