class AddUserInBlackListModel{
  int code;
  bool flag;
  String message;

  AddUserInBlackListModel({required this.code, required this.flag, required this.message});

  factory AddUserInBlackListModel.fromJson(Map<String, dynamic> json) {
    return AddUserInBlackListModel(
      code: json['code'],
      flag: json['flag'],
      message: json['message'],
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['flag'] = this.flag;
    data['message'] = this.message;
    return data;
  }
}