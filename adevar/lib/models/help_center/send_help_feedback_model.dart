class SendHelpAndFeedbackModel {
  SendHelpAndFeedbackModel({
    this.code,
    this.flag,
    this.message,
  });

  int? code;
  bool? flag;
  String? message;

  factory SendHelpAndFeedbackModel.fromJson(Map<String, dynamic> json) =>
      SendHelpAndFeedbackModel(
        code: json["code"] == null ? null : json["code"],
        flag: json["flag"] == null ? null : json["flag"],
        message: json["message"] == null ? null : json["message"],
      );

  Map<String, dynamic> toJson() => {
        "code": code == null ? null : code,
        "flag": flag == null ? null : flag,
        "message": message == null ? null : message,
      };
}
