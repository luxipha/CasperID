class SearchEmergencyContactModel {
  bool? flag;
  dynamic counts;
  dynamic page;
  dynamic pageSize;
  dynamic code;
  String? message;
  dynamic items;

  SearchEmergencyContactModel(
      {this.flag,
      this.counts,
      this.page,
      this.pageSize,
      this.code,
      this.message,
      this.items});

  SearchEmergencyContactModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    counts = json['counts'];
    page = json['page'];
    pageSize = json['pageSize'];
    code = json['code'];
    message = json['message'];
    if (json['items'] != '') {
      items = <Items>[];
      json['items'].forEach((v) {
        items!.add(new Items.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['flag'] = this.flag;
    data['counts'] = this.counts;
    data['page'] = this.page;
    data['pageSize'] = this.pageSize;
    data['code'] = this.code;
    data['message'] = this.message;
    if (this.items != null) {
      data['items'] = this.items!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Items {
  String? logo;
  String? lastName;
  String? firstName;
  String? gender;
  String? position;
  String? city;
  String? company;
  String? mobile;
  dynamic isActivate;
  int? ecuserId;

  Items(
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

  Items.fromJson(Map<String, dynamic> json) {
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
