class GetUserInfoModel{
  bool? flag;
  int? code;
  String? message;
  UserInfoData? data;

  GetUserInfoModel({this.flag, this.code, this.message, this.data});

  GetUserInfoModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    code = json['code'];
    message = json['message'];
    data = json['data'] != null ? new UserInfoData.fromJson(json['data']) : null;
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

class UserInfoData {
  List<UserLogos>? userLogos;
  UserInfo? userInfo;
  List<Educations> educations = [];
  List<WorkExperiences> workExperiences = [];
  List<UserSkills> userSkills = [];

  UserInfoData(
      {this.userLogos,
        this.userInfo,
        required this.educations,
        required this.workExperiences,
        required this.userSkills});

  UserInfoData.fromJson(Map<String, dynamic> json) {
    if (json['userLogos'] != null) {
      userLogos = <UserLogos>[];
      json['userLogos'].forEach((v) {
        userLogos!.add(new UserLogos.fromJson(v));
      });
    }
    userInfo = json['userInfo'] != null
        ? new UserInfo.fromJson(json['userInfo'])
        : null;
    if (json['educations'] != null) {
      educations = <Educations>[];
      json['educations'].forEach((v) {
        educations.add(new Educations.fromJson(v));
      });
    }
    if (json['workExperiences'] != null) {
      workExperiences = <WorkExperiences>[];
      json['workExperiences'].forEach((v) {
        workExperiences.add(new WorkExperiences.fromJson(v));
      });
    }
    if (json['userSkills'] != null) {
      userSkills = <UserSkills>[];
      json['userSkills'].forEach((v) {
        userSkills.add(new UserSkills.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.userLogos != null) {
      data['userLogos'] = this.userLogos!.map((v) => v.toJson()).toList();
    }
    if (this.userInfo != null) {
      data['userInfo'] = this.userInfo!.toJson();
    }
    data['educations'] = this.educations.map((v) => v.toJson()).toList();
    data['workExperiences'] =
        this.workExperiences.map((v) => v.toJson()).toList();
    data['userSkills'] = this.userSkills.map((v) => v.toJson()).toList();
    return data;
  }
}

class UserLogos {
  String? created;
  String? updated;
  int? id;
  int? userId;
  String? logoUrl;
  String? bigLogoUrl;
  String? hdLogoUrl;
  int? isNow;
  String? uuid;

  UserLogos(
      {this.created,
        this.updated,
        this.id,
        this.userId,
        this.logoUrl,
        this.bigLogoUrl,
        this.hdLogoUrl,
        this.isNow,
        this.uuid});

  UserLogos.fromJson(Map<String, dynamic> json) {
    created = json['created'];
    updated = json['updated'];
    id = json['id'];
    userId = json['userId'];
    logoUrl = json['logoUrl'];
    bigLogoUrl = json['bigLogoUrl'];
    hdLogoUrl = json['hdLogoUrl'];
    isNow = json['isNow'];
    uuid = json['uuid']??"";
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['created'] = this.created;
    data['updated'] = this.updated;
    data['id'] = this.id;
    data['userId'] = this.userId;
    data['logoUrl'] = this.logoUrl;
    data['bigLogoUrl'] = this.bigLogoUrl;
    data['hdLogoUrl'] = this.hdLogoUrl;
    data['isNow'] = this.isNow;
    data['uuid'] = this.uuid;
    return data;
  }
}

class UserInfo {
  String? created;
  String? updated;
  int? id;
  int? userId;
  String? firstName;
  String? lastName;
  String? gender;
  String? introduction;
  String? country;
  String? state;
  String? city;
  String? address;
  String? dateOfBirth;
  String? position;

  UserInfo(
      {this.created,
        this.updated,
        this.id,
        this.userId,
        this.firstName,
        this.lastName,
        this.gender,
        this.introduction,
        this.country,
        this.state,
        this.city,
        this.address,
        this.dateOfBirth,
        this.position});

  UserInfo.fromJson(Map<String, dynamic> json) {
    created = json['created'];
    updated = json['updated'];
    id = json['id'];
    userId = json['userId'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    gender = json['gender'];
    introduction = json['introduction'];
    country = json['country'];
    state = json['state'];
    city = json['city'];
    address = json['address'];
    dateOfBirth = json['dateOfBirth'];
    position = json['position'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['created'] = this.created;
    data['updated'] = this.updated;
    data['id'] = this.id;
    data['userId'] = this.userId;
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['gender'] = this.gender;
    data['introduction'] = this.introduction;
    data['country'] = this.country;
    data['state'] = this.state;
    data['city'] = this.city;
    data['address'] = this.address;
    data['dateOfBirth'] = this.dateOfBirth;
    data['position'] = this.position;
    return data;
  }
}

class Educations {
  int? id;
  int? userId;
  String? levelOfEducation;
  String? fieldOfStudy;
  String? school;
  String? timePeriodStar;
  String? timePeriodEnd;

  Educations(
      {this.id,
        this.userId,
        this.levelOfEducation,
        this.fieldOfStudy,
        this.school,
        this.timePeriodStar,
        this.timePeriodEnd});

  Educations.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    userId = json['userId'];
    levelOfEducation = json['levelOfEducation'];
    fieldOfStudy = json['fieldOfStudy'];
    school = json['school'];
    timePeriodStar = json['timePeriodStar'];
    timePeriodEnd = json['timePeriodEnd'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['userId'] = this.userId;
    data['levelOfEducation'] = this.levelOfEducation;
    data['fieldOfStudy'] = this.fieldOfStudy;
    data['school'] = this.school;
    data['timePeriodStar'] = this.timePeriodStar;
    data['timePeriodEnd'] = this.timePeriodEnd;
    return data;
  }
}

class WorkExperiences {
  int? id;
  int? userId;
  String? companyName;
  String? position;
  String? workDescription;
  String? workDateStart;
  String? workDateEnd;

  WorkExperiences(
      {this.id,
        this.userId,
        this.companyName,
        this.position,
        this.workDescription,
        this.workDateStart,
        this.workDateEnd});

  WorkExperiences.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    userId = json['userId'];
    companyName = json['companyName'];
    position = json['position'];
    workDescription = json['workDescription'];
    workDateStart = json['workDateStart']??"";
    workDateEnd = json['workDateEnd']??"";
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['userId'] = this.userId;
    data['companyName'] = this.companyName;
    data['position'] = this.position;
    data['workDescription'] = this.workDescription;
    data['workDateStart'] = this.workDateStart;
    data['workDateEnd'] = this.workDateEnd;
    return data;
  }
}

class UserSkills {
  String? created;
  String? updated;
  int? id;
  int? userId;
  String? skillExperience;
  String? chooseSkills;

  UserSkills(
      {this.created,
        this.updated,
        this.id,
        this.userId,
        this.skillExperience,
        this.chooseSkills});

  UserSkills.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    created = json['created'];
    updated = json['updated'];
    userId = json['userId'];
    skillExperience = json['skillExperience'];
    chooseSkills = json['chooseSkills'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['created'] = this.created;
    data['updated'] = this.updated;
    data['id'] = this.id;
    data['userId'] = this.userId;
    data['skillExperience'] = this.skillExperience;
    data['chooseSkills'] = this.chooseSkills;
    return data;
  }
}