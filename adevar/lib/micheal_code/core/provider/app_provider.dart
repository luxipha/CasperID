import 'package:flutter/material.dart';

class AppProvider extends ChangeNotifier {
  String category = "Choose Category";

  ScrollController categoryTabsController = ScrollController();

  bool check = false;

  final ScrollController scrollController1 = ScrollController();
  final ScrollController scrollController2 = ScrollController();
  final ScrollController scrollController3 = ScrollController();
  final ScrollController scrollController4 = ScrollController();
  final ScrollController scrollController5 = ScrollController();
  final ScrollController scrollController6 = ScrollController();

  TabController? ideasTabController;
  //
  // int ideasTabIndex = 0;
  //
  // void changeTabIndex(int newIndex) {
  //   ideasTabIndex = newIndex;
  //   notifyListeners();
  // }
  //
  // void changeNotifiers() {
  //   notifyListeners();
  // }

  TextEditingController topicTitleController = TextEditingController();
  TextEditingController detailsController = TextEditingController();

  List<String> postCategories = [
    'Share Ideas',
    'App Questions',
    'Colors',
    'QR Code',
    'Portfolio',
    'Settings',
  ];

  void resetTextFields() {
    category = 'Choose Category';
    topicTitleController.clear();
    detailsController.clear();
    notifyListeners();
  }

  open() {
    print("umar");
    check = !check;
    notifyListeners();
  }

  void close() {
    print("umar");
    check = !check;
    notifyListeners();
  }

  chkDialogue() {
    if (check) {
      check = false;
    }
    notifyListeners();
  }

  setCategory(String cate) {
    category = cate;
    notifyListeners();
  }
}
