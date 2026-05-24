import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import '../core/provider/idea_comment_provider.dart';
import '../core/provider/idea_info_provider.dart';
import '../widgets/colors..dart';
import '../widgets/comment_detail_bottomsheet.dart';
import '../widgets/share_idea_container.dart';

class ShareIdeas extends StatefulWidget {
  const ShareIdeas({
    Key? key,
    required this.tabTitle,
    this.id,
    this.parentCommentId = "6186735533d7b7ab8c4f8df2",
    this.title = 'Title',
    this.comments = 0,
    this.like = 0,
    this.commentAt = 'Jane',
    this.commentDetails,
    this.logo,
    this.baseUserView,
    this.callUserFirstName,
    this.callUserLastName,
    this.callUserId,
  }) : super(key: key);

  final String tabTitle;
  final String? id;
  final String? parentCommentId;
  final String? title;
  final int? comments;
  final int? like;
  final String? commentAt;
  final String? commentDetails;
  final String? logo;
  final baseUserView;
  final String? callUserFirstName;
  final String? callUserLastName;
  final int? callUserId;

  @override
  State<ShareIdeas> createState() => _ShareIdeasState();
}

class _ShareIdeasState extends State<ShareIdeas> {
  // ScrollController scrollController = ScrollController();
  bool comment = false;
  IdeaInfoProvider? ideaInfoProvider;
  Future<void> onRefresh() {
    return Future.delayed(Duration(milliseconds: 2), () {
      Provider.of<IdeaInfoProvider>(context).getIdeaInfo(widget.id ?? 'No ID');
      Provider.of<IdeaCommentProvider>(context, listen: false)
          .getCommentItems(widget.id);
    });
  }

  @override
  void initState() {
    super.initState();
    IdeaCommentProvider ideaCommentProvider =
        Provider.of<IdeaCommentProvider>(context, listen: false);
    ideaInfoProvider = Provider.of<IdeaInfoProvider>(context, listen: false);
    ideaCommentProvider.addListener(() async {
      if (ideaCommentProvider.ideaCommentScrollController.position.pixels >=
              ideaCommentProvider
                  .ideaCommentScrollController.position.maxScrollExtent &&
          !ideaCommentProvider.isLoading &&
          widget.comments! > 3) {
        // Reload ListView with new data
        await ideaCommentProvider.getMoreCommentItems();
        ;
        print('NEW DATA CALL');
      }
    });
    ideaInfoProvider!.getIdeaInfo(widget.id ?? "No ID");
  }

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    IdeaCommentProvider ideaCommentProvider =
        Provider.of<IdeaCommentProvider>(context, listen: false);
    ideaInfoProvider = Provider.of<IdeaInfoProvider>(context, listen: false);
    // .getIdeaInfo(widget.id ?? 'No ID');
    // ideaInfoProvider = Provider.of<IdeaInfoProvider>(context, listen: false)
    //     .getIdeaInfo(widget.id ?? 'No ID');

