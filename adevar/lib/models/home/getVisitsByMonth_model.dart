class GetVisitByMonthModel {
  bool? flag;
  int? code;
  String? message;
  List<String>? data;

  GetVisitByMonthModel({this.flag, this.code, this.message, this.data});

  GetVisitByMonthModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    code = json['code'];
    message = json['message'];
    data = json['data'].cast<String>();
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
