class GetMyOwnResumeModel{
  bool? flag;
  int? code;
  String? message;
  ResumeData? data;

  GetMyOwnResumeModel({this.flag, this.code, this.message, this.data});

  GetMyOwnResumeModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    code = json['code'];
    message = json['message'];
    data = json['data'] != null ? new ResumeData.fromJson(json['data']) : null;
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

class ResumeData {
  int? userId;
  String? logo;
  int? vipLv;
  String? registerDate;
  int? rating;
  String? position;
  String? intro;
  String? phone;
  String? email;
  List<Score>? score;
  Name? name;
  Place? place;
  List<Work>? work;
  List<Edu>? edu;
  List<Skills>? skills;
  Comment? comment;

  ResumeData(
      {this.userId,
        this.logo,
        this.vipLv,
        this.registerDate,
        this.rating,
        this.position,
        this.intro,
        this.phone,
        this.email,
        this.score,
        this.name,
        this.place,
        this.work,
        this.edu,
        this.skills,
        this.comment});

  ResumeData.fromJson(Map<String, dynamic> json) {
    userId = json['userId'];
    logo = json['logo'];
    vipLv = json['vipLv'];
    registerDate = json['registerDate'];
    rating = json['rating'];
    position = json['position'];
    intro = json['intro'];
    phone = json['phone'];
    email = json['email'];
    if (json['score'] != null) {
      score = <Score>[];
      json['score'].forEach((v) {
        score!.add(new Score.fromJson(v));
      });
    }
    name = json['name'] != null ? new Name.fromJson(json['name']) : null;
    place = json['place'] != null ? new Place.fromJson(json['place']) : null;
    if (json['work'] != null) {
      work = <Work>[];
      json['work'].forEach((v) {
        work!.add(new Work.fromJson(v));
      });
    }
    if (json['edu'] != null) {
      edu = <Edu>[];
      json['edu'].forEach((v) {
        edu!.add(new Edu.fromJson(v));
      });
    }
    if (json['skills'] != null) {
      skills = <Skills>[];
      json['skills'].forEach((v) {
        skills!.add(new Skills.fromJson(v));
      });
    }
    comment =
    json['comment'] != null ? new Comment.fromJson(json['comment']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['userId'] = this.userId;
    data['logo'] = this.logo;
    data['vipLv'] = this.vipLv;
    data['registerDate'] = this.registerDate;
    data['rating'] = this.rating;
    data['position'] = this.position;
    data['intro'] = this.intro;
    data['phone'] = this.phone;
    data['email'] = this.email;
    if (this.score != null) {
      data['score'] = this.score!.map((v) => v.toJson()).toList();
    }
    if (this.name != null) {
      data['name'] = this.name!.toJson();
    }
    if (this.place != null) {
      data['place'] = this.place!.toJson();
    }
    if (this.work != null) {
      data['work'] = this.work!.map((v) => v.toJson()).toList();
    }
    if (this.edu != null) {
      data['edu'] = this.edu!.map((v) => v.toJson()).toList();
    }
    if (this.skills != null) {
      data['skills'] = this.skills!.map((v) => v.toJson()).toList();
    }
    if (this.comment != null) {
      data['comment'] = this.comment!.toJson();
    }
    return data;
  }
}

class Score {
  int? vipLevel;
  int? count;

  Score({this.vipLevel, this.count});

  Score.fromJson(Map<String, dynamic> json) {
    vipLevel = json['vipLevel'];
    count = json['count'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['vipLevel'] = this.vipLevel;
    data['count'] = this.count;
    return data;
  }
}

class Name {
  String? firstName;
  String? lastName;

  Name({this.firstName, this.lastName});

  Name.fromJson(Map<String, dynamic> json) {
    firstName = json['firstName'];
    lastName = json['lastName'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    return data;
  }
}

class Place {
  String? country;
  String? state;
  String? city;
  String? address;

  Place({this.country, this.state, this.city, this.address});

  Place.fromJson(Map<String, dynamic> json) {
    country = json['country'];
    state = json['state'];
    city = json['city'];
    address = json['address'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['country'] = this.country;
    data['state'] = this.state;
    data['city'] = this.city;
    data['address'] = this.address;
    return data;
  }
}

class Work {
  int? id;
  String? companyName;
  String? workPosition;
  String? workDataStart;
  String? workDataEnd;
  String? workDescription;

  Work(
      {this.id,
        this.companyName,
        this.workPosition,
        this.workDataStart,
        this.workDataEnd,
        this.workDescription});

  Work.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    companyName = json['companyName'];
    workPosition = json['workPosition'];
    workDataStart = json['workDataStart'];
    workDataEnd = json['workDataEnd'];
    workDescription = json['workDescription'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['companyName'] = this.companyName;
    data['workPosition'] = this.workPosition;
    data['workDataStart'] = this.workDataStart;
    data['workDataEnd'] = this.workDataEnd;
    data['workDescription'] = this.workDescription;
    return data;
  }
}

class Edu {
  int? id;
  String? school;
  String? fieldOfStudy;
  String? levelOfEducation;
  String? timePeriodStar;
  String? timePeriodEnd;

  Edu(
      {this.id,
        this.school,
        this.fieldOfStudy,
        this.levelOfEducation,
        this.timePeriodStar,
        this.timePeriodEnd});

  Edu.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    school = json['school'];
    fieldOfStudy = json['fieldOfStudy'];
    levelOfEducation = json['levelOfEducation'];
    timePeriodStar = json['timePeriodStar'];
    timePeriodEnd = json['timePeriodEnd'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['school'] = this.school;
    data['fieldOfStudy'] = this.fieldOfStudy;
    data['levelOfEducation'] = this.levelOfEducation;
    data['timePeriodStar'] = this.timePeriodStar;
    data['timePeriodEnd'] = this.timePeriodEnd;
    return data;
  }
}

class Skills {
  Null? created;
  Null? updated;
  int? id;
  int? userId;
  String? skillExperience;
  String? chooseSkills;

  Skills(
      {this.created,
        this.updated,
        this.id,
        this.userId,
        this.skillExperience,
        this.chooseSkills});

  Skills.fromJson(Map<String, dynamic> json) {
    created = json['created'];
    updated = json['updated'];
    id = json['id'];
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

class Comment {
  int? commentUserId;
  String? firstName;
  String? lastName;
  String? logo;
  String? commentText;
  String? commentDateTime;

  Comment(
      {this.commentUserId,
        this.firstName,
        this.lastName,
        this.logo,
        this.commentText,
        this.commentDateTime});

  Comment.fromJson(Map<String, dynamic> json) {
    commentUserId = json['commentUserId'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    logo = json['logo'];
    commentText = json['commentText'];
    commentDateTime = json['commentDateTime'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['commentUserId'] = this.commentUserId;
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['logo'] = this.logo;
    data['commentText'] = this.commentText;
    data['commentDateTime'] = this.commentDateTime;
    return data;
  }
}