class GetAllCountryModel {
  bool? flag;
  int? code;
  String? message;
  List<Data>? data;

  GetAllCountryModel({this.flag, this.code, this.message, this.data});

  GetAllCountryModel.fromJson(Map<String, dynamic> json) {
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
  String? couid;
  String? continentId;
  String? code;
  String? name;
  String? fullName;
  String? cname;
  String? fullCname;
  String? lowerName;
  String? remark;

  Data(
      {this.couid,
      this.continentId,
      this.code,
      this.name,
      this.fullName,
      this.cname,
      this.fullCname,
      this.lowerName,
      this.remark});

  Data.fromJson(Map<String, dynamic> json) {
    couid = json['couid'];
    continentId = json['continentId'];
    code = json['code'];
    name = json['name'];
    fullName = json['fullName'];
    cname = json['cname'];
    fullCname = json['fullCname'];
    lowerName = json['lowerName'];
    remark = json['remark'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['couid'] = this.couid;
    data['continentId'] = this.continentId;
    data['code'] = this.code;
    data['name'] = this.name;
    data['fullName'] = this.fullName;
    data['cname'] = this.cname;
    data['fullCname'] = this.fullCname;
    data['lowerName'] = this.lowerName;
    data['remark'] = this.remark;
    return data;
  }
}
