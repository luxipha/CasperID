import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';
import '../../Constants/AppConstants.dart';
import '../ApiModels/vote_idea_model.dart';
import '../Urls.dart';

class GetVoteIdea {
  Future<VoteIdeaModel?> getIdea(int? page) async {
    try {
      final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
          ? Get.find<GetSharedPref>()
          : Get.put(GetSharedPref());
      UserDataModel token = await _getSharedPref.getUserData();
      print('Get Vote Idea');
      http.Response _response = await http.get(
          Uri.parse(
              "${Urls.voteIdea}${AppConstants.language}&page=$page&size=10"),
          headers: {
            "Content-Type": "Application/Json",
            "Authorization": "${token.authToken}",
          });

      print("HAHA ${Urls.voteIdea}${AppConstants.language}&page=$page&size=10");

      print(_response.statusCode);
      print(_response.body);

      if (_response.statusCode == 200) {
        VoteIdeaModel? _result = VoteIdeaModel.fromJson(
          json.decode(
            utf8.decode(_response.bodyBytes),
          ),
        );
        return _result;
      } else {
        print('Stupid Error');
        return null;
      }
    } catch (e) {
      print("Ideal List error: $e");
      return null;
    }
  }
}
