import 'dart:developer';
import 'package:get/get.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/home/getVisitByWeek_model.dart';
import 'package:highfedilityadevar/models/home/getVisitsByMonth_model.dart';
import 'package:highfedilityadevar/models/home/get_notification_model.dart';
import 'package:highfedilityadevar/models/home/myPersonView_model.dart';
import 'package:highfedilityadevar/models/home/userDataStaticsView_model.dart';
import 'package:highfedilityadevar/models/home/weekly_status_model.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';

import '../../services/api_service.dart';

class HomeScreenController extends GetxController {
  // UserProfileModel? userProfileModel;

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  // void getUserProfileApi() async {
  //
  // }

  Future<MyPersonViewModel> getPersonView() async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();

      final response = await ApiService.get(
        "home/myPersonView?lang=en_US",
        headerMap: {
          // "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();
      return MyPersonViewModel.fromJson(response);
    } catch (error) {
      print("------------------");
      print(error);
      throw error.toString();
    }
  }

  Future<GetAllNotificationModel> getNotification(pageCount) async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();

      final response = await ApiService.get(
        "socialContact/notifiaction/notifiactionFindPage?lang=en_US&page=$pageCount&size=10",
        headerMap: {
          // "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();

      return GetAllNotificationModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  deleteNotification(id) async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();

      final response = await ApiService.delete(
        "socialContact/notifiaction/$id?lang=en_US",
        headerMap: {
          // "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();

      return response;
    } catch (error) {
      print('\x1b[92m $error');
      throw error.toString();
    }
  }

  Future<UserDataStaticsViewModel> getDataStatics() async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();

      final response = await ApiService.get(
        "dataStatics/getUserView?lang=en_US",
        headerMap: {
          // "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();
      return UserDataStaticsViewModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<WeeklyStatusModel> getWeeklyStats() async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();

      final response = await ApiService.get(
        "dataStatics/getWeeklyStats?lang=en_US",
        headerMap: {
          // "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();
      return WeeklyStatusModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<GetVisitByMonthModel> getVisitsByMonth() async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();

      final response = await ApiService.get(
        "dataStatics/getVisitsByMonth?lang=en_US",
        headerMap: {
          // "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();
      return GetVisitByMonthModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  int? weekOfMonth;
  Future<GetVisitByWeekModel> getVisitsByWeek(weekNum) async {
    try {
      UserDataModel userDataModel = await _getSharedPref.getUserData();
      log(userDataModel.authToken!);

      final response = await ApiService.get(
        "dataStatics/getVisitsByWeek?lang=en_US&weekNum=$weekNum",
        headerMap: {
          // "Content-Type": "application/json",
          "Authorization": userDataModel.authToken!
        },
      );

      update();
      return GetVisitByWeekModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }
}
