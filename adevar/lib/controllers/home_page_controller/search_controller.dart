import 'package:get/get.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/home/search/getAllCityModel.dart';
import 'package:highfedilityadevar/models/home/search/getAllCompanyModel.dart';
import 'package:highfedilityadevar/models/home/search/getAllRegionModel.dart';
import 'package:highfedilityadevar/models/home/search/search_user_model.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class SearchController extends GetxController {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  Future<SearchUserModel> searchUser(Map<String, dynamic> params) async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();

      final response = await ApiService.post(
        "socialContact/search/searchUser?lang=en_US",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();
      return SearchUserModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  String companyNameInitial = "A";
  Future<GetAllCompanyModel> getAllCompany(pageCount) async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();

      final response = await ApiService.get(
        "socialContact/search/getAllCompany?lang=en_US&companyNameInitial=$companyNameInitial&page=$pageCount&size=10",
        headerMap: {
          // "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();
      return GetAllCompanyModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  String workNameInitial = "A";
  Future<GetAllCompanyModel> getAllWork(pageCount) async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();

      final response = await ApiService.get(
        "socialContact/search/getAllPosition?lang=en_US&workNameInitial=$workNameInitial&page=$pageCount&size=20",
        headerMap: {
          // "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();
      return GetAllCompanyModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<GetAllCityModel> getAllCity(countryId) async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();

      final response = await ApiService.get(
        "socialContact/search/reset/city?countyId=$countryId&lang=en_US",
        headerMap: {
          // "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();
      return GetAllCityModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<GetAllRegionModel> getAllRegion(cityId) async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();

      final response = await ApiService.get(
        "socialContact/search/reset/region?cityId=$cityId&lang=en_US",
        headerMap: {
          // "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();
      return GetAllRegionModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  String selectedCountryName = '';
  String selectedCityName = '';
  String selectedRegionName = '';
}
