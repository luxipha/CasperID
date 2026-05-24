import 'dart:convert';

import 'package:get/get.dart';
import 'package:http/http.dart' as http;

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';
import '../../Constants/AppConstants.dart';
import '../ApiModels/CurrentVersionIdeaModel.dart';
import '../Urls.dart';


class CurrentVersionService {
  Future<CurrentVersionIdeaModel?> getIdeas() async {
    try {
      final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
          ? Get.find<GetSharedPref>()
          : Get.put(GetSharedPref());
      UserDataModel token = await _getSharedPref.getUserData();
      http.Response _response = await http.get(
          Uri.parse(
              "${Urls.currentVersion}${AppConstants.language}&page=1&size=5"),
          headers: {
            "Content-Type": "Application/Json",
            "Authorization": "${token.authToken}",
          });

      print(_response.statusCode);
      print(_response.body);

      if (_response.statusCode == 200) {
        CurrentVersionIdeaModel? _result = CurrentVersionIdeaModel.fromJson(
          json.decode(
            utf8.decode(_response.bodyBytes),
          ),
        );
        return _result;
      }
      return null;
    } catch (e) {
      print("current version List error: $e");
      return null;
    }
  }
}
