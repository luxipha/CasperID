class GetEmergencyContactModel {
  bool? flag;
  dynamic code;
  String? message;
  // String? noData;
  dynamic data;

  GetEmergencyContactModel({
    this.flag,
    this.code,
    this.message,
    this.data,
  });

  GetEmergencyContactModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    code = json['code'];
    message = json['message'];

    if (json['data'] != null) {
      data = <Data>[];
      json['data'].forEach((v) {
        data!.add(new Data.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['flag'] = this.flag;
    data['code'] = this.code;
    data['message'] = this.message;

    if (this.data != null) {
      data['data'] = this.data!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Data {
  String? logo;
  String? lastName;
  String? firstName;
  String? gender;
  String? position;
  String? city;
  String? company;
  String? mobile;
  dynamic isActivate;
  dynamic ecuserId;

  Data(
      {this.logo,
      this.lastName,
      this.firstName,
      this.gender,
      this.position,
      this.city,
      this.company,
      this.mobile,
      this.isActivate,
      this.ecuserId});

  Data.fromJson(Map<String, dynamic> json) {
    logo = json['logo'];
    lastName = json['lastName'];
    firstName = json['firstName'];
    gender = json['gender'];
    position = json['position'];
    city = json['city'];
    company = json['company'];
    mobile = json['mobile'];
    isActivate = json['isActivate'];
    ecuserId = json['eCUserId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['logo'] = this.logo;
    data['lastName'] = this.lastName;
    data['firstName'] = this.firstName;
    data['gender'] = this.gender;
    data['position'] = this.position;
    data['city'] = this.city;
    data['company'] = this.company;
    data['mobile'] = this.mobile;
    data['isActivate'] = this.isActivate;
    data['eCUserId'] = this.ecuserId;
    return data;
  }
}