    return Scaffold(
      floatingActionButton: Padding(
        padding: EdgeInsets.only(
            right: size.height * .01, bottom: size.height * .06),
        child: FutureBuilder(
          future: Provider.of<IdeaInfoProvider>(context)
              .getIdeaInfo(widget.id ?? 'No ID'),
          builder: (context, AsyncSnapshot snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return CircularProgressIndicator();
            } else {
              return Consumer<IdeaInfoProvider>(
                builder: (context, IdeaInfoProvider ideaInfoProvider, _) {
                  return FloatingActionButton(
                    backgroundColor: Colors.white,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          height: size.height * 0.01,
                        ),
                        SvgPicture.asset('assets/images/floatcomment_svg.svg'),
                      ],
                    ),
                    onPressed: () {
                      showModalBottomSheet(
                        backgroundColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(size.height * 0.06),
                        ),
                        context: context,
                        isScrollControlled: true,
                        builder: (context) {
                          Map baseUserView =
                              ideaInfoProvider.ideaInfo['baseUserView'];
                          Map userIdeaView =
                              ideaInfoProvider.ideaInfo['userIdeaView'];
                          print('Mikky ID ==> ${userIdeaView['id']}');
                          print('ID ==> ${widget.id}');

                          return SingleChildScrollView(
                            child: CommentDetailsBottomSheet(
                              context,
                              ideaId: userIdeaView['id'],
                              category: widget.tabTitle,
                              parentCommentId: userIdeaView['id'],
                              callUserFirstName: baseUserView['firstName'],
                              callUserLastName: baseUserView['lastName'],
                              callUserId: baseUserView['userId'],
                            ),
                          );
                        },
                      ).then((value) => {
                            setState(() {
                              Provider.of<IdeaInfoProvider>(context)
                                  .getIdeaInfo(widget.id ?? 'No ID');
                              Provider.of<IdeaCommentProvider>(context,
                                      listen: false)
                                  .getCommentItems(widget.id);
                            })
                          });
                    },
                  );
                },
              );
            }
          },
        ),
      ),
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        leading: InkWell(
          onTap: () {
            Navigator.pop(context);
          },
          child: Icon(
            Icons.arrow_back_ios,
            color: Colors.black,
          ),
        ),
        title: Text(
          "", //'Share Ideas',
          style: TextStyle(
              color: Colors.black,
              fontSize: size.height * 0.023,
              fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: onRefresh,
        child: SingleChildScrollView(
          controller: ideaCommentProvider.ideaCommentScrollController,
          padding: const EdgeInsets.symmetric(horizontal: 15.0),
          child: Column(
            children: [
              SizedBox(
                height: size.height * 0.03,
              ),
              Container(
                alignment: Alignment.centerLeft,
                // height: 60,
                width: size.width - 40,
                // color: Colors.green,
                child: Stack(
                  children: [
                    Container(
                      // alignment: Alignment.center,
                      height: size.height * 0.027,
                      // width: size.width * 0.17,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                          color: Color(0xffF2F2F7),
                          borderRadius: BorderRadius.circular(5)),
                      child: Text(
                        widget.tabTitle,
                        style: TextStyle(
                            color: blueColor, fontSize: size.height * 0.016),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 0.0),
                      child: Text(
                        '                     ${widget.title}',
                        style: TextStyle(
                          // overflow: TextOverflow.ellipsis,
                          color: Colors.black,
                          fontSize: size.height * 0.025,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Row(
              //   children: [
              //     Container(
              //       alignment: Alignment.center,
              //       height: size.height * 0.027,
              //       width: size.width * 0.17,
              //       decoration: BoxDecoration(
              //           color: Color(0xffF2F2F7),
              //           borderRadius: BorderRadius.circular(5)),
              //       child: Text(
              //         'QR Code',
              //         style: TextStyle(
              //             color: blueColor, fontSize: size.height * 0.016),
              //       ),
              //     ),
              //     Text(
              //       '${widget.title}',
              //       style: TextStyle(
              //         overflow: TextOverflow.ellipsis,
              //         color: Colors.black,
              //         fontSize: size.height * 0.025,
              //         fontWeight: FontWeight.bold,
              //       ),
              //     ),
              //   ],
              // ),
              // Text(
              //   'arrange the invitation form',
              //   style: TextStyle(
              //       color: Colors.black,
              //       fontSize: size.height * 0.025,
              //       fontWeight: FontWeight.bold),
              // ),
              SizedBox(
                height: size.height * 0.03,
              ),
              ShareIdeaContainer(
                ideaId: ideaInfoProvider!.ideaInfo['userIdeaView']['id'],
                parentCommentId: ideaInfoProvider!.ideaInfo['userIdeaView']
                    ['id'],
                commentsCount: ideaInfoProvider!.ideaInfo['commentCount'],
                like: ideaInfoProvider!.ideaInfo['likeCount'],
                callUserFirstName: ideaInfoProvider!.ideaInfo['baseUserView']
                    ['firstName'],
                callUserLastName: ideaInfoProvider!.ideaInfo['baseUserView']
                    ['lastName'],
                commentName: ideaInfoProvider!.ideaInfo['baseUserView']
                    ['firstName'],
                callUserId: ideaInfoProvider!.ideaInfo['userIdeaView']
                    ['userId'],
                commentAt: 'creator',
                comment: ideaInfoProvider!.ideaInfo['userIdeaView']['text'],
                created: ideaInfoProvider!.ideaInfo['userIdeaView']['created'],
                logo: ideaInfoProvider!.ideaInfo['baseUserView']['logo'],
              ),
              widget.comments! != 0
                  ? FutureBuilder(
                      future: Future.wait([
                        Provider.of<IdeaCommentProvider>(context, listen: false)
                            .getCommentItems(widget.id),
                      ]),
                      builder: (context, AsyncSnapshot snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return Center(
                            child: Text('Loading...'),
                          );
                        } else {
                          return Consumer2<IdeaCommentProvider,
                              IdeaInfoProvider>(
                            builder: (context,
                                IdeaCommentProvider ideaCommentProvider,
                                IdeaInfoProvider ideaInfoProvider,
                                _) {
                              log('${ideaInfoProvider.ideaInfo}');
                              log(' Id==${ideaInfoProvider.ideaInfo['userIdeaView']['id']}');
                              log('${ideaCommentProvider.commentItems}');
                              return Stack(
                                children: [
                                  ListView.builder(
                                    shrinkWrap: true,
                                    // controller: ideaCommentProvider
                                    //     .ideaCommentScrollController,
                                    physics: NeverScrollableScrollPhysics(),
                                    itemCount:
                                        ideaCommentProvider.commentItems.length,
                                    itemBuilder:
                                        (BuildContext context, int index) {
                                      Map commentsData =
                                          ideaCommentProvider.commentsData;
                                      List commentItems =
                                          ideaCommentProvider.commentItems;
                                      print(widget.baseUserView);

                                      Map currentCommentItem =
                                          commentItems[index];

                                      // log('ShareIdea CallUserID ==> ${currentCommentItem}');

                                      return ShareIdeaContainer(
                                        like: currentCommentItem['likeCount'],
                                        commentsCount:
                                            currentCommentItem['commentCount'],
                                        commentName: currentCommentItem[
                                                    'baseUserView'] !=
                                                null
                                            ? currentCommentItem['baseUserView']
                                                ['firstName']
                                            : '',
                                        callUserFirstName: currentCommentItem[
                                                    'baseUserView'] !=
                                                null
                                            ? currentCommentItem['baseUserView']
                                                ['firstName']
                                            : "",
                                        callUserLastName: currentCommentItem[
                                                    'baseUserView'] !=
                                                null
                                            ? currentCommentItem['baseUserView']
                                                ['lastName']
                                            : "",
                                        callUserId: currentCommentItem[
                                                    'baseUserView'] !=
                                                null
                                            ? currentCommentItem['baseUserView']
                                                ['userId']
                                            : 0,
                                        commentAt: currentCommentItem[
                                            'callUserFirstName'],
                                        comment:
                                            currentCommentItem['commentBody'],
                                        ideaId: currentCommentItem['ideaId'],
                                        parentCommentId: currentCommentItem[
                                            'parentCommentId'],
                                        logo: currentCommentItem[
                                                    'baseUserView'] !=
                                                null
                                            ? currentCommentItem['baseUserView']
                                                ['logo']
                                            : "",
                                        created: currentCommentItem['created'],
                                      );
                                    },
                                  ),
                                  // Visibility(
                                  //   visible:
                                  //       ideaCommentProvider.isMoreLoading &&
                                  //           ideaCommentProvider
                                  //                   .commentItems.length >
                                  //               3,
                                  //   child: Positioned(
                                  //     bottom: -40,
                                  //     child: Center(
                                  //       child: Container(
                                  //         width:
                                  //             MediaQuery.of(context).size.width,
                                  //         child: Center(
                                  //           child: Lottie.asset(
                                  //             'assets/animations/loading.json',
                                  //             height: 200,
                                  //           ),
                                  //         ),
                                  //       ),
                                  //     ),
                                  //   ),
                                  // ),
                                ],
                              );
                            },
                          );
                        }
                      },
                    )
                  : Center(
                      child: Text(
                        '',
                        style: TextStyle(
                          fontSize: 20,
                        ),
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _shareIdeaContainer(Size size,
          {String? commentName,
          String? commentAt,
          String? comment,
          String? logo,
          int? like,
          int? commentsCount}) =>
      Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                height: size.height * 0.075,
                width: size.height * 0.075,
                decoration: BoxDecoration(
                  image: DecorationImage(
                      fit: BoxFit.cover,
                      image: NetworkImage(logo ??
                          'http://adevar.oss-cn-beijing.aliyuncs.com/images/2021/10/25/head/1635165688155304.jpg')),
                  shape: BoxShape.circle,
                  // color: Colors.red
                ),
              ),
              Text(
                'Oct 20',
                style: TextStyle(
                    color: Color(0xff8E8E93), fontSize: size.height * 0.017),
              ),
              Container(
                // height:
                //     comment == false ? size.height * 0.2 : size.height * 0.6,
                width: size.width * 0.003,
                color: Color(0xff8E8E93),
              )
            ],
          ),
          SizedBox(
            width: size.width * 0.01,
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  height: size.height * 0.03,
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    SizedBox(
                      width: size.width * 0.03,
                    ),
                    Text(
                      commentName ?? 'Mark',
                      style: TextStyle(
                          color: Colors.black,
                          fontSize: size.height * 0.025,
                          fontWeight: FontWeight.bold),
                    ),
                    Text(
                      ' @ ${commentAt ?? "Jane"}',
                      style: TextStyle(
                          color: blueColor,
                          fontSize: size.height * 0.024,
                          fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                SizedBox(
                  height: size.height * 0.01,
                ),
                Container(
                  padding: EdgeInsets.only(
                      left: size.width * 0.03,
                      right: size.width * 0.03,
                      top: size.height * 0.01,
                      bottom: size.height * 0.02),
                  // alignment: Alignment.bottomLeft,
                  decoration: BoxDecoration(
                      color: Color(0xffF2F2F7),
                      borderRadius: BorderRadius.circular(size.height * 0.02)),
                  height: size.height * 0.17,
                  width: size.width,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        comment ??
                            'If there is a calendar showing the arrangement of all my invitations, it will be more efficient for me and remind me not to forget.',
                        style: TextStyle(
                            color: Color(0xff8E8E93),
                            fontSize: size.height * 0.02),
                        textAlign: TextAlign.start,
                      ),
                      Spacer(),
                      Row(
                        children: [
                          Spacer(),
                          SvgPicture.asset(
                            'assets/images/comment_svg.svg',
                            height: size.height * 0.018,
                          ),
                          SizedBox(
                            width: size.width * 0.01,
                          ),
                          Text(
                            '${commentsCount ?? 125}',
                            style: TextStyle(
                                color: Color(0xff8E8E93),
                                fontSize: size.height * 0.016),
                          ),
                          SizedBox(
                            width: size.width * 0.04,
                          ),
                          SvgPicture.asset(
                            'assets/images/redlike_svg.svg',
                            height: size.height * 0.018,
                          ),
                          SizedBox(
                            width: size.width * 0.01,
                          ),
                          Text(
                            '${like ?? 125}',
                            style: TextStyle(
                                color: Color(0xffFF3B30),
                                fontSize: size.height * 0.016),
                          )
                        ],
                      ),
                    ],
                  ),
                ),
                // Visibility(
                //   //visible: comment,
                //   child: Container(
                //     padding: EdgeInsets.only(
                //         left: size.width * 0.02,
                //         right: size.width * 0.02,
                //         top: size.width * 0.05),
                //     decoration: BoxDecoration(
                //         borderRadius: BorderRadius.circular(size.height * 0.02),
                //         color: Colors.white,
                //         image: DecorationImage(
                //             fit: BoxFit.cover,
                //             image: AssetImage(
                //                 'assets/images/subcommentcontainer.png'))),
                //     height: size.height * 0.36,
                //     width: size.width,
                //     //color: Colors.red,
                //     child: Column(
                //       children: [
                //         Row(
                //           children: [
                //             CircleAvatar(
                //               radius: 17,
                //               child: Image.asset('assets/images/ayesha.png'),
                //             ),
                //             SizedBox(
                //               width: size.width * 0.01,
                //             ),
                //             Text(
                //               'Ayesha',
                //               style: TextStyle(
                //                   color: Colors.black,
                //                   fontSize: size.height * 0.018,
                //                   fontWeight: FontWeight.bold),
                //             ),
                //             Text(
                //               ' @ Mark',
                //               style: TextStyle(
                //                   color: blueColor,
                //                   fontSize: size.height * 0.018,
                //                   fontWeight: FontWeight.bold),
                //             ),
                //             Spacer(),
                //             Text(
                //               'Nov 22',
                //               style: TextStyle(
                //                 color: Color(0xff8E8E93),
                //                 fontSize: size.height * 0.016,
                //               ),
                //             ),
                //           ],
                //         ),
                //         SizedBox(
                //           height: size.height * 0.01,
                //         ),
                //         Text(
                //           'If there is a calendar showing the arrangement of all my invitations, it will be more efficient for me and remind me not to forget.',
                //           style: TextStyle(
                //               color: Color(0xff8E8E93),
                //               fontSize: size.height * 0.018),
                //         ),
                //         Row(
                //           children: [
                //             Spacer(),
                //             InkWell(
                //               onTap: () {
                //                 setState(() {
                //                //   comment = !comment;
                //                 });
                //               },
                //               child: Row(
                //                 children: [
                //                   SvgPicture.asset(
                //                     'assets/images/bluecomment_svg.svg',
                //                     height: size.height * 0.018,
                //                   ),
                //                   SizedBox(
                //                     width: size.width * 0.01,
                //                   ),
                //                   Text(
                //                     '1',
                //                     style: TextStyle(
                //                         color: blueColor,
                //                         fontSize: size.height * 0.016),
                //                   ),
                //                 ],
                //               ),
                //             ),
                //             SizedBox(
                //               width: size.width * 0.06,
                //             ),
                //             SvgPicture.asset(
                //               'assets/images/like_svg.svg',
                //               height: size.height * 0.018,
                //             ),
                //             SizedBox(
                //               width: size.width * 0.01,
                //             ),
                //           ],
                //         ),
                //         Divider(
                //           thickness: 2,
                //         ),
                //         Row(
                //           children: [
                //             CircleAvatar(
                //               radius: 17,
                //               child: Image.asset('assets/images/ayesha.png'),
                //             ),
                //             SizedBox(
                //               width: size.width * 0.01,
                //             ),
                //             Text(
                //               'Ayesha',
                //               style: TextStyle(
                //                   color: Colors.black,
                //                   fontSize: size.height * 0.018,
                //                   fontWeight: FontWeight.bold),
                //             ),
                //             Text(
                //               ' @ Mark',
                //               style: TextStyle(
                //                   color: blueColor,
                //                   fontSize: size.height * 0.018,
                //                   fontWeight: FontWeight.bold),
                //             ),
                //             Spacer(),
                //             Text(
                //               'Nov 22',
                //               style: TextStyle(
                //                 color: Color(0xff8E8E93),
                //                 fontSize: size.height * 0.016,
                //               ),
                //             ),
                //           ],
                //         ),
                //         SizedBox(
                //           height: size.height * 0.01,
                //         ),
                //         Text(
                //           'If there is a calendar showing the arrangement of all my invitations, it will be more efficient for me and remind me not to forget.',
                //           style: TextStyle(
                //               color: Color(0xff8E8E93),
                //               fontSize: size.height * 0.018),
                //         ),
                //         Row(
                //           children: [
                //             Spacer(),
                //             InkWell(
                //               onTap: () {
                //                 setState(() {
                //                  // comment = !comment;
                //                 });
                //               },
                //               child: Row(
                //                 children: [
                //                   SvgPicture.asset(
                //                     'assets/images/bluecomment_svg.svg',
                //                     height: size.height * 0.018,
                //                   ),
                //                   SizedBox(
                //                     width: size.width * 0.01,
                //                   ),
                //                   Text(
                //                     '1',
                //                     style: TextStyle(
                //                         color: blueColor,
                //                         fontSize: size.height * 0.016),
                //                   ),
                //                 ],
                //               ),
                //             ),
                //             SizedBox(
                //               width: size.width * 0.06,
                //             ),
                //             SvgPicture.asset(
                //               'assets/images/like_svg.svg',
                //               height: size.height * 0.018,
                //             ),
                //             SizedBox(
                //               width: size.width * 0.01,
                //             ),
                //           ],
                //         ),
                //       ],
                //     ),
                //   ),
                // )
              ],
            ),
          )
        ],
      );
}
