import 'dart:io';

import 'package:flutter/material.dart';

import '../../../Service/ApiFunctions/idea_list_service.dart';
import '../../../Service/ApiModels/FormIdeaListModel.dart';

class IdeaListProvider extends ChangeNotifier {
  /// Pop Up
  bool showPopUp = false;
  List listItem = ['item1', 'item2']; // ion 2
  var latest = 'Latest';
  var popular = 'Popular';
  var temp = 'latest';

  void changeShowPopUp() {
    showPopUp = !showPopUp;
    notifyListeners();
  }

  void refreshIdea() {
    String tempLatest = latest;
    if (latest == 'Popular') {
      tempLatest = 'like';
    }
    getIdealList(queryType: tempLatest, force: true);
  }

  void changeNotifiers() {
    notifyListeners();
  }

  FormIdeaListModel? idealList;
  FormIdeaListModel? moreIdealList;
  bool ideaListLoading = true;
  bool moreIdeaListLoading = false;
  int currentPage = 1;

  void increaseCurrentPage() {
    currentPage++;
    notifyListeners();
  }

  void addItemToList(Items item) {
    idealList!.items!.add(item);
    notifyListeners();
  }

  Future<void> getMoreIdealList({int? page, required String queryType}) async {
    moreIdeaListLoading = true;
    print('==> $moreIdeaListLoading');
    notifyListeners();
    print('====More Data====-------> $queryType');
    try {
      moreIdealList = await IdeaListService().getIdeas(
        ideaType: 100014,
        page: page,
        queryType: queryType.toLowerCase(),
      );
      print('======> MoreIdealList Gotten');
      print('=====List=====> ${moreIdealList!.items}');
      if (moreIdealList!.items != null && moreIdealList!.items!.isNotEmpty) {
        for (var item in moreIdealList!.items ?? []) {
          print('===> <><><><><><><> $item');
          idealList!.items!.add(item);
        }
      } else {
        print('Nothing in list');
      }
      print('More app  fetched=============>');
      print('=============> ${idealList!.items}');
      moreIdeaListLoading = false;
      notifyListeners();
    } on HttpException catch (e) {
      print('====> Error Getting IdealList <====');
      print('=========> $e');
      moreIdeaListLoading = false;
      notifyListeners();
    }
  }

  Future<void> getIdealList(
      {int? page, required String queryType, bool force = false}) async {
    // if (idealList != null && !force) {
    //   print('QR Code Idea has been gotten Already');
    // } else {
    print('This is the problem');
    ideaListLoading = true;
    currentPage = 1;
    // if (idealList == null && idealList!.items!.isEmpty) {
    // notifyListeners();
    print('==============-------> $queryType');
    try {
      idealList = await IdeaListService().getIdeas(
        ideaType: 100014,
        page: page,
        queryType: queryType.toLowerCase(),
      );
      print('======> IdealList Gotten');
      print('=====List=====> ${idealList!.items}');
      ideaListLoading = false;
    } on HttpException catch (e) {
      print('====> Error Getting IdealList <====');
      print('=========> $e');
      ideaListLoading = false;
      // }
      // } else {
      //   print('======> Idea List has been gotten Already');
      //   print(idealList);
      //   print(idealList!.items);
      // }
      notifyListeners();
    }
  }
}
