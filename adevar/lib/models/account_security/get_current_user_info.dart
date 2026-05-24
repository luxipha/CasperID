class GetCurrentUserInfoModel {
  bool? flag;
  int? code;
  String? message;
  Data? data;

  GetCurrentUserInfoModel({this.flag, this.code, this.message, this.data});

  GetCurrentUserInfoModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    code = json['code'];
    message = json['message'];
    data = json['data'] != null ? new Data.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['flag'] = this.flag;
    data['code'] = this.code;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class Data {
  User? user;
  UserLogo? userLogo;
  UserInfo? userInfo;

  Data({this.user, this.userLogo, this.userInfo});

  Data.fromJson(Map<String, dynamic> json) {
    user = json['user'] != null ? new User.fromJson(json['user']) : null;
    userLogo = json['userLogo'] != null
        ? new UserLogo.fromJson(json['userLogo'])
        : null;
    userInfo = json['userInfo'] != null
        ? new UserInfo.fromJson(json['userInfo'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.user != null) {
      data['user'] = this.user!.toJson();
    }
    if (this.userLogo != null) {
      data['userLogo'] = this.userLogo!.toJson();
    }
    if (this.userInfo != null) {
      data['userInfo'] = this.userInfo!.toJson();
    }
    return data;
  }
}

class User {
  String? created;
  String? updated;
  int? id;
  String? mobile;
  String? pin;
  String? email;
  int? isLock;
  dynamic language;

  User(
      {this.created,
      this.updated,
      this.id,
      this.mobile,
      this.pin,
      this.email,
      this.isLock,
      this.language});

  User.fromJson(Map<String, dynamic> json) {
    created = json['created'];
    updated = json['updated'];
    id = json['id'];
    mobile = json['mobile'];
    pin = json['pin'];
    email = json['email'];
    isLock = json['isLock'];
    language = json['language'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['created'] = this.created;
    data['updated'] = this.updated;
    data['id'] = this.id;
    data['mobile'] = this.mobile;
    data['pin'] = this.pin;
    data['email'] = this.email;
    data['isLock'] = this.isLock;
    data['language'] = this.language;
    return data;
  }
}

class UserLogo {
  String? created;
  String? updated;
  int? id;
  int? userId;
  String? logoUrl;
  String? bigLogoUrl;
  String? hdLogoUrl;
  int? isNow;
  String? uuid;

  UserLogo(
      {this.created,
      this.updated,
      this.id,
      this.userId,
      this.logoUrl,
      this.bigLogoUrl,
      this.hdLogoUrl,
      this.isNow,
      this.uuid});

  UserLogo.fromJson(Map<String, dynamic> json) {
    created = json['created'];
    updated = json['updated'];
    id = json['id'];
    userId = json['userId'];
    logoUrl = json['logoUrl'];
    bigLogoUrl = json['bigLogoUrl'];
    hdLogoUrl = json['hdLogoUrl'];
    isNow = json['isNow'];
    uuid = json['uuid'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['created'] = this.created;
    data['updated'] = this.updated;
    data['id'] = this.id;
    data['userId'] = this.userId;
    data['logoUrl'] = this.logoUrl;
    data['bigLogoUrl'] = this.bigLogoUrl;
    data['hdLogoUrl'] = this.hdLogoUrl;
    data['isNow'] = this.isNow;
    data['uuid'] = this.uuid;
    return data;
  }
}

class UserInfo {
  String? created;
  String? updated;
  int? id;
  int? userId;
  String? firstName;
  String? lastName;
  String? gender;
  dynamic introduction;
  String? country;
  dynamic state;
  dynamic city;
  dynamic address;
  dynamic dateOfBirth;
  String? position;

  UserInfo(
      {this.created,
      this.updated,
      this.id,
      this.userId,
      this.firstName,
      this.lastName,
      this.gender,
      this.introduction,
      this.country,
      this.state,
      this.city,
      this.address,
      this.dateOfBirth,
      this.position});

  UserInfo.fromJson(Map<String, dynamic> json) {
    created = json['created'];
    updated = json['updated'];
    id = json['id'];
    userId = json['userId'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    gender = json['gender'];
    introduction = json['introduction'];
    country = json['country'];
    state = json['state'];
    city = json['city'];
    address = json['address'];
    dateOfBirth = json['dateOfBirth'];
    position = json['position'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['created'] = this.created;
    data['updated'] = this.updated;
    data['id'] = this.id;
    data['userId'] = this.userId;
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['gender'] = this.gender;
    data['introduction'] = this.introduction;
    data['country'] = this.country;
    data['state'] = this.state;
    data['city'] = this.city;
    data['address'] = this.address;
    data['dateOfBirth'] = this.dateOfBirth;
    data['position'] = this.position;
    return data;
  }
}
