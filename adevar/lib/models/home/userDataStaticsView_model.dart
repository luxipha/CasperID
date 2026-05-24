class UserDataStaticsViewModel {
  bool? flag;
  int? code;
  String? message;
  Data? data;

  UserDataStaticsViewModel({this.flag, this.code, this.message, this.data});

  UserDataStaticsViewModel.fromJson(Map<String, dynamic> json) {
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
  String? logo;
  int? userId;
  String? firstName;
  String? lastName;
  int? vipLv;
  String? position;
  dynamic city;
  String? country;

  Data(
      {this.logo,
      this.userId,
      this.firstName,
      this.lastName,
      this.vipLv,
      this.position,
      this.city,
      this.country});

  Data.fromJson(Map<String, dynamic> json) {
    logo = json['logo'];
    userId = json['userId'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    vipLv = json['vipLv'];
    position = json['position'];
    city = json['city'];
    country = json['country'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['logo'] = this.logo;
    data['userId'] = this.userId;
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['vipLv'] = this.vipLv;
    data['position'] = this.position;
    data['city'] = this.city;
    data['country'] = this.country;
    return data;
  }
}
