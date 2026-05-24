import 'dart:convert';

import 'package:get/get.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class GetSharedPref extends GetxController {
  late UserDataModel _userDataModel;

  @override
  void onInit() async {
    super.onInit();
    _userDataModel = UserDataModel();
    loadPreference();
    loadProfileSharedPreference();

    //categoriesModel = await getCategoriesApi();
  }

  void setUserData(UserDataModel userDataModel) {
    _userDataModel = userDataModel;

    update();
  }

  String? getToken() {
    print(_userDataModel.authToken);
    return _userDataModel.authToken;
  }

  Future<UserDataModel> getUserData() async {
    SharedPreferences pref = await SharedPreferences.getInstance();
    UserDataModel userDataModel = decode(pref.getString("userData"));
    return userDataModel;
  }

  Future<void> saveSharedPreference(UserDataModel userDataModel) async {
    SharedPreferences pref = await SharedPreferences.getInstance();

    try {
      pref.setString('email', userDataModel.userEmail.toString());
      pref.setString('phoneNumber', userDataModel.userNumber.toString());
    } catch (e) {}
    var data = encode(userDataModel);
    pref.setString("userData", data);
    setUserData(userDataModel);
  }

  UserDataModel get userDataModel => _userDataModel;

  loadProfileSharedPreference() async {
    SharedPreferences pref = await SharedPreferences.getInstance();
    UserDataModel userProfileModel = new UserDataModel();
  }

  loadPreference() async {
    SharedPreferences pref = await SharedPreferences.getInstance();
    if (pref.getString("userData") != null) {
      UserDataModel userDataModel = decode(pref.getString("userData"));
      if (userDataModel != null) {
        setUserData(userDataModel);
      }
    }
  }

  clearPreference() async {
    SharedPreferences pref = await SharedPreferences.getInstance();
    UserDataModel model = new UserDataModel();
    model.isLoggedIn = false;
    model.userId = "";
    model.userNumber = "";
    model.userEmail = "";
    model.userName = "";
    model.fullName = "";
    model.authToken = "";
    model.firstName = "";
    model.lastName = "";
    model.tokenExpire = "";
    model.refreshTokenExpire = "";
    model.refreshToken = "";
    model.isNewUser = false;
    model.isUserRegistered = false;
    model.isLoggedIn = false;
    model.profilePicture = "";

    saveSharedPreference(model);
  }

  static String encode(UserDataModel userData) =>
      json.encode(userData.toMap(userData));

  static UserDataModel decode(String? musics) {
    var response = json.decode(musics!);
    final result = UserDataModel.fromJson(response);
    return result;
  }
}
