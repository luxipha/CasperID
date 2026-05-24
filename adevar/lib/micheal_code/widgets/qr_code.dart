import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:highfedilityadevar/micheal_code/Service/ApiModels/CurrentVersionIdeaModel.dart';
import 'package:highfedilityadevar/micheal_code/Service/ApiModels/FormIdeaListModel.dart';
import 'package:highfedilityadevar/micheal_code/core/models/user_model.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_info_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/settings_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/share_ideas_provider.dart';
import 'package:highfedilityadevar/micheal_code/ui/share_idea.dart';
import 'package:highfedilityadevar/micheal_code/widgets/users.dart';
import 'package:highfedilityadevar/micheal_code/widgets/colors..dart';

import 'comment_detail_bottomsheet.dart';

class QRCodeTab extends StatefulWidget {
  final String tabTitle;
  final String? id;
  // final String? ideaId;
  final String? parentCommentId;
  final int? createdAt;
  final String? title;
  final int comments;
  final int commentUsers;
  final String? commentAt;
  final int like;
  final List<LatestUserInfo> userInfo;
  final Function? submitComment;
  final BaseUserView? baseUserView;
  // final String? callUserFirstName;
  // final String? callUserLastName;
  // final String? callUserId;

  const QRCodeTab({
    Key? key,
    required this.tabTitle,
    this.id = "6186735533d7b7ab8c4f8df2",
    // this.ideaId = "618a3919fd78000001003895",
    this.parentCommentId = "6186735533d7b7ab8c4f8df2",
    this.createdAt,
    this.title,
    this.comments = 0,
    this.commentUsers = 0,
    this.commentAt,
    this.like = 0,
    this.userInfo = const [],
    this.submitComment,
    this.baseUserView,
    // this.callUserFirstName,
    // this.callUserLastName,
    // this.callUserId,
  }) : super(key: key);

  @override
  State<QRCodeTab> createState() => _QRCodeTabState();
}

