import 'dart:io';

import 'package:flutter/material.dart';

import '../../Service/ApiFunctions/voted_feature_idea_service.dart';
import '../../Service/ApiModels/VotedFeatureIdeaModel.dart';

class VotedFeatureProvider extends ChangeNotifier {
  VotedFeatureIdeaModel? votedFeatureIdeaModel;
  VotedFeatureIdeaModel? moreVotedFeatureIdeaModel;
  bool isLoading = false;
  bool isMoreLoading = false;
  int page = 1;
  int selectedIndex = -1;

  ScrollController scrollController = ScrollController();

  void changeSelectedIndex(int newValue) {
    selectedIndex = newValue;
    notifyListeners();
  }

  Future<void> getVotedFeature() async {
    if (votedFeatureIdeaModel != null) {
      print('VotedFeature has been gotten already');
    } else {
      isLoading = true;
      page = 1;
      try {
        print('===> Getting VotedFeature');
        votedFeatureIdeaModel = await VotedFeaturedService().getIdeas(page);
        print('===> VotedFeature Gotten');
      } on HttpException catch (e) {
        print('===> Error Getting VotedFeature');
        print(e);
        print('===> Error Getting VotedFeature <===');
      }
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> getMoreVotedFeature() async {
    isMoreLoading = true;
    notifyListeners();
    page++;
    try {
      print('===> Getting MoreVotedFeature');
      moreVotedFeatureIdeaModel = await VotedFeaturedService().getIdeas(page);
      for (var item in moreVotedFeatureIdeaModel!.items!) {
        votedFeatureIdeaModel!.items!.add(item);
      }
      print('===> MoreVotedFeature Gotten');
    } on HttpException catch (e) {
      print('===> Error Getting MoreVotedFeature');
      print(e);
      print('===> Error Getting MoreVotedFeature <===');
    }
    isMoreLoading = false;
    notifyListeners();
  }
}
