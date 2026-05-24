import 'package:flutter/material.dart';

class CategoryProvider extends ChangeNotifier {
  bool showPopUp = false;
  List listItem = ['item1', 'item2']; // ion 2
  var latest = 'Latest';
  var popular = 'Popular';
  var temp = 'latest';

  final ScrollController scrollController1 = ScrollController();
  final ScrollController scrollController2 = ScrollController();
  final ScrollController scrollController3 = ScrollController();
  final ScrollController scrollController4 = ScrollController();
  final ScrollController scrollController5 = ScrollController();
  final ScrollController scrollController6 = ScrollController();

  void changeShowPopUp() {
    showPopUp = !showPopUp;
    notifyListeners();
  }

  void changeNotifiers() {
    notifyListeners();
  }
}
