import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:highfedilityadevar/micheal_code/Service/ApiModels/FormIdeaListModel.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/app_questions_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/colours_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/idea_list_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/portfolio_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/settings_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/share_ideas_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/submit_comment_provider.dart';
import 'package:highfedilityadevar/micheal_code/ui/adevar_forum.dart';
import 'package:highfedilityadevar/micheal_code/ui/share_idea.dart';
import 'package:highfedilityadevar/micheal_code/widgets/error_bottomsheet.dart';

import 'colors..dart';

Widget confirmBottomSheet(BuildContext context, String s, String category) {
  var size = MediaQuery.of(context).size;
  return Container(
    height: size.height * 0.45,
    width: size.width,
    decoration: BoxDecoration(
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
                borderRadius: BorderRadius.circular(10)),
          ),
          SizedBox(
            height: size.height * 0.08,
          ),
          Container(
              height: size.height * 0.1,
              width: size.width * 0.2,
              child: SvgPicture.asset('assets/images/success_svg.svg')),
          SizedBox(
            height: size.height * 0.01,
          ),
          Text(
            "Success",
            style: TextStyle(color: Colors.black, fontSize: size.height * 0.02),
          ),
          SizedBox(
            height: size.height * 0.1,
          ),
          Consumer<SubmitCommentProvider>(
              builder: (context, submitCommentProvider, _) {
            return InkWell(
              onTap: () {
                print('Confirm Success');
                // print(submitCommentProvider.oldTitle);
                // Navigator.push(
                //   context,
                //   MaterialPageRoute(
                //     builder: (context) {
                //       return ShareIdeas(
                //         id: 'Hetty',
                //         title: submitCommentProvider.oldTitle,
                //         like: 5,
                //         comments: 1,
                //         commentAt: 'Michael',
                //         commentDetails: submitCommentProvider.oldDetails,
                //       );
                //     },
                //   ),
                // );
                Navigator.pop(context);
                Navigator.pop(context);
                if (category == 'QR Code') {
                  Map<String, dynamic> oldUserIdeaView =
                      submitCommentProvider.oldUserIdeaView;

                  var item = Items(
                    title: oldUserIdeaView['title'],
                    type: oldUserIdeaView['type'],
                    ideaId: oldUserIdeaView['id'],
                    latestUserInfo: [],
                    likeCount: 0,
                    commentCount: 0,
                    commentUserCount: 0,
                    created: oldUserIdeaView['created'],
                    id: oldUserIdeaView['id'],
                  );

                  if (category == 'Share Ideas') {
                    ShareIdeasProvider shareIdeasProvider =
                        Provider.of<ShareIdeasProvider>(context, listen: false);
                    shareIdeasProvider.addItemToList(item);
                  } else if (category == 'App Questions') {
                    AppQuestionsProvider appQuestionsProvider =
                        Provider.of<AppQuestionsProvider>(context,
                            listen: false);
                    appQuestionsProvider.addItemToList(item);
                  } else if (category == 'QR Code') {
                    IdeaListProvider ideaListProvider =
                        Provider.of<IdeaListProvider>(context, listen: false);
                    ideaListProvider.addItemToList(item);
                  } else if (category == 'Portfolio') {
                    PortfolioProvider portfolioProvider =
                        Provider.of<PortfolioProvider>(context, listen: false);
                    portfolioProvider.addItemToList(item);
                  } else if (category == 'Colours') {
                    ColoursProvider coloursProvider =
                        Provider.of<ColoursProvider>(context, listen: false);
                    coloursProvider.addItemToList(item);
                  } else if (category == 'Settings') {
                    SettingsProvider settingsProvider =
                        Provider.of<SettingsProvider>(context, listen: false);
                    settingsProvider.addItemToList(item);
                  } else {
                    print('====> Invalid Category');
                  }
                }
                // showModalBottomSheet(
                //     backgroundColor: Colors.transparent,
                //     shape: RoundedRectangleBorder(
                //       borderRadius: BorderRadius.circular(
                //           size.height * 0.06),
                //     ),
                //     context: context,
                //     builder: (context) {
                //       return errorBottomSheet(context,s);
                //     });
                // Get.offAll(ShareIdeas());
              },
              child: Container(
                height: size.height * 0.07,
                width: size.width,
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15), color: blueColor),
                child: Center(
                  child: Text(
                    "Confirm",
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: size.height * 0.025),
                  ),
                ),
              ),
            );
          })
        ],
      ),
    ),
  );
}
