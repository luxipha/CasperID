import 'dart:convert';
import 'dart:io';

import 'package:get/get.dart';
import 'package:http/http.dart' as http;


import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';
import '../../Constants/AppConstants.dart';
import '../ApiModels/VotedFeatureIdeaModel.dart';
import '../Urls.dart';

class VotedFeaturedService {
  Future<VotedFeatureIdeaModel?> getIdeas(int page) async {
    try {
      final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
          ? Get.find<GetSharedPref>()
          : Get.put(GetSharedPref());
      UserDataModel token = await _getSharedPref.getUserData();
      http.Response _response = await http.get(
          Uri.parse(
              "${Urls.votedFeature}${AppConstants.language}&page=$page&size=10"),
          headers: {
            "Content-Type": "Application/Json",
            "Authorization": "${token.authToken}",
          });

      print(_response.statusCode);
      print(_response.body);
      print('======No Error======> ');

      if (_response.statusCode == 200) {
        VotedFeatureIdeaModel? _result = VotedFeatureIdeaModel.fromJson(
          json.decode(
            utf8.decode(_response.bodyBytes),
          ),
        );
        return _result;
      } else {
        // return null;
      }
    } on HttpException catch (e) {
      print('==============> ');
      print("Ideal List error: $e");
      return null;
    }
  }
}
