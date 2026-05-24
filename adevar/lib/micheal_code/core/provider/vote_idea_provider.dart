// ignore_for_file: unused_local_variable

import 'dart:convert';
import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';
import '../../Constants/AppConstants.dart';
import '../../Service/Urls.dart';

class VoteIdeaProvider extends ChangeNotifier {
  ScrollController scrollController = ScrollController();

  bool isLoading = false;
  bool isMoreLoading = false;
  Map<String, dynamic>? voteIdeaModel;
  Map<String, dynamic>? moreVoteIdeaModel;
  int page = 1;
  int minLikes = 0;
  int maxLikes = 0;
  late double screenWidth;
  List<double> likeSpaces = [];
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());
  void setLikes() {
    List tempItems = voteIdeaModel!['items'];
    tempItems.sort((a, b) => b['likeCount'].compareTo(a['likeCount']));

    minLikes = tempItems.last['likeCount'];
    maxLikes = tempItems[0]['likeCount'];
    print('====> There are ${tempItems.length} in the List');
    notifyListeners();
  }

  void getMaxLikes() {
    /// Arrange the list of items in descending order
    List tempItems = voteIdeaModel!['items'];
    tempItems.sort((a, b) => b['likeCount'].compareTo(a['likeCount']));

    minLikes = tempItems.last['likeCount'];
    maxLikes = tempItems[0]['likeCount'];

    print('minLiker ==> $minLikes');
    print('maxLiker ==> $maxLikes');

    /// Assign the like of the last item to minLikes
    /// Assign the like of the first item to maxLikes
    minLikes = voteIdeaModel!['items'].last['likeCount'];
    maxLikes = voteIdeaModel!['items'][0]['likeCount'];

    notifyListeners();
  }

  void updateSpaces() {
    minLikes = voteIdeaModel!['items'].last['likeCount'];
    maxLikes = voteIdeaModel!['items'][0]['likeCount'];

    print('==Current MinLikes==> $minLikes');
    print('==Current MaxLikes==> $maxLikes');
    likeSpaces.clear();

    for (var vote in voteIdeaModel!['items']) {
      print('===> newLike -- ${vote['likeCount']}');
      likeSpaces.add(getLikeSpace(
        like: vote['likeCount'],
        screenWidth: screenWidth,
      ));
    }
    print('==CurrentSpaces==> $likeSpaces');
  }

  // void addLikeSpacesToIdeas() {
  //   // getMaxLikes();
  //
  //   // likeSpaces.clear();
  //   for (var vote in voteIdeaModel!['items']) {
  //     print('===> newLike -- ${vote['likeCount']}');
  //     vote['likeSpace'] = getLikeSpace(
  //       like: vote['likeCount'],
  //       screenWidth: screenWidth,
  //     );
  //   }
  //
  //   // notifyListeners();
  // }

  Future<void> getIdea(BuildContext context) async {
    print('===Getting Vote Ideas===>');
    page = 1;

    screenWidth = MediaQuery.of(context).size.width * 4 - 15;
    notifyListeners();

    try {
      isLoading = true;
      UserDataModel token = await _getSharedPref.getUserData();
      http.Response _response = await http.get(
          Uri.parse(
              "${Urls.voteIdea}${AppConstants.language}&page=$page&size=10"),
          headers: {
            "Content-Type": "Application/Json",
            "Authorization": "${token.authToken}",
          });

      voteIdeaModel = jsonDecode(
        utf8.decode(_response.bodyBytes),
      );
      minLikes = voteIdeaModel!['items'].last['likeCount'];
      maxLikes = voteIdeaModel!['items'][0]['likeCount'];
      updateSpaces();
    } on HttpException catch (e) {
      print('Another Error');
      print('==> $e');
    }

    // voteIdeaModel = await GetVoteIdea().getIdea(page);
    isLoading = false;
    // Vote page scrolls to the end after loading votes
    // scrollController.jumpTo(scrollController.position.maxScrollExtent);
    notifyListeners();
  }

  Future<void> getMoreIdeas(BuildContext context) async {
    print('===Getting More Ideas===>');
    page++;
    screenWidth = MediaQuery.of(context).size.width * 4 - 15;
    notifyListeners();

    try {
      UserDataModel token = await _getSharedPref.getUserData();
      isMoreLoading = true;
      http.Response _response = await http.get(
          Uri.parse(
              "${Urls.voteIdea}${AppConstants.language}&page=$page&size=10"),
          headers: {
            "Content-Type": "Application/Json",
            "Authorization": "${token.authToken}",
          });

      moreVoteIdeaModel = jsonDecode(
        utf8.decode(_response.bodyBytes),
      );

      for (var item in moreVoteIdeaModel!['items']!) {
        voteIdeaModel!['items']!.add(item);
      }
      minLikes = voteIdeaModel!['items'].last['likeCount'];
      maxLikes = voteIdeaModel!['items'][0]['likeCount'];
      updateSpaces();
    } on HttpException catch (e) {
      print('Another Error');
      print('==> $e');
    }

    // voteIdeaModel = await GetVoteIdea().getIdea(page);
    isMoreLoading = false;
    notifyListeners();
  }

  double getLikeSpace({
    required int like,
    required double screenWidth,
  }) {
    /// Get the percentage of the selected like from highest like
    /// And get the percentage from the screenWidth
    double likePercent = (like / maxLikes) * 100;
    double widthPercent = (likePercent / 100) * screenWidth;

    /// Subtract the percentage of lowest likes from the gotten
    double minLikePercent = (minLikes / maxLikes) * 100;
    double minWidthPercent = (minLikePercent / 100) * screenWidth;
    // print('===MinWidthPercent===> $minWidthPercent');
    // print('===WidthPercent===> ${widthPercent - minWidthPercent}');

    /// Subtract the percentage of lowest likes from the gotten
    double maxLikePercent = (maxLikes / maxLikes) * 100;
    double maxWidthPercent = (maxLikePercent / 100) * screenWidth;
    // print('===MinWidthPercent===> $maxWidthPercent');
    // print('===WidthPercent===> ${widthPercent - minWidthPercent}');

    /// percent to make it 0 when the selected like is the lowest
    double finalPercent = widthPercent - minWidthPercent;
    // print('===finalPercent===> $finalPercent');

    ///
    double upsideDownPercent = maxWidthPercent - finalPercent - minWidthPercent;
    // print('===upsideDownPercent===> $upsideDownPercent');

    return finalPercent / page;
  }
}