class _QRCodeTabState extends State<QRCodeTab>
    with AutomaticKeepAliveClientMixin<QRCodeTab> {
  @override
  bool get wantKeepAlive => true;

  bool isLiked = false;
  int like = 0;

  @override
  void initState() {
    super.initState();
    like = widget.like;
  }

  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.of(context).size;

    return Padding(
      padding: EdgeInsets.symmetric(vertical: size.height * 0.01),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ShareIdeas(
                tabTitle: widget.tabTitle,
                id: widget.id,
                title: widget.title ?? 'Title',
                like: widget.like,
                comments: widget.comments,
                commentAt: widget.commentAt,
                baseUserView: widget.baseUserView,
              ),
            ),
          ).then((value) {});
        },
        child: Container(
          padding: EdgeInsets.only(left: size.width * 0.05),
          height: size.height * 0.125,
          width: size.width,
          decoration: BoxDecoration(
              color: const Color(0xffF2F2F7),
              borderRadius: BorderRadius.circular(size.height * 0.025)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      DateFormat.yMMMMd('en_US')
                          .format(DateTime.fromMillisecondsSinceEpoch(
                              widget.createdAt ?? 1636201297011))
                          .toString(),
                      // createdAt??'Oct 19,2021',

                      style: TextStyle(
                          color: const Color(0xff8E8E93),
                          fontSize: size.height * 0.015),
                    ),
                    Container(
                      alignment: Alignment.center,
                      height: size.height * 0.03,
                      width: size.width * 0.25,
                      decoration: BoxDecoration(
                          color: Colors.blue[100],
                          borderRadius: BorderRadius.only(
                              bottomLeft: Radius.circular(size.height * 0.025),
                              topRight: Radius.circular(size.height * 0.025))),
                      child: Text(
                        widget.tabTitle,
                        style: TextStyle(
                            color: blueColor,
                            fontSize: size.height * 0.015,
                            fontWeight: FontWeight.w500),
                      ),
                    )
                  ],
                ),
              ),
              SizedBox(
                height: size.height * 0.00,
              ),
              Text(
                widget.title ??
                    'Can you add a calendar to arrange the invitation form?',
                style: TextStyle(
                  color: Colors.black,
                  fontSize: size.height * 0.025,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              SizedBox(
                height: size.height * 0.007,
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Container(
                        height: size.height * 0.045,
                        // width: size.width * 0.35,
                        // color: Colors.purple,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          shrinkWrap: true,
                          itemCount: widget.userInfo.length < 4
                              ? widget.userInfo.length
                              : 3,
                          itemBuilder: (context, index) {
                            return UsersWidget(
                                widget.userInfo[index].logo ?? '', context);
                          },
                        ),
                      ),
                      SizedBox(
                        width: 5,
                      ),
                      Visibility(
                        visible: widget.commentUsers > 3,
                        child: CircleAvatar(
                          radius: 16,
                          child: CircleAvatar(
                            radius: 15,
                            backgroundColor: Colors.white,
                            child: Center(
                              child: Text('+${widget.commentUsers - 3}'),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  // Container(
                  //   alignment: Alignment.center,
                  //   height: size.height*0.04,
                  //   width: size.height*0.04,
                  //   decoration: BoxDecoration(
                  //       shape: BoxShape.circle,
                  //       border: Border.all(width: 1,color: blueColor)
                  //   ),
                  //   child: Text("+12",style: TextStyle(
                  //       fontSize: size.height*0.013,
                  //       color: blueColor
                  //   ),),
                  // ),
                  Spacer(),
                  FutureBuilder(
                    future: Provider.of<IdeaInfoProvider>(context)
                        .getIdeaInfo(widget.id ?? 'No ID'),
                    builder: (context, AsyncSnapshot snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return Container();
                      } else {
                        return Consumer<IdeaInfoProvider>(
                          builder:
                              (context, IdeaInfoProvider ideaInfoProvider, _) {
                            return InkWell(
                              onTap: () {
                                log('Comment tapped');
                                showModalBottomSheet(
                                  backgroundColor: Colors.transparent,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(
                                        size.height * 0.06),
                                  ),
                                  context: context,
                                  isScrollControlled: true,
                                  builder: (context) {
                                    Map baseUserView = ideaInfoProvider
                                        .ideaInfo['baseUserView'];
                                    Map userIdeaView = ideaInfoProvider
                                        .ideaInfo['userIdeaView'];
                                    print('Mikky ID ==> ${userIdeaView['id']}');
                                    print('ID ==> ${widget.id}');

                                    return SingleChildScrollView(
                                      child: CommentDetailsBottomSheet(
                                        context,
                                        ideaId: userIdeaView['id'],
                                        category: widget.tabTitle,
                                        parentCommentId: userIdeaView['id'],
                                        callUserFirstName:
                                            baseUserView['firstName'],
                                        callUserLastName:
                                            baseUserView['lastName'],
                                        callUserId: baseUserView['userId'],
                                      ),
                                    );
                                  },
                                ).then((value) => {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => ShareIdeas(
                                            tabTitle: widget.tabTitle,
                                            id: widget.id,
                                            title: widget.title ?? 'Title',
                                            like: widget.like,
                                            comments: widget.comments,
                                            commentAt: widget.commentAt,
                                            baseUserView: widget.baseUserView,
                                          ),
                                        ),
                                      )
                                    });
                              },
                              child: Container(
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    SvgPicture.asset(
                                        'assets/images/comment_svg.svg'),
                                    SizedBox(
                                      width: size.width * 0.01,
                                    ),
                                    Text(
                                      "${widget.comments}",
                                      style: TextStyle(
                                        color: Color(0xff8E8E93),
                                        fontSize: size.height * 0.016,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        );
                      }
                    },
                  ),
                  // InkWell(
                  //   onTap: () {
                  //     print('Comment tapped');
                  //     showModalBottomSheet(
                  //       backgroundColor: Colors.transparent,
                  //       shape: RoundedRectangleBorder(
                  //         borderRadius:
                  //             BorderRadius.circular(size.height * 0.06),
                  //       ),
                  //       context: context,
                  //       isScrollControlled: true,
                  //       builder: (context) {
                  //         print('==> ${widget.id}');
                  //
                  //         return SingleChildScrollView(
                  //           child: CommentDetailsBottomSheet(
                  //             context,
                  //             ideaId: widget.id,
                  //             category: widget.tabTitle,
                  //             // callUserFirstName: widget.callUserFirstName ?? '',
                  //             // parentCommentId: widget.parentCommentId ?? '',
                  //             // callUserId: widget.callUserId ?? '',
                  //             // callUserLastName: widget.callUserLastName ?? '',
                  //           ),
                  //         );
                  //       },
                  //     );
                  //   },
                  //   child: Container(
                  //     child: Row(
                  //       crossAxisAlignment: CrossAxisAlignment.center,
                  //       children: [
                  //         SvgPicture.asset('assets/images/comment_svg.svg'),
                  //         SizedBox(
                  //           width: size.width * 0.01,
                  //         ),
                  //         Text(
                  //           "${widget.comments}",
                  //           style: TextStyle(
                  //             color: Color(0xff8E8E93),
                  //             fontSize: size.height * 0.016,
                  //           ),
                  //         ),
                  //       ],
                  //     ),
                  //   ),
                  // ),
                  SizedBox(
                    width: size.width * 0.05,
                  ),
                  InkWell(
                    onTap: () {
                      print('Like pressed');

                      setState(() {
                        isLiked = !isLiked;
                      });
                      if (isLiked) {
                        Provider.of<ShareIdeasProvider>(context, listen: false)
                            .likeIdea(
                                topic0id:
                                    widget.id ?? widget.parentCommentId ?? '');
                        like++;
                        setState(() {});
                      } else {
                        Provider.of<ShareIdeasProvider>(context, listen: false)
                            .unlikeIdea(
                                topic0id:
                                    widget.id ?? widget.parentCommentId ?? '');
                        like--;
                        setState(() {});
                      }
                    },
                    child: Container(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          SvgPicture.asset(
                            'assets/images/like_svg.svg',
                            color: isLiked ? Colors.red : Color(0xff8E8E93),
                          ),
                          SizedBox(
                            width: size.width * 0.01,
                          ),
                          Text(
                            "$like",
                            style: TextStyle(
                              color: isLiked ? Colors.red : Color(0xff8E8E93),
                              fontSize: size.height * 0.016,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(
                    width: size.width * 0.05,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Widget QRCodeTab(
//   BuildContext context, {
//   String? id = "6186735533d7b7ab8c4f8df2",
//   int? createdAt,
//   String? title,
//   int comments = 0,
//   int like = 0,
//   List<LatestUserInfo> userInfo = const [],
// }) {
//   var size = MediaQuery.of(context).size;
//   bool isLiked = false;
//
//   return Padding(
//     padding: EdgeInsets.symmetric(vertical: size.height * 0.01),
//     child: GestureDetector(
//       onTap: () {
//         Navigator.push(
//           context,
//           MaterialPageRoute(
//             builder: (context) => ShareIdeas(
//               id: id,
//               title: title ?? 'Title',
//               like: like,
//               comments: comments,
//             ),
//           ),
//         );
//       },
//       child: Container(
//         padding: EdgeInsets.only(left: size.width * 0.05),
//         height: size.height * 0.125,
//         width: size.width,
//         decoration: BoxDecoration(
//             color: const Color(0xffF2F2F7),
//             borderRadius: BorderRadius.circular(size.height * 0.025)),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             Container(
//               child: Row(
//                 crossAxisAlignment: CrossAxisAlignment.end,
//                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                 children: [
//                   Text(
//                     DateFormat.yMMMMd('en_US')
//                         .format(DateTime.fromMillisecondsSinceEpoch(
//                             createdAt ?? 1636201297011))
//                         .toString(),
//                     // createdAt??'Oct 19,2021',
//
//                     style: TextStyle(
//                         color: const Color(0xff8E8E93),
//                         fontSize: size.height * 0.015),
//                   ),
//                   Container(
//                     alignment: Alignment.center,
//                     height: size.height * 0.03,
//                     width: size.width * 0.25,
//                     decoration: BoxDecoration(
//                         color: Colors.blue[100],
//                         borderRadius: BorderRadius.only(
//                             bottomLeft: Radius.circular(size.height * 0.025),
//                             topRight: Radius.circular(size.height * 0.025))),
//                     child: Text(
//                       'QR Code',
//                       style: TextStyle(
//                           color: blueColor,
//                           fontSize: size.height * 0.015,
//                           fontWeight: FontWeight.w500),
//                     ),
//                   )
//                 ],
//               ),
//             ),
//             SizedBox(
//               height: size.height * 0.00,
//             ),
//             Text(
//               title ?? 'Can you add a calendar to arra...',
//               style: TextStyle(
//                 color: Colors.black,
//                 fontSize: size.height * 0.025,
//                 overflow: TextOverflow.ellipsis,
//               ),
//             ),
//             SizedBox(
//               height: size.height * 0.007,
//             ),
//             Row(
//               children: [
//                 Row(
//                   children: [
//                     Container(
//                       height: size.height * 0.045,
//                       width: size.width * 0.35,
//                       // color: Colors.purple,
//                       child: ListView.builder(
//                         scrollDirection: Axis.horizontal,
//                         itemCount: userInfo.length < 4 ? userInfo.length : 3,
//                         itemBuilder: (context, index) {
//                           return UsersWidget(
//                               userInfo[index].logo ?? '', context);
//                         },
//                       ),
//                     ),
//                     SizedBox(
//                       width: 10,
//                     ),
//                     Visibility(
//                       visible: userInfo.length > 3,
//                       child: CircleAvatar(
//                         radius: 18,
//                         child: CircleAvatar(
//                           radius: 17,
//                           backgroundColor: Colors.white,
//                           child: Center(
//                             child: Text('+${userInfo.length - 3}'),
//                           ),
//                         ),
//                       ),
//                     ),
//                   ],
//                 ),
//                 // Container(
//                 //   alignment: Alignment.center,
//                 //   height: size.height*0.04,
//                 //   width: size.height*0.04,
//                 //   decoration: BoxDecoration(
//                 //       shape: BoxShape.circle,
//                 //       border: Border.all(width: 1,color: blueColor)
//                 //   ),
//                 //   child: Text("+12",style: TextStyle(
//                 //       fontSize: size.height*0.013,
//                 //       color: blueColor
//                 //   ),),
//                 // ),
//                 Spacer(),
//                 InkWell(
//                   onTap: () {
//                     print('Comment tapped');
//                   },
//                   child: Container(
//                     child: Row(
//                       crossAxisAlignment: CrossAxisAlignment.center,
//                       children: [
//                         SvgPicture.asset('assets/images/comment_svg.svg'),
//                         SizedBox(
//                           width: size.width * 0.01,
//                         ),
//                         Text(
//                           "${comments}",
//                           style: TextStyle(
//                             color: Color(0xff8E8E93),
//                             fontSize: size.height * 0.016,
//                           ),
//                         ),
//                       ],
//                     ),
//                   ),
//                 ),
//                 SizedBox(
//                   width: size.width * 0.05,
//                 ),
//                 InkWell(
//                   onTap: () {
//                     isLiked = !isLiked;
//                     print('Like pressed');
//                   },
//                   child: Container(
//                     child: Row(
//                       crossAxisAlignment: CrossAxisAlignment.center,
//                       children: [
//                         SvgPicture.asset(
//                           'assets/images/like_svg.svg',
//                           color: isLiked ? Colors.red : Colors.grey,
//                         ),
//                         SizedBox(
//                           width: size.width * 0.01,
//                         ),
//                         Text(
//                           "${like}",
//                           style: TextStyle(
//                               color: Color(0xff8E8E93),
//                               fontSize: size.height * 0.016),
//                         )
//                       ],
//                     ),
//                   ),
//                 ),
//                 SizedBox(
//                   width: size.width * 0.05,
//                 )
//               ],
//             ),
//           ],
//         ),
//       ),
//     ),
//   );
// }
