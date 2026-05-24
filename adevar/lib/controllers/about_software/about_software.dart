import 'dart:developer';

import 'package:get/get.dart';
import 'package:highfedilityadevar/models/setting/about_software_model.dart';
import '../../services/api_service.dart';

class AboutSoftwareController extends GetxController {
  Future<AboutSoftwareModel> getSoftwareInfo() async {
    final response = await ApiService.get(
      "system/getAppDocumentInfo?lang=en_US",
    );
    print(response);
    return AboutSoftwareModel.fromJson(response);
  }
}
