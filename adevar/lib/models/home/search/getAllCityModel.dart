class GetAllCityModel {
  bool? flag;
  int? code;
  String? message;
  List<Data>? data;

  GetAllCityModel({this.flag, this.code, this.message, this.data});

  GetAllCityModel.fromJson(Map<String, dynamic> json) {
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
  String? citid;
  String? stateId;
  String? code;
  String? name;
  String? cname;
  String? lowerName;
  String? codeFull;

  Data(
      {this.citid,
      this.stateId,
      this.code,
      this.name,
      this.cname,
      this.lowerName,
      this.codeFull});

  Data.fromJson(Map<String, dynamic> json) {
    citid = json['citid'];
    stateId = json['stateId'];
    code = json['code'];
    name = json['name'];
    cname = json['cname'];
    lowerName = json['lowerName'];
    codeFull = json['codeFull'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['citid'] = this.citid;
    data['stateId'] = this.stateId;
    data['code'] = this.code;
    data['name'] = this.name;
    data['cname'] = this.cname;
    data['lowerName'] = this.lowerName;
    data['codeFull'] = this.codeFull;
    return data;
  }
}
