import 'dart:convert';
import 'dart:io';

import 'package:get/get.dart';
import 'package:http/http.dart' as http;

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';
import '../../Constants/AppConstants.dart';
import '../ApiModels/FormIdeaListModel.dart';
import '../Urls.dart';

class IdeaListService {
  Future<FormIdeaListModel?> getIdeas(
      {required int ideaType, int? page, required String queryType}) async {
    try {
      final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
          ? Get.find<GetSharedPref>()
          : Get.put(GetSharedPref());
      UserDataModel token = await _getSharedPref.getUserData();
      print(
          "===---===> ${Urls.ideaList}${AppConstants.language}&page=${page ?? 1}&size=5&ideaType=${ideaType}&queryType=$queryType");
      http.Response _response = await http.get(
          Uri.parse(
              "${Urls.ideaList}${AppConstants.language}&page=${page ?? 1}&size=5&ideaType=${ideaType}&queryType=$queryType"),
          headers: {
            "Content-Type": "Application/Json",
            "Authorization": "${token.authToken}",
          });

      print(_response.statusCode);
      print(_response.body);

      if (_response.statusCode == 200) {
        FormIdeaListModel? _result = FormIdeaListModel.fromJson(
            json.decode(utf8.decode(_response.bodyBytes)));
        print('Ideas ===> $_result');
        return _result;
      }

      return null;
    } on HttpException catch (e) {
      print('====Status====> ${e.message}');
      print("======> Ideal List error: $e");
      return null;
    }
  }
}
