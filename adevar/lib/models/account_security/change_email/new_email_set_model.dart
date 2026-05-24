import 'dart:convert';

NewEmailSetModel newEmailSetModelFromJson(String str) =>
    NewEmailSetModel.fromJson(json.decode(str));

String newEmailSetModelToJson(NewEmailSetModel data) =>
    json.encode(data.toJson());

class NewEmailSetModel {
  NewEmailSetModel({
    this.flag,
    this.code,
    this.message,
    this.data,
  });

  bool? flag;
  int? code;
  String? message;
  Data? data;

  factory NewEmailSetModel.fromJson(Map<String, dynamic> json) =>
      NewEmailSetModel(
        flag: json["flag"] == null ? null : json["flag"],
        code: json["code"] == null ? null : json["code"],
        message: json["message"] == null ? null : json["message"],
        data: json["data"] == null ? null : Data.fromJson(json["data"]),
      );

  Map<String, dynamic> toJson() => {
        "flag": flag == null ? null : flag,
        "code": code == null ? null : code,
        "message": message == null ? null : message,
        "data": data == null ? null : data!.toJson(),
      };
}

class Data {
  Data({
    this.newEmail,
  });

  String? newEmail;

  factory Data.fromJson(Map<String, dynamic> json) => Data(
        newEmail: json["newEmail"] == null ? null : json["newEmail"],
      );

  Map<String, dynamic> toJson() => {
        "newEmail": newEmail == null ? null : newEmail,
      };
}
