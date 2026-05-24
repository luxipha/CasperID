import 'dart:convert';
import 'dart:io';

import 'dart:typed_data';

class UserDataModel {
  String? userId;
  String? userName;
  String? fullName;
  String? userEmail;
  String? userNumber;
  bool? isLoggedIn;
  String? authToken;
  String? firstName;
  String? lastName;
  String? refreshToken;
  String? tokenExpire;
  String? refreshTokenExpire;
  bool? isNewUser;
  bool? isUserRegistered;
  String? uniqueId;

  String? profilePicture;

  String? dummyProfilePicture;

  String? uuid;
  String? profileImageFile;
  String? badgeUrl;

  /* UserDataModel(
      {this.userId,
        this.userName,
        this.fullName,
        this.userEmail,
        this.isLoggedIn,
        this.userNumber,this.authToken,});*/

  UserDataModel({
    this.userId,
    this.userName,
    this.firstName,
    this.lastName,
    this.fullName,
    this.userEmail,
    this.userNumber,
    this.isLoggedIn,
    this.authToken,
    this.refreshToken,
    this.tokenExpire,
    this.refreshTokenExpire,
    this.isNewUser,
    this.isUserRegistered,
    this.uuid,
    this.profilePicture,
    this.uniqueId,
    this.dummyProfilePicture,
    this.profileImageFile,
    this.badgeUrl,
  });

  String? getProfileImageFile() {
    return profileImageFile;
  }

  setProfileImageFile(String profileImageFile) {
    this.profileImageFile = profileImageFile;
  }

  String? getBadgeUrl() {
    return badgeUrl;
  }

  setBadgeUrl(String profileImageFile) {
    this.badgeUrl = profileImageFile;
  }

  String? getProfilePicture() {
    return profilePicture;
  }

  setProfilePicture(String profilePicture) {
    this.profilePicture = profilePicture;
  }

  String? getDummyProfilePicture() {
    return dummyProfilePicture;
  }

  setDummyProfilePicture(String dummyProfilePicture) {
    this.dummyProfilePicture = dummyProfilePicture;
  }

  String? getUUID() {
    return uuid;
  }

  setUUID(String userStatus) {
    this.uuid = uuid;
  }

  String? getUniqueId() {
    return uniqueId;
  }

  setUniqueId(String uniqueId) {
    this.uniqueId = uniqueId;
  }

  String? getRefreshToken() {
    return refreshToken;
  }

  String? getTokenExpire() {
    return tokenExpire;
  }

  String? getRefreshTokenExpire() {
    return refreshTokenExpire;
  }

  setRefreshToken(String rToken) {
    this.refreshToken = rToken;
  }

  bool? getIsUserRegistered() {
    return isUserRegistered;
  }

  setsUserRegistered(bool userStatus) {
    this.isUserRegistered = userStatus;
  }

  String? getFirstName() {
    return firstName;
  }

  setFirstName(String firstName) {
    this.firstName = firstName;
  }

  String? getLastName() {
    return lastName;
  }

  setLastName(String lastName) {
    this.lastName = lastName;
  }

  bool? getIsNewUser() {
    return isNewUser;
  }

  setIsNewUser(bool newUser) {
    this.isNewUser = newUser;
  }

  setTokenExpire(String tExpire) {
    this.tokenExpire = tExpire;
  }

  setRefreshTokenExpire(String rTExpire) {
    this.refreshTokenExpire = rTExpire;
  }

  //////////

  String? getPhoneNumber() {
    return userNumber;
  }

  String? getUserId() {
    return userId;
  }

  bool? isLogin() {
    return isLoggedIn;
  }

  String? getFullName() {
    return fullName;
  }

  String? getUserName() {
    return userName;
  }

  String? getEmail() {
    return userEmail;
  }

  String? getToken() {
    return authToken;
  }

  setAuthToken(String token) {
    this.authToken = token;
  }

  setLogin(bool isLogin) {
    isLoggedIn = isLogin;
  }

  setPhoneNumber(String number) {
    this.userNumber = number;
  }

  setUserName(String name) {
    this.userName = name;
  }

  setUserId(String id) {
    this.userId = id;
  }

  setFullName(String fullName) {
    this.fullName = fullName;
  }

  setUserEmail(String email) {
    this.userEmail = email;
  }

  Map<String, dynamic> toMap(UserDataModel user) => {
        'id': user.userId,
        'name': user.fullName,
        'username': user.userName,
        'email': user.userEmail,
        'phone': user.userNumber,
        'isLoggedIn': user.isLoggedIn,
        'authToken': user.authToken,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'refreshToken': user.refreshToken,
        'tokenExpire': user.tokenExpire,
        'refreshTokenExpire': user.refreshTokenExpire,
        'isNewUser': user.isNewUser,
        'isUserRegistered': user.isUserRegistered,
        'profilePicture': user.profilePicture,
        'uniqueId': user.uniqueId,
        'uuid': user.uuid,
        'dummyProfilePicture': user.dummyProfilePicture,
        'badgeUrl': user.badgeUrl,
      };

  factory UserDataModel.fromJson(Map<String, dynamic> jsonData) {
    return UserDataModel(
        userId: jsonData['id'],
        fullName: jsonData['name'],
        userName: jsonData['username'],
        userEmail: jsonData['email'],
        userNumber: jsonData['phone'],
        isLoggedIn: jsonData['isLoggedIn'],
        authToken: jsonData['authToken'],
        firstName: jsonData['firstName'],
        lastName: jsonData['lastName'],
        refreshToken: jsonData['refreshToken'],
        tokenExpire: jsonData['tokenExpire'],
        refreshTokenExpire: jsonData['refreshTokenExpire'],
        isNewUser: jsonData['isNewUser'],
        isUserRegistered: jsonData['isUserRegistered'],
        uniqueId: jsonData['uniqueId'],
        profilePicture: jsonData['profilePicture'],
        uuid: jsonData['uuid'],
        dummyProfilePicture: jsonData['dummyProfilePicture'],
        badgeUrl: jsonData['badgeUrl']);
  }
}
