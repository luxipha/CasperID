class VerifyOTPSentToPhoneModel {
  bool? flag;
  int? code;
  String? message;
  Data? data;

  VerifyOTPSentToPhoneModel({this.flag, this.code, this.message, this.data});

  VerifyOTPSentToPhoneModel.fromJson(Map<String, dynamic> json) {
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
  String? certificate;

  Data({this.certificate});

  Data.fromJson(Map<String, dynamic> json) {
    certificate = json['certificate'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['certificate'] = this.certificate;
    return data;
  }
}
