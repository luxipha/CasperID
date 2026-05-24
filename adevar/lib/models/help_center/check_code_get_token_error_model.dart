class CheckCodeAndGetTokenErrorModel {
  int? code;
  Data? data;
  bool? flag;
  String? message;

  CheckCodeAndGetTokenErrorModel(
      {this.code, this.data, this.flag, this.message});

  CheckCodeAndGetTokenErrorModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    data = json['data'] != null ? new Data.fromJson(json['data']) : null;
    flag = json['flag'];
    message = json['message'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    data['flag'] = this.flag;
    data['message'] = this.message;
    return data;
  }
}

class Data {
  int? remainingCount;

  Data({this.remainingCount});

  Data.fromJson(Map<String, dynamic> json) {
    remainingCount = json['remainingCount'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['remainingCount'] = this.remainingCount;
    return data;
  }
}
