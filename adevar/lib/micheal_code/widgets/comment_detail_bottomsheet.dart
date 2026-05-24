import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:highfedilityadevar/micheal_code/Service/ApiModels/FormIdeaListModel.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/app_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/app_questions_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/colours_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/idea_list_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/portfolio_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/settings_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/share_ideas_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/submit_comment_provider.dart';
import 'package:highfedilityadevar/micheal_code/ui/adevar_forum.dart';

import 'colors..dart';
import 'confirm_bottom_sheet.dart';

Widget CommentDetailsBottomSheet(
  BuildContext context, {
  String? ideaId = '6186735533d7b7ab8c4f8df2',
  String category = 'Share Ideas',
  String? parentCommentId,
  String? callUserFirstName,
  String? callUserLastName,
  int? callUserId,
}) {
  var size = MediaQuery.of(context).size;
  TextEditingController controller = TextEditingController();

  return Consumer<SubmitCommentProvider>(
      builder: (context, SubmitCommentProvider submitCommentProvider, _) {
    log('Consumer');
    return Container(
      padding:
          EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        height: size.height * 0.4,
        width: size.width,
        decoration: const BoxDecoration(
            borderRadius: BorderRadius.only(
                topLeft: Radius.circular(30), topRight: Radius.circular(30)),
            color: Colors.white),
        child: Padding(
          padding: EdgeInsets.only(
              left: size.width * 0.05,
              right: size.width * 0.05,
              top: size.height * 0.01),
          child: Column(
            children: [
              Container(
                height: size.height * 0.008,
                width: size.width * 0.35,
                decoration: BoxDecoration(
                  color: Color(0xffE3E3E3),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              SizedBox(
                height: size.height * 0.02,
              ),
              TextField(
                maxLines: 6,
                controller: controller,
                decoration: InputDecoration(
                    filled: true,
                    fillColor: const Color(0xffF0F3F6),
                    enabledBorder: const OutlineInputBorder(
                      borderRadius: BorderRadius.all(Radius.circular(12.0)),
                      borderSide:
                          BorderSide(color: Color(0xffF0F3F6), width: 2),
                    ),
                    focusedBorder: const OutlineInputBorder(
                      borderRadius: BorderRadius.all(Radius.circular(10.0)),
                      borderSide: BorderSide(color: Colors.white),
                    ),
                    hintText: "Comment detail",
                    hintStyle: TextStyle(color: Colors.grey),
                    prefixIcon: Padding(
                      padding: EdgeInsets.only(bottom: size.height * 0.12),
                      child: Icon(
                        Icons.edit,
                        color: Colors.black,
                      ),
                    )),
              ),
              SizedBox(
                height: size.height * 0.04,
              ),
              InkWell(
                onTap: () async {
                  log('=========${controller.text.isNotEmpty}================');
                  AppProvider appProvider =
                      Provider.of<AppProvider>(context, listen: false);

                  if (controller.text.isNotEmpty) {
                    await Provider.of<ShareIdeasProvider>(context,
                            listen: false)
                        .replyIdea(
                      context,
                      ideaId: ideaId ?? '6186735533d7b7ab8c4f8df2',
                      parentCommentId:
                          parentCommentId ?? '6186735533d7b7ab8c4f8df2',
                      commentBody: controller.text,
                      callUserFirstName: callUserFirstName,
                      callUserLastName: callUserLastName ?? '',
                      callUserId: callUserId,
                    );

                    // Map<String, dynamic> oldUserIdeaView =
                    //     submitCommentProvider.oldUserIdeaView;
                    //
                    // var item = Items(
                    //   title: oldUserIdeaView['title'],
                    //   type: oldUserIdeaView['type'],
                    //   ideaId: oldUserIdeaView['id'],
                    //   latestUserInfo: [],
                    //   likeCount: 0,
                    //   commentCount: 0,
                    //   commentUserCount: 0,
                    //   created: oldUserIdeaView['created'],
                    //   id: oldUserIdeaView['id'],
                    // );
                    //
                    // if (category == 'Share Idea') {
                    //   ShareIdeasProvider shareIdeasProvider =
                    //       Provider.of<ShareIdeasProvider>(context,
                    //           listen: false);
                    //
                    //   appProvider.scrollController1.position.jumpTo(
                    //     appProvider.scrollController1.position.maxScrollExtent,
                    //   );
                    //   shareIdeasProvider.addItemToList(item);
                    // } else if (category == 'App Questions') {
                    //   AppQuestionsProvider appQuestionsProvider =
                    //       Provider.of<AppQuestionsProvider>(context,
                    //           listen: false);
                    //   appQuestionsProvider.addItemToList(item);
                    // } else if (category == 'QR Code') {
                    //   IdeaListProvider ideaListProvider =
                    //       Provider.of<IdeaListProvider>(context, listen: false);
                    //   ideaListProvider.addItemToList(item);
                    // } else if (category == 'Portfolio') {
                    //   PortfolioProvider portfolioProvider =
                    //       Provider.of<PortfolioProvider>(context,
                    //           listen: false);
                    //   portfolioProvider.addItemToList(item);
                    // } else if (category == 'Colours') {
                    //   ColoursProvider coloursProvider =
                    //       Provider.of<ColoursProvider>(context, listen: false);
                    //   coloursProvider.addItemToList(item);
                    // } else if (category == 'Settings') {
                    //   SettingsProvider settingsProvider =
                    //       Provider.of<SettingsProvider>(context, listen: false);
                    //   settingsProvider.addItemToList(item);
                    // } else {
                    //   print('====> Invalid Category');
                    // }
                  } else {}
                  // Navigator.pop(context);
                  // showModalBottomSheet(
                  //   backgroundColor: Colors.transparent,
                  //   shape: RoundedRectangleBorder(
                  //     borderRadius: BorderRadius.circular(size.height * 0.06),
                  //   ),
                  //   context: context,
                  //   builder: (context) {
                  //     return confirmBottomSheet(context, '2');
                  //   },
                  // );
                },
                child: Container(
                  height: size.height * 0.07,
                  width: size.width,
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: blueColor),
                  child: Center(
                    child: Text(
                      "Submit",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        fontSize: size.height * 0.025,
                      ),
                    ),
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  });
}
