class VerifyOldPinModel {
  bool? flag;
  int? code;
  String? message;
  Data? data;

  VerifyOldPinModel({this.flag, this.code, this.message, this.data});

  VerifyOldPinModel.fromJson(Map<String, dynamic> json) {
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
  String? certificateCode;

  Data({this.certificateCode});

  Data.fromJson(Map<String, dynamic> json) {
    certificateCode = json['certificateCode'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['certificateCode'] = this.certificateCode;
    return data;
  }
}
