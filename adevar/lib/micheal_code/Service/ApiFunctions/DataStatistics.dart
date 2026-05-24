import 'dart:convert';

import 'package:get/get.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:http/http.dart' as http;

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../Constants/AppConstants.dart';
import '../ApiModels/DataStatisticsModel.dart';
import '../Urls.dart';

class DataStatistics {
  Future<DataStatisticsModel?> getEvents() async {
    try {
      final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
          ? Get.find<GetSharedPref>()
          : Get.put(GetSharedPref());
      UserDataModel token = await _getSharedPref.getUserData();
      print(Uri.parse("${Urls.dataStats}${AppConstants.language}"));
      print({
        "Content-Type": "Application/Json",
        "Authorization": "${token.authToken}",
      });
      http.Response _response = await http.get(
          Uri.parse("${Urls.dataStats}${AppConstants.language}"),
          headers: {
            "Content-Type": "Application/Json",
            "Authorization": "${token.authToken}",
          });

      print(_response.statusCode);
      print(_response.body);

      if (_response.statusCode == 200) {
        DataStatisticsModel? _result =
            DataStatisticsModel.fromJson(json.decode(_response.body));
        return _result;
      }
      return null;
    } catch (e) {
      print("Events error: $e");
      return null;
    }
  }
}
