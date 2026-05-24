class Urls {
  static String baseUrl = "https://mobapis.adevar.app";
  static String dataStats =
      "$baseUrl/setting/supportForumController/forumDataStatisticsView?lang=";
  static String ideaList =
      "$baseUrl/setting/supportForumController/forumIdeaListViewList?lang=";
  static String votedFeature =
      "$baseUrl/setting/supportForumController/getVotedFeatureIdea?lang=";
  static String currentVersion =
      "$baseUrl/setting/supportForumController/getCurrentVersionDoneIdea?lang=";
  static String shareIdeaComment =
      "$baseUrl//setting/supportForumController/userIdeaCommentViewFindPage?lang=";
  static String supportForum = baseUrl + "/setting/supportForumController";
  static String voteIdea = supportForum + "/getVoteIdea?lang=";
  static String replyComment = "$supportForum/commentUserIdea";
}
