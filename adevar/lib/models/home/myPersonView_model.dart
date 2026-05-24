class MyPersonViewModel {
  bool? flag;
  int? code;
  String? message;
  Data? data;

  MyPersonViewModel({this.flag, this.code, this.message, this.data});

  MyPersonViewModel.fromJson(Map<String, dynamic> json) {
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
  int? userId;
  String? logo;
  String? firstName;
  String? lastName;
  dynamic idNumber;
  String? badgeUrl;
  int? exp;
  int? todayVisit;
  int? newNotificationCount;
  CompletenessOfInfo? completenessOfInfo;

  Data(
      {this.userId,
      this.logo,
      this.firstName,
      this.lastName,
      this.idNumber,
      this.badgeUrl,
      this.exp,
      this.todayVisit,
      this.newNotificationCount,
      this.completenessOfInfo});

  Data.fromJson(Map<String, dynamic> json) {
    userId = json['userId'];
    logo = json['logo'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    idNumber = json['idNumber'];
    badgeUrl = json['badgeUrl'];
    exp = json['exp'];
    todayVisit = json['todayVisit'];
    newNotificationCount = json['newNotificationCount'];
    completenessOfInfo = json['completenessOfInfo'] != null
        ? new CompletenessOfInfo.fromJson(json['completenessOfInfo'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['userId'] = this.userId;
    data['logo'] = this.logo;
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['idNumber'] = this.idNumber;
    data['badgeUrl'] = this.badgeUrl;
    data['exp'] = this.exp;
    data['todayVisit'] = this.todayVisit;
    data['newNotificationCount'] = this.newNotificationCount;
    if (this.completenessOfInfo != null) {
      data['completenessOfInfo'] = this.completenessOfInfo!.toJson();
    }
    return data;
  }
}

class CompletenessOfInfo {
  String? proportion;
  String? isRealPerson;

  CompletenessOfInfo({this.proportion, this.isRealPerson});

  CompletenessOfInfo.fromJson(Map<String, dynamic> json) {
    proportion = json['proportion'];
    isRealPerson = json['isRealPerson'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['proportion'] = this.proportion;
    data['isRealPerson'] = this.isRealPerson;
    return data;
  }
}
