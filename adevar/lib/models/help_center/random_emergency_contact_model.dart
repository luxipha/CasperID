class RandomEmergeancyContactModel {
  bool? flag;
  int? code;
  String? message;
  List<ContactData>? data;

  RandomEmergeancyContactModel({this.flag, this.code, this.message, this.data});

  RandomEmergeancyContactModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    code = json['code'];
    message = json['message'];
    if (json['data'] != null) {
      data = <ContactData>[];
      json['data'].forEach((v) {
        data!.add(new ContactData.fromJson(v));
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

class ContactData {
  int? userId;
  String? firstName;
  String? lastName;
  String? logo;
  int? ecuserId;

  ContactData(
      {this.userId, this.firstName, this.lastName, this.logo, this.ecuserId});

  ContactData.fromJson(Map<String, dynamic> json) {
    userId = json['userId'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    logo = json['logo'];
    ecuserId = json['eCUserId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['userId'] = this.userId;
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['logo'] = this.logo;
    data['eCUserId'] = this.ecuserId;
    return data;
  }
}
