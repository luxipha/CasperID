class GetAllCompanyModel {
  bool? flag;
  int? counts;
  int? page;
  int? latestCount;
  int? pageSize;
  int? code;
  String? message;
  List<String>? items;

  GetAllCompanyModel(
      {this.flag,
      this.counts,
      this.page,
      this.latestCount,
      this.pageSize,
      this.code,
      this.message,
      this.items});

  GetAllCompanyModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    counts = json['counts'];
    page = json['page'];
    latestCount = json['latestCount'];
    pageSize = json['pageSize'];
    code = json['code'];
    message = json['message'];
    items = json['items'].cast<String>();
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['flag'] = this.flag;
    data['counts'] = this.counts;
    data['page'] = this.page;
    data['latestCount'] = this.latestCount;
    data['pageSize'] = this.pageSize;
    data['code'] = this.code;
    data['message'] = this.message;
    data['items'] = this.items;
    return data;
  }
}
