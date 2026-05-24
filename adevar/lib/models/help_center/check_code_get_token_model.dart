class CheckCodeAndGetTokenModel {
  bool? flag;
  int? code;
  String? message;
  dynamic data;

  CheckCodeAndGetTokenModel({this.flag, this.code, this.message, this.data});

  CheckCodeAndGetTokenModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    code = json['code'];
    message = json['message'];
    data = json['data'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['flag'] = this.flag;
    data['code'] = this.code;
    data['message'] = this.message;
    data['data'] = this.data;
    return data;
  }
}
