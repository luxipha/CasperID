import 'package:flutter/material.dart';

class CategoryPopUpProvider extends ChangeNotifier {
  int ideasTabIndex = 0;

  void changeTabIndex(int newIndex) {
    ideasTabIndex = newIndex;
    notifyListeners();
  }
}
