class IniviteEmergencyContactModel {
  int? code;
  bool? flag;
  String? message;

  IniviteEmergencyContactModel({this.code, this.flag, this.message});

  IniviteEmergencyContactModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    flag = json['flag'];
    message = json['message'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['flag'] = this.flag;
    data['message'] = this.message;
    return data;
  }
}
