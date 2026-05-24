import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/share_ideas_provider.dart';

import 'colors..dart';
import 'comment_detail_bottomsheet.dart';

class ShareIdeaContainer extends StatefulWidget {
  final String? commentName;
  final String? commentAt;
  final String? comment;
  final String? logo;
  final int? like;
  final int? commentsCount;
  final String? ideaId;
  final String? parentCommentId;
  final String? callUserFirstName;
  final String? callUserLastName;
  final int? callUserId;
  final int? created;

  const ShareIdeaContainer({
    Key? key,
    this.commentName,
    this.commentAt,
    this.comment,
    this.logo,
    this.like,
    this.commentsCount,
    required this.ideaId,
    required this.parentCommentId,
    this.callUserFirstName,
    this.callUserLastName,
    this.callUserId,
    this.created,
  }) : super(key: key);

  @override
  State<ShareIdeaContainer> createState() => _ShareIdeaContainerState();
}

class _ShareIdeaContainerState extends State<ShareIdeaContainer> {
  bool isLiked = false;
  int myLike = 0;

  @override
  void initState() {
    super.initState();
    myLike = widget.like!;
  }

  @override
  Widget build(BuildContext context) {
    Size size = MediaQuery.of(context).size;

    return Row(
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
                  image: NetworkImage(widget.logo ??
                      'http://adevar.oss-cn-beijing.aliyuncs.com/images/2021/10/25/head/1635165688155304.jpg'),
                ),
                shape: BoxShape.circle,
                // color: Colors.red
              ),
            ),
            Text(
              '${DateFormat("MMM dd").format(
                DateTime.fromMillisecondsSinceEpoch(widget.created!),
              )}',
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
                    widget.commentName ?? 'Mark',
                    style: TextStyle(
                        color: Colors.black,
                        fontSize: size.height * 0.025,
                        fontWeight: FontWeight.bold),
                  ),
                  Text(
                    widget.commentAt == 'creator'
                        ? ' ${widget.commentAt}'
                        : ' @ ${widget.commentAt ?? "Jane"}',
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
                      widget.comment ??
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
                        InkWell(
                          onTap: () {
                            showModalBottomSheet(
                              backgroundColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius:
                                    BorderRadius.circular(size.height * 0.06),
                              ),
                              context: context,
                              isScrollControlled: true,
                              builder: (context) {
                                print('==> ${widget.ideaId}');
                                print(
                                    'ShareIdeaContainer CallUserID ==> ${widget.callUserId}');

                                return SingleChildScrollView(
                                  child: CommentDetailsBottomSheet(
                                    context,
                                    ideaId: widget.ideaId,
                                    parentCommentId:
                                        widget.parentCommentId ?? '',
                                    callUserFirstName:
                                        widget.callUserFirstName ?? '',
                                    callUserLastName:
                                        widget.callUserLastName ?? '',
                                    callUserId: widget.callUserId,
                                  ),
                                );
                              },
                            );
                          },
                          child: Container(
                            child: Row(
                              children: [
                                SvgPicture.asset(
                                  'assets/images/comment_svg.svg',
                                  height: size.height * 0.018,
                                ),
                                SizedBox(
                                  width: size.width * 0.01,
                                ),
                                Text(
                                  '${widget.commentsCount ?? 125}',
                                  style: TextStyle(
                                      color: Color(0xff8E8E93),
                                      fontSize: size.height * 0.016),
                                ),
                              ],
                            ),
                          ),
                        ),
                        SizedBox(
                          width: size.width * 0.04,
                        ),
                        InkWell(
                          onTap: () {
                            print('Like');
                            setState(() {
                              isLiked = !isLiked;
                            });
                            if (isLiked) {
                              myLike++;
                              Provider.of<ShareIdeasProvider>(context,
                                      listen: false)
                                  .likeIdea(
                                      topic0id: widget.ideaId ??
                                          widget.parentCommentId ??
                                          '');
                            } else {
                              myLike--;
                              Provider.of<ShareIdeasProvider>(context,
                                      listen: false)
                                  .unlikeIdea(
                                      topic0id: widget.ideaId ??
                                          widget.parentCommentId ??
                                          '');
                            }
                            setState(() {});
                          },
                          child: Container(
                            child: Row(
                              children: [
                                SvgPicture.asset(
                                  'assets/images/redlike_svg.svg',
                                  height: size.height * 0.018,
                                  color: isLiked
                                      ? Color(0xffFF3B30)
                                      : Color(0xff8E8E93),
                                ),
                                SizedBox(
                                  width: size.width * 0.01,
                                ),
                                Text(
                                  '$myLike',
                                  style: TextStyle(
                                    color: isLiked
                                        ? Color(0xffFF3B30)
                                        : Color(0xff8E8E93),
                                    fontSize: size.height * 0.016,
                                  ),
                                )
                              ],
                            ),
                          ),
                        )
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        )
      ],
    );
  }
}
