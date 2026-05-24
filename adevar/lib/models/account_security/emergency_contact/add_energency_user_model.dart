class AddEmergencyContactModel {
  bool? flag;
  int? code;
  String? message;

  AddEmergencyContactModel({this.flag, this.code, this.message});

  AddEmergencyContactModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    code = json['code'];
    message = json['message'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['flag'] = this.flag;
    data['code'] = this.code;
    data['message'] = this.message;
    return data;
  }
}
