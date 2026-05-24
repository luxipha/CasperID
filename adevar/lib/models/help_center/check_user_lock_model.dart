class CheckUserLockModel {
  bool? flag;
  int? code;
  String? message;
  Data? data;

  CheckUserLockModel({this.flag, this.code, this.message, this.data});

  CheckUserLockModel.fromJson(Map<String, dynamic> json) {
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
  int? isLock;

  Data({this.isLock});

  Data.fromJson(Map<String, dynamic> json) {
    isLock = json['isLock'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['isLock'] = this.isLock;
    return data;
  }
}
